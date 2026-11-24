"""BT-EXP-01: encrypted Storage sidecar for an approved SEC07 recovery set.
No network/credential lookup at import; no real export is enabled by default.
The dump alone never implies that these bytes were captured or restored.
"""
import hashlib
import json
import os
import re
import struct
import subprocess
import tempfile
from pathlib import Path
from urllib.request import Request, build_opener, HTTPRedirectHandler

MAGIC = b'BT-STORAGE-01\n'
MAX_BYTES = 20_000_000
UUID = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
class StorageRecoveryError(Exception):
    pass

def canonical(value):
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(',', ':')).encode('ascii')

def inventory(value):
    if not isinstance(value, dict) or value.get('version') != 1 or not re.fullmatch(UUID, value.get('workshopId', '')) or not re.fullmatch(r'[A-Za-z0-9_-]{1,80}', value.get('recoverySetId', '')):
        raise StorageRecoveryError('INVENTORY_INVALID')
    docs = value.get('documents')
    if not isinstance(docs, list) or not docs or len(docs) > 100000:
        raise StorageRecoveryError('INVENTORY_INVALID')
    seen = set()
    for d in docs:
        bucket, path = d.get('bucket'), d.get('path')
        wid = value['workshopId']
        pattern = (re.escape(wid) + '/quotes/' + UUID + r'/r[1-9][0-9]*/[a-f0-9]{64}\.pdf') if bucket == 'cp05-quote-documents' else (re.escape(wid) + '/closings/' + UUID + '/' + UUID + '/' + UUID + r'/(report|handover)/[a-f0-9]{64}\.pdf') if bucket == 'bt-closing-documents' else None
        if not pattern or not isinstance(path, str) or not re.fullmatch(pattern, path) or (bucket, path) in seen or not re.fullmatch(r'[a-f0-9]{64}', d.get('sha256', '')) or type(d.get('byteLength')) is not int or not 12 <= d['byteLength'] <= MAX_BYTES:
            raise StorageRecoveryError('INVENTORY_INVALID')
        seen.add((bucket, path))
    return value

def checked_bytes(doc, data):
    if not isinstance(data, bytes) or len(data) != doc['byteLength'] or not data.startswith(b'%PDF-') or b'%%EOF' not in data[-2048:] or hashlib.sha256(data).hexdigest() != doc['sha256']:
        raise StorageRecoveryError('OBJECT_INTEGRITY_FAILED')
    return data

def write_snapshot(value, fetch, sink):
    """Plaintext goes only to an in-memory or encryption pipe sink, never a staging file."""
    value = inventory(value)
    header = canonical(value)
    if len(header) > 32_000_000:
        raise StorageRecoveryError('INVENTORY_TOO_LARGE')
    sink.write(MAGIC + struct.pack('>I', len(header)) + header)
    for doc in value['documents']:
        data = checked_bytes(doc, fetch(doc))
        sink.write(struct.pack('>I', len(data)))
        sink.write(data)
    sink.write(b'BT-STORAGE-END\n')
    return {'recoverySetId': value['recoverySetId'], 'inventorySha256': hashlib.sha256(header).hexdigest(), 'objects': len(value['documents'])}

def exact(stream, size):
    data = bytearray()
    while len(data) < size:
        part = stream.read(size - len(data))
        if not part:
            raise StorageRecoveryError('TRUNCATED_SNAPSHOT')
        data.extend(part)
    return bytes(data)

def verify_snapshot(stream, expected, put_if_absent=None, read_back=None, *, isolated=False):
    expected = inventory(expected)
    if put_if_absent is not None and (not isolated or read_back is None):
        raise StorageRecoveryError('ISOLATED_RESTORE_REQUIRED')
    if exact(stream, len(MAGIC)) != MAGIC:
        raise StorageRecoveryError('FORMAT_INVALID')
    size = struct.unpack('>I', exact(stream, 4))[0]
    if size > 32_000_000:
        raise StorageRecoveryError('INVENTORY_TOO_LARGE')
    try:
        actual = inventory(json.loads(exact(stream, size)))
    except (ValueError, TypeError):
        raise StorageRecoveryError('INVENTORY_INVALID') from None
    if canonical(actual) != canonical(expected):
        raise StorageRecoveryError('DATABASE_STORAGE_SET_MISMATCH')
    for doc in actual['documents']:
        size = struct.unpack('>I', exact(stream, 4))[0]
        if size != doc['byteLength']:
            raise StorageRecoveryError('OBJECT_INTEGRITY_FAILED')
        data = checked_bytes(doc, exact(stream, size))
        if put_if_absent is not None:
            put_if_absent(doc, data)
            checked_bytes(doc, read_back(doc))
    if exact(stream, len(b'BT-STORAGE-END\n')) != b'BT-STORAGE-END\n' or stream.read(1):
        raise StorageRecoveryError('FORMAT_INVALID')
    return {'recoverySetId': actual['recoverySetId'], 'objects': len(actual['documents']), 'verified': True}

def encrypt_snapshot(value, fetch, public_key, fingerprint, destination):
    """Public key only in an ephemeral keyring. Ciphertext file is exclusive, mode 0600."""
    if not re.fullmatch(r'[A-Fa-f0-9]{40}|[A-Fa-f0-9]{64}', fingerprint) or b'BEGIN PGP PUBLIC KEY BLOCK' not in public_key or b'PRIVATE KEY' in public_key:
        raise StorageRecoveryError('PUBLIC_RECIPIENT_REQUIRED')
    target = Path(destination)
    with tempfile.TemporaryDirectory(prefix='bt-storage-public-') as home:
        os.chmod(home, 0o700)
        base = ['gpg', '--homedir', home, '--batch', '--no-tty']
        inspection = subprocess.run(base + ['--with-colons', '--import-options', 'show-only', '--dry-run', '--import'], input=public_key, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        lines = inspection.stdout.decode('ascii', errors='ignore').splitlines()
        if inspection.returncode or any(x.startswith(('sec:', 'ssb:')) for x in lines) or not any(x.startswith('fpr:') and x.split(':')[9].upper() == fingerprint.upper() for x in lines):
            raise StorageRecoveryError('PUBLIC_RECIPIENT_REQUIRED')
        imported = subprocess.run(base + ['--import'], input=public_key, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if imported.returncode:
            raise StorageRecoveryError('PUBLIC_RECIPIENT_REQUIRED')
        fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        try:
            with os.fdopen(fd, 'wb') as cipher:
                proc = subprocess.Popen(base + ['--trust-model', 'always', '--recipient', fingerprint, '--encrypt'], stdin=subprocess.PIPE, stdout=cipher, stderr=subprocess.DEVNULL)
                try:
                    receipt = write_snapshot(value, fetch, proc.stdin)
                    proc.stdin.close()
                    if proc.wait() != 0:
                        raise StorageRecoveryError('ENCRYPTION_FAILED')
                except BaseException:
                    proc.stdin.close()
                    proc.terminate()
                    proc.wait()
                    raise
            with target.open('rb') as encrypted:
                receipt['ciphertextSha256'] = hashlib.file_digest(encrypted, 'sha256').hexdigest()
            receipt['scope'] = 'PRIVATE_PDF_OBJECTS_ONLY_NOT_FULL_SUPABASE_DR'
            return receipt
        except BaseException:
            target.unlink(missing_ok=True)
            raise

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        raise StorageRecoveryError('STORAGE_REDIRECT_BLOCKED')

def authenticated_fetch(doc):
    """Future explicit export only. Pinned official project; token is never put in URL/logs."""
    if os.environ.get('BT_STORAGE_EXPORT_AUTHORIZED') != 'true':
        raise StorageRecoveryError('EXPORT_NOT_AUTHORIZED')
    origin = os.environ.get('SUPABASE_URL', '')
    token = os.environ.get('BT_STORAGE_BACKUP_TOKEN', '')
    if origin != 'https://suxcqqnmcjoezfxltoms.supabase.co' or not token:
        raise StorageRecoveryError('EXPORT_NOT_CONFIGURED')
    from urllib.parse import quote
    url = origin + '/storage/v1/object/authenticated/' + doc['bucket'] + '/' + quote(doc['path'], safe='/')
    try:
        with build_opener(NoRedirect()).open(Request(url, headers={'Authorization': 'Bearer ' + token, 'apikey': token}), timeout=30) as response:
            return response.read(MAX_BYTES + 1)
    except Exception:
        raise StorageRecoveryError('STORAGE_READ_FAILED') from None

def main():
    import argparse
    import sys
    parser = argparse.ArgumentParser(description='Candidate Storage sidecar; no action without explicit mode')
    commands = parser.add_subparsers(dest='command', required=True)
    export = commands.add_parser('export')
    for key in ('inventory', 'public-key', 'recipient', 'output'):
        export.add_argument('--' + key, required=True)
    verify = commands.add_parser('verify')
    verify.add_argument('--inventory', required=True)
    verify.add_argument('--isolated-directory')
    verify.add_argument('--encrypted-file')
    verify.add_argument('--owner-gpg-home')
    args = parser.parse_args()
    try:
        value = inventory(json.loads(Path(args.inventory).read_text(encoding='utf8')))
        if args.command == 'export':
            if os.environ.get('BT_STORAGE_EXPORT_AUTHORIZED') != 'true':
                raise StorageRecoveryError('EXPORT_NOT_AUTHORIZED')
            destination = Path(args.output).resolve()
            repo = Path(__file__).resolve().parents[2]
            if destination.is_relative_to(repo):
                raise StorageRecoveryError('BACKUP_MUST_BE_OUTSIDE_REPOSITORY')
            receipt = encrypt_snapshot(value, authenticated_fetch, Path(args.public_key).read_bytes(), args.recipient, destination)
            sidecar = destination.with_suffix(destination.suffix + '.receipt.json')
            with sidecar.open('x', encoding='ascii') as proof:
                json.dump(receipt, proof, sort_keys=True)
            print('BT_STORAGE_SIDECAR: ENCRYPTED_AND_HASHED; RECOVERY_NOT_YET_PROVEN')
        else:
            put = read = None
            if args.isolated_directory:
                root = Path(args.isolated_directory).resolve()
                if root.is_relative_to(Path(__file__).resolve().parents[2]):
                    raise StorageRecoveryError('RESTORE_MUST_BE_OUTSIDE_REPOSITORY')
                root.mkdir(mode=0o700)  # new destination only; never overwrite an existing tree
                def put(doc, data):
                    target = root / doc['bucket'] / doc['path']
                    target.parent.mkdir(parents=True, exist_ok=True)
                    with target.open('xb') as restored:
                        restored.write(data)
                def read(doc):
                    return (root / doc['bucket'] / doc['path']).read_bytes()
            if args.owner_gpg_home and not args.encrypted_file:
                raise StorageRecoveryError('OWNER_HOME_ONLY_FOR_EXPLICIT_DECRYPTION')
            if args.encrypted_file:
                command = ['gpg'] + (['--homedir', args.owner_gpg_home] if args.owner_gpg_home else [])
                # Owner-side only: binary subprocess transport also works on Windows PowerShell 5.1.
                proc = subprocess.Popen(command + ['--decrypt', args.encrypted_file], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
                try:
                    verify_snapshot(proc.stdout, value, put, read, isolated=put is not None)
                    if proc.wait() != 0:
                        raise StorageRecoveryError('DECRYPTION_FAILED')
                finally:
                    proc.stdout.close()
                    if proc.poll() is None:
                        proc.terminate()
                    proc.wait()
            else:
                verify_snapshot(sys.stdin.buffer, value, put, read, isolated=put is not None)
            print('BT_STORAGE_SIDECAR: VERIFIED' + ('_ISOLATED_BYTES_RESTORED' if put else '_NO_RESTORE'))
    except Exception as error:
        code = error.args[0] if isinstance(error, StorageRecoveryError) else 'LOCAL_OPERATION_FAILED'
        print('BT_STORAGE_SIDECAR: BLOCKED; CODE=' + code, file=sys.stderr)
        return 1
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
