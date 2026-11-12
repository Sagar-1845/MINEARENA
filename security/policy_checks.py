"""Policy enforcement and compliance verification module.

Applies configurable governance rules to pre-payload requests, verifying
thresholds for risk score, injection presence, entity limits, and restricted PII types.

Note: Prototype engineering indicator only. Does not claim 100% security or complete
regulatory guarantee.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Mapping, Sequence

from security.models import (
    Action,
    InjectionDetectionResult,
    PIIType,
    PolicyEvaluationResult,
    RiskReport,
    SecurityPolicy,
)

_POLICIES_CACHE: dict[str, Any] | None = None


def _load_policies_json() -> dict[str, Any]:
    """Load policy definitions from security/policies.json."""
    global _POLICIES_CACHE
    if _POLICIES_CACHE is None:
        policy_path = Path(__file__).parent / "policies.json"
        if policy_path.exists():
            with open(policy_path, "r", encoding="utf-8") as f:
                _POLICIES_CACHE = json.load(f)
        else:
            _POLICIES_CACHE = {}
    return _POLICIES_CACHE


def get_policy(department: str | None = None) -> SecurityPolicy:
    """Retrieve the SecurityPolicy configured for a given department.

    Loads definitions from security/policies.json (supporting 'banking', 'hr',
    'healthcare', and 'default'). If the requested department is not found or empty,
    it falls back to 'default'.

    Args:
        department: Department identifier (e.g. 'banking', 'hr', 'healthcare').

    Returns:
        SecurityPolicy configured with department-specific thresholds and rules.
    """
    policies_data = _load_policies_json()

    dept_key = (department or "default").strip().lower()
    if dept_key not in policies_data:
        dept_key = "default"

    raw_cfg = policies_data.get(dept_key, policies_data.get("default", {}))

    blocked_types: list[PIIType] = []
    for item in raw_cfg.get("blocked_pii_types", []):
        norm = str(item).strip().upper()
        if norm in PIIType.__members__:
            blocked_types.append(PIIType[norm])

    always_mask_types: list[PIIType] = []
    for item in raw_cfg.get("always_mask", []):
        norm = str(item).strip().upper()
        if norm in PIIType.__members__:
            always_mask_types.append(PIIType[norm])

    return SecurityPolicy(
        name=dept_key,
        max_allowed_risk_score=float(raw_cfg.get("max_allowed_risk_score", 65.0)),
        block_on_injection=bool(raw_cfg.get("block_on_injection", True)),
        max_masked_entities=int(raw_cfg.get("max_masked_entities", 10)),
        blocked_pii_types=tuple(blocked_types),
        always_mask=tuple(always_mask_types),
        strict_leak_check=bool(raw_cfg.get("strict_leak_check", True)),
    )


def _extract_entity_type_str(entity: Mapping[str, Any] | str) -> str:
    """Extract normalized string representation of an entity's type."""
    if isinstance(entity, Mapping):
        val = entity.get("type") or entity.get("entity_type") or entity.get("label") or ""
    else:
        val = str(entity)
    return str(val).strip().upper()


def evaluate_security_policy(
    masked_text: str,
    detected_entities: Sequence[Mapping[str, Any] | str] | None,
    risk_report: RiskReport,
    injection_result: InjectionDetectionResult,
    policy: SecurityPolicy | None = None,
) -> PolicyEvaluationResult:
    """Validate a request against organizational security policies.

    Pure function that executes deterministic policy checks:
    - Verifies composite risk score against the configured threshold.
    - Enforces injection blocking flags.
    - Caps maximum allowable masked entity count to mitigate bulk data export.
    - Blocks specific forbidden sensitive PII types if restricted by policy.

    Args:
        masked_text: Text with masked placeholders from Member 1.
        detected_entities: Sequence of detected PII entity metadata or labels.
        risk_report: RiskReport produced by risk scoring engine.
        injection_result: InjectionDetectionResult from injection detection engine.
        policy: Configured SecurityPolicy or default StandardPolicy.

    Returns:
        PolicyEvaluationResult containing action (ALLOW/WARN/BLOCK), pass status,
        list of violations, warnings, and engineering indicator statement.
    """
    active_policy = policy if policy is not None else SecurityPolicy()
    entities = list(detected_entities or [])

    violations: list[str] = []
    warnings: list[str] = []

    # 1. Check prompt injection violation
    if active_policy.block_on_injection and injection_result.is_flagged:
        categories_str = ", ".join(injection_result.categories) or "heuristic patterns"
        violations.append(
            f"Adversarial prompt injection detected ({categories_str}) with confidence "
            f"{injection_result.confidence_score:.2f}, breaching active policy '{active_policy.name}'."
        )

    # 2. Check risk score threshold
    if risk_report.score > active_policy.max_allowed_risk_score:
        violations.append(
            f"Risk score {risk_report.score:.2f} exceeds policy maximum threshold "
            f"of {active_policy.max_allowed_risk_score:.2f}."
        )
    elif risk_report.score >= (active_policy.max_allowed_risk_score * 0.70):
        warnings.append(
            f"Elevated risk score {risk_report.score:.2f} approaches policy threshold "
            f"({active_policy.max_allowed_risk_score:.2f})."
        )

    # 3. Check masked entity count threshold (bulk exfiltration guard)
    total_entities = len(entities)
    if total_entities > active_policy.max_masked_entities:
        violations.append(
            f"Total masked entity count ({total_entities}) exceeds policy limit "
            f"of {active_policy.max_masked_entities} per prompt."
        )
    elif total_entities >= (active_policy.max_masked_entities * 0.75):
        warnings.append(
            f"High volume of masked entities ({total_entities}/{active_policy.max_masked_entities})."
        )

    # 4. Check for explicitly blocked PII types
    if active_policy.blocked_pii_types:
        blocked_names = {
            t.value if isinstance(t, PIIType) else str(t).upper()
            for t in active_policy.blocked_pii_types
        }
        for entity in entities:
            etype = _extract_entity_type_str(entity)
            if etype in blocked_names:
                violations.append(
                    f"Entity type '{etype}' is explicitly prohibited by policy '{active_policy.name}'."
                )
                break  # Record one violation per blocked type check

    # 5. Determine enforcement action
    if violations:
        action = Action.BLOCK
        passed = False
    elif warnings:
        action = Action.WARN
        passed = True
    else:
        action = Action.ALLOW
        passed = True

    engineering_note = (
        f"Engineering indicator: Policy '{active_policy.name}' evaluation yielded {len(violations)} "
        f"violation(s) and {len(warnings)} warning(s). Result is an operational decision for "
        "prototype pipeline dispatch, not an absolute guarantee."
    )

    return PolicyEvaluationResult(
        action=action,
        passed=passed,
        violations=violations,
        warnings=warnings,
        engineering_indicator=engineering_note,
    )
