"""
app/privacy/detector.py
───────────────────────
Member 1 Integration Stub — PII Detection
─────────────────────────────────────────
This module detects PII in text using regex-based patterns for Indian
documents.  When Member 1 delivers their Presidio-based implementation,
they should replace the body of `detect_pii()` while keeping the same
function signature and return type.

Supported entity types:
  AADHAAR, PAN, GSTIN, PASSPORT, VOTER_ID,
  PHONE, EMAIL, NAME, ADDRESS, DATE_OF_BIRTH

Supported languages (detection hint only — regex is language-agnostic):
  English, Hindi, Kannada, mixed text
"""

from __future__ import annotations

import re
import logging
from dataclasses import dataclass, field
from typing import List

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Entity type constants (shared across the whole project)
# ─────────────────────────────────────────────────────────────────────────────
class EntityType:
    AADHAAR      = "AADHAAR"
    PAN          = "PAN"
    GSTIN        = "GSTIN"
    PASSPORT     = "PASSPORT"
    VOTER_ID     = "VOTER_ID"
    PHONE        = "PHONE"
    EMAIL        = "EMAIL"
    NAME         = "NAME"
    ADDRESS      = "ADDRESS"
    DATE_OF_BIRTH = "DATE_OF_BIRTH"
    CREDIT_CARD  = "CREDIT_CARD"
    BANK_ACCOUNT = "BANK_ACCOUNT"
    IFSC         = "IFSC"


@dataclass
class DetectedEntity:
    entity_type: str
    value: str
    start: int
    end: int
    confidence: float = 1.0


# ─────────────────────────────────────────────────────────────────────────────
# Regex patterns for Indian PII
# ─────────────────────────────────────────────────────────────────────────────
_PATTERNS: list[tuple[str, str, float]] = [
    # (entity_type, regex_pattern, confidence)

    # Aadhaar: 12 digits (optionally space/hyphen separated in groups of 4)
    (EntityType.AADHAAR,
     r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b",
     0.90),

    # PAN: 5 uppercase letters, 4 digits, 1 uppercase letter
    (EntityType.PAN,
     r"\b[A-Z]{5}[0-9]{4}[A-Z]\b",
     0.95),

    # GSTIN: 15-char alphanumeric
    (EntityType.GSTIN,
     r"\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]\b",
     0.95),

    # Indian Passport: letter (A-PR-WY) + 7 digits (must be preceded by keyword or start)
    (EntityType.PASSPORT,
     r"(?i)(?:passport(?:\s+no\.?|\s+number)?[:\s]+)[A-PR-WYa-pr-wy][1-9]\d{6}\b",
     0.92),

    # Voter ID: exactly 3 uppercase letters + 7 digits
    (EntityType.VOTER_ID,
     r"\b[A-Z]{3}[0-9]{7}\b",
     0.85),

    # Indian mobile: 10 digits starting with 6-9, optionally prefixed with +91
    (EntityType.PHONE,
     r"(?:\+91[\s\-]?)?[6-9]\d{9}\b",
     0.90),

    # Email
    (EntityType.EMAIL,
     r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b",
     0.98),

    # IFSC code
    (EntityType.IFSC,
     r"\b[A-Z]{4}0[A-Z0-9]{6}\b",
     0.90),

    # Bank account: 9–18 consecutive digits (heuristic; check after Aadhaar)
    (EntityType.BANK_ACCOUNT,
     r"\b\d{9,18}\b",
     0.70),

    # Credit/debit card: 16 digits (optionally space/hyphen separated in 4s)
    (EntityType.CREDIT_CARD,
     r"\b(?:\d{4}[\s\-]?){3}\d{4}\b",
     0.80),

    # Date of birth: common Indian formats
    (EntityType.DATE_OF_BIRTH,
     r"\b(?:0?[1-9]|[12]\d|3[01])[\/\-\.](?:0?[1-9]|1[0-2])[\/\-\.](?:19|20)\d{2}\b",
     0.85),

    # Indian names (heuristic: 2–4 capitalised words, context keywords nearby)
    # This is intentionally loose; Member 1 should replace with NER.
    (EntityType.NAME,
     r"\b(?:(?:Mr|Mrs|Ms|Dr|Shri|Smt|Kumar|Singh|Sharma|Patel|Reddy|Nair|Rao|Das|Joshi|Pillai|Iyer|Menon|Verma|Gupta)\b\.?\s+)?[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){1,3}\b",
     0.70),

    # Indian addresses (heuristic: contains common address keywords)
    (EntityType.ADDRESS,
     r"(?:(?:Flat|Apartment|Plot|Door|House|H\.No|No\.)\s*[\#\-]?\s*\d+[A-Za-z]?[,\s]+)?(?:[A-Za-z0-9\s\,\.\-]+(?:Road|Street|Lane|Nagar|Colony|Layout|Extension|Phase|Sector|Block|Village|Town|District|Taluk|Mandal|State|Pin|Pincode)\b[A-Za-z0-9\s\,\.\-]{0,80})",
     0.65),
]

# Compile patterns once
_COMPILED: list[tuple[str, re.Pattern, float]] = [
    (etype, re.compile(pat, re.UNICODE), conf)
    for etype, pat, conf in _PATTERNS
]

# Entity types that MUST always be masked — no task can override this
ALWAYS_MASK: frozenset[str] = frozenset({
    EntityType.AADHAAR,
    EntityType.PAN,
    EntityType.GSTIN,
    EntityType.PASSPORT,
    EntityType.VOTER_ID,
    EntityType.CREDIT_CARD,
    EntityType.BANK_ACCOUNT,
})


def detect_pii(text: str) -> List[DetectedEntity]:
    """
    Detect PII entities in the given text.

    Returns a list of DetectedEntity objects ordered by start position.
    Overlapping matches are deduplicated (longest match wins).

    ── INTEGRATION NOTE FOR MEMBER 1 ──────────────────────────────────────
    Replace this function body with your Presidio-based implementation.
    Keep the function signature: (text: str) -> List[DetectedEntity]
    The rest of the codebase depends on this exact interface.
    ────────────────────────────────────────────────────────────────────────
    """
    if not text or not text.strip():
        return []

    raw_matches: List[DetectedEntity] = []

    for entity_type, pattern, confidence in _COMPILED:
        for m in pattern.finditer(text):
            raw_matches.append(DetectedEntity(
                entity_type=entity_type,
                value=m.group(),
                start=m.start(),
                end=m.end(),
                confidence=confidence,
            ))

    # Sort by start, then by length descending (longer match wins)
    raw_matches.sort(key=lambda e: (e.start, -(e.end - e.start)))

    # Remove overlapping spans (keep first / longest)
    deduped: List[DetectedEntity] = []
    occupied_end = -1
    for entity in raw_matches:
        if entity.start >= occupied_end:
            deduped.append(entity)
            occupied_end = entity.end

    logger.debug("Detected %d PII entities", len(deduped))
    return deduped
