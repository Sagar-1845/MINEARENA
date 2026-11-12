"""Data models and type definitions for ZeroLeak AI Security and Privacy Intelligence module (Member 3).

Note: This module is part of a prototype system. All security evaluations,
risk scores, and alerts represent an engineering indicator and heuristic assessment,
never an assertion of absolute security.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from enum import Enum
from typing import Any


class SeverityLevel(str, Enum):
    """Severity classification for security and privacy events."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Action(str, Enum):
    """Enforcement action recommendation."""
    ALLOW = "ALLOW"
    WARN = "WARN"
    BLOCK = "BLOCK"


class PIIType(str, Enum):
    """Supported sensitive Personally Identifiable Information (PII) types."""
    AADHAAR = "AADHAAR"
    PAN = "PAN"
    GSTIN = "GSTIN"
    PHONE = "PHONE"
    EMAIL = "EMAIL"
    NAME = "NAME"
    UNKNOWN = "UNKNOWN"


DEFAULT_DISCLAIMER: str = (
    "Engineering indicator: Security and privacy scoring represents heuristic "
    "evaluations for prototype verification. This assessment is not an assertion "
    "of being completely uncompromised or invulnerable."
)


@dataclass(frozen=True)
class RiskFactor:
    """Individual contributing factor to an overall privacy or security risk score.

    Attributes:
        name: Short identifier for the risk factor.
        severity: Severity classification (LOW, MEDIUM, HIGH, CRITICAL).
        weight: Numeric weight contribution (0.0 to 100.0).
        description: Readable explanation of the risk factor.
    """
    name: str
    severity: SeverityLevel
    weight: float
    description: str

    def to_dict(self) -> dict[str, Any]:
        """Serialize RiskFactor to a JSON-compatible dictionary."""
        return {
            "name": self.name,
            "severity": self.severity.value if isinstance(self.severity, Enum) else str(self.severity),
            "weight": self.weight,
            "description": self.description,
        }


@dataclass(frozen=True)
class RiskReport:
    """Composite risk evaluation report for a masked prompt or request payload.

    Attributes:
        score: Normalized risk score from 0.0 to 100.0.
        severity: Overall severity level.
        action_recommendation: Suggested policy action (ALLOW, WARN, BLOCK).
        factors: Contributing risk factors identified during evaluation.
        summary: Human-readable assessment summary.
        engineering_indicator: Explicit prototype indicator notice.
    """
    score: float
    severity: SeverityLevel
    action_recommendation: Action
    factors: list[RiskFactor] = field(default_factory=list)
    summary: str = ""
    engineering_indicator: str = DEFAULT_DISCLAIMER

    def to_dict(self) -> dict[str, Any]:
        """Serialize RiskReport to a JSON-compatible dictionary."""
        return {
            "score": self.score,
            "severity": self.severity.value if isinstance(self.severity, Enum) else str(self.severity),
            "action_recommendation": (
                self.action_recommendation.value
                if isinstance(self.action_recommendation, Enum)
                else str(self.action_recommendation)
            ),
            "factors": [f.to_dict() for f in self.factors],
            "summary": self.summary,
            "engineering_indicator": self.engineering_indicator,
        }


@dataclass(frozen=True)
class InjectionIndicatorMatch:
    """Details of a matched prompt injection or jailbreak heuristic pattern.

    Attributes:
        pattern_name: Identifier of the matched rule/pattern.
        category: Attack classification (e.g., 'override', 'jailbreak', 'delimiter').
        matched_text: Exact snippet that triggered the indicator.
        position: Character offset (start, end) within the input text.
        weight: Severity weight of this pattern match.
    """
    pattern_name: str
    category: str
    matched_text: str
    position: tuple[int, int]
    weight: float

    def to_dict(self) -> dict[str, Any]:
        """Serialize InjectionIndicatorMatch to a JSON-compatible dictionary."""
        return {
            "pattern_name": self.pattern_name,
            "category": self.category,
            "matched_text": self.matched_text,
            "position": list(self.position),
            "weight": self.weight,
        }


@dataclass(frozen=True)
class InjectionDetectionResult:
    """Results of prompt injection and adversarial prompt heuristic scanning.

    Attributes:
        is_flagged: True if any high-confidence injection pattern or threshold was reached.
        confidence_score: Heuristic confidence level from 0.0 to 1.0.
        matched_indicators: List of specific matched indicators.
        categories: Set or list of matched injection categories.
        engineering_indicator: Explicit prototype indicator notice.
    """
    is_flagged: bool
    confidence_score: float
    matched_indicators: list[InjectionIndicatorMatch] = field(default_factory=list)
    categories: list[str] = field(default_factory=list)
    engineering_indicator: str = (
        "Engineering indicator: Prompt injection analysis is based on static "
        "heuristic pattern matching and structural cues. It serves as an early "
        "warning signal rather than an absolute boundary."
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize InjectionDetectionResult to a JSON-compatible dictionary."""
        return {
            "is_flagged": self.is_flagged,
            "confidence_score": self.confidence_score,
            "matched_indicators": [m.to_dict() for m in self.matched_indicators],
            "categories": list(self.categories),
            "engineering_indicator": self.engineering_indicator,
        }


@dataclass(frozen=True)
class SecurityPolicy:
    """Configurable security and compliance policy parameters.

    Attributes:
        name: Name of the policy configuration.
        max_allowed_risk_score: Maximum acceptable composite risk score (0-100).
        block_on_injection: Whether any flagged injection must trigger BLOCK.
        max_masked_entities: Maximum allowed count of masked entities per prompt.
        blocked_pii_types: Specific PII types that must not appear even in masked form.
        always_mask: PII types that are strictly mandated to be masked.
        strict_leak_check: Whether any prospective leak results in immediate BLOCK.
    """
    name: str = "StandardPolicy"
    max_allowed_risk_score: float = 65.0
    block_on_injection: bool = True
    max_masked_entities: int = 10
    blocked_pii_types: tuple[PIIType, ...] = ()
    always_mask: tuple[PIIType, ...] = ()
    strict_leak_check: bool = True

    def to_dict(self) -> dict[str, Any]:
        """Serialize SecurityPolicy to a JSON-compatible dictionary."""
        return {
            "name": self.name,
            "max_allowed_risk_score": self.max_allowed_risk_score,
            "block_on_injection": self.block_on_injection,
            "max_masked_entities": self.max_masked_entities,
            "blocked_pii_types": [
                t.value if isinstance(t, Enum) else str(t) for t in self.blocked_pii_types
            ],
            "always_mask": [
                t.value if isinstance(t, Enum) else str(t) for t in self.always_mask
            ],
            "strict_leak_check": self.strict_leak_check,
        }


@dataclass(frozen=True)
class PolicyEvaluationResult:
    """Result of validating text and metadata against a security policy.

    Attributes:
        action: Final enforcement decision (ALLOW, WARN, BLOCK).
        passed: True if the payload conforms to policy requirements.
        violations: List of blocking rule violations.
        warnings: List of non-blocking risk warnings.
        engineering_indicator: Explicit prototype indicator notice.
    """
    action: Action
    passed: bool
    violations: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    engineering_indicator: str = (
        "Engineering indicator: Policy compliance evaluated against active rule sets. "
        "Enforcement actions guide pipeline handling for prototype governance."
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize PolicyEvaluationResult to a JSON-compatible dictionary."""
        return {
            "action": self.action.value if isinstance(self.action, Enum) else str(self.action),
            "passed": self.passed,
            "violations": list(self.violations),
            "warnings": list(self.warnings),
            "engineering_indicator": self.engineering_indicator,
        }


@dataclass(frozen=True)
class LeakedEntityMatch:
    """Details of an unmasked PII detection during pre-LLM leak verification.

    Attributes:
        pii_type: Classified PII category (AADHAAR, PAN, PHONE, EMAIL, GSTIN, NAME).
        raw_snippet: Redacted or masked snippet of the detected match.
        position: Character indices (start, end) in the inspected payload.
        detection_method: Detection mechanism (e.g., 'regex_pattern', 'exact_origin_match').
    """
    pii_type: PIIType
    raw_snippet: str
    position: tuple[int, int]
    detection_method: str

    def to_dict(self) -> dict[str, Any]:
        """Serialize LeakedEntityMatch to a JSON-compatible dictionary."""
        return {
            "pii_type": self.pii_type.value if isinstance(self.pii_type, Enum) else str(self.pii_type),
            "raw_snippet": self.raw_snippet,
            "position": list(self.position),
            "detection_method": self.detection_method,
        }


@dataclass(frozen=True)
class LeakCheckResult:
    """Outcome of pre-dispatch outbound payload leak verification.

    Attributes:
        has_leak: True if any unmasked sensitive PII was detected in outbound payload.
        leak_count: Total number of identified raw PII leaks.
        leaked_items: List of matched leak entities.
        summary: Readable outcome summary.
        engineering_indicator: Explicit prototype indicator notice.
    """
    has_leak: bool
    leak_count: int
    leaked_items: list[LeakedEntityMatch] = field(default_factory=list)
    summary: str = ""
    engineering_indicator: str = (
        "Engineering indicator: Pre-outbound leak check scans for syntactic patterns "
        "and original entity values. Serves as a defensive gatekeeper in the gateway."
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize LeakCheckResult to a JSON-compatible dictionary."""
        return {
            "has_leak": self.has_leak,
            "leak_count": self.leak_count,
            "leaked_items": [item.to_dict() for item in self.leaked_items],
            "summary": self.summary,
            "engineering_indicator": self.engineering_indicator,
        }


@dataclass(frozen=True)
class PrePayloadSecurityAssessment:
    """Aggregated pre-payload security analysis produced by Member 3.

    Attributes:
        can_proceed: Whether text may proceed to Member 2 payload generation.
        risk_report: Output of the risk scoring engine.
        injection_result: Output of the injection detection engine.
        policy_result: Output of policy verification.
        engineering_indicator: Explicit prototype indicator notice.
    """
    can_proceed: bool
    risk_report: RiskReport
    injection_result: InjectionDetectionResult
    policy_result: PolicyEvaluationResult
    engineering_indicator: str = (
        "Engineering indicator: Pre-payload multi-vector assessment combining "
        "privacy risk, prompt injection, and organizational policy checks."
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize PrePayloadSecurityAssessment to a JSON-compatible dictionary."""
        return {
            "can_proceed": self.can_proceed,
            "risk_report": self.risk_report.to_dict(),
            "injection_result": self.injection_result.to_dict(),
            "policy_result": self.policy_result.to_dict(),
            "engineering_indicator": self.engineering_indicator,
        }


@dataclass(frozen=True)
class OutboundSecurityAssessment:
    """Outbound leak verification assessment produced by Member 3 before LLM dispatch.

    Attributes:
        can_dispatch_to_llm: Whether payload passed leak checks and is safe to send.
        leak_result: Output of leak detection scan.
        engineering_indicator: Explicit prototype indicator notice.
    """
    can_dispatch_to_llm: bool
    leak_result: LeakCheckResult
    engineering_indicator: str = (
        "Engineering indicator: Outbound payload inspection completed. Verifies that "
        "raw unmasked identifiers are absent prior to external transmission."
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize OutboundSecurityAssessment to a JSON-compatible dictionary."""
        return {
            "can_dispatch_to_llm": self.can_dispatch_to_llm,
            "leak_result": self.leak_result.to_dict(),
            "engineering_indicator": self.engineering_indicator,
        }


@dataclass(frozen=True)
class CanaryResult:
    """Outcome of synthetic end-to-end canary pipeline verification.

    Attributes:
        passed: True if canary run completed with expected security enforcement.
        skip_masking: Whether masking was intentionally bypassed during this canary run.
        leak_check_result: Raw leak check result for the canary payload.
        details: Metadata regarding synthetic test identifiers and stage evaluations.
        engineering_indicator: Explicit prototype indicator notice.
    """
    passed: bool
    skip_masking: bool
    leak_check_result: LeakCheckResult
    details: dict[str, Any] = field(default_factory=dict)
    engineering_indicator: str = (
        "Engineering indicator: Canary execution verifies pipeline barrier efficacy "
        "using synthetic tokens. Prototype health indicator only."
    )

    def to_dict(self) -> dict[str, Any]:
        """Serialize CanaryResult to a JSON-compatible dictionary."""
        return {
            "passed": self.passed,
            "skip_masking": self.skip_masking,
            "leak_check_result": self.leak_check_result.to_dict(),
            "details": dict(self.details),
            "engineering_indicator": self.engineering_indicator,
        }
