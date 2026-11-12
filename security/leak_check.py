"""Pre-LLM outbound payload leak detection module.

Scans outbound payloads for residual unmasked PII (Aadhaar, PAN, GSTIN, Phone,
Email, Names) before dispatch to external LLMs.

Note: Prototype engineering indicator only. Does not claim 100% security or complete
elimination of latent privacy risks.
"""

from __future__ import annotations

import html
import re
import unicodedata
import urllib.parse
from typing import Any, Mapping, Sequence, Set

from security.models import (
    LeakCheckResult,
    LeakedEntityMatch,
    PIIType,
)

# Translation table mapping Unicode Devanagari numerals (U+0966 to U+096F) to standard ASCII 0-9
DEVANAGARI_DIGITS_TRANS = str.maketrans("०१२३४५६७८९", "0123456789")

# Cyrillic homoglyph mappings to Latin equivalents commonly used in spoofing attacks
CYRILLIC_HOMOGLYPH_TRANS = str.maketrans({
    "А": "A", "В": "B", "С": "C", "Е": "E", "Н": "H", "І": "I",
    "Ј": "J", "К": "K", "М": "M", "О": "O", "Р": "P", "Ѕ": "S",
    "Т": "T", "Х": "X", "Ү": "Y", "а": "a", "с": "c", "е": "e",
    "о": "o", "р": "p", "х": "x", "у": "y",
})

# Zero-width / invisible characters regex
ZERO_WIDTH_REGEX = re.compile(r"[\u200B-\u200D\uFEFF\u2060\u200E\u200F]")

# Generic separator character class for Aadhaar, Phone, and PAN splits
SEP = r"[\s\-_./]"

# Regex patterns for identifying unmasked Indian PII entities
LEAK_PATTERNS: tuple[tuple[PIIType, str, str], ...] = (
    # Aadhaar: 12 digits (with optional spaces, dashes, dots, slashes, underscores separating 4-digit groups, or 12 continuous digits)
    (
        PIIType.AADHAAR,
        "raw_aadhaar_pattern",
        rf"\b\d{{4}}{SEP}?\d{{4}}{SEP}?\d{{4}}\b|\b\d{{12}}\b",
    ),
    # PAN: 5 letters, 4 digits, 1 letter (supporting optional separators between blocks, case-insensitive)
    (
        PIIType.PAN,
        "raw_pan_pattern",
        rf"\b[a-zA-Z]{{5}}{SEP}?[0-9]{{4}}{SEP}?[a-zA-Z]\b",
    ),
    # GSTIN: 2-digit state code + 10-char PAN + 1 entity code + 'Z' + 1 checksum char
    (
        PIIType.GSTIN,
        "raw_gstin_pattern",
        r"\b[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9a-zA-Z]{1}[zZ][0-9a-zA-Z]{1}\b",
    ),
    # Indian Mobile Phone: 10 digits starting with 6, 7, 8, or 9 (with optional +91, (+91), 0 prefix, optional 5-5 separator)
    (
        PIIType.PHONE,
        "raw_indian_phone_pattern",
        rf"(?:\(?\+?91\)?{SEP}?|\(?0\)?{SEP}?)?[6-9]\d{{4}}{SEP}?\d{{5}}\b",
    ),
    # Email address
    (
        PIIType.EMAIL,
        "raw_email_pattern",
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    ),
)


def _sanitize_and_canonicalize(text: str) -> str:
    """Normalize text across encodings, homoglyphs, and zero-width characters.

    Pipeline:
    1. HTML entity unescaping (e.g., &#65; -> 'A').
    2. URL percent unquoting (e.g., %41 -> 'A', %20 -> ' ').
    3. Unicode NFKC normalization (converts full-width and mathematical symbols to ASCII).
    4. Devanagari digit translation (०-९ -> 0-9).
    5. Cyrillic homoglyph translation.
    6. Stripping zero-width invisible characters.
    """
    # 1. HTML unescape
    text = html.unescape(text)
    # 2. URL decode
    text = urllib.parse.unquote(text)
    # 3. Unicode NFKC normalization (handles full-width Latin/digits and mathematical bold)
    text = unicodedata.normalize("NFKC", text)
    # 4. Devanagari digits
    text = text.translate(DEVANAGARI_DIGITS_TRANS)
    # 5. Cyrillic homoglyphs
    text = text.translate(CYRILLIC_HOMOGLYPH_TRANS)
    # 6. Zero-width character removal
    text = ZERO_WIDTH_REGEX.sub("", text)
    return text


def _normalize_string(text: str, strip_separators: bool = True) -> str:
    """Normalise string by canonicalizing, lowercasing, and optionally stripping separators."""
    canonical = _sanitize_and_canonicalize(text).lower()
    if strip_separators:
        return re.sub(r"[\s\-_./]+", "", canonical)
    return canonical


def _mask_snippet_for_reporting(text: str) -> str:
    """Mask sensitive string for safe incident reporting (never reveals raw value)."""
    clean = text.strip()
    length = len(clean)
    if length <= 2:
        return "**"
    if length <= 4:
        return clean[0] + ("*" * (length - 1))
    prefix_len = min(2, max(1, length // 4))
    suffix_len = min(2, max(1, length // 4))
    masked_len = max(1, length - prefix_len - suffix_len)
    return clean[:prefix_len] + ("*" * masked_len) + clean[-suffix_len:]


def _extract_all_text_from_payload(payload: Any) -> str:
    """Recursively extract all string values from structured or primitive payload."""
    if isinstance(payload, str):
        return payload
    if isinstance(payload, Mapping):
        parts: list[str] = []
        for val in payload.values():
            parts.append(_extract_all_text_from_payload(val))
        return " \n ".join(parts)
    if isinstance(payload, (list, tuple, set)):
        parts = [_extract_all_text_from_payload(item) for item in payload]
        return " \n ".join(parts)
    return str(payload)


def _is_inside_placeholder(start_idx: int, end_idx: int, text: str) -> bool:
    """Check if the matched span is part of an intentionally masked placeholder.

    Permits placeholders like {{PII_AADHAAR_1}}, <MASKED_PAN_2>, or [PERSON_1].
    Rejects malformed placeholders that embed raw data like {{AADHAAR: 999988887777}}.
    """
    lookback = text[max(0, start_idx - 30):start_idx]
    lookahead = text[end_idx:min(len(text), end_idx + 30)]

    if ("{{" in lookback and "}}" in lookahead) or \
       ("<" in lookback and ">" in lookahead) or \
       ("[" in lookback and "]" in lookahead):
        open_pos = max(lookback.rfind("{{"), lookback.rfind("<"), lookback.rfind("["))
        close_pos = len(lookahead)
        for delim in ("}}", ">", "]"):
            p = lookahead.find(delim)
            if p != -1 and p < close_pos:
                close_pos = p

        enclosing = lookback[open_pos:] + text[start_idx:end_idx] + lookahead[:close_pos]
        clean_token = re.sub(r"[{}\[\]<>]", "", enclosing).strip()
        if re.match(
            r"^(?:MASKED_|PII_|SAFE_)?(?:AADHAAR|PAN|GSTIN|PHONE|EMAIL|NAME|PERSON|PLACEHOLDER|USER|TOKEN)(?:_\d+)?$",
            clean_token,
            re.IGNORECASE,
        ):
            return True
    return False


def _is_value_preserved(
    candidate: str,
    allowed_preserved_normalized: set[str],
    allowed_preserved_raw: set[str],
) -> bool:
    """Check if candidate value matches any intentionally preserved allowed values."""
    if not allowed_preserved_normalized and not allowed_preserved_raw:
        return False

    raw_clean = candidate.strip()
    if raw_clean in allowed_preserved_raw:
        return True

    norm = _normalize_string(candidate, strip_separators=True)
    if norm in allowed_preserved_normalized:
        return True

    norm_with_spaces = _normalize_string(candidate, strip_separators=False).strip()
    if norm_with_spaces in allowed_preserved_normalized:
        return True

    return False


def run_leak_check(
    outbound_payload: Any,
    original_entities: Sequence[Mapping[str, Any]] | None = None,
    allowed_preserved: Sequence[str] | Set[str] | None = None,
) -> LeakCheckResult:
    """Perform pre-LLM leak verification on the outbound payload.

    Pure function that:
    1. Flattens outbound payload (dict, JSON, list, or text string).
    2. Canonicalizes text (HTML decode, URL unquote, Unicode NFKC, Devanagari translation,
       Cyrillic homoglyph normalization, zero-width stripping).
    3. Scans for synthetic or real Aadhaar, PAN, GSTIN, Phone, and Email patterns.
    4. Cross-checks against exact raw entity values recorded during masking (Member 1).
       Uses word-boundary matching for names while supporting possessives (e.g. Ann's).
    5. Excludes any intentionally preserved values provided via allowed_preserved.
    6. Ensures serialized leak report NEVER contains raw original values.

    Args:
        outbound_payload: Outbound text or serialized payload destined for external LLM.
        original_entities: Optional list of raw entities detected before masking.
        allowed_preserved: Optional sequence or set of strings allowed to remain
            unmasked in the outbound payload without being flagged as leaks.

    Returns:
        LeakCheckResult containing leak boolean, count, detailed matches,
        summary description, and prototype engineering indicator.
    """
    raw_extracted = _extract_all_text_from_payload(outbound_payload)
    if not raw_extracted or not raw_extracted.strip():
        return LeakCheckResult(
            has_leak=False,
            leak_count=0,
            leaked_items=[],
            summary="Engineering indicator: Payload is empty. No PII leaks detected.",
            engineering_indicator=(
                "Engineering indicator: Empty outbound payload. Verification completed."
            ),
        )

    # Canonicalize extracted text to defeat evasion attempts
    canonical_extracted = _sanitize_and_canonicalize(raw_extracted)

    # Prepare normalized set of allowed preserved values
    allowed_raw_set: set[str] = set()
    allowed_norm_set: set[str] = set()
    if allowed_preserved:
        for val in allowed_preserved:
            if val is not None:
                sval = str(val).strip()
                if sval:
                    allowed_raw_set.add(sval)
                    allowed_norm_set.add(_normalize_string(sval, strip_separators=True))
                    allowed_norm_set.add(_normalize_string(sval, strip_separators=False).strip())

    leaked_items: list[LeakedEntityMatch] = []
    seen_spans: set[tuple[int, int]] = set()

    # 1. Regex pattern scanning on canonicalized text
    for pii_type, pattern_name, regex_pattern in LEAK_PATTERNS:
        for match in re.finditer(regex_pattern, canonical_extracted, flags=re.IGNORECASE):
            span = (match.start(), match.end())
            if span in seen_spans:
                continue

            # Ensure this is not inside a valid placeholder token
            if _is_inside_placeholder(match.start(), match.end(), canonical_extracted):
                continue

            matched_text = canonical_extracted[match.start():match.end()]

            # Check if this value is intentionally allowed to be preserved
            if _is_value_preserved(matched_text, allowed_norm_set, allowed_raw_set):
                continue

            seen_spans.add(span)
            leaked_items.append(
                LeakedEntityMatch(
                    pii_type=pii_type,
                    raw_snippet=_mask_snippet_for_reporting(matched_text),
                    position=span,
                    detection_method=f"regex:{pattern_name}",
                )
            )

    # 2. Origin entity verification (checking if raw original values leak into outbound text)
    if original_entities:
        for ent in original_entities:
            raw_val = ent.get("value") or ent.get("raw")
            if not raw_val:
                continue

            str_val = str(raw_val).strip()
            if not str_val:
                continue

            # Check if this original entity is explicitly in allowed_preserved
            if _is_value_preserved(str_val, allowed_norm_set, allowed_raw_set):
                continue

            etype_str = str(ent.get("type", "UNKNOWN")).upper()
            norm_type = PIIType[etype_str] if etype_str in PIIType.__members__ else PIIType.UNKNOWN

            # For names, enforce word-boundary matching while permitting possessive apostrophe-s (e.g. Ann's)
            if norm_type == PIIType.NAME:
                escaped_name = re.escape(_sanitize_and_canonicalize(str_val))
                # Word-boundary at start, followed by name, and end boundary or possessive suffix
                name_pattern = rf"\b{escaped_name}(?:'s|’s)?\b"
                for m in re.finditer(name_pattern, canonical_extracted, flags=re.IGNORECASE):
                    span = (m.start(), m.end())
                    if span in seen_spans:
                        continue
                    if _is_inside_placeholder(m.start(), m.end(), canonical_extracted):
                        continue
                    if _is_value_preserved(m.group(0), allowed_norm_set, allowed_raw_set):
                        continue
                    seen_spans.add(span)
                    leaked_items.append(
                        LeakedEntityMatch(
                            pii_type=norm_type,
                            raw_snippet=_mask_snippet_for_reporting(m.group(0)),
                            position=span,
                            detection_method="exact_origin_name_word_boundary",
                        )
                    )
            else:
                # For numbers and other identifiers, normalize before comparing
                canon_val = _sanitize_and_canonicalize(str_val)
                norm_target = _normalize_string(canon_val, strip_separators=True)
                if len(norm_target) < 3:
                    continue

                val_pattern = rf"\b{re.escape(canon_val)}\b"
                found_match = False
                for m in re.finditer(val_pattern, canonical_extracted, flags=re.IGNORECASE):
                    span = (m.start(), m.end())
                    if span in seen_spans:
                        found_match = True
                        continue
                    if _is_inside_placeholder(m.start(), m.end(), canonical_extracted):
                        continue
                    matched_str = canonical_extracted[m.start():m.end()]
                    if _is_value_preserved(matched_str, allowed_norm_set, allowed_raw_set):
                        continue
                    seen_spans.add(span)
                    found_match = True
                    leaked_items.append(
                        LeakedEntityMatch(
                            pii_type=norm_type,
                            raw_snippet=_mask_snippet_for_reporting(matched_str),
                            position=span,
                            detection_method="exact_origin_match",
                        )
                    )

                if not found_match:
                    norm_extracted = _normalize_string(canonical_extracted, strip_separators=True)
                    if norm_target in norm_extracted:
                        leaked_items.append(
                            LeakedEntityMatch(
                                pii_type=norm_type,
                                raw_snippet=_mask_snippet_for_reporting(canon_val),
                                position=(0, len(raw_extracted)),
                                detection_method="normalized_entity_origin_match",
                            )
                        )

    has_leak = len(leaked_items) > 0
    leak_count = len(leaked_items)

    if has_leak:
        types_summary = ", ".join(sorted({item.pii_type.value for item in leaked_items}))
        summary = (
            f"Engineering indicator: Leak detected - {leak_count} unmasked sensitive item(s) found in outbound "
            f"payload ({types_summary}). Transmission to external LLM must be halted."
        )
    else:
        summary = (
            "Engineering indicator: Pre-LLM leak check passed. No unmasked sensitive PII detected in outbound payload."
        )

    engineering_note = (
        f"Engineering indicator: Pattern and entity-origin verification completed. "
        f"Identified {leak_count} potential leak artifact(s). Prototype evaluation "
        "measure to protect data privacy prior to external transit."
    )

    return LeakCheckResult(
        has_leak=has_leak,
        leak_count=leak_count,
        leaked_items=leaked_items,
        summary=summary,
        engineering_indicator=engineering_note,
    )
