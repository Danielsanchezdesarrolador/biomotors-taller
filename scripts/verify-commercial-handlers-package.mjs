// Local package compatibility/reproducibility checks. No Deno install or hosted traffic.
import assert from 'node:assert/strict'
import {readFile,mkdir,writeFile,mkdtemp} from 'node:fs/promises'
import {join,resolve} from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {Buffer} from 'node:buffer'
if(process.env.BT_DELTA_ESM_CHILD!=='true'){
 const temp=await mkdtemp('/tmp/bt-delta-esm-'),stub=join(temp,'synthetic-sdk.mjs'),loader=join(temp,'loader.mjs')
 await writeFile(stub,'export const createClient=(...args)=>globalThis.__btSyntheticCreateClient(...args);\n')
 const aliases={'npm:@supabase/supabase-js@2.119.0':pathToFileURL(stub).href,'npm:pdf-lib@1.17.1':import.meta.resolve('pdf-lib'),'npm:@pdf-lib/fontkit@1.1.1':import.meta.resolve('@pdf-lib/fontkit')}
 await writeFile(loader,'const aliases='+JSON.stringify(aliases)+';export async function resolve(specifier,context,next){return aliases[specifier]?{url:aliases[specifier],shortCircuit:true}:next(specifier,context);}')
 execFileSync(process.execPath,['--experimental-loader',loader,new URL(import.meta.url).pathname,...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,BT_DELTA_ESM_CHILD:'true'}})
 process.exit(0)
}
const [a,b]=process.argv.slice(2).map(value=>resolve(value));assert.ok(a?.startsWith('/tmp/')&&b?.startsWith('/tmp/'))
const sha=bytes=>createHash('sha256').update(bytes).digest('hex')
const ma=JSON.parse(await readFile(join(a,'release-manifest.json'),'utf8')),mb=JSON.parse(await readFile(join(b,'release-manifest.json'),'utf8'));assert.deepEqual(ma,mb)
for(const [name,hash] of Object.entries(ma.files)){assert.equal(sha(await readFile(join(a,name))),hash);assert.equal(sha(await readFile(join(b,name))),hash)}
const results=[{name:'Two independent packages have identical manifests and all 43 file hashes',status:'PASS'}]
const id=n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),uid=id(2),rid=id(3),qid=id(8),requestId=id(4),oid=id(7),origin='https://app.synthetic.invalid'
const pdf=new TextEncoder().encode('%PDF-1.7\nSynthetic immutable package original\n%%EOF')
const path=wid+'/quotes/'+qid+'/r1/'+'a'.repeat(64)+'.pdf'
const doc={kind:'quote',fileName:'quote.pdf',bucket:'cp05-quote-documents',path,sha256:sha(pdf),byteLength:pdf.length,contentType:'application/pdf'}
const rows={workshop_memberships:{workshop_id:wid,user_id:uid,role:'owner',status:'active'},workshops:{id:wid,name:'Taller sintético',status:'active'},quote_revisions:{id:rid,workshop_id:wid,quote_id:qid,revision:1,payload_sha256:'a'.repeat(64),pdf_object_path:path,pdf_sha256:sha(pdf),pdf_size:pdf.length},customers:{id:id(5),workshop_id:wid,full_name:'Cliente sintético'},vehicles:{id:id(6),workshop_id:wid,customer_id:id(5),plate:'QA1234',make:'Sintético',model:'Paquete'},work_orders:{id:oid,workshop_id:wid,vehicle_id:id(6),intake_odometer:120000,opened_at:'2026-11-26T12:00:00Z',complaint:'Prueba de paquete'}}
for(const name of ma.services){
 let handler,cached='',state='reserved',network=0
 const env={SUPABASE_URL:'https://synthetic.invalid',BT_CP05_PUBLISHABLE_KEY:'synthetic-only',SUPABASE_SERVICE_ROLE_KEY:'synthetic-only',BT_CP05_ARCHIVE_ENABLED:'true',BT_CP05_EMAIL_ENABLED:'false',BT_CP05_ALLOWED_ORIGIN:origin,BT_CP05_PILOT_WORKSHOP_ID:wid,BT_FINAL_ARCHIVE_READ_ENABLED:'true',BT_FINAL_ARCHIVE_WRITE_ENABLED:'false',BT_FINAL_ARCHIVE_ALLOWED_ORIGIN:origin}
 const user={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'synthetic-confirmed'}},error:null})},rpc:async(n,args)=>{
  assert.equal(args.p_workshop_id,wid)
  if(n==='bt_plan04_operations_status')return {data:{workshopId:wid,operationsEnabled:true,documentsEnabled:true},error:null}
  if(n==='bt_commercial_status')return {data:{workshopId:wid,inspectionEnabled:true,plan:'plus'},error:null}
  if(n==='bt_final_archive_document')return {data:{workshopId:wid,revisionId:rid,quoteId:qid,orderId:oid,vehicleId:id(6),customerId:id(5),revision:1,issuedAt:'2026-11-26T12:00:00Z',complete:false,documents:[doc]},error:null}
  assert.equal(n,'bt_commercial_reserve');assert.equal(args.p_request_id,requestId);return {data:{workshop_id:wid,actor_id:uid,resource_id:args.p_resource_id,request_id:requestId,state},error:null}
 },from:table=>{assert.ok(table in rows||table==='inspection_findings','Unexpected table '+table);const filters={};const get=()=>({data:table==='inspection_findings'?[]:Object.entries(filters).every(([k,v])=>rows[table]?.[k]===v)?rows[table]:null,error:null});const q={select:()=>q,eq:(k,v)=>{filters[k]=v;return q},maybeSingle:async()=>get(),single:async()=>get(),then:r=>Promise.resolve(get()).then(r)};return q}}
 const trusted={rpc:async(n,args)=>{assert.equal(args.p_request_id,requestId);assert.equal(args.p_actor_id,uid);if(n==='bt_commercial_cached')return {data:cached,error:null};assert.equal(n,'bt_commercial_finish');if(args.p_success&&state!=='confirmed'){cached=args.p_bytes.slice(2);state='confirmed'};return {data:{request_id:requestId,state},error:null}},storage:{from:bucket=>({download:async p=>{assert.equal(bucket,doc.bucket);assert.equal(p,path);return {data:new Blob([pdf]),error:null}}})}}
 const entry=join(a,'ready/supabase/functions',name,'index.js'),url=pathToFileURL(entry)
 globalThis.Deno={env:{get:key=>env[key]},readFile:async u=>{assert.ok(u.href.startsWith(new URL('./assets/',url).href));return new Uint8Array(await readFile(u))},serve:h=>{handler=h}}
 globalThis.__btSyntheticCreateClient=(api,_key,options)=>{assert.equal(api,env.SUPABASE_URL);return options.global?user:trusted}
 globalThis.fetch=()=>{network++;throw Error('REAL_NETWORK_FORBIDDEN')}
 const code=await readFile(entry,'utf8');assert.ok(!code.includes('import.meta.env'))
 for(const specifier of [...code.matchAll(/from ["']([^"']+)["']/g)].map(m=>m[1]))assert.ok(['npm:@supabase/supabase-js@2.119.0','npm:pdf-lib@1.17.1','npm:@pdf-lib/fontkit@1.1.1','node:buffer'].includes(specifier),'Unpinned/unresolved dependency '+specifier)
 await import(url.href);assert.equal(typeof handler,'function')
 const body=name==='bt-cp05-documents'?{action:'download',workshopId:wid,revisionId:rid,requestId}:name==='bt-final-archive'?{action:'download',kind:'quote',workshopId:wid,revisionId:rid,requestId}:{action:'multipunto',workshopId:wid,orderId:oid,requestId}
 const req=()=>new Request(origin+'/documents',{method:'POST',headers:{origin,authorization:'Bearer synthetic','content-type':'application/json'},body:JSON.stringify(body)})
 const first=await handler(req());assert.equal(first.status,200,name+' '+await (first.status!==200?first.text():Promise.resolve('')));assert.equal(first.headers.get('content-type'),'application/pdf');const bytes=new Uint8Array(await first.arrayBuffer());assert.equal(new TextDecoder().decode(bytes.slice(0,5)),'%PDF-')
 const retry=await handler(req());assert.equal(retry.status,200);assert.deepEqual(new Uint8Array(await retry.arrayBuffer()),bytes)
 assert.equal(network,0);results.push({name:name+' bundled entry evaluates, authorizes PDF HTTP and retries identical bytes in Node ESM/Deno shim',status:'PASS',responseSHA256:sha(bytes),realNetworkRequests:network})
 let frozen;globalThis.Deno={serve:h=>{frozen=h}};await import(pathToFileURL(join(a,'freeze/supabase/functions',name,'index.js')).href)
 const unavailable=await frozen(req());assert.equal(unavailable.status,503);assert.equal((await unavailable.arrayBuffer()).byteLength,0);results.push({name:name+' deny-all package returns 503 without document bytes or dependencies',status:'PASS'})
}
const out='/tmp/bt-commercial-delta-evidence';await mkdir(out,{recursive:true});await writeFile(join(out,'package-results.json'),JSON.stringify({status:'PASS',cases:results,scope:'Node ESM with Deno adapter and synthetic SDK, real PDF libraries/assets; NOT a native Deno or hosted runtime certification',nativeDeno:'NOT_AVAILABLE_NOT_INSTALLED',productionContacted:false},null,2)+'\n');console.log('THREE_HANDLERS_PACKAGE_COMPATIBILITY_PASS',results.length)
