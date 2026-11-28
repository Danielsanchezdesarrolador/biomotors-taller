import {readFile,writeFile,mkdtemp} from 'node:fs/promises'
import {pathToFileURL} from 'node:url'
import {execFileSync} from 'node:child_process'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const [a,b]=process.argv.slice(2),out=process.env.BT_MPF_EVIDENCE||'/tmp/bt-mpf-evidence'
if(!a?.startsWith('/tmp/')||!b?.startsWith('/tmp/'))throw Error('ISOLATED_OUTPUT_REQUIRED')
if(!process.env.BT_MP_PACKAGE_CHILD){
 const d=await mkdtemp('/tmp/bt-mp-loader-'),stub=d+'/sdk.mjs',loader=d+'/loader.mjs';await writeFile(stub,'export const createClient=(...args)=>globalThis.mpCreate(...args)')
 const aliases={'npm:@supabase/supabase-js@2.119.0':pathToFileURL(stub).href,'npm:pdf-lib@1.17.1':import.meta.resolve('pdf-lib'),'npm:@pdf-lib/fontkit@1.1.1':import.meta.resolve('@pdf-lib/fontkit')};await writeFile(loader,'const aliases='+JSON.stringify(aliases)+';export async function resolve(s,c,n){return aliases[s]?{url:aliases[s],shortCircuit:true}:n(s,c)}')
 execFileSync(process.execPath,['--experimental-loader',loader,new URL(import.meta.url).pathname,a,b],{stdio:'inherit',env:{...process.env,BT_MP_PACKAGE_CHILD:'true'}});process.exit(0)
}
const ma=JSON.parse(await readFile(a+'/manifest.json')),mb=JSON.parse(await readFile(b+'/manifest.json'));assert.deepEqual(ma,mb)
for(const [p,h]of Object.entries(ma.files))for(const root of [a,b])assert.equal(createHash('sha256').update(await readFile(root+'/'+p)).digest('hex'),h)
let h,network=0,calls=0;const wid='00000000-0000-4000-8000-000000000001',oid='00000000-0000-4000-8000-000000000002'
globalThis.fetch=()=>{network++;throw Error('REAL_NETWORK_FORBIDDEN')}
globalThis.mpCreate=()=>({auth:{getUser:async()=>({data:{user:{email_confirmed_at:'synthetic'}},error:null})},rpc:async(n,args)=>{assert.equal(n,'bt_mp_info');assert.deepEqual(args,{p_workshop_id:wid,p_order_id:oid});calls++;return {data:{version:2,workshopId:wid,orderId:oid,plan:'basic',originals:[]},error:null}}})
const entry=a+'/supabase/functions/bt-multipunto-documents/index.js';const code=await readFile(entry,'utf8');assert.ok(!code.includes('import.meta.env'));for(const s of [...code.matchAll(/from ["']([^"']+)/g)].map(m=>m[1]))assert.ok(['npm:@supabase/supabase-js@2.119.0','npm:pdf-lib@1.17.1','npm:@pdf-lib/fontkit@1.1.1','node:buffer'].includes(s),s)
const env={BT_MP_READ_ENABLED:'true',BT_MP_WRITE_ENABLED:'false',SUPABASE_URL:'https://synthetic.invalid',BT_MP_PUBLISHABLE_KEY:'sb_publishable_synthetic',BT_MP_ALLOWED_ORIGIN:'https://synthetic.invalid',SUPABASE_SERVICE_ROLE_KEY:'synthetic-only'}
globalThis.Deno={env:{get:k=>env[k]},serve:fn=>h=fn,readFile:async url=>new Uint8Array(await readFile(url))};await import(pathToFileURL(entry).href)
const request=action=>new Request('https://synthetic.invalid',{method:'POST',headers:{authorization:'Bearer synthetic','Content-Type':'application/json'},body:JSON.stringify({version:2,action,workshopId:wid,orderId:oid})})
assert.equal((await h(request('info'))).status,200);assert.equal((await h(request('prepare'))).status,503);assert.equal(calls,1);assert.equal(network,0)
env.BT_MP_READ_ENABLED='false';await import(pathToFileURL(entry).href+'?frozen');assert.equal((await h(request('info'))).status,503);assert.equal(calls,1)
let deno
try{deno=execFileSync('deno',['--version'],{encoding:'utf8'})}catch(e){if(e.code!=='ENOENT')throw e;deno=null}
if(deno){
 execFileSync('deno',['check',entry],{stdio:'inherit'})
 const native=await mkdtemp('/tmp/bt-mp-native-'),test=native+'/entry_test.ts'
 await writeFile(test,`let handler;Object.defineProperty(Deno,'serve',{value:(fn)=>{handler=fn}});Deno.env.set('BT_MP_READ_ENABLED','false');await import(${JSON.stringify(pathToFileURL(entry).href)});Deno.test('native bundled gate OFF returns no bytes',async()=>{const r=await handler(new Request('https://synthetic.invalid'));if(r.status!==503||(await r.arrayBuffer()).byteLength!==0)throw Error('GATE_FAILED')});`)
 execFileSync('deno',['test','--no-check','--allow-read','--allow-env',test],{stdio:'inherit'});deno='PASS: native deno check and bundled gate test'
}else deno='BLOCKED_ENVIRONMENT: executable deno not found; no installation attempted'
await writeFile(out+'/package-results.json',JSON.stringify({status:'PASS',files:Object.keys(ma.files).length,reproducible:true,scope:'Node ESM executing bundled Edge entry with Deno adapter and strict synthetic SDK; not native Deno validation',network,calls,nativeDeno:deno},null,2))
console.log('MULTIPUNTO_PACKAGE_REPRODUCIBILITY_AND_NODE_ADAPTER_PASS')
