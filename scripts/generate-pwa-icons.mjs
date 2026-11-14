// Every build publishes the versioned approved artwork. No drawing or fallback logo.
import { readFileSync, copyFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
const manifest = JSON.parse(readFileSync('assets/brand/manifest.json', 'utf8'))
for (const item of [...manifest.originals, ...manifest.derivatives]) {
  const bytes = readFileSync(item.path)
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    item.sha256,
    item.path + ': artwork changed'
  )
}
mkdirSync('public', { recursive: true })
for (const file of [
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png',
  'icon-maskable-512.png',
  'favicon-32.png',
  'favicon-48.png'
]) {
  copyFileSync('assets/brand/generated/' + file, 'public/' + file)
}
console.log('BT-BRAND-01: official versioned PWA artwork published')
