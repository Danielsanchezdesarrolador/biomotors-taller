"""Synthetic-only provision tests: no network, OAuth, mkdir, export or restore."""
import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import provision_drive_folder as setup
from test_drive_destination import config, metadata

ROOT = 'offline_root_12345'
ID = 'offline_candidate_12345'

def environment():
    return dict(GITHUB_ACTIONS='true', GITHUB_EVENT_NAME='workflow_dispatch',
                GITHUB_REF='refs/heads/main', GITHUB_REPOSITORY=setup.REPOSITORY,
                GITHUB_ACTOR='Danielsanchezdesarrolador',
                GITHUB_TRIGGERING_ACTOR='Danielsanchezdesarrolador',
                GITHUB_RUN_ATTEMPT='1', GITHUB_RUN_ID='123456789',
                BT_DRIVE_CREATE_APPROVED='true')

class ProvisionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(); self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name) / 'config'; self.path.write_text(config())
        self.env = environment(); self.name = setup.authorized_name(self.env)
        self.created = False; self.commands = []; self.requests = []
        self.owner = 'owner@example.test'; self.existing = []
        self.row = metadata(ID, self.name, ROOT)
        self.permissions = {'permissions':[{'id':'owner', 'type':'user', 'role':'owner'}]}
        self.root = metadata(ROOT, 'My Drive')
        self.run_error = None; self.run_code = 0; self.child_files = []
        network = patch.object(setup.DriveAPI, '_open', side_effect=AssertionError('Network forbidden'))
        network.start(); self.addCleanup(network.stop)

    def api(self, client, resource, params=None, **kwargs):
        self.requests.append((resource, params, kwargs))
        self.assertNotIn('body', kwargs)
        if resource == 'about': return {'user':{'emailAddress':self.owner}}
        if resource == 'files/root': return self.root
        if resource == 'files':
            if params['q'] == f"'{ID}' in parents and trashed = false":
                return {'files': self.child_files}
            self.assertIn("'" + ROOT + "' in parents", params['q'])
            self.assertIn(self.name, params['q'])
            return {'files':[{'id':ID}] if self.created else self.existing}
        if resource.endswith('/permissions'): return self.permissions
        if resource == 'files/' + ID: return dict(self.row)
        raise AssertionError('Unexpected request')

    def command(self, command, **kwargs):
        self.commands.append(command)
        self.assertEqual(command[-2:], ['mkdir', setup.REMOTE + ':' + self.name])
        self.assertEqual(command[3:7], ['--retries','1','--low-level-retries','1'])
        self.assertFalse(any(k.startswith(('BT_BACKUP_', 'BT_DRIVE_', 'RCLONE_')) for k in kwargs['env']))
        if self.run_error: raise self.run_error
        self.created = True
        return subprocess.CompletedProcess(command, self.run_code, 'PRIVATE', 'PRIVATE')

    def invoke(self):
        with patch.object(setup, 'rclone_json', return_value=[]), patch.object(setup.DriveAPI, '_json', autospec=True, side_effect=self.api), patch.object(setup.subprocess, 'run', side_effect=self.command):
            return setup.provision(self.path, 'owner@example.test', self.name, self.env)

    def test_one_empty_folder_receipt_does_not_activate_or_export(self):
        self.env.update(BT_BACKUP_DRIVE_CONFIG_CONTENT='PRIVATE', RCLONE_DRIVE_SCOPE='drive')
        receipt = self.invoke()
        self.assertEqual(len(self.commands), 1)
        self.assertEqual(receipt['candidate_id'], ID)
        self.assertTrue(receipt['owner_root_private_verified'])
        for key in ('destination_activated','backup_exported','restoration_verified'):
            self.assertIs(receipt[key], False)
        self.assertNotIn('PRIVATE', json.dumps(receipt))
        self.assertEqual(self.path.read_text(), config())

    def test_every_guard_blocks_before_any_tool_or_api(self):
        for key in environment():
            with self.subTest(key=key):
                self.env = environment(); self.env[key] = 'invalid'
                with self.assertRaisesRegex(setup.ProvisionFailure, 'GUARD_REJECTED'):
                    self.invoke()
                self.assertFalse(self.commands); self.assertFalse(self.requests)

    def test_rerun_cannot_create_again(self):
        self.env['GITHUB_RUN_ATTEMPT'] = '2'
        with self.assertRaisesRegex(setup.ProvisionFailure, 'GUARD_REJECTED'): self.invoke()
        self.assertFalse(self.commands)

    def test_scope_cannot_be_broadened(self):
        self.path.write_text(config().replace('scope=drive.file','scope=drive'))
        with self.assertRaises(RuntimeError): self.invoke()
        self.assertFalse(self.commands)

    def test_wrong_owner_and_invalid_root_stop_before_create(self):
        self.owner = 'other@example.test'
        with self.assertRaisesRegex(setup.ProvisionFailure, 'OWNER_MISMATCH'): self.invoke()
        self.owner = 'owner@example.test'; self.root['ownedByMe'] = False
        with self.assertRaisesRegex(setup.ProvisionFailure, 'ROOT_INVALID'): self.invoke()
        self.assertFalse(self.commands)

    def test_existing_name_is_never_adopted(self):
        self.existing = [{'id':'homonym_12345'}]
        with self.assertRaisesRegex(setup.ProvisionFailure, 'NAME_ALREADY_EXISTS'): self.invoke()
        self.assertFalse(self.commands)

    def test_ambiguous_create_never_retries(self):
        for error in (subprocess.TimeoutExpired('PRIVATE',45), OSError('PRIVATE')):
            self.commands.clear(); self.run_error = error
            with self.assertRaisesRegex(setup.ProvisionFailure, '^CREATE_OUTCOME_UNKNOWN$'): self.invoke()
            self.assertEqual(len(self.commands),1)
        self.commands.clear(); self.run_error = None; self.run_code = 1
        with self.assertRaisesRegex(setup.ProvisionFailure, '^CREATE_OUTCOME_UNKNOWN$'): self.invoke()
        self.assertEqual(len(self.commands),1)

    def test_wrong_parent_or_shortcut_never_verified(self):
        for change in ({'parents':['other_root_12345']}, {'mimeType':'application/vnd.google-apps.shortcut'}, {'ownedByMe':False}):
            self.created = False; self.row = dict(metadata(ID,self.name,ROOT), **change)
            with self.assertRaisesRegex(setup.ProvisionFailure, 'CANDIDATE_INVALID'): self.invoke()

    def test_new_folder_must_be_owner_only(self):
        for permission in ({'id':'public','type':'anyone','role':'reader'}, {'id':'writer','type':'user','role':'writer'}):
            self.created = False
            self.permissions = {'permissions':[{'id':'owner','type':'user','role':'owner'}, permission]}
            with self.assertRaisesRegex(setup.ProvisionFailure, 'CANDIDATE_NOT_OWNER_ONLY'): self.invoke()

    def test_incomplete_listing_and_permissions_fail_closed(self):
        from unittest.mock import Mock
        with self.assertRaisesRegex(setup.ProvisionFailure, 'LIST_INCOMPLETE'):
            setup.find_candidate(Mock(_json=Mock(return_value={'files':[], 'nextPageToken':'MORE'})), ROOT, self.name)
        self.permissions['nextPageToken'] = 'MORE'
        with self.assertRaisesRegex(setup.ProvisionFailure, 'CANDIDATE_NOT_OWNER_ONLY'): self.invoke()

    def test_nonempty_candidate_is_not_verified(self):
        self.child_files = [{'id':'unexpected_file'}]
        with self.assertRaisesRegex(setup.ProvisionFailure, 'CANDIDATE_INVALID'): self.invoke()

    def test_entrypoint_without_authorization_cannot_write(self):
        output = io.StringIO()
        with patch.dict(os.environ, {}, clear=True), patch.object(setup, 'provision') as call, contextlib.redirect_stdout(output):
            self.assertEqual(setup.main(), 1)
        call.assert_not_called()
        self.assertEqual(output.getvalue(), 'DRIVE_PROVISION_NOT_COMPLETE: GUARD_REJECTED\n')

if __name__ == '__main__': unittest.main()
