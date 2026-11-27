// Consolidated REVIEW packages only. No network, dependency install, config mutation or deployment.
import {mkdir,readFile,writeFile,cp,readdir} from 'node:fs/promises'
import {join} from 'node:path'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import {offlineOutput} from './cp05-offline-output.mjs'
const out=offlineOutput(process.argv[2]||'',process.cwd());if(process.argv.length!==3)throw Error('ONE_NEW_TEMP_OUTPUT_REQUIRED')
await mkdir(out)
const services=[['bt-cp05-documents','scripts/package-cp05-edge.mjs'],['bt-final-archive','scripts/package-final-archive.mjs'],['bt-commercial-documents','scripts/package-commercial-edge.mjs']]
const parts=join(out,'parts');await mkdir(parts)
let config='# CONSOLIDATED OFFLINE CANDIDATE; not deployed.\n'
for(const [name,script] of services){
 const part=join(parts,name);execFileSync(process.execPath,[script,part],{stdio:'pipe'})
 await mkdir(join(out,'ready/supabase/functions'),{recursive:true});await cp(join(part,'supabase/functions',name),join(out,'ready/supabase/functions',name),{recursive:true,errorOnExist:true,force:false})
 config+=(await readFile(join(part,'supabase/config.toml'),'utf8')).replace(/^#.*\n/gm,'')
}
await writeFile(join(out,'ready/supabase/config.toml'),config)
let frozenConfig='# TEMPORARY DENY-ALL CANDIDATE; not deployed.\n'
const frozen='// Maintenance barrier: no SDK, credentials, assets, request bodies or document access.\nDeno.serve(() => new Response(null, {status:503, headers:{"Cache-Control":"no-store", "Retry-After":"60", "X-Content-Type-Options":"nosniff"}}));\n'
for(const [name] of services){const p=join(out,'freeze/supabase/functions',name);await mkdir(p,{recursive:true});await writeFile(join(p,'index.js'),frozen);frozenConfig+=`[functions.${name}]\nverify_jwt = true\nentrypoint = "./functions/${name}/index.js"\n`}
await writeFile(join(out,'freeze/supabase/config.toml'),frozenConfig)
const sha=b=>createHash('sha256').update(b).digest('hex'),files={}
async function inventory(root,prefix=''){for(const e of await readdir(root,{withFileTypes:true})){const relative=prefix+e.name,path=join(root,e.name);if(e.isDirectory())await inventory(path,relative+'/');else if(e.isFile())files[relative]=sha(await readFile(path));else throw Error('NON_REGULAR_PACKAGE_ENTRY')}}
await inventory(out)
const sources={};for(const p of ['scripts/package-commercial-handlers.mjs','scripts/package-cp05-edge.mjs','scripts/package-final-archive.mjs','scripts/package-commercial-edge.mjs','server/cp05/edgeEntryCandidate.ts','server/com/finalArchiveEntry.ts','server/commercial/edgeEntryCandidate.ts','server/com/finalArchiveHandler.ts','server/com/finalArchivePorts.ts','src/expedientes/originalZip.ts','src/expedientes/contracts.ts','src/ordenes/cp04InspectionPdf.ts','server/commercial/documentHandler.ts','server/commercial/meteredDocument.ts','package-lock.json'])sources[p]=sha(await readFile(p))
await writeFile(join(out,'release-manifest.json'),JSON.stringify({scope:'OFFLINE_REVIEW_ONLY',network:false,deployed:false,services:services.map(([n])=>n),sourceHashes:sources,files:Object.fromEntries(Object.entries(files).sort()),runtime:'Deno/Supabase Edge, pinned npm imports, JWT verification true',activation:'Freeze and drain ALL old egress before SQL and ready packages. Provider cross-service atomicity is NOT assumed. See candidate checkpoint.'},null,2)+'\n')
console.log('COMMERCIAL_THREE_HANDLERS_PACKAGE_PASS',Object.keys(files).length,'hashed files; ready + deny-all freeze')
