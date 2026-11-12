"""Pytest test suite for ZeroLeak AI Pre-LLM Outbound Leak Checker.

Uses synthetic test data only (never real Aadhaar or PAN numbers).
Validates that alerts contain 'engineering indicator' and never '100% secure'.
"""

from __future__ import annotations

import json
from typing import Any

import pytest

from security.leak_check import run_leak_check
from security.models import PIIType


# ---------------------------------------------------------------------------
# Leak Detection Test Cases (Must be detected as leaks)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "aadhaar_format",
    [
        "1234 5678 9012",      # Spaced 4-4-4
        "1234-5678-9012",      # Dashed 4-4-4
        "123456789012",        # Contiguous 12 digits
        "१२३४ ५६७८ ९०१२",      # Devanagari numerals spaced
        "१२३४-५६७८-९०१२",      # Devanagari numerals dashed
        "१२३४५६७८९०१२",        # Devanagari numerals contiguous
    ],
)
def test_aadhaar_leaks_detected(aadhaar_format: str) -> None:
    """Verifies that synthetic Aadhaar in various formats (including Devanagari) are flagged as leaks."""
    payload = f"The customer's synthetic identification is {aadhaar_format}."
    result = run_leak_check(payload)

    assert result.has_leak is True
    assert result.leak_count >= 1
    assert any(item.pii_type == PIIType.AADHAAR for item in result.leaked_items)
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


@pytest.mark.parametrize(
    "pan_val",
    [
        "abcde1234f",
        "xyzab5678c",
        "ABCDE1234F",
    ],
)
def test_lowercase_and_cased_pan_leak_detected(pan_val: str) -> None:
    """Verifies that a synthetic PAN in lowercase or mixed case is detected as a leak."""
    payload = f"Payment tax document recorded under PAN {pan_val}."
    result = run_leak_check(payload)

    assert result.has_leak is True
    assert result.leak_count >= 1
    assert any(item.pii_type == PIIType.PAN for item in result.leaked_items)
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


@pytest.mark.parametrize(
    "phone_format",
    [
        "+91 98765 43210",   # +91 with space in 10-digit number (5-5)
        "98765-43210",       # 10-digit phone with dash (5-5)
        "09876543210",       # Leading 0 format (STD/national prefix)
        "+91-9876543210",    # +91 with contiguous 10 digits
        "9876543210",        # Plain 10 digits starting with 9
    ],
)
def test_phone_format_leaks_detected(phone_format: str) -> None:
    """Verifies detection of synthetic Indian phone numbers across diverse formatting styles."""
    payload = f"Please contact customer support hotline at {phone_format} immediately."
    result = run_leak_check(payload)

    assert result.has_leak is True
    assert result.leak_count >= 1
    assert any(item.pii_type == PIIType.PHONE for item in result.leaked_items)
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


@pytest.mark.parametrize(
    "cased_name",
    [
        "ramesh kumar",      # lowercase
        "RAMESH KUMAR",      # uppercase
        "Ramesh Kumar",      # title case
        "RaMeSh KuMaR",      # mixed case
    ],
)
def test_name_different_casing_detected(cased_name: str) -> None:
    """Verifies that a detected name entity leaks when present in different casing."""
    original_entities = [{"type": "NAME", "value": "Ramesh Kumar"}]
    payload = f"The assigned representative is {cased_name} for this account."
    result = run_leak_check(payload, original_entities=original_entities)

    assert result.has_leak is True
    assert result.leak_count >= 1
    assert any(item.pii_type == PIIType.NAME for item in result.leaked_items)
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


def test_leak_embedded_inside_longer_sentence() -> None:
    """Verifies that a sensitive value deeply embedded in complex text is detected."""
    sentence = (
        "During the routine annual compliance review conducted in Mumbai, "
        "the auditor noted that customer account 44102 was linked to synthetic PAN abcde1234f "
        "without prior supervisor authorization."
    )
    result = run_leak_check(sentence)

    assert result.has_leak is True
    assert any(item.pii_type == PIIType.PAN for item in result.leaked_items)
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


# ---------------------------------------------------------------------------
# Part A: Required Additional Tests
# ---------------------------------------------------------------------------

def test_leak_at_very_start_and_very_end_of_payload() -> None:
    """Part A.1: Leak at the very start (index 0) and the very end of payload string."""
    payload = "ABCDE1234F is the customer tax identifier, reaching back on 9876543210"
    result = run_leak_check(payload)

    assert result.has_leak is True
    assert result.leak_count >= 2
    types = {item.pii_type for item in result.leaked_items}
    assert PIIType.PAN in types
    assert PIIType.PHONE in types


def test_leak_inside_nested_payload_and_json_string() -> None:
    """Part A.2: Leak inside deeply nested structures and serialized JSON string."""
    nested_payload = {
        "messages": [
            {
                "role": "user",
                "content": "Verify customer account with synthetic PAN ABCDE1234F.",
            }
        ]
    }
    result_nested = run_leak_check(nested_payload)
    assert result_nested.has_leak is True
    assert any(item.pii_type == PIIType.PAN for item in result_nested.leaked_items)

    json_string_payload = json.dumps({
        "status": "success",
        "user_data": {
            "records": [
                {"id_token": "1234 5678 9012"}
            ]
        }
    })
    result_json = run_leak_check(json_string_payload)
    assert result_json.has_leak is True
    assert any(item.pii_type == PIIType.AADHAAR for item in result_json.leaked_items)


def test_leak_report_never_contains_raw_original_value() -> None:
    """Part A.3: The leak report must NEVER contain the raw original value, only type and position."""
    raw_pan = "ABCDE1234F"
    raw_aadhaar = "1234 5678 9012"
    raw_phone = "9876543210"
    raw_name = "Ramesh Kumar"

    original_entities = [
        {"type": "PAN", "value": raw_pan},
        {"type": "AADHAAR", "value": raw_aadhaar},
        {"type": "PHONE", "value": raw_phone},
        {"type": "NAME", "value": raw_name},
    ]

    payload = f"Records for {raw_name}: PAN {raw_pan}, Aadhaar {raw_aadhaar}, Phone {raw_phone}"
    result = run_leak_check(payload, original_entities=original_entities)

    assert result.has_leak is True
    report_dict_str = str(result.to_dict())

    # Raw unmasked values must never appear in serialized leak report
    assert raw_pan not in report_dict_str, "Raw PAN found in serialized leak report!"
    assert raw_aadhaar not in report_dict_str, "Raw Aadhaar found in serialized leak report!"
    assert raw_phone not in report_dict_str, "Raw Phone found in serialized leak report!"
    assert raw_name not in report_dict_str, "Raw Name found in serialized leak report!"


def test_12_digit_order_number_flagged_as_possible_aadhaar() -> None:
    """Part A.4: A 12-digit order number is explicitly flagged as a possible Aadhaar leak.

    Comment: Fail-safe architectural choice.
    In a high-assurance privacy gateway, any 12-digit number sequence is treated as a potential
    Aadhaar exposure to prevent malicious exfiltration disguised as order or serial numbers.
    If an order number is intentionally public, it must be declared via allowed_preserved.
    """
    order_payload = "Your order reference number 123456789012 has been packed."
    result = run_leak_check(order_payload)

    # Fail-safe choice: Assert explicitly that it IS flagged as a possible Aadhaar
    assert result.has_leak is True
    assert any(item.pii_type == PIIType.AADHAAR for item in result.leaked_items)


def test_name_ann_vs_annual_and_anns_possessive() -> None:
    """Part A.5: Single-word name 'Ann' vs 'Annual' (safe) and 'Ann' vs 'Ann's' (leak)."""
    original_entities = [{"type": "NAME", "value": "Ann"}]

    # 'Ann' vs 'Annual' -> must NOT match
    res_annual = run_leak_check("Annual review meeting summary.", original_entities=original_entities)
    assert res_annual.has_leak is False

    # 'Ann' vs 'Ann's' -> MUST match because Ann is the target entity
    res_anns = run_leak_check("This document was prepared on Ann's request.", original_entities=original_entities)
    assert res_anns.has_leak is True
    assert any(item.pii_type == PIIType.NAME for item in res_anns.leaked_items)


def test_name_with_initial_r_kumar() -> None:
    """Part A.5: A name with an initial like 'R. Kumar' is detected as a leak."""
    original_entities = [{"type": "NAME", "value": "R. Kumar"}]
    payload = "Document signed by R. Kumar in New Delhi."
    result = run_leak_check(payload, original_entities=original_entities)

    assert result.has_leak is True
    assert any(item.pii_type == PIIType.NAME for item in result.leaked_items)


@pytest.mark.parametrize(
    "split_payload",
    [
        "Customer PAN is ABCDE\n1234F for filing.",       # Split across line break
        "Identification: 1234\t5678\t9012 registered.",   # Split across tabs
        "Reach out at 98765\n43210 during day.",          # Phone split across line break
    ],
)
def test_value_split_across_line_break_or_tab(split_payload: str) -> None:
    """Part A.6: Values split across newline or tab characters must still be flagged."""
    result = run_leak_check(split_payload)
    assert result.has_leak is True, f"Failed to detect leak split across whitespace/tab: '{split_payload}'"


# ---------------------------------------------------------------------------
# Part B: Adversarial Attack Inputs (Must be detected as leaks)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "evasion_input, expected_type",
    [
        # 1. Full-width digits in Aadhaar (U+FF11..U+FF19)
        ("Aadhaar id is １２３４ ５６７８ ９０１２ here", PIIType.AADHAAR),
        # 2. Mathematical bold digits in Aadhaar (U+1D7CE..U+1D7D7)
        ("Identity key 𝟏𝟐𝟑𝟒 𝟓𝟔𝟕𝟖 𝟗𝟎𝟏𝟐 found", PIIType.AADHAAR),
        # 3. Zero-width space inside Aadhaar (U+200B)
        ("Aadhaar: 1234\u200b5678\u200b9012 for user", PIIType.AADHAAR),
        # 4. Zero-width non-joiner & joiner in PAN (U+200C, U+200D)
        ("Record under PAN ABCDE\u200c1234\u200df approved", PIIType.PAN),
        # 5. Full-width Latin letters in PAN (U+FF21..U+FF25)
        ("Tax PAN identifier: ＡＢＣＤＥ１２３４Ｆ", PIIType.PAN),
        # 6. Mixed Cyrillic homoglyphs in PAN ('А' U+0410, 'В' U+0412, 'С' U+0421, 'Е' U+0415)
        ("Document PAN is \u0410\u0412\u0421D\u04151234F today", PIIType.PAN),
        # 7. URL-encoded PAN string
        ("User submitted token %41%42%43%44%45%31%32%33%34%46 to api", PIIType.PAN),
        # 8. URL-encoded Aadhaar with %20
        ("User verification link 1234%205678%209012 logged", PIIType.AADHAAR),
        # 9. Aadhaar with dot separators
        ("Aadhaar reference 1234.5678.9012 active", PIIType.AADHAAR),
        # 10. Aadhaar with slash separators
        ("Aadhaar reference 1234/5678/9012 active", PIIType.AADHAAR),
        # 11. Phone with dot separators
        ("Contact phone 98765.43210 registered", PIIType.PHONE),
        # 12. Phone with slash separators
        ("Contact phone +91/98765/43210 registered", PIIType.PHONE),
        # 13. Phone with brackets around country/operator code
        ("Direct phone (+91) 9876543210 available", PIIType.PHONE),
        # 14. HTML entity encoded PAN characters
        ("Entity PAN &#65;&#66;&#67;&#68;&#69;1234F stored", PIIType.PAN),
        # 15. Aadhaar with underscore separators
        ("Synthetic Aadhaar 1234_5678_9012 logged", PIIType.AADHAAR),
    ],
)
def test_adversarial_evasion_inputs_detected(evasion_input: str, expected_type: PIIType) -> None:
    """Part B: 15 adversarial evasion attacks that attempt to bypass leak checks."""
    result = run_leak_check(evasion_input)
    assert result.has_leak is True, f"Attacker evasion succeeded: '{evasion_input}' was not detected!"
    assert any(item.pii_type == expected_type for item in result.leaked_items)


# ---------------------------------------------------------------------------
# Part B: Harmless Inputs (Must NOT be blocked, must pass as safe)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "harmless_text",
    [
        # 1. ISO 8601 timestamps
        "Server deployment timestamp: 2026-11-12T13:00:45Z on host-node-01.",
        # 2. Product SKU / Catalog numbers
        "Inventory catalog item code: SKU-9988-7711-PART.",
        # 3. Currency / financial amounts with commas and decimals
        "Quarterly net revenue reached $1,234,567.89 and domestic spend was INR 98,76,543.00.",
        # 4. Standard IPv4 addresses and network port numbers
        "Database cluster connection established at 192.168.1.100 on port 8080 successfully.",
        # 5. English prose containing words with 'PAN' or 'PHONE' substrings
        "The expansion committee formed a panel to accompany participants across PAN-India campaigns.",
    ],
)
def test_harmless_inputs_not_blocked(harmless_text: str) -> None:
    """Part B: 5 harmless inputs that must pass cleanly without false positive leak flags."""
    result = run_leak_check(harmless_text)
    assert result.has_leak is False, f"Harmless text falsely blocked: '{harmless_text}', leaks: {result.leaked_items}"
    assert result.leak_count == 0


# ---------------------------------------------------------------------------
# Safe Scenarios (Must pass without leaks)
# ---------------------------------------------------------------------------

@pytest.mark.parametrize(
    "placeholder_text",
    [
        "Hello [PERSON_1], your loan inquiry has been received.",
        "Profile for [PERSON_1] with phone [PHONE_1] and Aadhaar [AADHAAR_1].",
        "{{PII_NAME_1}} requested balance updates for {{PII_PAN_1}}.",
        "<MASKED_AADHAAR_1> verified by <MASKED_NAME_1> successfully.",
    ],
)
def test_text_containing_only_placeholders_passes_safe(placeholder_text: str) -> None:
    """Verifies that text containing standard placeholders passes without flagging leaks."""
    result = run_leak_check(placeholder_text)

    assert result.has_leak is False
    assert result.leak_count == 0
    assert len(result.leaked_items) == 0
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


def test_value_in_allowed_preserved_passes_safe() -> None:
    """Verifies that sensitive-looking values listed in allowed_preserved pass cleanly."""
    support_phone = "+91 98765 43210"
    official_email = "support@service.gov.in"
    payload = f"For grievance escalation, reach {support_phone} or email {official_email}."

    result = run_leak_check(
        payload,
        allowed_preserved=[support_phone, official_email],
    )

    assert result.has_leak is False
    assert result.leak_count == 0
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


# ---------------------------------------------------------------------------
# False-Positive and Robustness Checks
# ---------------------------------------------------------------------------

def test_random_12_digit_order_number_does_not_crash_checker() -> None:
    """False-positive check 1: A random 12-digit order reference executes safely without crashing."""
    order_payload = {
        "order_id": "ORD-123456789012",
        "status": "PROCESSING",
        "description": "Standard retail tracking item ORD-987654321012.",
    }

    try:
        result = run_leak_check(order_payload)
    except Exception as exc:
        pytest.fail(f"run_leak_check crashed on 12-digit order number: {exc}")

    assert isinstance(result.has_leak, bool)
    assert isinstance(result.leak_count, int)
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


def test_benign_business_text_does_not_falsely_flag_name_substrings() -> None:
    """False-positive check 2: Substrings like 'Ann' inside 'Annual' or 'Marianne' do not trigger false leaks."""
    original_entities = [{"type": "NAME", "value": "Ann"}]
    benign_text = (
        "The Annual shareholders meeting will review the financial performance "
        "and determine annual dividend allocations."
    )

    result = run_leak_check(benign_text, original_entities=original_entities)

    assert result.has_leak is False
    assert result.leak_count == 0
    assert "engineering indicator" in result.engineering_indicator.lower()
    assert "100% secure" not in result.engineering_indicator.lower()


def test_iso_date_and_sku_do_not_falsely_trigger_phone_or_aadhaar() -> None:
    """False-positive check 3: Standard ISO timestamps and alphanumeric SKUs do not falsely trigger leaks."""
    text = "Shipment dispatched on 2026-11-12 with SKU ITEM-9988-77."
    result = run_leak_check(text)

    assert result.has_leak is False
    assert result.leak_count == 0
