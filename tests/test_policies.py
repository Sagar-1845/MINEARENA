"""Unit tests for department policy loading and SecurityPolicy configuration.

Validates security/policies.json loading, fallback to default,
and to_dict() serialization.
"""

import json
import unittest

from security.models import PIIType, SecurityPolicy
from security.policy_checks import get_policy


class TestPolicyLoading(unittest.TestCase):
    """Test suite for get_policy function and policies.json."""

    def test_get_policy_banking(self) -> None:
        """Verifies loading banking department policy."""
        policy = get_policy("banking")
        self.assertEqual(policy.name, "banking")
        self.assertEqual(policy.max_allowed_risk_score, 50.0)
        self.assertTrue(policy.block_on_injection)
        self.assertIn(PIIType.AADHAAR, policy.blocked_pii_types)
        self.assertIn(PIIType.PAN, policy.always_mask)
        self.assertIn(PIIType.PHONE, policy.always_mask)

    def test_get_policy_hr(self) -> None:
        """Verifies loading HR department policy."""
        policy = get_policy("hr")
        self.assertEqual(policy.name, "hr")
        self.assertEqual(policy.max_allowed_risk_score, 60.0)
        self.assertTrue(policy.block_on_injection)
        self.assertEqual(len(policy.blocked_pii_types), 0)
        self.assertIn(PIIType.NAME, policy.always_mask)

    def test_get_policy_healthcare(self) -> None:
        """Verifies loading Healthcare department policy."""
        policy = get_policy("healthcare")
        self.assertEqual(policy.name, "healthcare")
        self.assertEqual(policy.max_allowed_risk_score, 45.0)
        self.assertTrue(policy.block_on_injection)
        self.assertIn(PIIType.AADHAAR, policy.blocked_pii_types)

    def test_get_policy_default_explicit(self) -> None:
        """Verifies loading default policy explicitly."""
        policy = get_policy("default")
        self.assertEqual(policy.name, "default")
        self.assertEqual(policy.max_allowed_risk_score, 65.0)
        self.assertTrue(policy.block_on_injection)

    def test_get_policy_fallback_on_unknown(self) -> None:
        """Verifies fallback to default when unknown department is requested."""
        policy = get_policy("marketing_logistics_unknown")
        self.assertEqual(policy.name, "default")
        self.assertEqual(policy.max_allowed_risk_score, 65.0)

    def test_get_policy_fallback_on_none_or_empty(self) -> None:
        """Verifies fallback to default when department is None or whitespace."""
        policy_none = get_policy(None)
        policy_empty = get_policy("   ")
        self.assertEqual(policy_none.name, "default")
        self.assertEqual(policy_empty.name, "default")

    def test_policy_to_dict_json_serializable(self) -> None:
        """Verifies that SecurityPolicy.to_dict() is fully serializable to JSON."""
        policy = get_policy("banking")
        pdict = policy.to_dict()
        serialized = json.dumps(pdict)
        deserialized = json.loads(serialized)

        self.assertEqual(deserialized["name"], "banking")
        self.assertEqual(deserialized["max_allowed_risk_score"], 50.0)
        self.assertIn("AADHAAR", deserialized["blocked_pii_types"])
        self.assertIn("PAN", deserialized["always_mask"])


if __name__ == "__main__":
    unittest.main()
