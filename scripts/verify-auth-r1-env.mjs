// Negative build tests with unmistakably synthetic values. Never use actual keys here.
import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'
const output = mkdtempSync(join(tmpdir(), 'bt-auth-env-'))
try {
  const baseEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('VITE_')))
  for (const [name, value] of [
    ['VITE_SUPABASE_PUBLISHABLE_KEY', 'sb_secret_forbidden_test_only_12345'],
    ['VITE_SUPABASE_PUBLISHABLE_KEY', 'eyJhbGci.fake.legacy'],
    ['VITE_SUPABASE_ANON_KEY', 'legacy-placeholder'],
    ['VITE_SECRET_TEST', 'placeholder-forbidden']
  ]) {
    const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', output], {
      env: { ...baseEnv, [name]: value }, encoding: 'utf8'
    })
    assert.notEqual(result.status, 0, 'Unsafe public environment must stop the build')
    assert.ok(!(result.stdout + result.stderr).includes(value), 'Rejected values must not be printed')
  }
  console.log('R1 negative environment builds: 4/4 rejected, no values disclosed; PASS')
} finally { rmSync(output, { recursive: true, force: true }) }
