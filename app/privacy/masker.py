"""
app/privacy/masker.py
─────────────────────
Member 1 Integration Stub — PII Masker
───────────────────────────────────────
Receives detected entities and replaces them with typed, indexed
placeholders such as [AADHAAR_1], [PAN_1], [PERSON_1].

The placeholder mapping (original value → placeholder) is NEVER
sent externally.  It is returned to the caller and stored locally
in mapping_store.py, keyed by request_id.

── INTEGRATION NOTE FOR MEMBER 1 ──────────────────────────────────────
Replace this module's body if you use Presidio anonymizer.
Keep the function signature: mask_text() → MaskResult
────────────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass, field
from typing import Dict, List

from app.privacy.detector import DetectedEntity, EntityType, detect_pii

logger = logging.getLogger(__name__)

# Placeholder format: [ENTITY_TYPE_N]
_PLACEHOLDER_RE = re.compile(r"\[([A-Z_]+)_(\d+)\]")


@dataclass
class MaskResult:
    sanitized_text: str                   # text with placeholders inserted
    mapping: Dict[str, str]               # placeholder → original value (LOCAL ONLY)
    entities_found: List[DetectedEntity]  # for audit / context-aware logic
    placeholder_list: List[str]           # ordered list of all placeholders used


def mask_text(
    text: str,
    entities: List[DetectedEntity] | None = None,
    task_entity_filter: set[str] | None = None,
) -> MaskResult:
    """
    Replace detected PII with typed placeholders.

    Args:
        text:               Raw input text.
        entities:           Pre-detected entities (optional; detected if None).
        task_entity_filter: If provided, only mask these entity types.
                            ALWAYS_MASK types (Aadhaar, PAN, etc.) are always masked
                            regardless of this filter.

    Returns:
        MaskResult with sanitized text, local mapping, entity list,
        and placeholder list.
    """
    from app.privacy.detector import ALWAYS_MASK

    if entities is None:
        entities = detect_pii(text)

    if not entities:
        return MaskResult(
            sanitized_text=text,
            mapping={},
            entities_found=[],
            placeholder_list=[],
        )

    # Decide which entities to mask
    if task_entity_filter is not None:
        effective_types = task_entity_filter | ALWAYS_MASK
        entities_to_mask = [e for e in entities if e.entity_type in effective_types]
    else:
        entities_to_mask = entities[:]

    # Sort by position (descending) so replacements don't shift earlier offsets
    entities_to_mask.sort(key=lambda e: e.start, reverse=True)

    mapping: Dict[str, str] = {}       # placeholder → original
    counter: Dict[str, int] = {}       # entity_type → counter
    placeholder_list: List[str] = []

    result = text
    for entity in entities_to_mask:
        etype = entity.entity_type
        counter[etype] = counter.get(etype, 0) + 1
        placeholder = f"[{etype}_{counter[etype]}]"

        # Avoid creating duplicate placeholders for the same value
        existing = next(
            (ph for ph, val in mapping.items() if val == entity.value), None
        )
        if existing:
            placeholder = existing
        else:
            mapping[placeholder] = entity.value
            placeholder_list.append(placeholder)

        result = result[: entity.start] + placeholder + result[entity.end :]

    logger.debug(
        "Masked %d entities → %d unique placeholders", len(entities_to_mask), len(mapping)
    )

    return MaskResult(
        sanitized_text=result,
        mapping=mapping,
        entities_found=entities,
        placeholder_list=placeholder_list,
    )


def extract_placeholders(text: str) -> List[str]:
    """Return all placeholder tokens found in a text string."""
    return _PLACEHOLDER_RE.findall(text)  # returns list of (type, index) tuples


def get_placeholder_set(text: str) -> set[str]:
    """Return the set of full placeholder strings present in text."""
    return set(_PLACEHOLDER_RE.findall_as_strings(text) if hasattr(_PLACEHOLDER_RE, "findall_as_strings")
               else [m.group() for m in _PLACEHOLDER_RE.finditer(text)])
