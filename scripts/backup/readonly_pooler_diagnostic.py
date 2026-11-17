#!/usr/bin/env python3
"""Manually dispatched, read-only Supabase pooler diagnostic. No backup/export."""
import configparser
import io
import os
from pathlib import Path
import re
import ssl
import subprocess
import tempfile

from postgres_preflight import classify

PROJECT = "suxcqqnmcjoezfxltoms"
HOST = "aws-0-sa-east-1.pooler.supabase.com"
PREFIX = f"{HOST}:5432:postgres:postgres.{PROJECT}:"

def main():
    if not (os.getenv("GITHUB_ACTIONS") == "true"
            and os.getenv("GITHUB_EVENT_NAME") == "workflow_dispatch"
            and os.getenv("GITHUB_REF") == "refs/heads/main"
            and os.getenv("GITHUB_REPOSITORY") == "Danielsanchezdesarrolador/biomotors-taller"):
        raise ValueError("GUARD_REJECTED")
    pgpass = os.getenv("BT_BACKUP_PGPASS_CONTENT", "").strip("\r\n")
    ca = os.getenv("BT_BACKUP_PG_CA_PEM", "")
    if (not pgpass.startswith(PREFIX) or not pgpass[len(PREFIX):]
            or "\n" in pgpass or "\r" in pgpass):
        raise ValueError("BINDING_INVALID")
    if "PRIVATE KEY" in ca or "-----BEGIN CERTIFICATE-----" not in ca:
        raise ValueError("CA_INVALID")
    try:
        ssl.create_default_context(cadata=ca)
    except Exception:
        raise ValueError("CA_INVALID") from None
    os.umask(0o077)
    with tempfile.TemporaryDirectory(prefix="bt-probe-") as temp:
        root = Path(temp)
        (root / "ca.pem").write_text(ca)
        (root / "pgpass").write_text(pgpass + "\n")
        config = configparser.ConfigParser(interpolation=None)
        config["bytetorque_backup"] = {
            "host": HOST, "port": "5432", "dbname": "postgres",
            "user": "postgres." + PROJECT, "sslmode": "verify-full",
            "sslrootcert": str(root / "ca.pem"),
        }
        with (root / "service").open("w") as stream:
            config.write(stream)
        base = {k: v for k, v in os.environ.items()
                if not k.startswith(("PG", "BT_BACKUP_", "RCLONE_"))}
        base.update(PGSERVICEFILE=str(root / "service"),
                    PGPASSFILE=str(root / "pgpass"),
                    PGSSLMODE="verify-full", PGCONNECT_TIMEOUT="15")
        # Both commands are a single SELECT, never SQL writes or exports.
        command = ["psql", "-X", "-w", "-A", "-t",
                   "-v", "ON_ERROR_STOP=1", "-v", "VERBOSITY=verbose",
                   "--dbname=service=bytetorque_backup", "-c", "SELECT 1"]
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
            print(f"{label}: {code}", flush=True)

if __name__ == "__main__":
    try:
        main()
    except Exception:
        print("DIAGNOSTIC_NOT_COMPLETE: SAFE_PREPARATION_FAILURE")
        raise SystemExit(1)
