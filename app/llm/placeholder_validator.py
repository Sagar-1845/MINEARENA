"""
app/llm/placeholder_validator.py
─────────────────────────────────
Member 2 — LLM Response Placeholder Validation
────────────────────────────────────────────────
After the LLM returns a response, this module validates all placeholder
tokens in that response before restoration begins.

Checks performed:
  1. All found placeholders are in the allowed set for this request.
  2. Unknown / hallucinated placeholders are flagged (never restored).
  3. Reordered placeholders are allowed (restoration handles them).
  4. Repeated placeholders are flagged as informational.
  5. Missing placeholders (sent but absent in response) are warned.
  6. Modified placeholders (e.g. wrong case, truncated) are detected
     by fuzzy matching and flagged — but NEVER blindly restored.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from difflib import get_close_matches
from typing import Dict, List, Set

logger = logging.getLogger(__name__)

# Strict placeholder pattern: [UPPERCASE_TYPE_NUMBER]
_STRICT_PLACEHOLDER_RE = re.compile(r"\[([A-Z][A-Z_]*_\d+)\]")

# Loose pattern to catch modified/malformed placeholders (for warning only)
_LOOSE_PLACEHOLDER_RE = re.compile(r"\[[A-Za-z][A-Za-z_\s]*_?\d*\]")


@dataclass
class ValidationResult:
    valid: bool                           # True if safe to proceed with restoration
    placeholders_in_response: List[str]   # all strict placeholders found
    valid_placeholders: List[str]         # intersection with allowed set
    unknown_placeholders: List[str]       # in response, NOT in allowed set
    repeated_placeholders: List[str]      # appear more than once
    missing_placeholders: List[str]       # in allowed set, NOT in response
    modified_placeholders: List[str]      # close matches that look like corrupted ones
    warnings: List[str]


def validate_response(
    llm_response: str,
    allowed_placeholders: Set[str],
) -> ValidationResult:
    """
    Validate placeholders in the LLM response.

    Args:
        llm_response:         Raw text from the LLM.
        allowed_placeholders: Set of placeholder strings sent to the LLM.

    Returns:
        ValidationResult.  valid=False if unknown placeholders are present.
    """
    warnings: List[str] = []

    # ── Step 1: Find all strict-format placeholders ───────────────────────
    all_found: List[str] = [m.group() for m in _STRICT_PLACEHOLDER_RE.finditer(llm_response)]
    found_set: Set[str] = set(all_found)

    # ── Step 2: Classify placeholders ────────────────────────────────────
    valid_phs = [ph for ph in all_found if ph in allowed_placeholders]
    unknown_phs = list({ph for ph in all_found if ph not in allowed_placeholders})
    missing_phs = [ph for ph in allowed_placeholders if ph not in found_set]

    # Repeated placeholders (appear more than once in response)
    seen_counts: Dict[str, int] = {}
    for ph in all_found:
        seen_counts[ph] = seen_counts.get(ph, 0) + 1
    repeated_phs = [ph for ph, count in seen_counts.items() if count > 1]

    # ── Step 3: Detect modified/fuzzy-matched placeholders ───────────────
    # Look for loose patterns that don't match the strict format
    loose_found = set(m.group() for m in _LOOSE_PLACEHOLDER_RE.finditer(llm_response))
    loose_unmatched = loose_found - found_set  # loose matches not caught by strict

    modified_phs: List[str] = []
    for loose in loose_unmatched:
        # Check if this is a corrupted version of an allowed placeholder
        close = get_close_matches(loose.upper(), [a.upper() for a in allowed_placeholders], n=1, cutoff=0.6)
        if close:
            modified_phs.append(loose)
            warnings.append(
                f"Possible modified placeholder {loose!r} found — "
                f"closest allowed: {close[0]!r}. NOT restored."
            )

    # ── Step 4: Build warnings ────────────────────────────────────────────
    if unknown_phs:
        warnings.append(
            f"Unknown placeholder(s) {unknown_phs} found in LLM response — "
            "these will NOT be restored."
        )
    if missing_phs:
        warnings.append(
            f"Placeholder(s) {missing_phs} were sent to the LLM but are absent "
            "from the response — they will remain unreplaced in the final output."
        )
    if repeated_phs:
        warnings.append(
            f"Placeholder(s) {repeated_phs} appear more than once in the response "
            "— this is allowed; each occurrence will be restored independently."
        )

    # Response is considered valid as long as there are no UNKNOWN placeholders
    valid = len(unknown_phs) == 0

    logger.info(
        "Placeholder validation: valid=%s, found=%d, valid=%d, unknown=%d, missing=%d, modified=%d",
        valid, len(all_found), len(valid_phs), len(unknown_phs), len(missing_phs), len(modified_phs),
    )

    return ValidationResult(
        valid=valid,
        placeholders_in_response=all_found,
        valid_placeholders=valid_phs,
        unknown_placeholders=unknown_phs,
        repeated_placeholders=repeated_phs,
        missing_placeholders=missing_phs,
        modified_placeholders=modified_phs,
        warnings=warnings,
    )
