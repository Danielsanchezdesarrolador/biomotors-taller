// Build a REVIEWABLE offline deployment directory. Never calls Supabase or deploys.
import { mkdir, copyFile, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID, createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { offlineOutput } from './cp05-offline-output.mjs'
const checkOnly = process.argv[2] === '--check'
if (process.argv.length > 3) throw Error('ONE_OUTPUT_OR_CHECK_ONLY')
const out = offlineOutput(checkOnly || !process.argv[2]
  ? join(tmpdir(), 'bytetorque-cp05-edge-' + randomUUID()) : process.argv[2], process.cwd())
const assets = [
  ['public/cp05/DejaVuSans.ttf', 'DejaVuSans.ttf'],
  ['assets/brand/generated/icon-192.png', 'icon-192.png'],
  ['public/cp05/FONT-LICENSE.txt', 'FONT-LICENSE.txt']
]
const hashes = {}
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
for (const [source] of assets) hashes[source] = sha(await readFile(source))
const entry = await readFile('server/cp05/edgeEntryCandidate.ts', 'utf8')
for (const source of assets.slice(0, 2).map(x => x[0]))
  if (!entry.includes(hashes[source])) throw Error('ENTRY_ASSET_HASH_MISMATCH')
let localBuildDependency = false
try { createRequire(import.meta.url).resolve('rolldown'); localBuildDependency = true } catch {}
if (checkOnly) {
  console.log(JSON.stringify({ scope: 'OFFLINE_PREFLIGHT_ONLY', portable_destination: true,
    entry_source_present: true, asset_hashes_match_entry: true, asset_sha256: hashes,
    rolldown_local: localBuildDependency,
    build_status: localBuildDependency ? 'READY_NOT_BUILT' : 'BLOCKED_LOCAL_DEPENDENCY_NOT_INSTALLED',
    network_called: false, deployed: false }))
  process.exit(localBuildDependency ? 0 : 2)
}
if (!localBuildDependency) throw Error('LOCAL_ROLLDOWN_REQUIRED_NO_AUTOMATIC_INSTALL')
const { build } = await import('rolldown')
const functionPath = join(out, 'supabase/functions/bt-cp05-documents')
await mkdir(out) // exclusive: an earlier or incomplete package is never overwritten
await mkdir(join(functionPath, 'assets'), { recursive: true })
const packages = {
  '@supabase/supabase-js': 'npm:@supabase/supabase-js@2.119.0',
  'pdf-lib': 'npm:pdf-lib@1.17.1',
  '@pdf-lib/fontkit': 'npm:@pdf-lib/fontkit@1.1.1'
}
await build({
  input: 'server/cp05/edgeEntryCandidate.ts',
  platform: 'neutral',
  plugins: [
    {
      name: 'edge-npm-pins',
      resolveId(source) {
        if (packages[source]) return { id: packages[source], external: true }
        if (source.startsWith('node:')) return { id: source, external: true }
      }
    }
  ],
  output: { file: join(functionPath, 'index.js'), format: 'es', sourcemap: false }
})
for (const [source, name] of assets) {
  const target = join(functionPath, 'assets', name)
  await copyFile(source, target)
  if (sha(await readFile(target)) !== hashes[source]) throw Error('PACKAGED_ASSET_HASH_MISMATCH')
}
await writeFile(
  join(out, 'supabase/config.toml'),
  '# CANDIDATE ONLY — not deployed; separate approval required.\n[functions.bt-cp05-documents]\nverify_jwt = true\nentrypoint = "./functions/bt-cp05-documents/index.js"\nstatic_files = ["./functions/bt-cp05-documents/assets/*"]\n'
)
await writeFile(join(out, 'offline-package-manifest.json'), JSON.stringify({
  scope: 'CANDIDATE_ONLY_NOT_DEPLOYED', entrypoint: 'supabase/functions/bt-cp05-documents/index.js',
  entrypoint_sha256: sha(await readFile(join(functionPath, 'index.js'))),
  source_asset_sha256: hashes, production_contacted: false, runtime_validated: false
}, null, 2), { flag: 'wx' })
console.log(
  'CP05 offline package prepared. No deployment, secrets or service activation performed.'
)
