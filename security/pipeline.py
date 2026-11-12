"""Security and Privacy Intelligence Pipeline Orchestrator (Member 3).

Coordinates:
Stage 1 (Pre-Payload): Risk scoring, Prompt Injection detection, and Policy verification.
Stage 2 (Outbound): Pre-LLM leak checking on the constructed outbound payload.

Note: Prototype engineering indicator only. Never claims 100% security or complete
invulnerability.
"""

from __future__ import annotations

from typing import Any, Mapping, Sequence

from security.injection_detection import detect_prompt_injection
from security.leak_check import run_leak_check
from security.models import (
    Action,
    OutboundSecurityAssessment,
    PrePayloadSecurityAssessment,
    SecurityPolicy,
)
from security.policy_checks import evaluate_security_policy
from security.risk_scoring import calculate_risk_score


def evaluate_pre_payload_stage(
    masked_text: str,
    detected_entities: Sequence[Mapping[str, Any] | str] | None = None,
    policy: SecurityPolicy | None = None,
) -> PrePayloadSecurityAssessment:
    """Execute Stage 1 security intelligence checks after Member 1 masks PII.

    Workflow:
    1. Detects prompt injection, jailbreaks, and delimiter escapes.
    2. Calculates composite risk score based on masked entities and threats.
    3. Verifies organizational compliance and security policies.

    Args:
        masked_text: The masked text output from Member 1.
        detected_entities: Sequence of entities detected by Member 1.
        policy: Optional custom SecurityPolicy. Defaults to standard policy.

    Returns:
        PrePayloadSecurityAssessment indicating whether Member 2 should proceed
        with outbound payload generation.
    """
    # 1. Run prompt injection heuristic scanner
    injection_result = detect_prompt_injection(masked_text)

    # 2. Compute composite privacy & security risk score
    risk_report = calculate_risk_score(
        masked_text=masked_text,
        detected_entities=detected_entities,
        injection_result=injection_result,
    )

    # 3. Apply governance security policy
    policy_result = evaluate_security_policy(
        masked_text=masked_text,
        detected_entities=detected_entities,
        risk_report=risk_report,
        injection_result=injection_result,
        policy=policy,
    )

    can_proceed = policy_result.action != Action.BLOCK

    engineering_note = (
        f"Engineering indicator: Pre-payload stage finished with action '{policy_result.action.value}'. "
        f"Risk score: {risk_report.score:.1f}, Injection flagged: {injection_result.is_flagged}. "
        "Provides an engineering indicator for prototype gateway pipeline."
    )

    return PrePayloadSecurityAssessment(
        can_proceed=can_proceed,
        risk_report=risk_report,
        injection_result=injection_result,
        policy_result=policy_result,
        engineering_indicator=engineering_note,
    )


def evaluate_outbound_leak_stage(
    outbound_payload: Any,
    original_entities: Sequence[Mapping[str, Any]] | None = None,
    strict_leak_check: bool = True,
    allowed_preserved: Sequence[str] | set[str] | None = None,
) -> OutboundSecurityAssessment:
    """Execute Stage 2 pre-LLM leak verification on Member 2's outbound payload.

    Verifies that no raw, unmasked PII (Aadhaar, PAN, GSTIN, Phone, Email, Name)
    leaks out to external LLMs, excluding intentionally allowed preserved values.

    Args:
        outbound_payload: The final payload (string, dict, or message list) built by Member 2.
        original_entities: Optional list of raw entities detected before masking.
        strict_leak_check: If True, any identified leak blocks external dispatch.
        allowed_preserved: Optional sequence or set of strings permitted to remain unmasked.

    Returns:
        OutboundSecurityAssessment indicating whether the payload is cleared for
        external LLM invocation.
    """
    leak_result = run_leak_check(
        outbound_payload=outbound_payload,
        original_entities=original_entities,
        allowed_preserved=allowed_preserved,
    )

    can_dispatch = not (strict_leak_check and leak_result.has_leak)

    engineering_note = (
        f"Engineering indicator: Outbound leak verification evaluated. "
        f"Detected leaks: {leak_result.leak_count}. Can dispatch: {can_dispatch}. "
        "Serves as an engineering indicator for privacy boundary compliance."
    )

    return OutboundSecurityAssessment(
        can_dispatch_to_llm=can_dispatch,
        leak_result=leak_result,
        engineering_indicator=engineering_note,
    )
