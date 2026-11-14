// BT-BRAND-02: verify the text-only derivative and freeze all BT-BRAND-01 protected resources.
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const original = JSON.parse(readFileSync('assets/brand/manifest.json', 'utf8'))
const dark = JSON.parse(readFileSync('assets/brand/dark-variant.json', 'utf8'))
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')
for (const item of [...original.originals, ...original.derivatives, ...dark.outputs])
  assert.equal(hash(item.path), item.sha256, item.path)
assert.equal(hash(dark.source), dark.sourceSha256)
assert.ok(
  dark.alphaIdentical &&
    dark.symbolIdentical &&
    dark.optimizedVisibleSymbolIdentical &&
    dark.onlyTextRgbChanged
)
assert.ok(dark.changedPixels > 10000)
console.log(
  'BT-BRAND-02: dark derivative, original/symbol/alpha provenance and protected PWA/Android assets PASS'
)
