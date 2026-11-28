// Native Deno only. Original bundled entry, actual pinned SDK, strict synthetic fetch.
const entry=Deno.args[0];if(!entry?.startsWith('/tmp/'))throw Error('ISOLATED_BUNDLE_REQUIRED')
const assert=(v,message='Native entry contract failed')=>{if(!v)throw Error(message)}
const wid='00000000-0000-4000-8000-000000000001',oid='00000000-0000-4000-8000-000000000002',doc='00000000-0000-4000-8000-000000000003'
let handler,sequence=0,authorized=true,trace=[]
Object.defineProperty(Deno,'serve',{value:fn=>{handler=fn}})
globalThis.fetch=async(input,init)=>{
 const r=new Request(input,init),url=new URL(r.url);assert(url.origin==='https://synthetic.invalid','Real network forbidden')
 assert(r.headers.get('authorization')==='Bearer synthetic-native','Unexpected authorization')
 trace.push(r.method+' '+url.pathname)
 if(url.pathname==='/auth/v1/user'){assert(r.method==='GET');return Response.json(authorized?{id:doc,aud:'authenticated',role:'authenticated',email:'native@invalid.test',email_confirmed_at:'2026-11-28T00:00:00Z',created_at:'2026-11-28T00:00:00Z',app_metadata:{},user_metadata:{}}:{message:'Synthetic session revoked',code:'session_not_found'},{status:authorized?200:401})}
 assert(r.method==='POST');const args=await r.json();assert(args.p_workshop_id===wid)
 if(url.pathname==='/rest/v1/rpc/bt_mp_info'){assert(args.p_order_id===oid&&Object.keys(args).length===2);return Response.json({version:2,workshopId:wid,orderId:oid,plan:'basic',originals:[],eligibleCredit:null})}
 if(url.pathname==='/rest/v1/rpc/bt_mp_read'){assert(args.p_order_id===oid&&args.p_document_id===doc);return Response.json({message:'MP_PERMISSION_DENIED',code:'42501',details:null,hint:null},{status:403})}
 throw Error('Unexpected native endpoint: '+url.pathname)
}
async function load(read,write){
 for(const [k,v]of Object.entries({BT_MP_READ_ENABLED:String(read),BT_MP_WRITE_ENABLED:String(write),SUPABASE_URL:'https://synthetic.invalid',BT_MP_PUBLISHABLE_KEY:'sb_publishable_synthetic',BT_MP_ALLOWED_ORIGIN:'https://synthetic.invalid',SUPABASE_SERVICE_ROLE_KEY:'synthetic-only'}))Deno.env.set(k,v)
 authorized=true;trace=[];handler=null;await import(new URL('file://'+entry+'?native='+ ++sequence).href);assert(typeof handler==='function');return handler
}
const request=(action,extra={},auth=true)=>new Request('https://synthetic.invalid',{method:'POST',headers:{'Content-Type':'application/json',...(auth?{authorization:'Bearer synthetic-native'}:{})},body:JSON.stringify({version:2,action,workshopId:wid,...(['info','read','prepare'].includes(action)?{orderId:oid}:{jobId:doc}),...(action==='prepare'?{requestId:doc,kind:'final',sourceHash:'a'.repeat(64),snapshotHash:'b'.repeat(64),maxAdditionalUnits:1,partialAck:true}:{}),...(action==='renew'?{maxAdditionalUnits:1}:{}),...extra})})
Deno.test('OFF entry returns HTTP503 and zero bytes without SDK I/O',async()=>{const h=await load(false,false),r=await h(request('info'));assert(r.status===503);assert((await r.arrayBuffer()).byteLength===0);assert(trace.length===0)})
Deno.test('READ ON, WRITE OFF uses actual SDK HTTP and denies every write',async()=>{
 const h=await load(true,false),info=await h(request('info'));assert(info.status===200);assert((await info.json()).workshopId===wid)
 for(const action of ['prepare','resume','renew']){const r=await h(request(action));assert(r.status===503);assert((await r.json()).error==='MP_WRITE_DISABLED')}
 assert(trace.filter(x=>x.includes('/rest/v1/')).length===1,'Write must not reach a business RPC')
})
Deno.test('Unauthorized session, permission, origin and malformed requests fail closed',async()=>{
 const h=await load(true,false);assert((await h(request('info',{},false))).status===401)
 authorized=false;assert((await h(request('info'))).status===401);authorized=true
 const denied=await h(request('read',{documentId:doc}));assert(denied.status===403);assert((await denied.json()).error==='MP_PERMISSION_DENIED')
 assert((await h(request('info',{unexpected:true}))).status===400)
 const origin=request('info');origin.headers.set('origin','https://other.invalid');assert((await h(origin)).status===403)
 assert(trace.every(x=>x.includes('/auth/v1/user')||x.includes('/rest/v1/rpc/bt_mp_info')||x.includes('/rest/v1/rpc/bt_mp_read')))
})
