"""
app/api/schemas.py
───────────────────
Pydantic request/response models for the API layer.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Set

from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Request models
# ─────────────────────────────────────────────────────────────────────────────

class ProcessRequest(BaseModel):
    text: str = Field(..., description="Raw input document text.", min_length=1)
    task_type: str = Field(
        default="general",
        description=(
            "Task type: summarization | extraction | support_analysis | "
            "loan_analysis | kyc_analysis | general"
        ),
    )
    request_id: Optional[str] = Field(
        default=None,
        description="Optional idempotency / audit ID. Auto-generated if omitted.",
    )

    model_config = {"json_schema_extra": {
        "example": {
            "text": "Dear Sir, I am Ramesh Kumar, Aadhaar 9876 5432 1012, applying for a home loan.",
            "task_type": "loan_analysis",
        }
    }}


class SanitizeRequest(BaseModel):
    text: str = Field(..., description="Raw input text to sanitize.", min_length=1)
    task_type: str = Field(default="general")

    model_config = {"json_schema_extra": {
        "example": {
            "text": "My PAN is ABCDE1234F and phone is 9876543210.",
            "task_type": "extraction",
        }
    }}


class LLMQueryRequest(BaseModel):
    sanitized_text: str = Field(
        ...,
        description="Pre-sanitized text. Original PII must NOT be present.",
    )
    task_type: str = Field(default="general")
    allowed_placeholders: List[str] = Field(
        default_factory=list,
        description="List of placeholder tokens present in the sanitized text.",
    )
    request_id: Optional[str] = Field(default=None)


# ─────────────────────────────────────────────────────────────────────────────
# Response models
# ─────────────────────────────────────────────────────────────────────────────

class SanitizeResponse(BaseModel):
    request_id: str
    sanitized_text: str
    entities_detected: int
    placeholder_list: List[str]


class PlaceholderValidation(BaseModel):
    valid: bool
    placeholders_in_response: List[str]
    valid_placeholders: List[str]
    unknown_placeholders: List[str]
    repeated_placeholders: List[str]
    missing_placeholders: List[str]
    modified_placeholders: List[str]


class OutboundGuardInfo(BaseModel):
    passed: bool
    leaks_detected: List[str]
    placeholders_verified: List[str]
    warnings: List[str]


class ProcessResponse(BaseModel):
    request_id: str
    task_type: str
    status: str
    original_text: str
    sanitized_text: str
    llm_raw_response: str
    restored_response: str
    model_used: str
    provider: str
    processing_time_ms: float
    outbound_payload: Dict[str, Any]
    mock: bool
    placeholder_validation: PlaceholderValidation
    outbound_guard: OutboundGuardInfo
    all_warnings: List[str]
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    llm_mock_mode: bool
    groq_model: str
    groq_key_configured: bool   # True/False — never the actual key
