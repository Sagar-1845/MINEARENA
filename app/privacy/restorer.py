"""
app/privacy/restorer.py
────────────────────────
Member 1 Integration Stub — Safe Local Restoration
────────────────────────────────────────────────────
Replaces placeholders in an LLM response with their original values
using ONLY the per-request local mapping.

Security rules enforced here:
  1. Only known placeholders (those in the allowed set) are restored.
  2. Unknown / hallucinated placeholders are left as-is and flagged.
  3. Modified placeholders (e.g. [Person_1] instead of [PERSON_1])
     are never guessed at — they are flagged as warnings.
  4. No second mapping system is created here — always uses mapping_store.

── INTEGRATION NOTE FOR MEMBER 1 ──────────────────────────────────────
Replace the body of `restore_text()` if needed.
Keep the signature: (text, request_id, allowed_placeholders) → RestoreResult
────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List, Set, Optional

from app.privacy import mapping_store

logger = logging.getLogger(__name__)

_PLACEHOLDER_RE = re.compile(r"\[([A-Z_]+_\d+)\]")


@dataclass
class RestoreResult:
    restored_text: str
    placeholders_found: List[str]      # all placeholders seen in LLM response
    placeholders_restored: List[str]   # successfully restored
    placeholders_missing: List[str]    # in mapping but not in response
    placeholders_unknown: List[str]    # in response but NOT in mapping
    warnings: List[str]


def restore_text(
    llm_response: str,
    request_id: str,
    allowed_placeholders: Set[str],
) -> RestoreResult:
    """
    Restore original values into the LLM response.

    Args:
        llm_response:         Raw text returned by the LLM.
        request_id:           Used to fetch the correct local mapping.
        allowed_placeholders: Set of placeholders that were sent to the LLM.

    Returns:
        RestoreResult with restored text and detailed warnings.
    """
    mapping: Optional[Dict[str, str]] = mapping_store.retrieve(request_id)

    if mapping is None:
        return RestoreResult(
            restored_text=llm_response,
            placeholders_found=[],
            placeholders_restored=[],
            placeholders_missing=[],
            placeholders_unknown=[],
            warnings=[f"No mapping found for request_id={request_id}. Restoration skipped."],
        )

    # Find all placeholders present in the LLM response
    found_in_response: List[str] = [
        f"[{m.group(1)}]" for m in _PLACEHOLDER_RE.finditer(llm_response)
    ]
    found_set = set(found_in_response)

    restored: List[str] = []
    unknown: List[str] = []
    warnings: List[str] = []

    result = llm_response

    for placeholder in sorted(found_set, key=len, reverse=True):  # longest first
        if placeholder not in mapping:
            # Placeholder appears in response but was never in our mapping
            unknown.append(placeholder)
            warnings.append(
                f"Unknown placeholder {placeholder!r} found in LLM response — NOT restored."
            )
            continue

        if placeholder not in allowed_placeholders:
            # Placeholder exists in mapping but was not part of this request's
            # allowed set — could be a cross-request injection attempt.
            unknown.append(placeholder)
            warnings.append(
                f"Placeholder {placeholder!r} not in allowed set for this request — NOT restored."
            )
            continue

        # Safe to restore
        original_value = mapping[placeholder]
        result = result.replace(placeholder, original_value)
        restored.append(placeholder)

    # Identify placeholders that were in the original text but are missing from response
    missing = [ph for ph in allowed_placeholders if ph not in found_set]
    if missing:
        warnings.append(
            f"These placeholders were sent to the LLM but are absent from the response: {missing}"
        )

    logger.debug(
        "Restoration complete: restored=%d, missing=%d, unknown=%d",
        len(restored), len(missing), len(unknown),
    )

    return RestoreResult(
        restored_text=result,
        placeholders_found=list(found_set),
        placeholders_restored=restored,
        placeholders_missing=missing,
        placeholders_unknown=unknown,
        warnings=warnings,
    )
