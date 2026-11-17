#!/usr/bin/env python3
"""Secret-free, offline assertions for the diagnostic preparation boundary."""
import os
import unittest
from unittest.mock import patch
import readonly_pooler_diagnostic as diagnostic


class PreparationTests(unittest.TestCase):
    def settings(self):
        return {
            "GITHUB_ACTIONS": "true",
            "GITHUB_EVENT_NAME": "workflow_dispatch",
            "GITHUB_REF": "refs/heads/main",
            "GITHUB_REPOSITORY": "Danielsanchezdesarrolador/biomotors-taller",
            "BT_BACKUP_PGPASS_CONTENT": diagnostic.PREFIX + "SYNTHETIC_NOT_A_PASSWORD",
            "BT_BACKUP_PG_CA_PEM": "-----BEGIN CERTIFICATE-----\nSYNTHETIC\n-----END CERTIFICATE-----",
        }

    def test_missing_or_invalid_bindings_have_fixed_safe_codes(self):
        cases = [
            ("BT_BACKUP_PGPASS_CONTENT", "", "PGPASS_MISSING"),
            ("BT_BACKUP_PGPASS_CONTENT", "not-a-pgpass-entry", "PGPASS_FORMAT_INVALID"),
            ("BT_BACKUP_PGPASS_CONTENT", diagnostic.PREFIX + "SYNTHETIC\nSECOND", "PGPASS_FORMAT_INVALID"),
            ("BT_BACKUP_PG_CA_PEM", "", "CA_MISSING"),
            ("BT_BACKUP_PG_CA_PEM", "PRIVATE KEY SYNTHETIC", "CA_FORMAT_INVALID"),
            ("BT_BACKUP_PG_CA_PEM", "-----BEGIN CERTIFICATE-----\nSYNTHETIC\n-----END CERTIFICATE-----", "CA_PARSE_INVALID"),
            ("GITHUB_REF", "refs/heads/other", "GUARD_REJECTED"),
        ]
        for key, value, expected in cases:
            values = self.settings()
            values[key] = value
            with self.subTest(key=key, expected=expected):
                with patch.dict(os.environ, values, clear=True):
                    with self.assertRaises(diagnostic.PreparationFailure) as raised:
                        diagnostic.main()
                self.assertEqual(raised.exception.code, expected)
                self.assertIn(expected, diagnostic.PREPARATION_CODES)
                self.assertNotIn("SYNTHETIC", str(raised.exception))

    def test_no_unapproved_code_can_be_logged(self):
        self.assertEqual(diagnostic.PreparationFailure("SYNTHETIC_SECRET").code, "GUARD_REJECTED")


if __name__ == "__main__":
    unittest.main()
