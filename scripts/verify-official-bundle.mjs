import { readFileSync, readdirSync } from 'node:fs'
import assert from 'node:assert/strict'
const modules = JSON.parse(readFileSync('dist/.vite/public-modules.json', 'utf8'))
assert.ok(modules.length > 0)
// The offline handoff cannot enter the publicly deployed PWA until a separate
// authenticated, server-backed invitation rollout is explicitly authorized.
assert.ok(
  modules.every((id) => !/inviteHandoffCandidate\.(?:ts|tsx|js)/.test(id)),
  'Forbidden dormant invite handoff was bundled into public PWA'
)
// The session-aware flow remains an offline candidate, not production UI.
assert.ok(
  modules.every((id) => !/inviteSessionCandidate\.(?:ts|tsx|js)/.test(id)),
  'Forbidden invite session candidate was bundled into public PWA'
)
assert.ok(
  modules.every(
    (id) =>
      id.endsWith('.css') ||
      /src\/(?:main\.tsx|App\.tsx|layout\/|official\/|access\/|brand\/|auth\/)/.test(id)
  )
)
for (const name of readdirSync('dist/assets')) {
  if (!/\.(js|css)$/.test(name)) continue
  const text = readFileSync('dist/assets/' + name, 'utf8')
  if (name.endsWith('.js')) assert.doesNotMatch(text, /TallerFlow/)
  assert.doesNotMatch(text, /sb_secret_[A-Za-z0-9_-]{10,}/)
  assert.doesNotMatch(
    text,
    /OT-100[1-8]|workshop-demo|DEMO-KZV|@example\.com|Camila Muñoz|demoWorkOrders|tests\/fixtures|WorkflowApp|revision\.admin@bytetorque\.test|VistaBT-2026!|private_browser_stub|synthetic-refresh-token|browser-stub@invalid\.test/
  )
}
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'))
assert.match(manifest.name, /ByteTorque/)
assert.equal(manifest.short_name, 'ByteTorque')
console.log('Public module graph, fixture exclusion and ByteTorque PWA identity: PASS')
