# BT-BACKUP-GHA-04 - Pooler TLS preflight

The earlier check used the server-side pg_stat_ssl view; behind a session pooler this can describe the pooler-to-PostgreSQL connection rather than the GitHub-to-pooler TLS session.

A read-only SELECT 1 through libpq with the existing pinned PostgreSQL service, sslmode=verify-full and CA file now confirms that the authenticated TLS connection can execute SQL. The expected result must be exactly 1. No SSL bypass or downgrade, no database mutation, no new credential, and no automatic backup run.

Failures use a finite allowlist of diagnostic codes for certificate, TLS, authentication, pooler startup/options, tenant identity, DNS, network and unexpected responses. Provider stderr/stdout and credentials are never published. Offline synthetic tests run before environment secrets are supplied in the manually dispatched workflow.

Code-only change, [skip render], single main branch. Encrypted backup and recovery remain unverified until explicitly executed and checked separately.
