"""Canonical libpq files. No network, logging, or password transformations."""
import configparser
import io

PROJECT = 'suxcqqnmcjoezfxltoms'
HOST = 'aws-0-sa-east-1.pooler.supabase.com'
PREFIX = f'{HOST}:5432:postgres:postgres.{PROJECT}:'


def normalize_pgpass(value):
    # A single optional line terminator is harmless; never strip password spaces.
    line = value[:-2] if value.endswith('\r\n') else value[:-1] if value.endswith('\n') else value
    if not line.startswith(PREFIX) or not line[len(PREFIX):]:
        raise ValueError('PGPASS_FORMAT_INVALID')
    if any(ord(c) < 32 or ord(c) == 127 or c == '\ufeff' for c in line):
        raise ValueError('PGPASS_FORMAT_INVALID')
    password = line[len(PREFIX):]
    index = 0
    while index < len(password):
        char = password[index]
        if char == ':':
            raise ValueError('PGPASS_FORMAT_INVALID')
        if char == '\\':
            index += 1
            if index == len(password) or password[index] not in ('\\', ':'):
                raise ValueError('PGPASS_FORMAT_INVALID')
        index += 1
    return line + '\n'


def service_content(ca_path):
    config = configparser.ConfigParser(interpolation=None)
    config['bytetorque_backup'] = {
        'host': HOST, 'port': '5432', 'dbname': 'postgres',
        'user': 'postgres.' + PROJECT, 'sslmode': 'verify-full',
        'sslrootcert': str(ca_path),
    }
    output = io.StringIO()
    # libpq's service parser does NOT accept ConfigParser's default key = value.
    config.write(output, space_around_delimiters=False)
    return output.getvalue()
