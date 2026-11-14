// Every build publishes the versioned approved artwork. No drawing or fallback logo.
import { readFileSync, copyFileSync, mkdirSync, writeFileSync } from 'node:fs'
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

// Legacy bookmarks may retain /icon.svg. Embed the exact approved PNG, without vector reinterpretation.
const icon = readFileSync('assets/brand/generated/icon-512.png').toString('base64')
writeFileSync(
  'public/icon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><title>ByteTorque</title><image width="512" height="512" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${icon}"/></svg>\n`
)
