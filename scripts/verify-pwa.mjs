// Checks approved source provenance, actual build bytes and conservative mask safe area.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const pack = JSON.parse(readFileSync('assets/brand/manifest.json', 'utf8'))
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'))
const html = readFileSync('dist/index.html', 'utf8')
assert.equal(manifest.id, '/')
assert.equal(manifest.start_url, '/')
assert.equal(manifest.scope, '/')
assert.equal(manifest.display, 'standalone')
assert.ok(html.includes('/apple-touch-icon.png?v=bt-brand-01'))
assert.ok(html.includes('/favicon-32.png?v=bt-brand-01'))
const legacySvg = readFileSync('dist/icon.svg', 'utf8')
assert.ok(
  legacySvg.includes(
    'data:image/png;base64,' +
      readFileSync('assets/brand/generated/icon-512.png').toString('base64')
  )
)
assert.match(legacySvg, /^<svg[^>]*width="512"[^>]*height="512"/)
assert.doesNotMatch(legacySvg, /<(?:path|circle|rect)\b/)
for (const original of pack.originals) {
  assert.equal(
    createHash('sha256').update(readFileSync(original.path)).digest('hex'),
    original.sha256
  )
  assert.equal(original.mode, 'RGBA')
  assert.ok(original.transparentPixels > 0 && original.semitransparentPixels > 0)
}
for (const file of [
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'icon-maskable-512.png',
  'favicon-32.png',
  'favicon-48.png'
]) {
  const source = pack.derivatives.find((d) => d.path === 'assets/brand/generated/' + file)
  const bytes = readFileSync('dist/' + file)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, file)
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(bytes.readUInt32BE(16), source.width)
  assert.equal(bytes.readUInt32BE(20), source.height)
  if (file.startsWith('icon-')) {
    const icon = manifest.icons.find((i) => i.src.split('?')[0] === '/' + file)
    assert.equal(icon.sizes, source.width + 'x' + source.height)
    assert.equal(icon.type, 'image/png')
    assert.equal(icon.purpose, file.includes('maskable') ? 'maskable' : 'any')
  }
}
for (const item of pack.derivatives.filter((d) => d.protectedBounds)) {
  const [left, top, right, bottom] = item.protectedBounds
  const half = item.width / 2
  for (const x of [left, right])
    for (const y of [top, bottom]) {
      assert.ok(
        Math.hypot(x - half, y - half) <= item.width * 0.4,
        item.path + ': art outside safe circle'
      )
    }
}
console.log(
  'BT-BRAND-01 PWA: original hashes/transparency, official PNGs, manifest, favicon and maskable safe area PASS'
)
