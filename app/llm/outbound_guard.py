"""
app/llm/outbound_guard.py
──────────────────────────
Member 2 — Outbound Privacy Firewall
──────────────────────────────────────
This is the most critical privacy component.

BEFORE any text reaches the external LLM, this module:
  1. Verifies that the outbound text contains NO original PII values.
  2. Verifies that expected placeholder format is intact.
  3. Verifies that the PII mapping (original values) is NOT embedded
     anywhere in the payload.
  4. Captures the exact outbound payload for audit.
  5. BLOCKS the request if any leak is detected.

── Member 3 Integration Point ──────────────────────────────────────────
Member 3's leak checker is called via `run_member3_leak_check()`.
When Member 3 delivers their module, replace the stub in that function.
The interface is: (text: str, mapping: dict) -> LeakCheckResult
────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List, Set

logger = logging.getLogger(__name__)

_PLACEHOLDER_RE = re.compile(r"\[([A-Z_]+_\d+)\]")


@dataclass
class GuardResult:
    passed: bool                       # True = safe to send externally
    sanitized_text: str                # exact text that will be sent
    placeholders_verified: List[str]   # placeholders confirmed in text
    leaks_detected: List[str]          # human-readable leak descriptions
    warnings: List[str]


def check_outbound(
    sanitized_text: str,
    original_mapping: Dict[str, str],   # LOCAL ONLY — never serialised
    allowed_placeholders: Set[str],
) -> GuardResult:
    """
    Run all outbound privacy checks.

    Args:
        sanitized_text:     Text that is about to be sent to the LLM.
        original_mapping:   {placeholder: original_value} — stays local.
        allowed_placeholders: Set of placeholders that must appear in text.

    Returns:
        GuardResult.  If passed=False, the LLM call must be BLOCKED.
    """
    leaks: List[str] = []
    warnings: List[str] = []

    # ── Check 1: Original values must NOT appear in outbound text ─────────
    for placeholder, original_value in original_mapping.items():
        if original_value and original_value in sanitized_text:
            leaks.append(
                f"Original value for {placeholder!r} is present in outbound text. "
                f"Value: {_redact(original_value)}"
            )

    # ── Check 2: Placeholder format must be valid ─────────────────────────
    found_placeholders = [m.group() for m in _PLACEHOLDER_RE.finditer(sanitized_text)]
    unrecognised = [ph for ph in found_placeholders if ph not in allowed_placeholders]
    if unrecognised:
        warnings.append(
            f"Unrecognised placeholders in sanitized text (not in allowed set): {unrecognised}"
        )

    # ── Check 3: Mapping dict itself must not be in the text ─────────────
    for original_value in original_mapping.values():
        # Check for even partial leakage of values longer than 4 chars
        if len(original_value) > 4 and original_value[:6] in sanitized_text:
            leaks.append(
                f"Possible partial value leak detected in outbound text. "
                f"Fragment: {_redact(original_value[:6])}"
            )

    # ── Check 4: Member 3 external leak checker ───────────────────────────
    m3_result = run_member3_leak_check(sanitized_text, original_mapping)
    if not m3_result.passed:
        leaks.extend(m3_result.leak_descriptions)

    passed = len(leaks) == 0
    if not passed:
        logger.error(
            "OUTBOUND BLOCKED — %d leak(s) detected: %s", len(leaks), leaks
        )
    else:
        logger.info(
            "Outbound guard PASSED — %d placeholders verified, sending to LLM.",
            len(found_placeholders),
        )

    return GuardResult(
        passed=passed,
        sanitized_text=sanitized_text,
        placeholders_verified=found_placeholders,
        leaks_detected=leaks,
        warnings=warnings,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Member 3 integration — app.audit.leak_checker
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class _M3LeakCheckResult:
    passed: bool
    leak_descriptions: List[str] = field(default_factory=list)


def run_member3_leak_check(
    text: str,
    mapping: Dict[str, str],
) -> _M3LeakCheckResult:
    """
    Calls Member 3's advanced leak checker from app.audit.leak_checker.

    The leak_checker module provides multi-layer PII leak detection:
      • Verbatim match
      • Normalised match (spaces/hyphens removed)
      • Partial prefix match for long values
      • Orphaned PII pattern scan (Aadhaar/PAN/GSTIN not covered by placeholders)

    If the import fails (e.g., during integration), falls back to a basic check.
    """
    try:
        from app.audit.leak_checker import check_for_leaks
        result = check_for_leaks(text=text, mapping=mapping)
        return _M3LeakCheckResult(
            passed=result.is_safe,
            leak_descriptions=result.issues,
        )
    except ImportError:
        # Fallback: basic verbatim check if module is not yet available
        logger.warning("[M3] app.audit.leak_checker not available — using fallback check.")
        issues = []
        for placeholder, original in mapping.items():
            if original and len(original) > 3 and original in text:
                issues.append(
                    f"[M3-FALLBACK] Value for {placeholder} found verbatim in outbound text."
                )
        return _M3LeakCheckResult(passed=len(issues) == 0, leak_descriptions=issues)


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _redact(value: str, visible_chars: int = 3) -> str:
    """Partially redact a value for safe logging."""
    if len(value) <= visible_chars:
        return "***"
    return value[:visible_chars] + "***"
