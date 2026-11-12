"""Unit tests for Pre-LLM Outbound Leak Check module.

Uses synthetic test data only (no real Aadhaar or PAN values).
Validates that alerts contain 'engineering indicator' and never '100% secure'.
"""

import json
import unittest

from security.leak_check import run_leak_check
from security.models import PIIType


class TestLeakCheck(unittest.TestCase):
    """Test suite for run_leak_check function."""

    def test_clean_masked_payload_passes(self) -> None:
        """Verifies that an outbound payload with well-formed placeholders has no leaks."""
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": "Analyze account for customer {{PII_NAME_1}} with phone {{PII_PHONE_1}}.",
                }
            ]
        }
        res = run_leak_check(payload)
        self.assertFalse(res.has_leak)
        self.assertEqual(res.leak_count, 0)
        self.assertIn("no unmasked sensitive pii detected", res.summary.lower())
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_synthetic_aadhaar_leak_detected(self) -> None:
        """Verifies detection of unmasked synthetic Aadhaar number in outbound payload."""
        synthetic_aadhaar = "9999 8888 7777"
        payload = f"Please process identity verification for Aadhaar: {synthetic_aadhaar}"
        res = run_leak_check(payload)

        self.assertTrue(res.has_leak)
        self.assertGreaterEqual(res.leak_count, 1)
        aadhaar_matches = [item for item in res.leaked_items if item.pii_type == PIIType.AADHAAR]
        self.assertGreaterEqual(len(aadhaar_matches), 1)
        self.assertIn("*", aadhaar_matches[0].raw_snippet)
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_synthetic_aadhaar_format_variations(self) -> None:
        """Verifies detection of synthetic Aadhaar in spaced, dashed, and contiguous formats."""
        variants = [
            "1234 5678 9012",
            "1234-5678-9012",
            "123456789012",
        ]
        for variant in variants:
            payload = f"Customer ID check for {variant} in records."
            res = run_leak_check(payload)
            self.assertTrue(
                res.has_leak,
                f"Failed to detect synthetic Aadhaar variation: '{variant}'",
            )
            aadhaar_matches = [item for item in res.leaked_items if item.pii_type == PIIType.AADHAAR]
            self.assertGreaterEqual(
                len(aadhaar_matches),
                1,
                f"No Aadhaar match for variation '{variant}'",
            )

    def test_devanagari_digits_leak_detection(self) -> None:
        """Verifies detection of synthetic Aadhaar formatted using Unicode Devanagari numerals."""
        devanagari_variants = [
            "१२३४ ५६७८ ९०१२",
            "१२३४-५६७८-९०१२",
            "१२३४५६७८९०१२",
        ]
        for dev_num in devanagari_variants:
            payload = f"ग्राहक आधार संख्या: {dev_num}"
            res = run_leak_check(payload)
            self.assertTrue(
                res.has_leak,
                f"Failed to detect Devanagari numeral leak: '{dev_num}'",
            )
            aadhaar_matches = [item for item in res.leaked_items if item.pii_type == PIIType.AADHAAR]
            self.assertGreaterEqual(
                len(aadhaar_matches),
                1,
                f"No Aadhaar match for Devanagari '{dev_num}'",
            )

    def test_name_word_boundary_ann_vs_annual(self) -> None:
        """Verifies that 'Ann' does not match 'Annual', but matches exact 'Ann'."""
        entities = [{"type": "NAME", "value": "Ann"}]

        # Payload containing the word "Annual" - should NOT trigger a leak for "Ann"
        annual_payload = "Please review the Annual financial report for the department."
        res_annual = run_leak_check(annual_payload, original_entities=entities)
        self.assertFalse(
            res_annual.has_leak,
            "False positive: 'Ann' incorrectly matched 'Annual'!",
        )

        # Payload containing the actual name "Ann" - SHOULD trigger a leak
        ann_payload = "Please assign this ticket to Ann for immediate review."
        res_ann = run_leak_check(ann_payload, original_entities=entities)
        self.assertTrue(
            res_ann.has_leak,
            "Failed to detect exact name 'Ann' when present as a distinct word.",
        )
        self.assertTrue(any(item.pii_type == PIIType.NAME for item in res_ann.leaked_items))

    def test_allowed_preserved_parameter(self) -> None:
        """Verifies that intentionally preserved values in allowed_preserved are not flagged."""
        synthetic_phone = "+91 9876543210"
        synthetic_email = "support@publiccompany.com"
        payload = f"For inquiries, contact customer support at {synthetic_phone} or {synthetic_email}."

        # Without allowed_preserved, both phone and email trigger leaks
        res_blocked = run_leak_check(payload)
        self.assertTrue(res_blocked.has_leak)
        self.assertEqual(res_blocked.leak_count, 2)

        # With allowed_preserved, both values are permitted and not flagged
        res_allowed = run_leak_check(
            payload,
            allowed_preserved=[synthetic_phone, synthetic_email],
        )
        self.assertFalse(
            res_allowed.has_leak,
            f"Expected allowed_preserved to permit values, but got leaks: {res_allowed.leaked_items}",
        )
        self.assertEqual(res_allowed.leak_count, 0)

    def test_synthetic_pan_leak_detected(self) -> None:
        """Verifies detection of unmasked synthetic PAN in outbound payload."""
        synthetic_pan = "ABCDE1234F"
        payload = {"prompt": f"Verify tax compliance for PAN number {synthetic_pan}."}
        res = run_leak_check(payload)

        self.assertTrue(res.has_leak)
        pan_matches = [item for item in res.leaked_items if item.pii_type == PIIType.PAN]
        self.assertEqual(len(pan_matches), 1)
        self.assertIn("*", pan_matches[0].raw_snippet)
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_synthetic_gstin_leak_detected(self) -> None:
        """Verifies detection of unmasked synthetic GSTIN in outbound payload."""
        synthetic_gstin = "22ABCDE1234F1Z5"
        payload = f"Invoice record for GSTIN: {synthetic_gstin}"
        res = run_leak_check(payload)

        self.assertTrue(res.has_leak)
        gstin_matches = [item for item in res.leaked_items if item.pii_type == PIIType.GSTIN]
        self.assertEqual(len(gstin_matches), 1)
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_synthetic_phone_and_email_leak_detected(self) -> None:
        """Verifies detection of synthetic Indian phone and email addresses."""
        synthetic_phone = "+91 9876543210"
        synthetic_email = "test.user@example.com"
        payload = f"Contact details: phone {synthetic_phone}, email {synthetic_email}"
        res = run_leak_check(payload)

        self.assertTrue(res.has_leak)
        self.assertEqual(res.leak_count, 2)
        types = {item.pii_type for item in res.leaked_items}
        self.assertIn(PIIType.PHONE, types)
        self.assertIn(PIIType.EMAIL, types)
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_original_entity_cross_check(self) -> None:
        """Verifies that original unmasked entity values (e.g., Name) are caught."""
        original_entities = [
            {"type": "NAME", "value": "Alex Doe"},
            {"type": "PHONE", "value": "+91 9876543210"},
        ]
        payload = "Summary for patient Alex Doe with ID {{MASKED_PHONE_1}}."
        res = run_leak_check(payload, original_entities=original_entities)

        self.assertTrue(res.has_leak)
        name_matches = [
            m for m in res.leaked_items
            if "name" in m.detection_method or m.pii_type == PIIType.NAME
        ]
        self.assertGreaterEqual(len(name_matches), 1)
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_empty_payload(self) -> None:
        """Verifies clean handling of empty outbound payload."""
        res = run_leak_check("")
        self.assertFalse(res.has_leak)
        self.assertEqual(res.leak_count, 0)
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_leak_check_to_dict_json_serializable(self) -> None:
        """Verifies that LeakCheckResult.to_dict() serializes to valid JSON."""
        res = run_leak_check("Raw synthetic leak: ABCDE1234F")
        d = res.to_dict()
        serialized = json.dumps(d)
        deserialized = json.loads(serialized)
        self.assertTrue(deserialized["has_leak"])
        self.assertGreaterEqual(deserialized["leak_count"], 1)
        self.assertIn("engineering indicator", deserialized["engineering_indicator"].lower())


if __name__ == "__main__":
    unittest.main()
