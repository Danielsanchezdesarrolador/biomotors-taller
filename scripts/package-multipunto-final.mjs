import {readFile,mkdir,copyFile,writeFile,readdir} from 'node:fs/promises'
import {join} from 'node:path'
import assert from 'node:assert/strict'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {build} from 'rolldown'
import {offlineOutput} from './cp05-offline-output.mjs'
assert.equal(execFileSync(process.execPath,['scripts/multipunto-policy.mjs'],{encoding:'utf8'}),await readFile('docs/sql/BT_MULTIPUNTO_FINAL_01B_DELTA_01_POLICY_CANDIDATE.sql','utf8'),'Policy registry/source drift')
assert.equal(execFileSync(process.execPath,['scripts/multipunto-pdf-policy.mjs'],{encoding:'utf8'}),await readFile('docs/sql/BT_MULTIPUNTO_PDF_FIX_01_POLICY_CANDIDATE.sql','utf8'),'PDF policy registry/source drift')
const out=offlineOutput(process.argv[2]||'',process.cwd());await mkdir(out)
const root=join(out,'supabase/functions/bt-multipunto-documents');await mkdir(join(root,'assets'),{recursive:true})
await build({input:'server/multipunto/edgeEntryCandidate.ts',platform:'neutral',external:['npm:@supabase/supabase-js@2.119.0','pdf-lib','@pdf-lib/fontkit','node:buffer'],output:{file:join(root,'index.js'),format:'esm'},plugins:[{name:'pinned-edge-dependencies',renderChunk(code){return {code:code.replaceAll("from \"pdf-lib\"","from \"npm:pdf-lib@1.17.1\"").replaceAll("from \"@pdf-lib/fontkit\"","from \"npm:@pdf-lib/fontkit@1.1.1\""),map:null}}}]})
for(const [src,dest]of [['public/cp05/DejaVuSans.ttf','DejaVuSans.ttf'],['apps/android/assets/brand/logo-horizontal.png','logo-light.png'],['apps/android/assets/brand/logo-horizontal-dark.png','logo-dark.png'],['public/cp05/FONT-LICENSE.txt','FONT-LICENSE.txt']])await copyFile(src,join(root,'assets',dest))
await writeFile(join(out,'supabase/config.toml'),'# Offline candidate; not deployed.\n[functions.bt-multipunto-documents]\nverify_jwt = true\nentrypoint = "./functions/bt-multipunto-documents/index.js"\nstatic_files = ["./functions/bt-multipunto-documents/assets/*"]\n')
await copyFile('docs/sql/BT_MULTIPUNTO_FINAL_01B_STORAGE_CANDIDATE.sql',join(out,'storage.sql'));
await copyFile('docs/sql/BT_MULTIPUNTO_FINAL_01B_CANDIDATE.sql',join(out,'migration.sql'));await copyFile('docs/sql/BT_MULTIPUNTO_FINAL_01B_POLICY_CANDIDATE.sql',join(out,'policy.sql'))
await copyFile('docs/sql/BT_MULTIPUNTO_FINAL_01B_DELTA_01_CANDIDATE.sql',join(out,'migration-delta.sql'));await copyFile('docs/sql/BT_MULTIPUNTO_FINAL_01B_DELTA_01_POLICY_CANDIDATE.sql',join(out,'policy-delta.sql'));
for(const [src,dest]of [['docs/sql/BT_MULTIPUNTO_PDF_FIX_01_POLICY_CANDIDATE.sql','policy-pdf.sql'],['docs/sql/BT_MULTIPUNTO_PDF_FIX_01_CANDIDATE.sql','migration-pdf.sql'],['docs/sql/BT_MULTIPUNTO_PDF_FIX_01_ROLLBACK_CANDIDATE.sql','rollback-pdf.sql']])await copyFile(src,join(out,dest))
const files={};async function walk(root,p=''){for(const e of await readdir(root,{withFileTypes:true})){if(e.isDirectory())await walk(join(root,e.name),p+e.name+'/');else files[p+e.name]=createHash('sha256').update(await readFile(join(root,e.name))).digest('hex')}}await walk(out)
await writeFile(join(out,'manifest.json'),JSON.stringify({version:3,scope:'OFFLINE_REVIEW_ONLY',files:Object.fromEntries(Object.entries(files).sort()),gates:'OFF',deployed:false},null,2)+'\n')
console.log('MULTIPUNTO_OFFLINE_PACKAGE',Object.keys(files).length)
