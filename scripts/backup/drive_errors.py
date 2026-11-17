"""Fixed diagnostic labels only; provider messages never leave this module."""
import json
import subprocess

CODES = frozenset({
    'DRIVE_RCLONE_MISSING', 'DRIVE_RCLONE_TIMEOUT', 'DRIVE_RCLONE_LAUNCH_FAILED',
    'DRIVE_OAUTH_GRANT_REJECTED', 'DRIVE_OAUTH_CLIENT_REJECTED',
    'DRIVE_OAUTH_REFRESH_REQUIRED', 'DRIVE_SCOPE_INSUFFICIENT',
    'DRIVE_API_DISABLED', 'DRIVE_RATE_LIMITED', 'DRIVE_TLS_FAILED',
    'DRIVE_NETWORK_FAILED', 'DRIVE_RCLONE_CONFIG_REJECTED',
    'DRIVE_RCLONE_EXECUTION_FAILED', 'DRIVE_LIST_JSON_INVALID',
    'DRIVE_LIST_SCHEMA_INVALID', 'DRIVE_FOLDER_NOT_LISTED',
    'DRIVE_FOLDER_NAME_AMBIGUOUS', 'DRIVE_FOLDER_ID_MISMATCH',
    'DRIVE_FOLDER_PATH_MISMATCH', 'DRIVE_STAT_MISMATCH',
    'DRIVE_HTTP_UNAUTHENTICATED', 'DRIVE_HTTP_FORBIDDEN',
    'DRIVE_FOLDER_INACCESSIBLE', 'DRIVE_HTTP_FAILED',
    'DRIVE_UNCLASSIFIED', 'DRIVE_OWNER_MISMATCH', 'DRIVE_OWNER_UNAVAILABLE',
    'DRIVE_OWNER_INPUT_INVALID',
})

class DriveFailure(RuntimeError):
    def __init__(self, code):
        self.code = code if code in CODES else 'DRIVE_UNCLASSIFIED'
        super().__init__(self.code)


def classify_message(message):
    # Read in memory, never return substrings, URLs, account names or messages.
    text = (message or '').lower()
    for code, markers in (
        ('DRIVE_OAUTH_GRANT_REJECTED', ('invalid_grant',)),
        ('DRIVE_OAUTH_CLIENT_REJECTED', ('invalid_client', 'unauthorized_client', 'deleted_client')),
        ('DRIVE_OAUTH_REFRESH_REQUIRED', ('token expired and refresh token is not set', 'empty token found')),
        ('DRIVE_SCOPE_INSUFFICIENT', ('insufficientpermissions', 'insufficient authentication scopes', 'access_token_scope_insufficient')),
        ('DRIVE_HTTP_UNAUTHENTICATED', ('invalid credentials', 'autherror', 'invalid authentication credentials')),
        ('DRIVE_API_DISABLED', ('accessnotconfigured', 'service_disabled', 'has not been used in project')),
        ('DRIVE_RATE_LIMITED', ('ratelimitexceeded', 'userratelimitexceeded', 'quotaexceeded')),
        ('DRIVE_TLS_FAILED', ('x509:', 'certificate verify failed', 'certificate verification failed')),
        ('DRIVE_NETWORK_FAILED', ('no such host', 'network is unreachable', 'connection refused', 'dial tcp', 'i/o timeout')),
        ('DRIVE_RCLONE_CONFIG_REJECTED', ('failed to decrypt client secret', 'failed to load config file', "didn't find section in config file", 'unknown flag:')),
    ):
        if any(marker in text for marker in markers):
            return code
    return 'DRIVE_RCLONE_EXECUTION_FAILED'


def http_failure(error):
    # Only structured reason codes are interpreted; never expose response bodies.
    try:
        payload = json.loads(error.read(65536))
        reasons = {row.get('reason') for row in payload.get('error', {}).get('errors', [])
                   if isinstance(row, dict)}
    except Exception:
        reasons = set()
    for reason, code in (('insufficientPermissions', 'DRIVE_SCOPE_INSUFFICIENT'),
                         ('accessNotConfigured', 'DRIVE_API_DISABLED'),
                         ('rateLimitExceeded', 'DRIVE_RATE_LIMITED'),
                         ('userRateLimitExceeded', 'DRIVE_RATE_LIMITED')):
        if reason in reasons:
            return DriveFailure(code)
    # A bare 403/404 does not identify scope, account, existence or deletion.
    return DriveFailure({401: 'DRIVE_HTTP_UNAUTHENTICATED',
                         403: 'DRIVE_HTTP_FORBIDDEN',
                         404: 'DRIVE_FOLDER_INACCESSIBLE',
                         429: 'DRIVE_RATE_LIMITED'}.get(error.code, 'DRIVE_HTTP_FAILED'))


def rclone_json(command, env):
    try:
        result = subprocess.run(command, check=False, stdout=subprocess.PIPE,
                                stderr=subprocess.PIPE, text=True, timeout=45, env=env)
    except FileNotFoundError:
        raise DriveFailure('DRIVE_RCLONE_MISSING') from None
    except subprocess.TimeoutExpired:
        raise DriveFailure('DRIVE_RCLONE_TIMEOUT') from None
    except OSError:
        raise DriveFailure('DRIVE_RCLONE_LAUNCH_FAILED') from None
    if result.returncode:
        raise DriveFailure(classify_message(result.stderr)) from None
    try:
        return json.loads(result.stdout)
    except (ValueError, TypeError):
        raise DriveFailure('DRIVE_LIST_JSON_INVALID') from None
