/**
 * BT-CP05 · Evidence that a deployable review package can be assembled offline.
 * Strictly checks local bytes and configuration. NEVER connects to Supabase,
 * deploys a function, reads a secret, or certifies hosted permissions.
 */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { resolve, join } from 'node:path'

const root = resolve(process.argv[2] || '/tmp/bytetorque-cp05-edge-candidate')
assert.ok(root.startsWith('/tmp/'), 'Only offline /tmp packages may be inspected')
const fn = join(root, 'supabase/functions/bt-cp05-documents')
const bytes = async (file) => {
  const path = join(fn, file)
  const fileStat = await stat(path)
  assert.ok(fileStat.isFile() && fileStat.size > 0, 'Missing package asset ' + file)
  return readFile(path)
}
const [bundle, font, logo, license, config] = await Promise.all([
  bytes('index.js'),
  bytes('assets/DejaVuSans.ttf'),
  bytes('assets/icon-192.png'),
  bytes('assets/FONT-LICENSE.txt'),
  readFile(join(root, 'supabase/config.toml'), 'utf8')
])
const digest = value => createHash('sha256').update(value).digest('hex')
const required = {
  'DejaVuSans.ttf': '57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e',
  'icon-192.png': '1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67'
}
assert.equal(digest(font), required['DejaVuSans.ttf'], 'Font bytes differ from pinned trusted asset')
assert.equal(digest(logo), required['icon-192.png'], 'Logo bytes differ from pinned brand asset')
assert.ok(license.byteLength > 100, 'Font license is not included')
assert.match(config, /\[functions\.bt-cp05-documents\]/)
assert.match(config, /^verify_jwt = true$/m)
assert.ok(!/^verify_jwt\s*=\s*false$/m.test(config))
assert.match(config, /^entrypoint = "\.\/functions\/bt-cp05-documents\/index\.js"$/m)
assert.match(config, /^static_files = \["\.\/functions\/bt-cp05-documents\/assets\/\*"\]$/m)
const output = bundle.toString('utf8')
assert.ok(output.length > 1000, 'Edge bundle is unexpectedly small')
for (const token of [
  'ARCHIVE_NOT_AUTHORIZED', 'SERVICE_DISABLED', 'ACCESS_DENIED',
  'PRIVATE_ARCHIVE_DISABLED', 'ARCHIVE_NOT_CONFIRMED', 'DELIVERY_PENDING',
  'supabase-js', 'pdf-lib'
]) assert.ok(output.includes(token), 'Missing CP05 worker contract marker: ' + token)
assert.ok(!output.includes('data:application/pdf;base64'), 'Never embed emitted PDF in worker source')
console.log('BT-CP05: offline Edge package verified (JWT required, pinned assets, issue/archive/download/delivery handlers). NO DEPLOY.')
