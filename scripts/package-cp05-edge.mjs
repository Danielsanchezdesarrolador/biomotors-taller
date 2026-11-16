// Build a REVIEWABLE offline deployment directory. Never calls Supabase or deploys.
import { build } from 'rolldown'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
const out = resolve(process.argv[2] || '/tmp/bytetorque-cp05-edge-candidate')
if (!out.startsWith('/tmp/'))
  throw Error('Use an offline /tmp output directory; never overwrite the repository')
const functionPath = join(out, 'supabase/functions/bt-cp05-documents')
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
for (const [source, name] of [
  ['public/cp05/DejaVuSans.ttf', 'DejaVuSans.ttf'],
  ['assets/brand/generated/icon-192.png', 'icon-192.png'],
  ['public/cp05/FONT-LICENSE.txt', 'FONT-LICENSE.txt']
])
  await copyFile(source, join(functionPath, 'assets', name))
await writeFile(
  join(out, 'supabase/config.toml'),
  '# CANDIDATE ONLY — not deployed; separate approval required.\n[functions.bt-cp05-documents]\nverify_jwt = true\nentrypoint = "./functions/bt-cp05-documents/index.js"\nstatic_files = ["./functions/bt-cp05-documents/assets/*"]\n'
)
console.log(
  'CP05 offline package prepared. No deployment, secrets or service activation performed.'
)
