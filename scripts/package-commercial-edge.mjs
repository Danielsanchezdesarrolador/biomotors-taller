// Offline reproducible candidate only. No network, install, deploy, or environment edits.
import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises'
import {resolve,join} from 'node:path'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
import {build} from 'rolldown'
const out=resolve(process.argv[2]||'');assert.ok(out.startsWith('/tmp/')&&!out.includes('..'),'Exclusive /tmp output required')
await mkdir(out);const root=join(out,'supabase/functions/bt-commercial-documents');await mkdir(join(root,'assets'),{recursive:true})
const packages={'@supabase/supabase-js':'npm:@supabase/supabase-js@2.119.0','pdf-lib':'npm:pdf-lib@1.17.1','@pdf-lib/fontkit':'npm:@pdf-lib/fontkit@1.1.1'}
await build({input:'server/commercial/edgeEntryCandidate.ts',platform:'neutral',plugins:[{name:'pinned-deno-imports',resolveId(source){if(packages[source])return {id:packages[source],external:true}}}],output:{file:join(root,'index.js'),format:'es'}})
for(const [source,name] of [['public/cp05/DejaVuSans.ttf','DejaVuSans.ttf'],['assets/brand/generated/icon-192.png','icon-192.png'],['apps/android/assets/brand/logo-horizontal.png','logo-light.png'],['apps/android/assets/brand/logo-horizontal-dark.png','logo-dark.png'],['public/cp05/FONT-LICENSE.txt','FONT-LICENSE.txt']])await copyFile(source,join(root,'assets',name))
await writeFile(join(out,'supabase/config.toml'),'# OFFLINE CANDIDATE ONLY; not installed.\n[functions.bt-commercial-documents]\nverify_jwt = true\nentrypoint = "./functions/bt-commercial-documents/index.js"\nstatic_files = ["./functions/bt-commercial-documents/assets/*"]\n')
const files=['supabase/config.toml','supabase/functions/bt-commercial-documents/index.js',...['DejaVuSans.ttf','icon-192.png','logo-light.png','logo-dark.png','FONT-LICENSE.txt'].map(n=>'supabase/functions/bt-commercial-documents/assets/'+n)]
const manifest={};for(const file of files)manifest[file]=createHash('sha256').update(await readFile(join(out,file))).digest('hex')
const bundle=await readFile(join(root,'index.js'),'utf8');assert.ok(!bundle.includes('import.meta.env'));assert.ok(bundle.includes('COMMERCIAL_QUOTA_DENIED'));assert.ok(bundle.includes('ASSET_INTEGRITY_ERROR'))
await writeFile(join(out,'MANIFEST.json'),JSON.stringify({network:false,deployed:false,verifyJWT:true,files:manifest},null,2));console.log('COMMERCIAL_EDGE_PACKAGE_PASS',files.length)
