"""New feature only: synthetic PDF objects/ephemeral public GPG, no SEC07 rerun."""
import copy
import hashlib
import io
import os
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from final_archive_storage import inventory, write_snapshot, verify_snapshot, encrypt_snapshot, StorageRecoveryError, authenticated_fetch

W='00000000-0000-4000-8000-000000000001'
Q='00000000-0000-4000-8000-000000000005'
PDF=b'%PDF-1.7\nOnly synthetic private PDF content\n%%EOF\n'
def fixture():
    return {'version':1,'workshopId':W,'recoverySetId':'synthetic-database-set','documents':[{'bucket':'cp05-quote-documents','path':W+'/quotes/'+Q+'/r1/'+'a'*64+'.pdf','sha256':hashlib.sha256(PDF).hexdigest(),'byteLength':len(PDF)}]}
class StorageSidecarTests(unittest.TestCase):
    def data(self):
        sink=io.BytesIO();write_snapshot(fixture(),lambda d:PDF,sink);return sink.getvalue()
    def test_valid_original_stream_and_isolated_readback(self):
        objects={}
        result=verify_snapshot(io.BytesIO(self.data()),fixture(),lambda d,b:objects.setdefault(d['path'],b),lambda d:objects[d['path']],isolated=True)
        self.assertTrue(result['verified']);self.assertEqual(list(objects.values()),[PDF])
    def test_database_only_or_other_recovery_set_is_not_sufficient(self):
        expected=fixture();expected['recoverySetId']='different-dump'
        with self.assertRaisesRegex(StorageRecoveryError,'DATABASE_STORAGE_SET_MISMATCH'):verify_snapshot(io.BytesIO(self.data()),expected)
    def test_missing_or_corrupt_object_never_succeeds(self):
        for data in (self.data()[:-20],self.data().replace(PDF,PDF.replace(b'Only',b'Fake'))):
            with self.assertRaises(StorageRecoveryError):verify_snapshot(io.BytesIO(data),fixture())
    def test_export_rejects_corrupt_original(self):
        with self.assertRaisesRegex(StorageRecoveryError,'OBJECT_INTEGRITY_FAILED'):write_snapshot(fixture(),lambda d:b'corrupt',io.BytesIO())
    def test_restore_to_unspecified_live_sink_is_blocked(self):
        with self.assertRaisesRegex(StorageRecoveryError,'ISOLATED_RESTORE_REQUIRED'):verify_snapshot(io.BytesIO(self.data()),fixture(),lambda d,b:None,lambda d:PDF)
    def test_duplicate_or_traversal_destination_rejected(self):
        for kind in ('duplicate','traversal','public','wrong-workshop'):
            value=fixture()
            if kind=='duplicate':value['documents']*=2
            if kind=='traversal':value['documents'][0]['path']+='../../other.pdf'
            if kind=='public':value['documents'][0]['bucket']='arbitrary-public'
            if kind=='wrong-workshop':value['workshopId']=Q
            with self.assertRaises(StorageRecoveryError):inventory(value)
    def test_network_export_disabled_without_explicit_future_authorization(self):
        with patch.dict(os.environ, {'BT_STORAGE_EXPORT_AUTHORIZED':'false'}):
            with self.assertRaisesRegex(StorageRecoveryError,'EXPORT_NOT_AUTHORIZED'):authenticated_fetch(fixture()['documents'][0])
    def test_real_ephemeral_gpg_cipher_and_restore_original_hash(self):
        if not shutil.which('gpg'):self.fail('GPG offline prerequisite is required')
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp);home=root/'private-owner-only';home.mkdir(mode=0o700)
            base=['gpg','--homedir',str(home),'--batch','--pinentry-mode','loopback','--passphrase','']
            subprocess.run(base+['--quick-generate-key','Synthetic Archive QA <archive@invalid.test>','rsa2048','encr','1d'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
            listed=subprocess.check_output(base+['--with-colons','--list-keys'],stderr=subprocess.DEVNULL).decode()
            fingerprint=next(line.split(':')[9] for line in listed.splitlines() if line.startswith('fpr:'))
            public=subprocess.check_output(base+['--armor','--export',fingerprint],stderr=subprocess.DEVNULL)
            destination=root/'objects.gpg'
            receipt=encrypt_snapshot(fixture(),lambda d:PDF,public,fingerprint,destination)
            self.assertNotIn(PDF,destination.read_bytes());self.assertEqual(receipt['objects'],1)
            plaintext=subprocess.check_output(base+['--decrypt',str(destination)],stderr=subprocess.DEVNULL)
            self.assertTrue(verify_snapshot(io.BytesIO(plaintext),fixture())['verified'])
            expected=root/'inventory.json';expected.write_text(json.dumps(fixture()))
            checked=subprocess.run([sys.executable,str(Path(__file__).with_name('final_archive_storage.py')),'verify','--inventory',str(expected),'--encrypted-file',str(destination),'--owner-gpg-home',str(home),'--isolated-directory',str(root/'isolated-restored')],capture_output=True,text=True)
            self.assertEqual(checked.returncode,0,checked.stderr);self.assertIn('VERIFIED_ISOLATED_BYTES_RESTORED',checked.stdout)
            self.assertEqual((root/'isolated-restored'/'cp05-quote-documents'/fixture()['documents'][0]['path']).read_bytes(),PDF)

            with self.assertRaises(FileExistsError):encrypt_snapshot(fixture(),lambda d:PDF,public,fingerprint,destination)
            self.assertEqual(hashlib.sha256(destination.read_bytes()).hexdigest(),receipt['ciphertextSha256'])
    @unittest.skipUnless(os.environ.get('BT_FINAL_ARCHIVE_FIXTURE_DIR'), 'Real fixture supplied only by consolidated lab')
    def test_actual_archived_pdf_set_restored_into_isolated_files(self):
        evidence=Path(os.environ['BT_FINAL_ARCHIVE_FIXTURE_DIR'])
        value=inventory(json.loads((evidence/'inventory.json').read_text()))
        objects=Path((evidence/'objects-root.txt').read_text())
        sink=io.BytesIO();write_snapshot(value,lambda d:(objects/d['bucket']/d['path']).read_bytes(),sink)
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            def put(doc,data):
                target=root/doc['bucket']/doc['path'];target.parent.mkdir(parents=True,exist_ok=True)
                with target.open('xb') as stream:stream.write(data)
            result=verify_snapshot(io.BytesIO(sink.getvalue()),value,put,lambda d:(root/d['bucket']/d['path']).read_bytes(),isolated=True)
            self.assertEqual(result['objects'],7)
            for d in value['documents']:self.assertEqual((root/d['bucket']/d['path']).read_bytes(),(objects/d['bucket']/d['path']).read_bytes())
    def test_private_key_is_never_imported_for_export(self):
        with self.assertRaisesRegex(StorageRecoveryError,'PUBLIC_RECIPIENT_REQUIRED'):encrypt_snapshot(fixture(),lambda d:PDF,b'-----BEGIN PGP PRIVATE KEY BLOCK-----','a'*40,'never-created.gpg')
if __name__=='__main__':unittest.main()
