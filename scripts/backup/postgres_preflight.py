#!/usr/bin/env python3
"""Offline-testable, secret-safe libpq connection probe; never print provider data.

A PostgreSQL server's pg_stat_ssl describes its own backend connection, which
need not be the GitHub-to-pooler TLS session. libpq with verify-full does.
"""
import subprocess

CODES = frozenset({
    'POSTGRES_CERTIFICATE_REJECTED', 'POSTGRES_TLS_REJECTED',
    'POSTGRES_AUTH_REJECTED', 'POSTGRES_POOLER_STARTUP_REJECTED',
    'POSTGRES_POOLER_IDENTITY_REJECTED', 'POSTGRES_DNS_FAILED',
    'POSTGRES_NETWORK_FAILED', 'POSTGRES_NETWORK_TIMEOUT',
    'POSTGRES_ACCESS_REJECTED', 'POSTGRES_CLIENT_LAUNCH_FAILED',
    'POSTGRES_PROBE_UNEXPECTED',
})


class ProbeFailure(RuntimeError):
    def __init__(self, code):
        self.code = code if code in CODES else 'POSTGRES_PROBE_UNEXPECTED'
        super().__init__(self.code)


def classify(result):
    if result.returncode == 0:
        return 'POSTGRES_PROBE_UNEXPECTED'
    message = (result.stderr or '').lower()
    patterns = (
        ('POSTGRES_CERTIFICATE_REJECTED', (
            'certificate verify failed', 'certificate verification failed',
            'server certificate', 'root certificate', 'certificate file',
            'certificate chain', 'hostname mismatch', 'does not match host',
            'self-signed certificate', 'unknown ca',
        )),
        ('POSTGRES_TLS_REJECTED', (
            'ssl error', 'ssl negotiation', 'server does not support ssl',
            'tls handshake', 'ssl connection has been closed',
        )),
        ('POSTGRES_AUTH_REJECTED', (
            'password authentication failed', 'authentication failed',
            'invalid password', 'no password supplied',
        )),
        ('POSTGRES_POOLER_STARTUP_REJECTED', (
            'unsupported startup parameter', 'unsupported startup message',
            'unsupported parameter', 'unsupported options',
        )),
        ('POSTGRES_POOLER_IDENTITY_REJECTED', (
            'tenant or user not found', 'unknown tenant', 'tenant not found',
        )),
        ('POSTGRES_DNS_FAILED', (
            'could not translate host name', 'temporary failure in name resolution',
            'name or service not known', 'no address associated with hostname',
        )),
        ('POSTGRES_NETWORK_TIMEOUT', (
            'connection timed out', 'timeout expired', 'operation timed out',
        )),
        ('POSTGRES_NETWORK_FAILED', (
            'connection refused', 'network is unreachable', 'no route to host',
            'could not connect to server', 'failed to connect',
        )),
        ('POSTGRES_ACCESS_REJECTED', (
            'no pg_hba.conf entry', 'permission denied', 'not allowed to connect',
        )),
    )
    for code, fragments in patterns:
        if any(fragment in message for fragment in fragments):
            return code
    return 'POSTGRES_PROBE_UNEXPECTED'


def verify_connection(service, env):
    """A read-only SELECT 1 over libpq TLS verify-full; never log command output."""
    if (service != 'bytetorque_backup' or
            env.get('PGSSLMODE') != 'verify-full' or
            not env.get('PGSERVICEFILE') or
            not env.get('PGPASSFILE') or
            env.get('PGOPTIONS') != '-c default_transaction_read_only=on'):
        raise ProbeFailure('POSTGRES_PROBE_UNEXPECTED')
    command = [
        'psql', '-X', '-w', '-A', '-t', '-v', 'ON_ERROR_STOP=1',
        '--dbname=service=' + service, '-c', 'SELECT 1',
    ]
    try:
        result = subprocess.run(
            command, env=env, capture_output=True, text=True,
            timeout=35, check=False,
        )
    except subprocess.TimeoutExpired:
        raise ProbeFailure('POSTGRES_NETWORK_TIMEOUT') from None
    except OSError:
        raise ProbeFailure('POSTGRES_CLIENT_LAUNCH_FAILED') from None
    if result.returncode != 0 or result.stdout.strip() != '1':
        raise ProbeFailure(classify(result))
