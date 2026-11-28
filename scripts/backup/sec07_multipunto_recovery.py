"""Pure, fail-closed Multipunto recovery checks for the existing S5B executor.

No credentials, filesystem access, subprocesses, network calls or mutable gates.
Input cells are PostgreSQL COPY values AFTER the original COPY escape decoder.
Receipts contain counts and digests, never rows, tenant IDs, PDF bytes or paths.
"""
import datetime as dt
import decimal
import hashlib
import json
import re
import uuid

BASE_TABLES = frozenset(('public.quote_revisions', 'bt_com_private.closing_manifests',
                         'storage.objects', 'storage.buckets'))
MP_PREFIX = 'bt_multipunto_private.'
LEDGER = 'bt_commercial_private.consumption'
BUCKET = 'bt-inspection-documents'
MAX_PDF_BYTES = 20_000_000
MAX_LEDGER_BYTES = 20_971_520
MAX_CANONICAL_BYTES = 1_048_576
UUID = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
HASH = r'[0-9a-f]{64}'

_COLUMNS = {
 'control': 'id read_enabled write_enabled recovery_ready epoch',
 'epochs': 'workshop_id version',
 'items': 'id ordinal category label',
 'policy': 'id definition sha256',
 'snapshots': 'id workshop_id order_id source_hash snapshot_hash policy_id canonical payload captured_at',
 'credits': 'credit_id workshop_id snapshot_id authority final_document_id',
 'jobs': 'id workshop_id order_id snapshot_id actor_id session_id authority kind credit_id requested_credit_id max_additional_units partial_ack generation lease_until revision state created_at document_id',
 'artifacts': 'job_id generation workshop_id pdf_bytes pdf_hash byte_length path verified_at',
 'documents': 'id workshop_id order_id snapshot_id revision credit_id issuer pdf_hash byte_length bucket path document_date confirmed_at',
 'events': 'id workshop_id job_id actor_id action at',
 'read_limits': 'workshop_id actor_id window_start used',
}
COLUMN_NAMES = {MP_PREFIX + name: tuple(cols.split()) for name, cols in _COLUMNS.items()}
COLUMN_NAMES[LEDGER] = tuple(('request_id workshop_id actor_id capability resource_id state '
                            'reserved_at expires_at confirmed_at plan_at_reservation '
                            'snapshot_hash session_id document_bytes').split())
MP_TABLES = frozenset(MP_PREFIX + name for name in _COLUMNS)
RECOVERY_TABLES = MP_TABLES | {LEDGER}
PRIMARY_KEYS = {table: ('id',) for table in MP_TABLES}
PRIMARY_KEYS.update({MP_PREFIX+'epochs': ('workshop_id',),
 MP_PREFIX+'credits': ('credit_id',), MP_PREFIX+'artifacts': ('job_id', 'generation'),
 MP_PREFIX+'read_limits': ('workshop_id', 'actor_id'), LEDGER: ('request_id',)})
_JSON_COLUMNS = {'definition', 'payload', 'authority'}
_TIMESTAMPS = {'captured_at', 'lease_until', 'created_at', 'verified_at', 'document_date',
               'confirmed_at', 'at', 'window_start', 'reserved_at', 'expires_at'}
_INT_COLUMNS = {'epoch', 'version', 'ordinal', 'max_additional_units', 'generation',
                'revision', 'byte_length', 'used'}
_BOOL_COLUMNS = {'read_enabled', 'write_enabled', 'recovery_ready', 'partial_ack'}

class RecoveryError(Exception):
    """Stable, sanitized error code only; no source values in exception messages."""

def _need(ok, code):
    if not ok:
        raise RecoveryError(code)

def _uid(value):
    _need(isinstance(value, str) and re.fullmatch(UUID, value) is not None,
          'MP_UUID_INVALID')
    return value

def _hash(value):
    _need(isinstance(value, str) and re.fullmatch(HASH, value) is not None,
          'MP_HASH_INVALID')
    return value

def _integer(value, minimum=None):
    _need(isinstance(value, str) and re.fullmatch(r'-?[0-9]+', value) is not None
          and len(value) <= 20, 'MP_INTEGER_INVALID')
    number = int(value)
    _need(minimum is None or number >= minimum, 'MP_INTEGER_INVALID')
    return number

def _json(value):
    _need(isinstance(value, str), 'MP_JSON_INVALID')
    def pairs(items):
        out = {}
        for key, item in items:
            _need(key not in out, 'MP_JSON_DUPLICATE_KEY')
            out[key] = item
        return out
    def bad_constant(_):
        raise RecoveryError('MP_JSON_INVALID')
    try:
        return json.loads(value, parse_float=decimal.Decimal, parse_int=int,
                          parse_constant=bad_constant, object_pairs_hook=pairs)
    except (ValueError, TypeError, RecursionError):
        raise RecoveryError('MP_JSON_INVALID') from None

def _canonical(value):
    """Lossless JSONB-value normalization; no float conversion or Decimal rounding."""
    if value is None:
        return 'null'
    if value is True:
        return 'true'
    if value is False:
        return 'false'
    if type(value) is int:
        return str(value)
    if isinstance(value, decimal.Decimal):
        _need(value.is_finite() and abs(value.as_tuple().exponent) <= 131072,
              'MP_JSON_NUMBER_INVALID')
        result = format(value, 'f')
        if '.' in result:
            result = result.rstrip('0').rstrip('.')
        return '0' if result in ('-0', '') else result
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=True)
    if isinstance(value, list):
        return '[' + ','.join(_canonical(x) for x in value) + ']'
    _need(isinstance(value, dict) and all(isinstance(k, str) for k in value),
          'MP_JSON_INVALID')
    return '{' + ','.join(json.dumps(k, ensure_ascii=True) + ':' + _canonical(value[k])
                          for k in sorted(value)) + '}'

def _same_json(left, right):
    return _canonical(left) == _canonical(right)

def _bytea(value, limit):
    _need(isinstance(value, str), 'MP_BYTEA_INVALID')
    if value.startswith('\\x'):
        body = value[2:]
        _need(len(body) % 2 == 0 and len(body) <= limit * 2
              and re.fullmatch(r'[0-9a-fA-F]*', body) is not None, 'MP_BYTEA_INVALID')
        return bytes.fromhex(body)
    # PostgreSQL's legacy bytea escape representation, after COPY unescaping.
    _need(len(value) <= limit * 4, 'MP_BYTEA_MEMORY_LIMIT')
    result, i = bytearray(), 0
    while i < len(value):
        char = value[i]
        if char != '\\':
            _need(32 <= ord(char) <= 126, 'MP_BYTEA_INVALID')
            result.append(ord(char)); i += 1
        elif value[i:i+2] == '\\\\':
            result.append(92); i += 2
        else:
            digits = value[i+1:i+4]
            _need(len(digits) == 3 and re.fullmatch(r'[0-3][0-7]{2}', digits) is not None,
                  'MP_BYTEA_INVALID')
            result.append(int(digits, 8)); i += 4
        _need(len(result) <= limit, 'MP_BYTEA_MEMORY_LIMIT')
    return bytes(result)

def _timestamp(value):
    if value in ('infinity', '-infinity'):
        return value
    _need(isinstance(value, str) and len(value) <= 64, 'MP_TIMESTAMP_INVALID')
    try:
        parsed = dt.datetime.fromisoformat(value.replace(' ', 'T', 1).replace('Z', '+00:00'))
        _need(parsed.tzinfo is not None, 'MP_TIMESTAMP_INVALID')
        return parsed.astimezone(dt.timezone.utc).isoformat(timespec='microseconds')
    except (ValueError, OverflowError):
        raise RecoveryError('MP_TIMESTAMP_INVALID') from None

def _normalized_cell(table, column, value):
    if value is None:
        return None
    _need(isinstance(value, str), 'MP_COPY_CELL_INVALID')
    if column in ('pdf_bytes', 'document_bytes'):
        data = _bytea(value, MAX_PDF_BYTES if column == 'pdf_bytes' else MAX_LEDGER_BYTES)
        return ['bytea', len(data), hashlib.sha256(data).hexdigest()]
    if column in _JSON_COLUMNS:
        return ['jsonb', _canonical(_json(value))]
    if column in _TIMESTAMPS:
        return ['timestamptz', _timestamp(value)]
    if column in _INT_COLUMNS or (table == MP_PREFIX+'events' and column == 'id'):
        return _integer(value)
    if column in _BOOL_COLUMNS or (table == MP_PREFIX+'control' and column == 'id'):
        _need(value in ('t', 'f'), 'MP_BOOLEAN_INVALID')
        return value == 't'
    return value

def validate_capture_tables(tables):
    _need(isinstance(tables, dict) and BASE_TABLES <= set(tables)
          and set(tables) <= BASE_TABLES | RECOVERY_TABLES, 'MP_CAPTURE_TABLE_SET_INVALID')
    present = set(tables) & MP_TABLES
    if present:
        _need(present == MP_TABLES and LEDGER in tables, 'MP_SCHEMA_PARTIAL')
        return True
    _need(not any(r.get('id') == BUCKET for r in tables['storage.buckets'])
          and not any(r.get('bucket_id') == BUCKET for r in tables['storage.objects']),
          'MP_BUCKET_WITHOUT_SCHEMA')
    return False

def _rows(tables, short):
    return tables[MP_PREFIX + short]

def _index(tables, table):
    _need(table in tables and isinstance(tables[table], list), 'MP_RECOVERY_TABLES_MISSING')
    columns, result = set(COLUMN_NAMES[table]), {}
    for row in tables[table]:
        _need(isinstance(row, dict) and set(row) == columns, 'MP_COLUMN_CONTRACT_CHANGED')
        key = tuple(_normalized_cell(table, col, row[col]) for col in PRIMARY_KEYS[table])
        _need(None not in key and key not in result, 'MP_DUPLICATE_PRIMARY_KEY')
        result[key] = row
        for col, value in row.items():
            _normalized_cell(table, col, value)
    return result

def _authority(raw):
    value = _json(raw)
    _need(isinstance(value, dict) and {'actor', 'session', 'plan', 'role', 'epoch', 'moduleEpoch'} <= set(value),
          'MP_AUTHORITY_INVALID')
    _uid(value['actor']); _uid(value['session'])
    _need(value['plan'] in ('basic', 'plus', 'full')
          and value['role'] in ('owner', 'admin', 'reception', 'mechanic')
          and type(value['epoch']) is int and value['epoch'] >= 0
          and type(value['moduleEpoch']) is int and value['moduleEpoch'] >= 1,
          'MP_AUTHORITY_INVALID')
    return value

def _analyze(tables, storage_catalog=False):
    _need(RECOVERY_TABLES <= set(tables), 'MP_RECOVERY_TABLES_MISSING')
    indices = {table: _index(tables, table) for table in sorted(RECOVERY_TABLES)}
    def index(short):
        return indices[MP_PREFIX + short]
    def lookup(short, value):
        row = index(short).get((value,))
        _need(row is not None, 'MP_REFERENCE_MISSING')
        return row
    controls = _rows(tables, 'control')
    _need(len(controls) == 1 and controls[0]['id'] == 't', 'MP_CONTROL_INVALID')
    _integer(controls[0]['epoch'], 1)
    item_ordinals = [_integer(r['ordinal'], 0) for r in _rows(tables, 'items')]
    _need(len(item_ordinals) == len(set(item_ordinals))
          and len({r['label'] for r in _rows(tables, 'items')}) == len(item_ordinals),
          'MP_ITEMS_DUPLICATE')
    for r in _rows(tables, 'epochs'):
        _uid(r['workshop_id']); _integer(r['version'], 1)
    for r in _rows(tables, 'policy'):
        _hash(r['sha256']); _need(isinstance(_json(r['definition']), dict), 'MP_POLICY_INVALID')
    snapshots = index('snapshots')
    snapshot_keys = set()
    for r in snapshots.values():
        _uid(r['id']); _uid(r['workshop_id']); _uid(r['order_id'])
        _hash(r['source_hash']); _hash(r['snapshot_hash'])
        key = (r['workshop_id'], r['order_id'], r['snapshot_hash'])
        _need(key not in snapshot_keys, 'MP_DUPLICATE_SNAPSHOT_IDENTITY')
        snapshot_keys.add(key)
        _need(isinstance(r['canonical'], str), 'MP_SNAPSHOT_INVALID')
        encoded = r['canonical'].encode('utf-8')
        _need(len(encoded) <= MAX_CANONICAL_BYTES
              and hashlib.sha256(encoded).hexdigest() == r['snapshot_hash'], 'MP_SNAPSHOT_HASH_MISMATCH')
        payload = _json(r['payload']); canonical = _json(r['canonical'])
        policy = lookup('policy', r['policy_id'])
        _need(isinstance(payload, dict) and _same_json(payload, canonical), 'MP_SNAPSHOT_PAYLOAD_MISMATCH')
        _need(payload.get('scope') == {'workshopId': r['workshop_id'], 'orderId': r['order_id']}
              and payload.get('policyId') == r['policy_id']
              and payload.get('policyHash') == policy['sha256']
              and _same_json(payload.get('policy'), _json(policy['definition'])),
              'MP_SNAPSHOT_SCOPE_OR_POLICY_MISMATCH')
        order = payload.get('order')
        _need(isinstance(order, dict) and order.get('id') == r['order_id']
              and order.get('workshop_id') == r['workshop_id'], 'MP_SNAPSHOT_TENANT_MISMATCH')
        for name in ('vehicle', 'customer', 'profile'):
            embedded = payload.get(name)
            if isinstance(embedded, dict) and 'workshop_id' in embedded:
                _need(embedded['workshop_id'] == r['workshop_id'], 'MP_SNAPSHOT_TENANT_MISMATCH')
        if isinstance(payload.get('workshop'), dict):
            _need(payload['workshop'].get('id') == r['workshop_id'], 'MP_SNAPSHOT_TENANT_MISMATCH')
        _need(r['policy_id'] in ('MP-V2-1', 'MP-V2-2'), 'MP_POLICY_VERSION_UNSUPPORTED')
        expected_schema = 'MP-SNAPSHOT-1/PG17' if r['policy_id'] == 'MP-V2-1' else 'MP-SNAPSHOT-2/PG17'
        _need(payload.get('schema') == expected_schema, 'MP_SNAPSHOT_SCHEMA_MISMATCH')
        if r['policy_id'] == 'MP-V2-2':
            _need(payload.get('sourceHash') == r['source_hash'], 'MP_SOURCE_HASH_BINDING_MISMATCH')
    ledger = indices[LEDGER]
    for r in ledger.values():
        for key in ('request_id', 'workshop_id', 'actor_id', 'resource_id'):
            _uid(r[key])
        _need(r['state'] in ('reserved', 'confirmed', 'failed')
              and (r['state'] == 'confirmed') == (r['confirmed_at'] is not None)
              and r['capability'] in ('quote', 'multipunto', 'email'), 'MP_LEDGER_INVALID')
    for r in index('credits').values():
        _uid(r['credit_id']); _uid(r['workshop_id']); _uid(r['snapshot_id'])
        snap = lookup('snapshots', r['snapshot_id'])
        entry = ledger.get((r['credit_id'],))
        authority = _authority(r['authority'])
        _need(entry is not None and snap['workshop_id'] == r['workshop_id'] == entry['workshop_id']
              and entry['capability'] == 'multipunto' and entry['resource_id'] == snap['order_id']
              and entry['snapshot_hash'] == snap['snapshot_hash']
              and entry['actor_id'] == authority['actor'] and entry['session_id'] == authority['session'],
              'MP_CREDIT_LEDGER_SCOPE_MISMATCH')
    job_states = {'PREPARED', 'RENDERING', 'STAGED', 'ARCHIVE_VERIFIED', 'ISSUED',
                  'DRAFT_CONFIRMED', 'FAILED', 'EXPIRED', 'DENIED', 'SOURCE_CHANGED'}
    revision_keys, active_keys = set(), set()
    for r in index('jobs').values():
        for key in ('id', 'workshop_id', 'order_id', 'snapshot_id', 'actor_id', 'session_id', 'credit_id', 'document_id'):
            _uid(r[key])
        if r['requested_credit_id'] is not None:
            _uid(r['requested_credit_id'])
        snap = lookup('snapshots', r['snapshot_id']); credit = lookup('credits', r['credit_id'])
        authority = _authority(r['authority']); entry = ledger[(r['credit_id'],)]
        _need(r['workshop_id'] == snap['workshop_id'] == credit['workshop_id']
              and r['order_id'] == snap['order_id'] and r['snapshot_id'] == credit['snapshot_id']
              and r['actor_id'] == authority['actor'] == entry['actor_id']
              and r['session_id'] == authority['session'] == entry['session_id']
              and authority['plan'] == entry['plan_at_reservation'],
              'MP_JOB_SCOPE_MISMATCH')
        _integer(r['generation'], 1); revision = _integer(r['revision'], 1)
        _need(_integer(r['max_additional_units']) in (0, 1) and r['kind'] in ('draft', 'final')
              and r['state'] in job_states, 'MP_JOB_STATE_INVALID')
        key = (r['workshop_id'], r['order_id'], revision)
        _need(key not in revision_keys, 'MP_DUPLICATE_REVISION'); revision_keys.add(key)
        if r['state'] in ('PREPARED', 'RENDERING', 'STAGED', 'ARCHIVE_VERIFIED'):
            key = (r['workshop_id'], r['order_id'], r['snapshot_id'], r['kind'])
            _need(key not in active_keys, 'MP_DUPLICATE_ACTIVE_JOB'); active_keys.add(key)
    objects = {}
    if storage_catalog:
        _need('storage.objects' in tables, 'MP_STORAGE_CATALOG_REQUIRED')
        for r in tables['storage.objects']:
            if r.get('bucket_id') == BUCKET:
                _need(r['name'] not in objects, 'MP_DUPLICATE_STORAGE_OBJECT')
                objects[r['name']] = r
    artifacts_by_path = {}
    counts = {'artifacts': 0, 'artifact_bytes': 0, 'historical_generations': 0,
              'published': 0, 'uploaded_staged': 0, 'database_only': 0}
    for r in index('artifacts').values():
        job = lookup('jobs', r['job_id']); generation = _integer(r['generation'], 1)
        _need(r['workshop_id'] == job['workshop_id'] and generation <= _integer(job['generation'], 1),
              'MP_ARTIFACT_SCOPE_OR_GENERATION_MISMATCH')
        data = _bytea(r['pdf_bytes'], MAX_PDF_BYTES); size = _integer(r['byte_length'], 12)
        _need(size <= MAX_PDF_BYTES and len(data) == size and hashlib.sha256(data).hexdigest() == _hash(r['pdf_hash'])
              and data.startswith(b'%PDF-') and b'%%EOF' in data[-2048:], 'MP_ARTIFACT_BYTES_MISMATCH')
        counts['artifacts'] += 1; counts['artifact_bytes'] += size
        counts['historical_generations'] += int(generation < _integer(job['generation']))
        if job['kind'] == 'draft':
            _need(r['path'] is None and r['verified_at'] is None, 'MP_DRAFT_STORAGE_REFERENCE_INVALID')
            counts['database_only'] += 1
            continue
        path = r['path']
        pattern = job['workshop_id'] + '/inspections/' + job['order_id'] + '/r' + str(_integer(job['revision'])) + '/' + UUID + '/' + r['pdf_hash'] + r'\.pdf'
        _need(isinstance(path, str) and re.fullmatch(pattern, path) is not None,
              'MP_ARTIFACT_PATH_MISMATCH')
        if generation == _integer(job['generation']) and job['state'] != 'ISSUED':
            _need(path.split('/')[4] == job['document_id'], 'MP_CURRENT_DOCUMENT_ID_MISMATCH')
        _need(path not in artifacts_by_path, 'MP_DUPLICATE_ARTIFACT_PATH')
        artifacts_by_path[path] = (r, job)
        if storage_catalog and r['verified_at'] is not None:
            _need(path in objects, 'MP_VERIFIED_STORAGE_OBJECT_MISSING')
    docs_by_path = {}
    document_revisions = set(); document_snapshots = set()
    for d in index('documents').values():
        for key in ('id', 'workshop_id', 'order_id', 'snapshot_id', 'credit_id', 'issuer'):
            _uid(d[key])
        _hash(d['pdf_hash']); size = _integer(d['byte_length'], 12); revision = _integer(d['revision'], 1)
        expected = f"{d['workshop_id']}/inspections/{d['order_id']}/r{revision}/{d['id']}/{d['pdf_hash']}.pdf"
        _need(d['bucket'] == BUCKET and d['path'] == expected and size <= MAX_PDF_BYTES,
              'MP_DOCUMENT_PATH_MISMATCH')
        _need(d['path'] not in docs_by_path, 'MP_DUPLICATE_DOCUMENT_PATH')
        revkey = (d['workshop_id'], d['order_id'], revision)
        snapkey = (d['workshop_id'], d['order_id'], d['snapshot_id'])
        _need(revkey not in document_revisions and snapkey not in document_snapshots,
              'MP_DUPLICATE_DOCUMENT_IDENTITY')
        document_revisions.add(revkey); document_snapshots.add(snapkey)
        _need(d['path'] in artifacts_by_path, 'MP_PUBLISHED_ARTIFACT_MISSING')
        artifact, job = artifacts_by_path[d['path']]
        credit = lookup('credits', d['credit_id']); entry = ledger.get((d['credit_id'],))
        _need(all(d[k] == job[k] for k in ('workshop_id', 'order_id', 'snapshot_id', 'credit_id', 'revision'))
              and d['pdf_hash'] == artifact['pdf_hash'] and size == _integer(artifact['byte_length'])
              and artifact['verified_at'] is not None and d['issuer'] == job['actor_id']
              and credit['final_document_id'] == d['id'] and entry is not None and entry['state'] == 'confirmed',
              'MP_PUBLISHED_RELATION_MISMATCH')
        if storage_catalog:
            _need(d['path'] in objects, 'MP_PUBLISHED_STORAGE_OBJECT_MISSING')
        docs_by_path[d['path']] = d; counts['published'] += 1
    for credit in index('credits').values():
        if credit['final_document_id'] is not None:
            doc = lookup('documents', credit['final_document_id'])
            _need(doc['credit_id'] == credit['credit_id'] and doc['workshop_id'] == credit['workshop_id']
                  and doc['snapshot_id'] == credit['snapshot_id'], 'MP_CREDIT_DOCUMENT_MISMATCH')
    for job in index('jobs').values():
        current = index('artifacts').get((job['id'], _integer(job['generation'])))
        if job['state'] in ('STAGED', 'ARCHIVE_VERIFIED', 'ISSUED', 'DRAFT_CONFIRMED'):
            _need(current is not None, 'MP_CURRENT_ARTIFACT_MISSING')
        if job['state'] == 'ISSUED':
            doc = lookup('documents', job['document_id'])
            _need(job['kind'] == 'final' and all(doc[k] == job[k] for k in ('workshop_id', 'order_id', 'snapshot_id')),
                  'MP_ISSUED_DOCUMENT_MISMATCH')
        if job['state'] == 'ARCHIVE_VERIFIED':
            _need(job['kind'] == 'final' and current['verified_at'] is not None,
                  'MP_ARCHIVE_VERIFICATION_MISSING')
        if job['state'] == 'DRAFT_CONFIRMED':
            _need(job['kind'] == 'draft' and ledger[(job['credit_id'],)]['state'] == 'confirmed',
                  'MP_DRAFT_CONFIRMATION_MISMATCH')
    for r in _rows(tables, 'events'):
        _uid(r['workshop_id'])
        if r['actor_id'] is not None:
            _uid(r['actor_id'])
        if r['job_id'] is not None:
            _need(lookup('jobs', r['job_id'])['workshop_id'] == r['workshop_id'], 'MP_EVENT_TENANT_MISMATCH')
    for r in _rows(tables, 'read_limits'):
        _uid(r['workshop_id']); _uid(r['actor_id']); _integer(r['used'], 1)
    if storage_catalog:
        for path in artifacts_by_path:
            if path not in docs_by_path:
                counts['uploaded_staged' if path in objects else 'database_only'] += 1
    return counts, docs_by_path, artifacts_by_path, objects

def augment_references(tables, add_callback, refs):
    """Validate DB history, then add only published/uploaded V2 objects to S5B refs."""
    _need(validate_capture_tables(tables), 'MP_SCHEMA_REQUIRED')
    counts, documents, artifacts, objects = _analyze(tables, storage_catalog=True)
    for path in sorted(documents):
        d = documents[path]
        add_callback(d['workshop_id'], {'bucket': BUCKET, 'path': path, 'sha256': d['pdf_hash'],
             'byteLength': int(d['byte_length']), 'state': 'published', 'orderId': d['order_id'],
             'documentId': d['id'], 'revision': int(d['revision'])})
    for path in sorted(artifacts):
        if path in documents or path not in objects:
            continue
        a, job = artifacts[path]
        # Historic generation identity comes from its immutable path, NOT current job.document_id.
        add_callback(a['workshop_id'], {'bucket': BUCKET, 'path': path, 'sha256': a['pdf_hash'],
             'byteLength': int(a['byte_length']), 'state': 'staged', 'orderId': job['order_id'],
             'documentId': path.split('/')[4], 'revision': int(job['revision'])})
    _need({p for b, p in refs if b == BUCKET} == set(objects), 'MP_STORAGE_RECONCILIATION_FAILED')
    return counts

def recovery_summary(tables, digest, *, columns=None):
    """Expectations for all columns in all 11 MP tables and the complete shared ledger."""
    _hash(digest)
    counts, _, _, _ = _analyze(tables, storage_catalog=False)
    columns = columns if columns is not None else getattr(tables, 'columns', None)
    _need(isinstance(columns, dict) and RECOVERY_TABLES <= set(columns), 'MP_COLUMN_EVIDENCE_REQUIRED')
    result = {}
    for table in sorted(RECOVERY_TABLES):
        names = tuple(columns[table])
        _need(len(names) == len(set(names)) and set(names) == set(COLUMN_NAMES[table]),
              'MP_COLUMN_CONTRACT_CHANGED')
        names = tuple(sorted(names)); by_key = _index(tables, table)
        digest_table = hashlib.sha256(b'BT-MP-RECOVERY-TABLE-1\0')
        digest_table.update(_canonical([table, list(names)]).encode('ascii') + b'\n')
        ordered = sorted(by_key, key=lambda key: _canonical(list(key)))
        for key in ordered:
            row = by_key[key]
            normalized = [_normalized_cell(table, column, row[column]) for column in names]
            digest_table.update(_canonical(normalized).encode('ascii') + b'\n')
        result[table] = {'rows': len(ordered), 'columns': list(names),
                         'primary_key': list(PRIMARY_KEYS[table]), 'content_sha256': digest_table.hexdigest()}
    return {'contract': 'BT_MP_RECOVERY_2_TABLES_V1', 'ciphertext_sha256': digest,
            'scope': 'ALL_COLUMNS_ALL_GENERATIONS_11_MP_TABLES_AND_SHARED_LEDGER',
            'canonicalization': 'PG17_COPY_VALUES_JSONB_EXACT_NUMBERS_TIMESTAMPTZ_UTC_BYTEA_SHA256',
            'tables': result, 'artifact_count': counts['artifacts'], 'artifact_bytes': counts['artifact_bytes'],
            'historical_generations': counts['historical_generations'],
            'snapshot_count': len(_rows(tables, 'snapshots')), 'credit_count': len(_rows(tables, 'credits')),
            'ledger_count': len(tables[LEDGER]), 'full_supabase_dr': False, 'security_parity_certified': False}

def compare_restored(expected_tables, actual_tables, digest, *, expected_columns=None, actual_columns=None):
    expected = recovery_summary(expected_tables, digest, columns=expected_columns)
    actual = recovery_summary(actual_tables, digest, columns=actual_columns)
    _need(expected == actual, 'MP_RESTORED_CONTENT_MISMATCH')
    return dict(expected, status='EXACT', isolated_table_restore_verified=True,
                all_artifact_generations_verified=True, production_writes=False)
