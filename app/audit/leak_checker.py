"""
app/audit/leak_checker.py
──────────────────────────
Member 3 Integration — Advanced PII Leak Detection
────────────────────────────────────────────────────
This module provides enhanced PII leak detection as the final
pre-flight check before any text is sent to an external LLM.

It acts as a secondary, defence-in-depth layer complementary to
the primary checks in `app/llm/outbound_guard.py`.

── INTEGRATION NOTE FOR MEMBER 3 ──────────────────────────────────────────
Replace the body of `check_for_leaks()` with your implementation.

Your module should detect:
  • Verbatim PII values in outbound text
  • Partial / obfuscated PII (e.g., Aadhaar with hyphens instead of spaces)
  • Encoded PII (Base64, URL-encoded, etc.)
  • Semantic PII patterns (e.g., age derived from DOB, partial name)

Expected interface:
    result = check_for_leaks(text=sanitized_text, mapping=original_mapping)
    # result.is_safe  → bool
    # result.issues   → List[str]  (human-readable leak descriptions)

The outbound_guard.py calls this via:
    from app.audit.leak_checker import check_for_leaks
    result = check_for_leaks(text=text, mapping=mapping)
    return _M3LeakCheckResult(passed=result.is_safe, leak_descriptions=result.issues)
─────────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# Result type
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class LeakCheckResult:
    """
    Result of the advanced leak detection check.

    Attributes:
        is_safe:    True if no leaks detected → safe to send to LLM.
        issues:     Human-readable descriptions of any detected leaks.
        checks_run: Names of the checks that were performed.
    """
    is_safe: bool
    issues: List[str] = field(default_factory=list)
    checks_run: List[str] = field(default_factory=list)


# ─────────────────────────────────────────────────────────────────────────────
# Normalisation helpers
# ─────────────────────────────────────────────────────────────────────────────

def _normalise(value: str) -> str:
    """
    Collapse common obfuscation forms to a canonical string for matching.
    Removes spaces, hyphens, dots, and lowercases the value.
    """
    return re.sub(r"[\s\-\.\(\)\/]", "", value).lower()


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def check_for_leaks(
    text: str,
    mapping: Dict[str, str],
) -> LeakCheckResult:
    """
    Advanced PII leak detection for outbound text.

    Performs multiple checks:
      1. Verbatim match — original value appears as-is in text.
      2. Normalised match — same value with whitespace/hyphens removed.
      3. Partial match — significant prefix of a long value appears in text.
      4. Known PII pattern scan — scan for Aadhaar/PAN/GSTIN patterns
         that do NOT correspond to placeholder tokens.

    Args:
        text:    The sanitized text about to be sent to an external LLM.
        mapping: {placeholder: original_value} — stays local, never sent.

    Returns:
        LeakCheckResult with is_safe=True iff no leaks are detected.
    """
    issues: List[str] = []
    checks_run: List[str] = []

    if not mapping:
        return LeakCheckResult(is_safe=True, issues=[], checks_run=["empty_mapping_shortcircuit"])

    normalised_text = _normalise(text)

    # ── Check 1: Verbatim match ──────────────────────────────────────────────
    checks_run.append("verbatim_match")
    for placeholder, original in mapping.items():
        if original and len(original) >= 4 and original in text:
            issues.append(
                f"[M3-LEAK] Verbatim value for {placeholder!r} found in outbound text. "
                f"Fragment: {_redact(original)}"
            )

    # ── Check 2: Normalised match (catches hyphen/space obfuscation) ─────────
    checks_run.append("normalised_match")
    for placeholder, original in mapping.items():
        if not original or len(original) < 6:
            continue
        norm_original = _normalise(original)
        if norm_original and norm_original in normalised_text:
            # Only report if verbatim wasn't already caught (to avoid duplicates)
            if original not in text:
                issues.append(
                    f"[M3-LEAK] Normalised value for {placeholder!r} found in outbound "
                    f"text (spaces/hyphens removed). Fragment: {_redact(original)}"
                )

    # ── Check 3: Partial match — ONLY for numeric/structured PII ─────────────
    # Restricts matching to values that start with digits (Aadhaar, bank acc,
    # credit card, etc.) to avoid false positives from name/address labels
    # like "Aadhaar:" appearing as plain text in the sanitized document.
    checks_run.append("partial_match")
    _NUMERIC_START = re.compile(r"^\d")
    for placeholder, original in mapping.items():
        if not original or len(original) < 8:
            continue
        norm_orig = _normalise(original)
        # Only apply to values that start with a digit (purely numeric PII)
        if not _NUMERIC_START.match(norm_orig):
            continue
        norm_prefix = norm_orig[:6]
        if not norm_prefix:
            continue
        if norm_prefix in normalised_text:
            already_reported = any(placeholder in issue for issue in issues)
            if not already_reported:
                issues.append(
                    f"[M3-LEAK] Possible partial value for {placeholder!r} in outbound "
                    f"text. Prefix: {_redact(original[:6])}"
                )

    # ── Check 4: Orphaned PII patterns (not covered by any placeholder) ──────
    # Scan for Aadhaar/PAN/GSTIN patterns that weren't caught by masking.
    checks_run.append("orphaned_pii_scan")

    _AADHAAR_RE = re.compile(r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b")
    _PAN_RE      = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
    _GSTIN_RE    = re.compile(r"\b\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]\b")

    # Build set of all placeholder tokens in the text (they're safe)
    _PLACEHOLDER_RE = re.compile(r"\[[A-Z_]+_\d+\]")
    placeholder_tokens = set(m.group() for m in _PLACEHOLDER_RE.finditer(text))

    for pattern, ptype in [(_AADHAAR_RE, "AADHAAR"), (_PAN_RE, "PAN"), (_GSTIN_RE, "GSTIN")]:
        for m in pattern.finditer(text):
            matched = m.group()
            # Check if this match overlaps with any placeholder token position
            is_inside_placeholder = any(
                tok in text[max(0, m.start()-5):m.end()+5]
                for tok in placeholder_tokens
            )
            if not is_inside_placeholder:
                issues.append(
                    f"[M3-LEAK] Orphaned {ptype} pattern found in outbound text that "
                    f"was not masked: {_redact(matched)}"
                )

    is_safe = len(issues) == 0

    if not is_safe:
        logger.error(
            "[M3] Advanced leak check FAILED — %d issue(s): %s",
            len(issues), issues,
        )
    else:
        logger.debug(
            "[M3] Advanced leak check PASSED — %d checks run, 0 issues.",
            len(checks_run),
        )

    return LeakCheckResult(is_safe=is_safe, issues=issues, checks_run=checks_run)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _redact(value: str, visible: int = 4) -> str:
    """Partially redact a value for safe logging."""
    if len(value) <= visible:
        return "***"
    return value[:visible] + "***"
