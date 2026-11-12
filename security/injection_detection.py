"""Prompt injection and adversarial pattern detection module.

Provides deterministic heuristic scanners to detect prompt overrides, jailbreaks,
delimiter hijacking, obfuscation cues, and gateway bypass attempts.

Note: Prototype engineering indicator only. Does not claim 100% security or complete
immunity against all potential adversarial techniques.
"""

from __future__ import annotations

import re
from typing import Sequence

from security.models import (
    InjectionDetectionResult,
    InjectionIndicatorMatch,
)

# Tuple structure: (Pattern Name, Category, Regex Pattern, Weight [0.0 to 1.0])
INJECTION_RULES: tuple[tuple[str, str, str, float], ...] = (
    # 1. Instruction Override / Hijacking
    (
        "ignore_instructions",
        "instruction_override",
        r"(?i)\b(?:ignore|disregard|forget|override|bypass)\b[\s\w,]{0,30}\b(?:all|previous|prior|above|former|system|initial)\b[\s\w,]{0,20}\b(?:instructions|directives|prompts|rules|guidelines|constraints)\b",
        0.85,
    ),
    (
        "new_instructions_priority",
        "instruction_override",
        r"(?i)\b(?:now\s+act\s+as|from\s+now\s+on\s+you\s+(?:must|are)|your\s+new\s+(?:instructions|rules|identity)\s+are)\b",
        0.75,
    ),
    (
        "system_directive_override",
        "instruction_override",
        r"(?i)\b(?:disregard\s+the\s+system\s+prompt|overwrite\s+core\s+programming|ignore\s+safety\s+guidelines)\b",
        0.90,
    ),

    # 2. Jailbreaking & Adversarial Personas
    (
        "dan_jailbreak",
        "jailbreak",
        r"(?i)\b(?:dan\s+mode|do\s+anything\s+now|developer\s+mode\s+v[0-9]|unrestricted\s+mode|jailbreak(?:ed)?\s+prompt)\b",
        0.95,
    ),
    (
        "persona_rule_bypass",
        "jailbreak",
        r"(?i)\b(?:pretend\s+(?:to\s+be|you\s+have)\s+no\s+(?:rules|filters|morals|limits|restrictions)|act\s+without\s+any\s+safeguards)\b",
        0.80,
    ),
    (
        "unfiltered_assistant",
        "jailbreak",
        r"(?i)\b(?:evil\s+twin|always\s+comply|never\s+refuse|ignore\s+all\s+refusals|answer\s+without\s+censorship)\b",
        0.75,
    ),

    # 3. Delimiter Hijacking & Chat Markup Injection
    (
        "chat_markup_tags",
        "delimiter_injection",
        r"(?i)(?:<\|im_start\|>|<\|im_end\|>|\[INST\]|\[\/INST\]|<<SYS>>|<\/SYS>|<system>|<\/system>)",
        0.90,
    ),
    (
        "prompt_separator_hijack",
        "delimiter_injection",
        r"(?i)(?:^|\n)(?:[-=]{3,}|#{2,})\s*(?:system(?:\s+message)?|admin(?:\s+override)?|assistant(?:\s+mode)?)\s*:\s*",
        0.80,
    ),

    # 4. Obfuscation & Evasion Cues
    (
        "base64_execution_cue",
        "obfuscation",
        r"(?i)\b(?:decode\s+(?:the\s+following|this)?\s+base64\s+(?:and\s+execute|and\s+follow|payload)|echo\s+[a-z0-9+/=]{20,}\s*\|\s*base64)\b",
        0.85,
    ),
    (
        "encoding_bypass_cue",
        "obfuscation",
        r"(?i)\b(?:rot13\s+encoded|hex\s+decoded\s+instructions|decode\s+hex\s+and\s+run)\b",
        0.70,
    ),
    (
        "zero_width_character_flood",
        "obfuscation",
        r"[\u200B-\u200D\uFEFF]{3,}",
        0.80,
    ),

    # 5. Gateway / Placeholder Exfiltration Attacks
    (
        "unmask_placeholder_extraction",
        "gateway_bypass",
        r"(?i)\b(?:reveal|unmask|extract|print|show)\s+(?:the\s+original|raw|unredacted|hidden)?\s*(?:masked\s+)?(?:placeholder|aadhaar|pan|phone|email|gstin|pii)\b",
        0.85,
    ),
    (
        "privacy_gateway_override",
        "gateway_bypass",
        r"(?i)\b(?:bypass\s+(?:privaguard|zeroleak)|ignore\s+(?:the\s+)?privacy\s+gateway|dump\s+anonymization\s+map|restore\s+tokens\s+prematurely)\b",
        0.90,
    ),
)


def detect_prompt_injection(
    text: str,
    custom_rules: Sequence[tuple[str, str, str, float]] | None = None,
    flag_threshold: float = 0.60,
) -> InjectionDetectionResult:
    """Detect prompt injection and adversarial manipulation attempts in input text.

    Scans the provided text against heuristic signatures covering prompt overrides,
    jailbreak requests, delimiter injection, encoding-based evasion cues, and privacy
    gateway extraction attacks.

    Args:
        text: Input string to inspect (typically masked text from Member 1).
        custom_rules: Optional additional rules tuple (name, category, regex, weight).
        flag_threshold: Confidence score threshold (0.0 to 1.0) above which is_flagged is set True.

    Returns:
        InjectionDetectionResult containing matched indicators, confidence score,
        attack categories, and engineering indicator statement.
    """
    if not text or not text.strip():
        return InjectionDetectionResult(
            is_flagged=False,
            confidence_score=0.0,
            matched_indicators=[],
            categories=[],
            engineering_indicator=(
                "Engineering indicator: Input text is empty. No injection patterns observed."
            ),
        )

    all_rules = list(INJECTION_RULES)
    if custom_rules:
        all_rules.extend(custom_rules)

    matches: list[InjectionIndicatorMatch] = []
    matched_categories: set[str] = set()

    max_weight: float = 0.0
    accumulated_weight: float = 0.0

    for name, category, pattern, weight in all_rules:
        for match in re.finditer(pattern, text):
            match_span = (match.start(), match.end())
            matched_text = match.group(0)

            indicator = InjectionIndicatorMatch(
                pattern_name=name,
                category=category,
                matched_text=matched_text,
                position=match_span,
                weight=weight,
            )
            matches.append(indicator)
            matched_categories.add(category)

            if weight > max_weight:
                max_weight = weight
            accumulated_weight += weight * 0.25

    # Composite heuristic confidence score: bounded between 0.0 and 1.0
    confidence_score = min(1.0, round(max_weight + (accumulated_weight if matches else 0.0) * 0.2, 4))
    is_flagged = bool(matches and (confidence_score >= flag_threshold or max_weight >= 0.75))

    indicator_note = (
        f"Engineering indicator: Static heuristic detection flagged {len(matches)} pattern(s) "
        f"with confidence {confidence_score:.2f}. Serves as an engineering indicator for prototype review; "
        f"not an absolute security guarantee."
    )

    return InjectionDetectionResult(
        is_flagged=is_flagged,
        confidence_score=confidence_score,
        matched_indicators=matches,
        categories=sorted(matched_categories),
        engineering_indicator=indicator_note,
    )
