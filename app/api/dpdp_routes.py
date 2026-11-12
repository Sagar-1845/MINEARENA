"""
app/api/dpdp_routes.py
──────────────────────
FastAPI APIRouter for DPDP Compliance Endpoints:
1. Data Principal Access, Correction, and Erasure (DPDP Sec 11 & 12)
2. Retention Limitation & Deletion Reaper (DPDP Sec 8(7))
3. Personal Data Breach Reporting (DPDP Sec 8(6) & CERT-In 6-Hour Rule)
4. Grievance Redressal & DPO Contacts (DPDP Sec 13)
5. Cryptographic Storage & Vault Safeguards (DPDP Sec 8(5))
6. Statutory Privacy Notices & Consent Management (DPDP Sec 5 & 6)
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.dpdp.consent_engine import (
    get_privacy_notice,
    grant_consent,
    check_consent,
    withdraw_consent,
)
from app.dpdp.rights_workflow import (
    submit_access_request,
    submit_correction_request,
    execute_erasure_request,
    list_rights_requests,
)
from app.dpdp.retention_manager import (
    get_retention_policy,
    purge_expired_records,
)
from app.dpdp.breach_manager import (
    report_breach_incident,
    list_breach_incidents,
)
from app.dpdp.grievance_officer import (
    get_dpo_contact,
    submit_grievance,
    get_grievance_status,
    resolve_grievance,
)

dpdp_router = APIRouter(tags=["DPDP Compliance & Privacy Governance"])


# ─────────────────────────────────────────────────────────────────────────────
# Pydantic Schemas
# ─────────────────────────────────────────────────────────────────────────────

class ConsentGrantReq(BaseModel):
    user_id: str = Field(..., description="Unique User ID or Email")
    purpose: str = Field(default="AI_PROMPT_PROCESSING", description="Purpose of processing")
    notice_version: str = Field(default="2.4", description="Version of acknowledged notice")
    notice_acknowledged: bool = Field(default=True, description="Affirmative acknowledgment")


class ConsentWithdrawReq(BaseModel):
    user_id: str
    purpose: str = Field(default="AI_PROMPT_PROCESSING")


class GeneralRightsReq(BaseModel):
    user_id: str
    request_type: str = Field(..., description="ACCESS, CORRECTION, ERASURE, or GRIEVANCE")
    details: str = Field(default="")


class CorrectionReq(BaseModel):
    user_id: str
    target_field: str = Field(..., description="Field name (e.g., PHONE, ADDRESS)")
    corrected_value: str = Field(..., description="Updated value")
    justification: str = Field(default="", description="Reason for update")


class ErasureReq(BaseModel):
    user_id: str
    reason: str = Field(default="Data Principal Request under DPDP Sec 12")


class BreachReportReq(BaseModel):
    severity: str = Field(..., description="LOW, MEDIUM, HIGH, CRITICAL")
    affected_categories: List[str] = Field(..., description="List of PII types affected")
    estimated_affected_count: int = Field(..., ge=0, description="Estimated count")
    root_cause: str = Field(..., description="Root cause description")
    containment_status: str = Field(default="CONTAINED_AND_ISOLATED")


class GrievanceSubmitReq(BaseModel):
    user_id: str
    category: str = Field(default="GENERAL", description="CONSENT_DISPUTE, UNAUTHORIZED_PROCESSING, etc.")
    description: str = Field(..., description="Detailed narrative of grievance")
    priority: str = Field(default="NORMAL")


class GrievanceResolveReq(BaseModel):
    resolution_notes: str
    status: str = Field(default="RESOLVED")


# ─────────────────────────────────────────────────────────────────────────────
# 6. Complete Privacy Notice and Consent Management (DPDP Sec 5 & 6)
# ─────────────────────────────────────────────────────────────────────────────

@dpdp_router.get("/privacy/notice")
@dpdp_router.get("/api/v1/privacy/notice")
def fetch_privacy_notice(lang: str = Query("en", description="Language code: en, hi, kn")):
    """Returns statutory DPDP Privacy Notice in English, Hindi, or Kannada."""
    return get_privacy_notice(lang)


@dpdp_router.post("/consent/grant")
@dpdp_router.post("/api/v1/consent/grant")
def grant_user_consent(req: ConsentGrantReq):
    """Grant affirmative consent and generate cryptographic Consent Receipt."""
    try:
        return grant_consent(
            user_id=req.user_id,
            purpose=req.purpose,
            notice_version=req.notice_version,
            notice_acknowledged=req.notice_acknowledged
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@dpdp_router.post("/consent/withdraw")
@dpdp_router.post("/api/v1/consent/withdraw")
def withdraw_user_consent(req: ConsentWithdrawReq):
    """Instantly revoke/withdraw consent under DPDP Sec 6(4)."""
    try:
        return withdraw_consent(req.user_id, req.purpose)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@dpdp_router.get("/consent/check")
@dpdp_router.get("/api/v1/consent/check")
def check_user_consent(user_id: str, purpose: str = "AI_PROMPT_PROCESSING"):
    """Verify if user has active consent for specified purpose."""
    granted = check_consent(user_id, purpose)
    return {
        "user_id": user_id,
        "purpose": purpose,
        "consent_granted": granted,
        "status": "ACTIVE_CONSENT" if granted else "NO_CONSENT_OR_WITHDRAWN"
    }


# ─────────────────────────────────────────────────────────────────────────────
# 1. Proper Data Access, Correction and Erasure Workflows (DPDP Sec 11 & 12)
# ─────────────────────────────────────────────────────────────────────────────

@dpdp_router.post("/rights/request")
@dpdp_router.post("/api/v1/rights/request")
def submit_general_rights_request(req: GeneralRightsReq):
    """Unified Data Principal Rights handler."""
    req_type = req.request_type.upper()
    if req_type == "ACCESS":
        return submit_access_request(req.user_id, req.details)
    elif req_type == "CORRECTION":
        return submit_correction_request(req.user_id, "GENERAL_PROFILE", req.details)
    elif req_type == "ERASURE":
        return execute_erasure_request(req.user_id, req.details)
    elif req_type == "GRIEVANCE":
        return submit_grievance(req.user_id, "GENERAL", req.details)
    else:
        raise HTTPException(status_code=400, detail=f"Invalid rights request type: {req_type}")


@dpdp_router.post("/api/v1/privacy/rights/access")
def request_data_access(user_id: str = Query(..., description="Data Principal ID")):
    """Generates official disclosure summary of personal data processed."""
    return submit_access_request(user_id)


@dpdp_router.post("/api/v1/privacy/rights/correction")
def request_data_correction(req: CorrectionReq):
    """Lodges a correction request for inaccurate identifiers."""
    return submit_correction_request(
        user_id=req.user_id,
        target_field=req.target_field,
        corrected_value=req.corrected_value,
        justification=req.justification
    )


@dpdp_router.post("/api/v1/privacy/rights/erasure")
def request_data_erasure(req: ErasureReq):
    """Executes immediate cryptographic erasure and returns verified Erasure Certificate."""
    return execute_erasure_request(req.user_id, req.reason)


@dpdp_router.get("/rights/requests")
@dpdp_router.get("/api/v1/rights/requests")
def view_all_rights_requests(status: Optional[str] = None):
    """Lists rights requests for audit and compliance inspection."""
    return list_rights_requests(status)


# ─────────────────────────────────────────────────────────────────────────────
# 2. Data Retention and Deletion Mechanisms (DPDP Sec 8(7))
# ─────────────────────────────────────────────────────────────────────────────

@dpdp_router.get("/api/v1/privacy/retention/policy")
def fetch_retention_policy():
    """Retrieve statutory storage limitation and retention rules."""
    return get_retention_policy()


@dpdp_router.post("/api/v1/privacy/retention/purge-expired")
def trigger_retention_purge():
    """Trigger statutory purge of expired ephemeral data."""
    return purge_expired_records()


# ─────────────────────────────────────────────────────────────────────────────
# 3. Personal Data Breach Reporting Workflow (DPDP Sec 8(6) & CERT-In)
# ─────────────────────────────────────────────────────────────────────────────

@dpdp_router.post("/api/v1/privacy/breach/report")
def report_data_breach(req: BreachReportReq):
    """File a personal data breach incident; generates DPBI and CERT-In notice packages."""
    try:
        return report_breach_incident(
            severity=req.severity,
            affected_categories=req.affected_categories,
            estimated_affected_count=req.estimated_affected_count,
            root_cause=req.root_cause,
            containment_status=req.containment_status
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@dpdp_router.get("/api/v1/privacy/breach/incidents")
def fetch_breach_incidents():
    """List all recorded breach incident files."""
    return list_breach_incidents()


# ─────────────────────────────────────────────────────────────────────────────
# 4. Grievance Handling and Contact Details (DPDP Sec 13)
# ─────────────────────────────────────────────────────────────────────────────

@dpdp_router.get("/api/v1/privacy/grievance/dpo-contact")
def fetch_dpo_coordinates():
    """Retrieve official Data Protection Officer contact coordinates."""
    return get_dpo_contact()


@dpdp_router.post("/api/v1/privacy/grievance/submit")
def submit_privacy_grievance(req: GrievanceSubmitReq):
    """File a formal privacy grievance; activates 72-hour SLA response clock."""
    return submit_grievance(
        user_id=req.user_id,
        category=req.category,
        description=req.description,
        priority=req.priority
    )


@dpdp_router.get("/api/v1/privacy/grievance/{ticket_id}")
def check_grievance_status(ticket_id: str):
    """Query progress and SLA status of a grievance ticket."""
    try:
        return get_grievance_status(ticket_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@dpdp_router.put("/api/v1/privacy/grievance/{ticket_id}/resolve")
def resolve_privacy_grievance(ticket_id: str, req: GrievanceResolveReq):
    """DPO / Admin resolution update."""
    try:
        return resolve_grievance(ticket_id, req.resolution_notes, req.status)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
