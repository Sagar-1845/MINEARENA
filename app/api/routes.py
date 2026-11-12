"""
app/api/routes.py
──────────────────
FastAPI route definitions.

Endpoints:
  GET  /api/v1/health           Health check
  POST /api/v1/sanitize         Detect + mask PII only (Member 1 pipeline)
  POST /api/v1/llm/query        LLM query with pre-sanitized text (Member 2 only)
  POST /api/v1/process          Full end-to-end pipeline
"""

from __future__ import annotations

import uuid
import logging

from fastapi import APIRouter, HTTPException, status

from app.api.schemas import (
    HealthResponse,
    LLMQueryRequest,
    ProcessRequest,
    ProcessResponse,
    SanitizeRequest,
    SanitizeResponse,
    PlaceholderValidation,
    OutboundGuardInfo,
)
from app.config import get_settings
from app.llm.context_masking import get_effective_mask_types
from app.llm.orchestrator import ProcessRequest as OrchestratorRequest
from app.llm.orchestrator import process as run_pipeline
from app.llm.placeholder_validator import validate_response
from app.llm.outbound_guard import check_outbound
from app.llm.provider import LLMRequest, build_provider
from app.privacy import mapping_store
from app.privacy.masker import mask_text, get_placeholder_set

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1")


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse, tags=["System"])
def health_check():
    """Returns service status and configuration summary (no secrets)."""
    cfg = get_settings()
    return HealthResponse(
        status="ok",
        version="1.0.0",
        llm_mock_mode=cfg.llm_mock_mode,
        groq_model=cfg.groq_model,
        groq_key_configured=bool(cfg.groq_api_key),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Sanitize (Member 1 pipeline)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/sanitize", response_model=SanitizeResponse, tags=["Privacy"])
def sanitize(req: SanitizeRequest):
    """
    Detect and mask PII in input text.
    Returns sanitized text and placeholder list.
    The original-to-placeholder mapping is stored locally only.
    """
    request_id = str(uuid.uuid4())
    effective_types = get_effective_mask_types(req.task_type)
    result = mask_text(text=req.text, task_entity_filter=effective_types)
    mapping_store.store(request_id, result.mapping)

    return SanitizeResponse(
        request_id=request_id,
        sanitized_text=result.sanitized_text,
        entities_detected=len(result.entities_found),
        placeholder_list=result.placeholder_list,
    )


# ─────────────────────────────────────────────────────────────────────────────
# LLM Query (Member 2 — pre-sanitized input only)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/llm/query", response_model=ProcessResponse, tags=["LLM"])
def llm_query(req: LLMQueryRequest):
    """
    Send pre-sanitized text to the LLM.
    The caller must have already run /sanitize and stored the mapping.
    """
    request_id = req.request_id or str(uuid.uuid4())
    allowed = set(req.allowed_placeholders)
    settings = get_settings()

    # Retrieve mapping for guard check
    mapping = mapping_store.retrieve(request_id) or {}

    guard_result = check_outbound(
        sanitized_text=req.sanitized_text,
        original_mapping=mapping,
        allowed_placeholders=allowed,
    )

    outbound_guard_info = OutboundGuardInfo(
        passed=guard_result.passed,
        leaks_detected=guard_result.leaks_detected,
        placeholders_verified=guard_result.placeholders_verified,
        warnings=guard_result.warnings,
    )

    if not guard_result.passed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Outbound privacy guard blocked the request.",
                "leaks": guard_result.leaks_detected,
            },
        )

    # Build LLM request
    from app.llm.context_masking import get_task_instruction
    provider = build_provider()
    llm_req = LLMRequest(
        sanitized_text=req.sanitized_text,
        task_instruction=get_task_instruction(req.task_type),
        model=settings.groq_model,
    )
    llm_resp = provider.call(llm_req)

    if not llm_resp.success:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": llm_resp.error},
        )

    validation = validate_response(llm_resp.content, allowed)
    ph_validation = PlaceholderValidation(
        valid=validation.valid,
        placeholders_in_response=validation.placeholders_in_response,
        valid_placeholders=validation.valid_placeholders,
        unknown_placeholders=validation.unknown_placeholders,
        repeated_placeholders=validation.repeated_placeholders,
        missing_placeholders=validation.missing_placeholders,
        modified_placeholders=validation.modified_placeholders,
    )

    from app.privacy.restorer import restore_text
    restore_result = restore_text(
        llm_response=llm_resp.content,
        request_id=request_id,
        allowed_placeholders=allowed,
    )

    return ProcessResponse(
        request_id=request_id,
        task_type=req.task_type,
        status="success",
        original_text="[pre-sanitized — original not provided to this endpoint]",
        sanitized_text=req.sanitized_text,
        llm_raw_response=llm_resp.content,
        restored_response=restore_result.restored_text,
        model_used=llm_resp.model_used,
        provider=llm_resp.provider,
        processing_time_ms=llm_resp.processing_time_ms,
        outbound_payload=llm_resp.outbound_payload,
        mock=llm_resp.mock,
        placeholder_validation=ph_validation,
        outbound_guard=outbound_guard_info,
        all_warnings=validation.warnings + restore_result.warnings,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Full pipeline (end-to-end)
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/process", response_model=ProcessResponse, tags=["Pipeline"])
def process_document(req: ProcessRequest):
    """
    Full end-to-end pipeline:
      detect → mask → guard → LLM → validate → restore
    """
    orch_req = OrchestratorRequest(
        original_text=req.text,
        task_type=req.task_type,
        request_id=req.request_id or str(uuid.uuid4()),
    )

    result = run_pipeline(orch_req)

    if result.status == "blocked":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": result.error, "leaks": result.outbound_guard.get("leaks_detected", [])},
        )

    ph = result.placeholder_validation
    ph_validation = PlaceholderValidation(
        valid=ph.get("valid", True),
        placeholders_in_response=ph.get("placeholders_in_response", []),
        valid_placeholders=ph.get("valid_placeholders", []),
        unknown_placeholders=ph.get("unknown_placeholders", []),
        repeated_placeholders=ph.get("repeated_placeholders", []),
        missing_placeholders=ph.get("missing_placeholders", []),
        modified_placeholders=ph.get("modified_placeholders", []),
    )

    og = result.outbound_guard
    outbound_guard_info = OutboundGuardInfo(
        passed=og.get("passed", False),
        leaks_detected=og.get("leaks_detected", []),
        placeholders_verified=og.get("placeholders_verified", []),
        warnings=og.get("warnings", []),
    )

    return ProcessResponse(
        request_id=result.request_id,
        task_type=result.task_type,
        status=result.status,
        original_text=result.original_text,
        sanitized_text=result.sanitized_text,
        llm_raw_response=result.llm_raw_response,
        restored_response=result.restored_response,
        model_used=result.model_used,
        provider=result.provider,
        processing_time_ms=result.processing_time_ms,
        outbound_payload=result.outbound_payload,
        mock=result.mock,
        placeholder_validation=ph_validation,
        outbound_guard=outbound_guard_info,
        all_warnings=result.all_warnings,
        error=result.error,
    )
