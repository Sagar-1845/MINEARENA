"""FastAPI APIRouter for ZeroLeak AI Security and Privacy Intelligence (Member 3).

Exposes REST endpoints for:
- Canary pipeline validation: POST /security/canary?skip_masking=false
- Policy retrieval: GET /security/policies
- Policy configuration update: PUT /security/policies/{department}
- Pre-payload security assessment: POST /security/evaluate
- Pre-LLM outbound leak check: POST /security/leak-check

Note: Router only. The parent FastAPI application is owned by Member 1 and mounts
this router via app.include_router(security_router).
All alerts and outputs represent an engineering indicator, never an assertion of 100% security.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field, field_validator

from security.canary import run_canary
from security.leak_check import run_leak_check
from security.models import PIIType
from security.pipeline import evaluate_pre_payload_stage
from security.policy_checks import get_policy

router = APIRouter(prefix="/security", tags=["Security & Privacy Intelligence"])

POLICIES_FILE_PATH = Path(__file__).parent / "policies.json"


# ---------------------------------------------------------------------------
# Pydantic Request Models
# ---------------------------------------------------------------------------

class UpdatePolicyRequest(BaseModel):
    """Schema for updating department security policy parameters."""
    max_allowed_risk_score: float = Field(..., ge=0.0, le=100.0, description="Max allowed risk score (0-100)")
    block_on_injection: bool = Field(default=True, description="Whether to block on prompt injection")
    max_masked_entities: int = Field(default=10, ge=1, le=100, description="Maximum allowed masked entities")
    blocked_pii_types: list[str] = Field(default_factory=list, description="PII types strictly forbidden")
    always_mask: list[str] = Field(default_factory=list, description="PII types required to be masked")
    strict_leak_check: bool = Field(default=True, description="Whether any leak strictly blocks dispatch")

    @field_validator("blocked_pii_types", "always_mask", mode="before")
    @classmethod
    def validate_pii_types(cls, val: Any) -> list[str]:
        """Validate and normalize PII type strings."""
        if not isinstance(val, (list, tuple, set)):
            raise ValueError("Must be a list of PII type strings")
        normalized: list[str] = []
        valid_members = {m.value for m in PIIType}
        for item in val:
            item_str = str(item).strip().upper()
            if item_str not in valid_members:
                raise ValueError(
                    f"Invalid PII type '{item_str}'. Valid types: {sorted(valid_members)}"
                )
            normalized.append(item_str)
        return normalized


class EvaluateRequest(BaseModel):
    """Schema for pre-payload security assessment request."""
    masked_text: str = Field(..., description="Masked text output from Member 1")
    entities: list[dict[str, Any]] = Field(default_factory=list, description="Detected entities metadata")
    department: str | None = Field(default=None, description="Department context (banking, hr, healthcare, default)")


class LeakCheckRequest(BaseModel):
    """Schema for pre-LLM outbound payload leak check request."""
    outbound_payload: Any = Field(..., description="Outbound text or structured JSON payload")
    entities: list[dict[str, Any]] = Field(default_factory=list, description="Original entities detected before masking")
    allowed_preserved: list[str] = Field(default_factory=list, description="Allowed unmasked values")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/canary", summary="Execute synthetic canary pipeline validation")
def api_run_canary(
    skip_masking: bool = Query(default=False, description="Simulate masking failure to test leak detector"),
) -> dict[str, Any]:
    """Execute synthetic end-to-end canary pipeline verification.

    Generates synthetic PII tokens, executes stub masking and payload build,
    runs pre-LLM leak verification, and returns status with details.
    """
    canary_result = run_canary(skip_masking=skip_masking)
    return canary_result.to_dict()


@router.get("/policies", summary="Retrieve all department security policies")
def api_get_policies() -> dict[str, Any]:
    """Return all department security policies defined in policies.json."""
    if not POLICIES_FILE_PATH.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policies definition file security/policies.json not found.",
        )
    with open(POLICIES_FILE_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


@router.put("/policies/{department}", summary="Update a department security policy")
def api_update_policy(department: str, payload: UpdatePolicyRequest) -> dict[str, Any]:
    """Update one department policy and save changes to policies.json."""
    dept_key = department.strip().lower()
    if not dept_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department name cannot be empty.",
        )

    # Read current policies
    policies_data: dict[str, Any] = {}
    if POLICIES_FILE_PATH.exists():
        with open(POLICIES_FILE_PATH, "r", encoding="utf-8") as f:
            policies_data = json.load(f)

    # Update the department entry
    policies_data[dept_key] = payload.model_dump()

    # Save back to policies.json
    with open(POLICIES_FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(policies_data, f, indent=2)

    # Invalidate policy checks cache if loaded
    import security.policy_checks as pc
    pc._POLICIES_CACHE = None

    return {
        "department": dept_key,
        "policy": policies_data[dept_key],
        "engineering_indicator": "Engineering indicator: Department policy updated successfully.",
    }


@router.post("/evaluate", summary="Run pre-payload risk, injection, and policy evaluation")
def api_evaluate_pre_payload(body: EvaluateRequest) -> dict[str, Any]:
    """Execute Stage 1 security assessment after Member 1 masks input text.

    Calculates composite risk score, detects adversarial prompt injections,
    and validates organizational security policy.
    Never reflects raw original PII in response.
    """
    policy = get_policy(body.department)
    assessment = evaluate_pre_payload_stage(
        masked_text=body.masked_text,
        detected_entities=body.entities,
        policy=policy,
    )
    return assessment.to_dict()


@router.post("/leak-check", summary="Run pre-LLM outbound payload leak verification")
def api_leak_check(body: LeakCheckRequest) -> dict[str, Any]:
    """Execute Stage 2 pre-LLM leak verification on constructed outbound payload.

    Verifies that no unmasked sensitive PII (Aadhaar, PAN, GSTIN, Phone, Email, Name)
    leaks to the external LLM, excluding allowed_preserved values.
    Never reflects raw original PII values in response.
    """
    leak_result = run_leak_check(
        outbound_payload=body.outbound_payload,
        original_entities=body.entities,
        allowed_preserved=body.allowed_preserved,
    )
    return leak_result.to_dict()
