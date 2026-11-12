"""Canary test runner for ZeroLeak AI pipeline validation.

Generates clearly synthetic PII tokens, executes a stub masking step,
constructs an outbound payload, and runs leak verification.

Note: Prototype engineering indicator only. Uses synthetic test tokens.
Never claims 100% security or complete invulnerability.
"""

from __future__ import annotations

from typing import Any

from security.leak_check import run_leak_check
from security.models import CanaryResult

# Clearly synthetic canary token definitions
SYNTHETIC_CANARY_NAME = "Canary Synthetic User"
SYNTHETIC_CANARY_AADHAAR = "9999 8888 7777"
SYNTHETIC_CANARY_PAN = "ABCDE1234F"
SYNTHETIC_CANARY_PHONE = "+91 9876543210"
SYNTHETIC_CANARY_EMAIL = "canary.test@example.com"
SYNTHETIC_CANARY_GSTIN = "22ABCDE1234F1Z5"


def run_canary(skip_masking: bool = False) -> CanaryResult:
    """Execute synthetic canary run through masking and outbound leak inspection.

    Pipeline test flow:
    1. Generates known synthetic PII (Name, Aadhaar, PAN, Phone, Email, GSTIN).
    2. Runs stub masking step:
       - If skip_masking is False, replaces synthetic PII with placeholders.
       - If skip_masking is True, leaves synthetic PII unmasked (simulating masking failure).
    3. Builds standard outbound payload format.
    4. Executes pre-LLM leak verification via run_leak_check.
    5. Returns CanaryResult indicating whether outbound payload passed clean (passed=True)
       or failed due to unmasked leaks (passed=False).

    Args:
        skip_masking: If True, bypasses masking to verify leak detector catches unmasked PII.

    Returns:
        CanaryResult with passed boolean, details dictionary, and LeakCheckResult.
    """
    entities = [
        {"type": "NAME", "value": SYNTHETIC_CANARY_NAME},
        {"type": "AADHAAR", "value": SYNTHETIC_CANARY_AADHAAR},
        {"type": "PAN", "value": SYNTHETIC_CANARY_PAN},
        {"type": "PHONE", "value": SYNTHETIC_CANARY_PHONE},
        {"type": "EMAIL", "value": SYNTHETIC_CANARY_EMAIL},
        {"type": "GSTIN", "value": SYNTHETIC_CANARY_GSTIN},
    ]

    raw_text = (
        f"Customer {SYNTHETIC_CANARY_NAME} with Aadhaar {SYNTHETIC_CANARY_AADHAAR}, "
        f"PAN {SYNTHETIC_CANARY_PAN}, phone {SYNTHETIC_CANARY_PHONE}, "
        f"email {SYNTHETIC_CANARY_EMAIL}, and GSTIN {SYNTHETIC_CANARY_GSTIN}."
    )

    if skip_masking:
        # Simulate pipeline failure where Member 1 did not mask sensitive values
        processed_text = raw_text
    else:
        # Standard stub masking step
        processed_text = (
            "Customer {{PII_NAME_1}} with Aadhaar {{PII_AADHAAR_1}}, "
            "PAN {{PII_PAN_1}}, phone {{PII_PHONE_1}}, "
            "email {{PII_EMAIL_1}}, and GSTIN {{PII_GSTIN_1}}."
        )

    # Member 2 stub payload build
    outbound_payload = {
        "model": "zeroleak-canary-evaluator",
        "messages": [
            {
                "role": "system",
                "content": "You are a customer service assistant.",
            },
            {
                "role": "user",
                "content": processed_text,
            },
        ],
    }

    # Member 3 Stage 2 leak check
    leak_res = run_leak_check(
        outbound_payload=outbound_payload,
        original_entities=entities,
    )

    # If leaks exist, canary run fails; if leak-free, canary run passes
    passed = not leak_res.has_leak

    status_str = "PASSED" if passed else "FAILED_LEAKS_IDENTIFIED"
    details: dict[str, Any] = {
        "status": status_str,
        "skip_masking": skip_masking,
        "synthetic_entities_tested": len(entities),
        "leak_count": leak_res.leak_count,
        "leak_summary": leak_res.summary,
    }

    engineering_note = (
        f"Engineering indicator: Canary test executed (skip_masking={skip_masking}). "
        f"Outcome: {status_str} with {leak_res.leak_count} detected leak(s). "
        "Provides an engineering indicator for pipeline integrity."
    )

    return CanaryResult(
        passed=passed,
        skip_masking=skip_masking,
        leak_check_result=leak_res,
        details=details,
        engineering_indicator=engineering_note,
    )
