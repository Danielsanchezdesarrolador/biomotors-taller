#!/usr/bin/env python3
"""Manually dispatched, read-only Supabase pooler diagnostic. No backup/export."""
import os
from pathlib import Path
import re
import ssl
import subprocess
import tempfile

from postgres_preflight import classify
from postgres_config import normalize_pgpass, service_content

PROJECT = "suxcqqnmcjoezfxltoms"
HOST = "aws-0-sa-east-1.pooler.supabase.com"
PREFIX = f"{HOST}:5432:postgres:postgres.{PROJECT}:"

# Never render a secret, a provider error or an exception from third-party code.
# Only these fixed labels may leave the preparation step.
PREPARATION_CODES = frozenset({
    "GUARD_REJECTED", "PGPASS_MISSING", "PGPASS_FORMAT_INVALID",
    "CA_MISSING", "CA_FORMAT_INVALID", "CA_PARSE_INVALID",
})


class PreparationFailure(ValueError):
    def __init__(self, code):
        self.code = code if code in PREPARATION_CODES else "GUARD_REJECTED"
        super().__init__(self.code)


def main():
    if not (os.getenv("GITHUB_ACTIONS") == "true"
            and os.getenv("GITHUB_EVENT_NAME") == "workflow_dispatch"
            and os.getenv("GITHUB_REF") == "refs/heads/main"
            and os.getenv("GITHUB_REPOSITORY") == "Danielsanchezdesarrolador/biomotors-taller"):
        raise PreparationFailure("GUARD_REJECTED")
    pgpass_value = os.getenv("BT_BACKUP_PGPASS_CONTENT", "")
    ca = os.getenv("BT_BACKUP_PG_CA_PEM", "")
    if not pgpass_value:
        raise PreparationFailure("PGPASS_MISSING")
    try:
        pgpass = normalize_pgpass(pgpass_value)
    except ValueError:
        raise PreparationFailure("PGPASS_FORMAT_INVALID") from None
    if not ca:
        raise PreparationFailure("CA_MISSING")
    if "PRIVATE KEY" in ca or "-----BEGIN CERTIFICATE-----" not in ca:
        raise PreparationFailure("CA_FORMAT_INVALID")
    try:
        ssl.create_default_context(cadata=ca)
    except Exception:
        raise PreparationFailure("CA_PARSE_INVALID") from None
    os.umask(0o077)
    with tempfile.TemporaryDirectory(prefix="bt-probe-") as temp:
        root = Path(temp)
        (root / "ca.pem").write_text(ca)
        (root / "pgpass").write_text(pgpass)
        (root / "service").write_text(service_content(root / "ca.pem"))
        base = {k: v for k, v in os.environ.items()
                if not k.startswith(("PG", "BT_BACKUP_", "RCLONE_"))}
        base.update(PGSERVICEFILE=str(root / "service"),
                    PGPASSFILE=str(root / "pgpass"),
                    PGSSLMODE="verify-full", PGCONNECT_TIMEOUT="15")
        # Both commands are a single SELECT, never SQL writes or exports.
        command = ["psql", "-X", "-w", "-A", "-t",
                   "-v", "ON_ERROR_STOP=1", "-v", "VERBOSITY=verbose",
                   "--dbname=service=bytetorque_backup", "-c", "SELECT 1"]
        all_ok = True
        for label, options in (("WITH_STARTUP_OPTIONS", True),
                               ("WITHOUT_STARTUP_OPTIONS", False)):
            env = dict(base)
            if options:
                env["PGOPTIONS"] = "-c default_transaction_read_only=on"
            try:
                result = subprocess.run(command, env=env, capture_output=True,
                                        text=True, timeout=25, check=False)
                code = ("OK" if result.returncode == 0 and result.stdout.strip() == "1"
                        else classify(result))
            except subprocess.TimeoutExpired:
                code = "POSTGRES_NETWORK_TIMEOUT"
            except OSError:
                code = "POSTGRES_CLIENT_LAUNCH_FAILED"
            # Fixed codes only. Never expose stderr, stdout, credentials or host details.
            if not re.fullmatch(r"[A-Z_]+", code):
                code = "UNCLASSIFIED"
            all_ok = all_ok and code == "OK"
            print(f"{label}: {code}", flush=True)
        return 0 if all_ok else 1

if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except PreparationFailure as error:
        print("DIAGNOSTIC_NOT_COMPLETE: " + error.code)
        raise SystemExit(1)
    except Exception:
        print("DIAGNOSTIC_NOT_COMPLETE: SAFE_PREPARATION_FAILURE")
        raise SystemExit(1)
