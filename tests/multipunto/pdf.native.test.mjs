/** Native Deno only. This test is not reported PASS by a Node adapter. */
import {PDFDocument} from 'npm:pdf-lib@1.17.1'
const [entry,out]=Deno.args
if(!entry||!out)throw Error('ISOLATED_TEST_ARGUMENTS_REQUIRED')
const {renderMultipunto}=await import(new URL('file://'+entry).href)
const work=JSON.parse(await Deno.readTextFile(out+'/worker.json'))
const assets={font:await Deno.readFile('public/cp05/DejaVuSans.ttf'),light:await Deno.readFile('apps/android/assets/brand/logo-horizontal.png'),dark:await Deno.readFile('apps/android/assets/brand/logo-horizontal-dark.png')}
const hash=async b=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b)),x=>x.toString(16).padStart(2,'0')).join('')
Deno.test('pinned renderer: actual draft bytes equal Node/SQL fixture, A4 and deterministic',async()=>{
 const a=await renderMultipunto(work,assets),b=await renderMultipunto(work,assets)
 if(await hash(a)!==await hash(b)||await hash(a)!==await hash(await Deno.readFile(out+'/draft.pdf')))throw Error('NATIVE_RENDERER_IDENTITY_MISMATCH')
 const pdf=await PDFDocument.load(a);for(const page of pdf.getPages())if(page.getWidth()!==595.28||page.getHeight()!==841.89)throw Error('NOT_A4')
})
Deno.test('untrusted renderer and mismatched assets fail closed',async()=>{
 for(const [w,a]of [[{...work,snapshot:{...work.snapshot,policy:{...work.snapshot.policy,renderer:'untrusted'}}},assets],[work,{...assets,font:new Uint8Array([1])}]]){
  let denied=false;try{await renderMultipunto(w,a)}catch(e){denied=/MP_POLICY_MISMATCH|MP_ASSET_MISMATCH/.test(String(e))}if(!denied)throw Error('DENIAL_REQUIRED')
 }
})
