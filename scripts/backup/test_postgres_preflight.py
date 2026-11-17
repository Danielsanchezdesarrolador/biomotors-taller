#!/usr/bin/env python3
"""Fully offline tests. Only synthetic subprocess responses; no real secrets."""
import subprocess
import unittest
from unittest.mock import patch
import postgres_preflight as check


def fixture():
    return {
        'PGSSLMODE': 'verify-full',
        'PGSERVICEFILE': '/offline/service',
        'PGPASSFILE': '/offline/pgpass',
        'PGOPTIONS': '-c default_transaction_read_only=on',
    }


class Tests(unittest.TestCase):
    def test_success_uses_readonly_query_and_strict_tls(self):
        result = subprocess.CompletedProcess([], 0, stdout='1\n', stderr='')
        with patch.object(check.subprocess, 'run', return_value=result) as run:
            check.verify_connection('bytetorque_backup', fixture())
        args = run.call_args.args[0]
        self.assertEqual(args[-1], 'SELECT 1')
        self.assertNotIn('pg_stat_ssl', ' '.join(args))
        self.assertIn('-w', args)
        self.assertIn('VERBOSITY=verbose', args)
        self.assertEqual(run.call_args.kwargs['env']['PGSSLMODE'], 'verify-full')
        self.assertTrue(run.call_args.kwargs['capture_output'])

    def test_no_tls_downgrade_or_missing_bindings(self):
        for key, value in (
            ('PGSSLMODE', 'require'), ('PGSSLMODE', 'disable'),
            ('PGSSLMODE', 'verify-ca'), ('PGSERVICEFILE', ''),
            ('PGPASSFILE', ''), ('PGOPTIONS', ''),
        ):
            env = fixture()
            env[key] = value
            with self.subTest(key=key), patch.object(check.subprocess, 'run') as mock:
                with self.assertRaises(check.ProbeFailure):
                    check.verify_connection('bytetorque_backup', env)
                mock.assert_not_called()

    def test_discrete_sanitized_diagnostics(self):
        examples = (
            ('certificate verify failed', 'POSTGRES_CERTIFICATE_REJECTED'),
            ('SSL error: handshake failed', 'POSTGRES_TLS_REJECTED'),
            ('password authentication failed', 'POSTGRES_AUTH_REJECTED'),
            ('unsupported startup parameter: options', 'POSTGRES_POOLER_STARTUP_REJECTED'),
            ('Tenant or user not found', 'POSTGRES_POOLER_IDENTITY_REJECTED'),
            ('could not translate host name', 'POSTGRES_DNS_FAILED'),
            ('connection timed out', 'POSTGRES_NETWORK_TIMEOUT'),
            ('connection refused', 'POSTGRES_NETWORK_FAILED'),
            ('no pg_hba.conf entry', 'POSTGRES_ACCESS_REJECTED'),
            ('PRIVATE_PROVIDER_DETAIL', 'POSTGRES_CLIENT_EXIT_UNEXPECTED'),
            ('FATAL: PRIVATE_PROVIDER_DETAIL', 'POSTGRES_SERVER_REJECTED'),
            ('FATAL: 28P01: PRIVATE_PROVIDER_DETAIL', 'POSTGRES_AUTH_REJECTED'),
            ('FATAL: 0A000: unsupported startup parameter: options', 'POSTGRES_POOLER_STARTUP_REJECTED'),
            ('ERROR: 42501: PRIVATE_PROVIDER_DETAIL', 'POSTGRES_ACCESS_REJECTED'),
        )
        for stderr, expected in examples:
            response = subprocess.CompletedProcess([], 2, stdout='', stderr=stderr)
            with self.subTest(expected=expected), patch.object(check.subprocess, 'run', return_value=response):
                with self.assertRaises(check.ProbeFailure) as failure:
                    check.verify_connection('bytetorque_backup', fixture())
                self.assertEqual(failure.exception.code, expected)
                self.assertNotIn(stderr, str(failure.exception))

    def test_unexpected_success_response_fails_closed(self):
        response = subprocess.CompletedProcess([], 0, stdout='0\n', stderr='')
        with patch.object(check.subprocess, 'run', return_value=response):
            with self.assertRaises(check.ProbeFailure) as failure:
                check.verify_connection('bytetorque_backup', fixture())
            self.assertEqual(failure.exception.code, 'POSTGRES_PROBE_OUTPUT_INVALID')

    def test_timeout_and_process_error_hide_source(self):
        for error, expected in (
            (subprocess.TimeoutExpired('psql', 35), 'POSTGRES_NETWORK_TIMEOUT'),
            (OSError('PRIVATE_PATH'), 'POSTGRES_CLIENT_LAUNCH_FAILED'),
        ):
            with self.subTest(expected=expected), patch.object(check.subprocess, 'run', side_effect=error):
                with self.assertRaises(check.ProbeFailure) as failure:
                    check.verify_connection('bytetorque_backup', fixture())
                self.assertEqual(failure.exception.code, expected)
                self.assertNotIn('PRIVATE_PATH', str(failure.exception))


if __name__ == '__main__':
    unittest.main()
