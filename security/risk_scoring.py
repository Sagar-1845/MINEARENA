"""Privacy and security risk scoring engine.

Calculates composite risk scores based on detected masked PII entities,
entity sensitivity weights, identity linkability/aggregation, structural text factors,
and prompt injection confidence.

Note: Prototype engineering indicator only. Does not claim 100% security or complete
protection against adversarial privacy leakage.
"""

from __future__ import annotations

import math
from typing import Any, Mapping, Sequence

from security.models import (
    Action,
    InjectionDetectionResult,
    PIIType,
    RiskFactor,
    RiskReport,
    SeverityLevel,
)

# Base sensitivity weights per PII category (0.0 to 100.0 scale contribution)
PII_SENSITIVITY_WEIGHTS: Mapping[str, float] = {
    PIIType.AADHAAR.value: 35.0,
    PIIType.PAN.value: 30.0,
    PIIType.GSTIN.value: 25.0,
    PIIType.PHONE.value: 15.0,
    PIIType.EMAIL.value: 15.0,
    PIIType.NAME.value: 10.0,
    PIIType.UNKNOWN.value: 10.0,
}


def _normalize_pii_type(raw_type: str | PIIType | None) -> str:
    """Normalize arbitrary string or enum to recognized PIIType string key."""
    if not raw_type:
        return PIIType.UNKNOWN.value
    if isinstance(raw_type, PIIType):
        return raw_type.value
    upper = str(raw_type).strip().upper()
    for valid_type in PIIType:
        if valid_type.value == upper:
            return valid_type.value
    return PIIType.UNKNOWN.value


def calculate_risk_score(
    masked_text: str,
    detected_entities: Sequence[Mapping[str, Any] | str] | None = None,
    injection_result: InjectionDetectionResult | None = None,
) -> RiskReport:
    """Calculate a composite privacy and security risk score for an input payload.

    Pure function that evaluates:
    1. Base PII sensitivity weights (Aadhaar, PAN, GSTIN, Phone, Email, Name).
    2. Identity aggregation & diversity multipliers (correlating multiple distinct IDs).
    3. Injection threat amplification if prompt injection is detected.
    4. Text-level structural anomaly signals (e.g. anomalous token density or entropy).

    Args:
        masked_text: The text processed by Member 1 (with placeholders).
        detected_entities: List of entity mappings (e.g. [{'type': 'AADHAAR'}]) or strings.
        injection_result: Optional result from the injection detection module.

    Returns:
        RiskReport containing normalized composite score (0-100), severity level,
        recommended action, breakdown of contributing factors, and prototype indicator.
    """
    factors: list[RiskFactor] = []
    entities = detected_entities or []

    # 1. Evaluate PII Sensitivity and Count
    type_counts: dict[str, int] = {}
    for entity in entities:
        if isinstance(entity, Mapping):
            raw_type = entity.get("type") or entity.get("entity_type") or entity.get("label")
        else:
            raw_type = str(entity)
        norm_type = _normalize_pii_type(raw_type)
        type_counts[norm_type] = type_counts.get(norm_type, 0) + 1

    pii_score = 0.0
    for pii_name, count in type_counts.items():
        weight = PII_SENSITIVITY_WEIGHTS.get(pii_name, 10.0)
        # Diminishing marginal risk for duplicate instances of the same entity type
        contribution = weight * (1.0 + 0.3 * (count - 1))
        pii_score += contribution
        severity = SeverityLevel.HIGH if weight >= 30.0 else SeverityLevel.MEDIUM
        factors.append(
            RiskFactor(
                name=f"pii_{pii_name.lower()}_count",
                severity=severity,
                weight=round(contribution, 2),
                description=f"Presence of {count} masked {pii_name} entity/entities (base weight: {weight}).",
            )
        )

    # 2. Identity Aggregation & Diversity Multiplier
    # When multiple distinct types of sensitive PII are present (e.g., Aadhaar + PAN + Phone),
    # the correlation/re-identification risk increases non-linearly.
    distinct_types = len(type_counts)
    if distinct_types > 1:
        diversity_bonus = min(25.0, (distinct_types - 1) * 6.0)
        pii_score += diversity_bonus
        factors.append(
            RiskFactor(
                name="pii_aggregation_diversity",
                severity=SeverityLevel.HIGH if distinct_types >= 3 else SeverityLevel.MEDIUM,
                weight=round(diversity_bonus, 2),
                description=(
                    f"Cross-identifier correlation risk: {distinct_types} distinct PII types "
                    "present simultaneously increases re-identification potential."
                ),
            )
        )

    # 3. Prompt Injection Threat Component
    injection_score = 0.0
    if injection_result:
        if injection_result.is_flagged or injection_result.confidence_score > 0:
            # Injection confidence score (0.0 to 1.0) maps to up to 50 risk points
            injection_score = round(injection_result.confidence_score * 50.0, 2)
            inj_severity = (
                SeverityLevel.CRITICAL
                if injection_result.confidence_score >= 0.8
                else SeverityLevel.HIGH
                if injection_result.confidence_score >= 0.5
                else SeverityLevel.MEDIUM
            )
            matched_str = ", ".join(injection_result.categories) or "heuristic patterns"
            factors.append(
                RiskFactor(
                    name="adversarial_prompt_injection",
                    severity=inj_severity,
                    weight=injection_score,
                    description=(
                        f"Prompt injection risk detected: categories [{matched_str}] with "
                        f"confidence {injection_result.confidence_score:.2f}."
                    ),
                )
            )

    # 4. Text Anomaly / Structural Heuristics
    structural_score = 0.0
    if masked_text:
        text_length = len(masked_text)
        # Check for abnormal length or token density
        if text_length > 3000:
            long_bonus = 5.0
            structural_score += long_bonus
            factors.append(
                RiskFactor(
                    name="payload_volume_anomaly",
                    severity=SeverityLevel.LOW,
                    weight=long_bonus,
                    description=f"Large payload size ({text_length} chars) increases surface area.",
                )
            )

        # Placeholder count check: count placeholder patterns in text (e.g., {{...}} or <...>)
        placeholder_occurrences = len(masked_text.split("{{")) - 1
        if placeholder_occurrences >= 10:
            dense_bonus = 8.0
            structural_score += dense_bonus
            factors.append(
                RiskFactor(
                    name="dense_placeholder_token_ratio",
                    severity=SeverityLevel.MEDIUM,
                    weight=dense_bonus,
                    description=f"High density of masked tokens ({placeholder_occurrences} placeholders).",
                )
            )

    # Calculate composite raw score and normalize to [0.0, 100.0]
    total_raw = pii_score + injection_score + structural_score
    # Soft ceiling mapping to keep bounded in 0 - 100
    composite_score = round(min(100.0, max(0.0, total_raw)), 2)

    # Assign overall severity level
    if composite_score >= 80.0:
        overall_severity = SeverityLevel.CRITICAL
        recommended_action = Action.BLOCK
    elif composite_score >= 55.0:
        overall_severity = SeverityLevel.HIGH
        recommended_action = Action.BLOCK if injection_result and injection_result.is_flagged else Action.WARN
    elif composite_score >= 25.0:
        overall_severity = SeverityLevel.MEDIUM
        recommended_action = Action.WARN
    else:
        overall_severity = SeverityLevel.LOW
        recommended_action = Action.ALLOW

    summary = (
        f"Engineering indicator: Composite risk score is {composite_score:.2f}/100.0 ({overall_severity.value}). "
        f"Identified {len(factors)} risk factor(s). Recommended action: {recommended_action.value}."
    )

    engineering_note = (
        "Engineering indicator: Calculated risk score is a composite heuristic for "
        "ZeroLeak AI prototype evaluation. It does not certify an absolute or infallible "
        "security assessment."
    )

    return RiskReport(
        score=composite_score,
        severity=overall_severity,
        action_recommendation=recommended_action,
        factors=factors,
        summary=summary,
        engineering_indicator=engineering_note,
    )
