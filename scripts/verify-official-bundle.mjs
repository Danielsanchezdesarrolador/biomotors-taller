import { readFileSync, readdirSync } from 'node:fs'
import assert from 'node:assert/strict'
const modules = JSON.parse(readFileSync('dist/.vite/public-modules.json', 'utf8'))
assert.ok(modules.length > 0)
assert.ok(
  modules.every(
    (id) => id.endsWith('.css') || /src\/(?:main\.tsx|App\.tsx|layout\/|official\/)/.test(id)
  )
)
for (const name of readdirSync('dist/assets')) {
  if (!/\.(js|css)$/.test(name)) continue
  const text = readFileSync('dist/assets/' + name, 'utf8')
  assert.doesNotMatch(
    text,
    /OT-100[1-8]|workshop-demo|DEMO-KZV|@example\.com|Camila Muñoz|demoWorkOrders|tests\/fixtures|WorkflowApp/
  )
}
const manifest = JSON.parse(readFileSync('dist/manifest.webmanifest', 'utf8'))
assert.match(manifest.name, /ByteTorque/)
assert.equal(manifest.short_name, 'ByteTorque')
console.log('Public module graph, fixture exclusion and ByteTorque PWA identity: PASS')
