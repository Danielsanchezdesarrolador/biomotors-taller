/** Same renderer bundle in real Node and (when present) native Deno; no network in Node. */
import {build} from 'rolldown'
import {mkdtemp,writeFile,readFile} from 'node:fs/promises'
import {execFileSync} from 'node:child_process'
import {pathToFileURL} from 'node:url'
import {missingRuntime} from './multipunto-runtime.mjs'
const out=process.env.BT_MPF_EVIDENCE||'/tmp/bt-mp-pdf-fix-evidence',dir=await mkdtemp('/tmp/bt-mp-pdf-runtime-'),entry=dir+'/renderer.mjs'
await build({input:'server/multipunto/renderer.ts',platform:'neutral',external:['pdf-lib','@pdf-lib/fontkit','node:buffer'],output:{file:entry,format:'esm'},plugins:[{name:'native-pinned',renderChunk(code){return {code:code.replaceAll('from "pdf-lib"','from "npm:pdf-lib@1.17.1"').replaceAll('from "@pdf-lib/fontkit"','from "npm:@pdf-lib/fontkit@1.1.1"'),map:null}}}]})
const aliases={'npm:pdf-lib@1.17.1':import.meta.resolve('pdf-lib'),'npm:@pdf-lib/fontkit@1.1.1':import.meta.resolve('@pdf-lib/fontkit')}
const loader=dir+'/loader.mjs';await writeFile(loader,'const aliases='+JSON.stringify(aliases)+';export async function resolve(s,c,n){return aliases[s]?{url:aliases[s],shortCircuit:true}:n(s,c)}')
const check=dir+'/node.mjs';await writeFile(check,`import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {renderMultipunto} from ${JSON.stringify(pathToFileURL(entry).href)};globalThis.fetch=()=>{throw Error('NETWORK_FORBIDDEN')};const w=JSON.parse(await readFile(${JSON.stringify(out+'/worker.json')},'utf8'));const assets={font:new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),light:new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal.png')),dark:new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal-dark.png'))};const b=await renderMultipunto(w,assets);assert.deepEqual(b,new Uint8Array(await readFile(${JSON.stringify(out+'/draft.pdf')})));console.log('NATIVE_NODE_RENDERER_PINNED_BUNDLE_PASS');`)
execFileSync(process.execPath,['--experimental-loader',loader,check],{stdio:'inherit'})
let deno
try{execFileSync('deno',['--version'],{stdio:'pipe'});deno=true}catch(e){if(e.code!=='ENOENT')throw e;deno=false}
if(deno){execFileSync('deno',['check',entry],{stdio:'inherit'});execFileSync('deno',['test','--allow-read','tests/multipunto/pdf.native.test.mjs','--',entry,out],{stdio:'inherit'});deno={status:'PASS',scope:'Native Deno check + shared renderer with pinned real PDF/font dependencies'}}else deno=await missingRuntime('Deno','No native executable installed. No installation or alternative download attempted.',out)
await writeFile(out+'/runtime-results.json',JSON.stringify({node:{status:'PASS',version:process.version,scope:'Actual pinned renderer bundle, actual fonts/PDF libs, deterministic bytes, no network'},deno},null,2)+'\n')
