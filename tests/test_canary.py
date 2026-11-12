"""Unit tests for the synthetic Canary verification runner.

Validates passing and failing cases (skip_masking=False vs skip_masking=True),
details structure, to_dict() serialization, and prototype wording compliance.
"""

import json
import unittest

from security.canary import run_canary


class TestCanaryRunner(unittest.TestCase):
    """Test suite for run_canary function in security/canary.py."""

    def test_canary_passing_case_with_masking(self) -> None:
        """Verifies that run_canary(skip_masking=False) executes cleanly and passes."""
        res = run_canary(skip_masking=False)

        self.assertTrue(res.passed)
        self.assertFalse(res.skip_masking)
        self.assertFalse(res.leak_check_result.has_leak)
        self.assertEqual(res.leak_check_result.leak_count, 0)
        self.assertEqual(res.details["status"], "PASSED")
        self.assertEqual(res.details["leak_count"], 0)
        self.assertGreaterEqual(res.details["synthetic_entities_tested"], 5)
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_canary_failing_case_when_skip_masking(self) -> None:
        """Verifies that run_canary(skip_masking=True) catches unmasked leaks and fails."""
        res = run_canary(skip_masking=True)

        self.assertFalse(res.passed)
        self.assertTrue(res.skip_masking)
        self.assertTrue(res.leak_check_result.has_leak)
        self.assertGreaterEqual(res.leak_check_result.leak_count, 1)
        self.assertEqual(res.details["status"], "FAILED_LEAKS_IDENTIFIED")
        self.assertGreaterEqual(res.details["leak_count"], 1)
        self.assertIn("engineering indicator", res.engineering_indicator.lower())
        self.assertNotIn("100% secure", res.engineering_indicator.lower())

    def test_canary_to_dict_json_serializable(self) -> None:
        """Verifies that CanaryResult.to_dict() produces a fully JSON-serializable dict."""
        res = run_canary(skip_masking=False)
        d = res.to_dict()
        serialized = json.dumps(d)
        deserialized = json.loads(serialized)

        self.assertTrue(deserialized["passed"])
        self.assertFalse(deserialized["skip_masking"])
        self.assertEqual(deserialized["details"]["status"], "PASSED")
        self.assertIn("engineering_indicator", deserialized)
        self.assertIn("leak_check_result", deserialized)


if __name__ == "__main__":
    unittest.main()
