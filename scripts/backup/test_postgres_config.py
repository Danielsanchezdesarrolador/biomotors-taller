"""Offline regression with real libpq: invalid sslmode stops BEFORE any socket."""
import ctypes
import ctypes.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from postgres_config import normalize_pgpass, service_content, PREFIX, HOST, PROJECT
from postgres_preflight import classify
import subprocess

class ConfigTests(unittest.TestCase):
    def test_pgpass_exact_preservation(self):
        for password in ('plain', ' spaces ', r'a\:b\\c', 'ñ%$!"'):
            for ending in ('', '\n', '\r\n'):
                self.assertEqual(normalize_pgpass(PREFIX + password + ending), PREFIX + password + '\n')

    def test_pgpass_rejects_ambiguous_input(self):
        for value in ('', PREFIX, '\ufeff' + PREFIX + 'p', PREFIX + 'a:b',
                      PREFIX + 'a\\b', PREFIX + 'a\\', PREFIX + 'a\x00b',
                      PREFIX + 'a\n\n', PREFIX + 'a\rb', PREFIX + 'a\nSECOND',
                      PREFIX.replace(HOST, '*') + 'p'):
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, '^PGPASS_FORMAT_INVALID$'):
                normalize_pgpass(value)

    def test_real_libpq_service_parser(self):
        lib = ctypes.CDLL(ctypes.util.find_library('pq') or 'libpq.so.5')
        lib.PQconnectStart.argtypes = [ctypes.c_char_p]
        lib.PQconnectStart.restype = ctypes.c_void_p
        lib.PQerrorMessage.argtypes = [ctypes.c_void_p]
        lib.PQerrorMessage.restype = ctypes.c_char_p
        lib.PQfinish.argtypes = [ctypes.c_void_p]
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'service'
            with patch.dict(os.environ, {'PGSERVICEFILE': str(path)}, clear=True):
                for broken in (True, False):
                    content = service_content(Path(folder) / 'ca.pem')
                    path.write_text(content.replace('=', ' = ') if broken else content)
                    # Invalid sslmode is validated before connection is started.
                    conn = lib.PQconnectStart(b'service=bytetorque_backup sslmode=OFFLINE_SENTINEL')
                    try:
                        error = lib.PQerrorMessage(conn).decode()
                        self.assertIn('syntax error in service file' if broken else 'invalid sslmode value', error)
                    finally:
                        lib.PQfinish(conn)

    def test_service_errors_are_local(self):
        result = subprocess.CompletedProcess([], 1, '', 'psql: error: syntax error in service file "PRIVATE", line 2')
        self.assertEqual(classify(result), 'POSTGRES_SERVICE_FILE_INVALID')

if __name__ == '__main__':
    unittest.main()
