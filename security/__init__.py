"""ZeroLeak AI - Security and Privacy Intelligence Module (Member 3).

This module handles:
1. Risk scoring for masked requests.
2. Prompt injection and adversarial pattern detection.
3. Policy checks and organizational compliance enforcement.
4. Outbound leak detection before LLM dispatch.
5. Canary pipeline validation with synthetic tokens.

Note: Prototype engineering indicator only. Alerts and assessments are
engineering indicators and never represent an assertion of absolute security.
"""

from security.api import router as security_router
from security.canary import run_canary
from security.injection_detection import detect_prompt_injection
from security.leak_check import run_leak_check
from security.models import (
    Action,
    CanaryResult,
    InjectionDetectionResult,
    InjectionIndicatorMatch,
    LeakCheckResult,
    LeakedEntityMatch,
    OutboundSecurityAssessment,
    PIIType,
    PolicyEvaluationResult,
    PrePayloadSecurityAssessment,
    RiskFactor,
    RiskReport,
    SecurityPolicy,
    SeverityLevel,
)
from security.pipeline import (
    evaluate_outbound_leak_stage,
    evaluate_pre_payload_stage,
)
from security.policy_checks import (
    evaluate_security_policy,
    get_policy,
)
from security.risk_scoring import calculate_risk_score

__all__ = [
    # Models & Dataclasses
    "Action",
    "SeverityLevel",
    "PIIType",
    "RiskFactor",
    "RiskReport",
    "InjectionIndicatorMatch",
    "InjectionDetectionResult",
    "SecurityPolicy",
    "PolicyEvaluationResult",
    "LeakedEntityMatch",
    "LeakCheckResult",
    "PrePayloadSecurityAssessment",
    "OutboundSecurityAssessment",
    "CanaryResult",
    # Core Functions
    "calculate_risk_score",
    "detect_prompt_injection",
    "evaluate_security_policy",
    "get_policy",
    "run_leak_check",
    "run_canary",
    "security_router",
    "evaluate_pre_payload_stage",
    "evaluate_outbound_leak_stage",
]
