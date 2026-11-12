"""
app/llm/orchestrator.py
────────────────────────
Member 2 — Main LLM Pipeline Orchestrator
───────────────────────────────────────────
Coordinates the full flow for a single LLM request:

  1. Apply context-aware masking rules (get effective mask types)
  2. Run PII detection + masking (Member 1)
  3. Store mapping locally (Member 1)
  4. Run outbound privacy guard (Member 2)
  5. Call external LLM with ONLY sanitized text (Member 2)
  6. Validate placeholder usage in response (Member 2)
  7. Restore original values locally (Member 1)
  8. Return full structured result

This is the ONLY module that calls the LLM provider.
"""

from __future__ import annotations

import logging
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set

from app.llm.context_masking import (
    get_effective_mask_types,
    get_task_instruction,
    get_task_rule,
    TaskType,
)
from app.llm.outbound_guard import check_outbound
from app.llm.placeholder_validator import validate_response
from app.llm.provider import LLMRequest, LLMResponse, build_provider
from app.privacy import mapping_store
from app.privacy.masker import mask_text, get_placeholder_set
from app.privacy.restorer import restore_text

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response models
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class ProcessRequest:
    """Input to the orchestrator from the API layer."""
    original_text: str
    task_type: str = TaskType.GENERAL
    request_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    # Optional: pre-sanitized text from Member 1 pipeline
    # If provided, detection + masking is skipped.
    pre_sanitized_text: Optional[str] = None
    pre_mapping: Optional[Dict[str, str]] = None
    pre_allowed_placeholders: Optional[Set[str]] = None


@dataclass
class ProcessResult:
    """Full structured result returned by the orchestrator."""
    request_id: str
    task_type: str
    status: str                           # "success" | "blocked" | "error"

    # Stages
    original_text: str
    sanitized_text: str                   # exact text sent to LLM
    llm_raw_response: str                 # raw LLM output (before restoration)
    restored_response: str                # final output after local restoration

    # Metadata
    model_used: str
    provider: str
    processing_time_ms: float
    outbound_payload: Dict[str, Any]      # for audit / frontend display
    mock: bool

    # Validation
    placeholder_validation: Dict[str, Any]
    outbound_guard: Dict[str, Any]
    restore_warnings: List[str]
    all_warnings: List[str]

    error: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Orchestrator
# ─────────────────────────────────────────────────────────────────────────────

def process(req: ProcessRequest, provider=None) -> ProcessResult:
    """
    Run the full privacy-safe LLM pipeline.

    Args:
        req:      ProcessRequest with original text and task type.
        provider: Optional LLM provider override (useful for testing).

    Returns:
        ProcessResult with all stage outputs and audit data.
    """
    start_total = time.monotonic()
    all_warnings: List[str] = []

    if provider is None:
        provider = build_provider()

    request_id = req.request_id
    task_type = req.task_type if req.task_type else TaskType.GENERAL
    rule = get_task_rule(task_type)

    logger.info(
        "Processing request_id=%s task=%s rule=%s",
        request_id, task_type, rule.description,
    )

    # ── Step 1: Masking ──────────────────────────────────────────────────
    if req.pre_sanitized_text is not None:
        # Member 1 has already done detection + masking upstream
        sanitized_text = req.pre_sanitized_text
        mapping = req.pre_mapping or {}
        allowed_placeholders = req.pre_allowed_placeholders or get_placeholder_set(sanitized_text)
        all_warnings.append("Using pre-sanitized text provided by caller (Member 1 pipeline).")
    else:
        effective_types = get_effective_mask_types(task_type)
        mask_result = mask_text(
            text=req.original_text,
            task_entity_filter=effective_types,
        )
        sanitized_text = mask_result.sanitized_text
        mapping = mask_result.mapping
        allowed_placeholders = set(mask_result.placeholder_list)

        # Store mapping locally (never sent externally)
        mapping_store.store(request_id, mapping)

    # ── Step 2: Outbound guard ───────────────────────────────────────────
    guard_result = check_outbound(
        sanitized_text=sanitized_text,
        original_mapping=mapping,
        allowed_placeholders=allowed_placeholders,
    )

    outbound_guard_info = {
        "passed": guard_result.passed,
        "leaks_detected": guard_result.leaks_detected,
        "placeholders_verified": guard_result.placeholders_verified,
        "warnings": guard_result.warnings,
    }

    if not guard_result.passed:
        elapsed = (time.monotonic() - start_total) * 1000
        return ProcessResult(
            request_id=request_id,
            task_type=task_type,
            status="blocked",
            original_text=req.original_text,
            sanitized_text=sanitized_text,
            llm_raw_response="",
            restored_response="",
            model_used="",
            provider="",
            processing_time_ms=elapsed,
            outbound_payload={},
            mock=False,
            placeholder_validation={},
            outbound_guard=outbound_guard_info,
            restore_warnings=[],
            all_warnings=all_warnings + guard_result.leaks_detected,
            error="Request blocked by outbound privacy guard. No data was sent externally.",
        )

    # ── Step 3: Call LLM ─────────────────────────────────────────────────
    task_instruction = get_task_instruction(task_type)
    from app.config import get_settings
    settings = get_settings()

    llm_req = LLMRequest(
        sanitized_text=sanitized_text,
        task_instruction=task_instruction,
        model=settings.groq_model,
    )

    llm_resp: LLMResponse = provider.call(llm_req)

    if not llm_resp.success:
        elapsed = (time.monotonic() - start_total) * 1000
        return ProcessResult(
            request_id=request_id,
            task_type=task_type,
            status="error",
            original_text=req.original_text,
            sanitized_text=sanitized_text,
            llm_raw_response="",
            restored_response="",
            model_used=llm_resp.model_used,
            provider=llm_resp.provider,
            processing_time_ms=elapsed,
            outbound_payload=llm_resp.outbound_payload,
            mock=llm_resp.mock,
            placeholder_validation={},
            outbound_guard=outbound_guard_info,
            restore_warnings=[],
            all_warnings=all_warnings,
            error=llm_resp.error,
        )

    # ── Step 4: Validate response placeholders ───────────────────────────
    validation = validate_response(
        llm_response=llm_resp.content,
        allowed_placeholders=allowed_placeholders,
    )
    all_warnings.extend(validation.warnings)

    # ── Step 5: Restore original values locally ───────────────────────────
    restore_result = restore_text(
        llm_response=llm_resp.content,
        request_id=request_id,
        allowed_placeholders=allowed_placeholders,
    )
    all_warnings.extend(restore_result.warnings)

    # Clean up mapping from store
    mapping_store.delete(request_id)

    elapsed = (time.monotonic() - start_total) * 1000

    return ProcessResult(
        request_id=request_id,
        task_type=task_type,
        status="success",
        original_text=req.original_text,
        sanitized_text=sanitized_text,
        llm_raw_response=llm_resp.content,
        restored_response=restore_result.restored_text,
        model_used=llm_resp.model_used,
        provider=llm_resp.provider,
        processing_time_ms=elapsed,
        outbound_payload=llm_resp.outbound_payload,
        mock=llm_resp.mock,
        placeholder_validation={
            "valid": validation.valid,
            "placeholders_in_response": validation.placeholders_in_response,
            "valid_placeholders": validation.valid_placeholders,
            "unknown_placeholders": validation.unknown_placeholders,
            "repeated_placeholders": validation.repeated_placeholders,
            "missing_placeholders": validation.missing_placeholders,
            "modified_placeholders": validation.modified_placeholders,
        },
        outbound_guard=outbound_guard_info,
        restore_warnings=restore_result.warnings,
        all_warnings=all_warnings,
    )
