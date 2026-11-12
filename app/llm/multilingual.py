"""
app/llm/multilingual.py
────────────────────────
Member 2 — Multilingual PII Handling Utilities
────────────────────────────────────────────────
Provides language detection and language-specific recommendations
for PII handling.

Important: Language detection is local only.
Unmasked text is NEVER sent externally to identify PII.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from typing import Optional

logger = logging.getLogger(__name__)

# Try to import langdetect; fall back gracefully if not installed
try:
    from langdetect import detect as _langdetect
    from langdetect.lang_detect_exception import LangDetectException
    _LANGDETECT_AVAILABLE = True
except ImportError:
    _LANGDETECT_AVAILABLE = False
    logger.warning("langdetect not installed — language detection disabled.")


@dataclass
class LanguageInfo:
    detected_language: Optional[str]   # ISO 639-1 code or None
    is_mixed: bool
    has_devanagari: bool               # Hindi/Marathi/etc
    has_kannada: bool
    has_tamil: bool
    has_telugu: bool
    detection_method: str              # "langdetect" | "script_heuristic" | "unknown"


# Unicode ranges for Indian scripts
_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")     # Hindi, Marathi, etc.
_KANNADA_RE    = re.compile(r"[\u0C80-\u0CFF]")
_TAMIL_RE      = re.compile(r"[\u0B80-\u0BFF]")
_TELUGU_RE     = re.compile(r"[\u0C00-\u0C7F]")
_LATIN_RE      = re.compile(r"[A-Za-z]")


def detect_language(text: str) -> LanguageInfo:
    """
    Detect the language(s) present in text.

    Uses Unicode script detection first (reliable for Indian scripts),
    then langdetect for Latin-script languages if available.
    All detection is performed LOCALLY — text is never sent externally.
    """
    has_devanagari = bool(_DEVANAGARI_RE.search(text))
    has_kannada    = bool(_KANNADA_RE.search(text))
    has_tamil      = bool(_TAMIL_RE.search(text))
    has_telugu     = bool(_TELUGU_RE.search(text))
    has_latin      = bool(_LATIN_RE.search(text))

    script_count = sum([has_devanagari, has_kannada, has_tamil, has_telugu, has_latin])
    is_mixed = script_count > 1

    # Determine primary language
    detected = None
    method = "unknown"

    if has_devanagari and not has_latin:
        detected = "hi"
        method = "script_heuristic"
    elif has_kannada and not has_latin:
        detected = "kn"
        method = "script_heuristic"
    elif has_tamil and not has_latin:
        detected = "ta"
        method = "script_heuristic"
    elif has_telugu and not has_latin:
        detected = "te"
        method = "script_heuristic"
    elif is_mixed:
        detected = "mixed"
        method = "script_heuristic"
    elif has_latin and _LANGDETECT_AVAILABLE:
        try:
            detected = _langdetect(text)
            method = "langdetect"
        except Exception:
            detected = "en"
            method = "script_heuristic"
    else:
        detected = "en"
        method = "script_heuristic"

    logger.debug(
        "Language detected: %s (mixed=%s, method=%s)", detected, is_mixed, method
    )

    return LanguageInfo(
        detected_language=detected,
        is_mixed=is_mixed,
        has_devanagari=has_devanagari,
        has_kannada=has_kannada,
        has_tamil=has_tamil,
        has_telugu=has_telugu,
        detection_method=method,
    )


def get_language_label(lang_info: LanguageInfo) -> str:
    """Human-readable language label for logging and audit."""
    if lang_info.is_mixed:
        scripts = []
        if lang_info.has_devanagari:
            scripts.append("Hindi")
        if lang_info.has_kannada:
            scripts.append("Kannada")
        if lang_info.has_tamil:
            scripts.append("Tamil")
        if lang_info.has_telugu:
            scripts.append("Telugu")
        scripts.append("English")
        return f"Mixed ({'+'.join(scripts)})"
    code_map = {"hi": "Hindi", "kn": "Kannada", "ta": "Tamil",
                "te": "Telugu", "en": "English", "mr": "Marathi"}
    return code_map.get(lang_info.detected_language or "", "Unknown")
