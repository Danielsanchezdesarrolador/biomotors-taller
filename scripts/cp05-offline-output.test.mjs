import { test } from 'node:test'
import assert from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { offlineOutput } from './cp05-offline-output.mjs'
const repo = resolve('.'), base = tmpdir(), fresh = join(base, 'bt-path-' + randomUUID())
test('native Windows/Linux temporary child is accepted without creating it', () =>
  assert.equal(offlineOutput(fresh, repo), fresh))
test('repository destination is rejected', () =>
  assert.throws(() => offlineOutput(join(repo, 'supabase/functions'), repo)))
test('temp root itself is rejected', () => assert.throws(() => offlineOutput(base, repo)))
test('existing destination is rejected', () => assert.throws(() => offlineOutput(base, repo, join(base, '..'))))
test('sibling sharing temp prefix is rejected', () =>
  assert.throws(() => offlineOutput(base + '-other/new', repo)))
