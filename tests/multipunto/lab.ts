import {spawnSync,spawn} from 'node:child_process'
import {readFile} from 'node:fs/promises'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {MPInfo,MPJob} from '../../server/multipunto/protocol'
import {multipuntoHandler} from '../../server/multipunto/handler'
import {randomUUID} from 'node:crypto'
export const lab=process.env.BT_MPF_LAB||'bt-mpf-development'
if(!/^bt-mpf-[a-z0-9-]+$/.test(lab))throw Error('ISOLATED_LAB_REQUIRED')
export const fixture=JSON.parse(await readFile('/tmp/bt-mpf-fixture.json','utf8')) as {wid:string;oid:string;vid:string;cid:string;owner:string;creator:string}
export const lit=(v:unknown)=>v==null?'NULL':typeof v==='boolean'||typeof v==='number'?String(v):"'"+String(typeof v==='object'?JSON.stringify(v):v).replaceAll("'","''")+"'"
export let actor=fixture.owner,session=fixture.owner
export function claims(role='authenticated'){return `SET ROLE ${role};SELECT set_config('request.jwt.claim.sub',${lit(actor)},false);SELECT set_config('request.jwt.claims',${lit({session_id:session,aal:actor===fixture.creator?'aal2':'aal1',exp:2000000000})},false);`}
export function sql(q:string,role='postgres'):any{const r=spawnSync('docker',['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','bytetorque'],{input:claims(role)+q,encoding:'utf8',maxBuffer:128*1024*1024});if(r.error||r.status!==0)throw Error(r.stderr);const s=r.stdout.trim().split('\n').at(-1)||'null';if(s==='t')return true;if(s==='f')return false;try{return JSON.parse(s)}catch{return s}}
export function independent(q:string,role='postgres'):Promise<string>{return new Promise((resolve,reject)=>{const c=spawn('docker',['exec','-i',lab,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-U','postgres','-d','bytetorque']);let out='',err='';c.stdout.on('data',x=>out+=x);c.stderr.on('data',x=>err+=x);c.on('exit',code=>code?reject(Error(err)):resolve(out));c.stdin.end(claims(role)+q)})}
const order:Record<string,string[]>={bt_mp_info:['p_workshop_id','p_order_id'],bt_mp_prepare:['p_workshop_id','p_order_id','p_request_id','p_kind','p_source_hash','p_snapshot_hash','p_max_additional_units','p_partial_ack','p_credit_id'],bt_mp_status:['p_workshop_id','p_job_id'],bt_mp_worker:['p_job_id','p_generation','p_action','p_bytes','p_hash'],bt_mp_complete:['p_workshop_id','p_job_id'],bt_mp_read:['p_workshop_id','p_order_id','p_document_id','p_job_id'],bt_mp_renew:['p_workshop_id','p_job_id','p_max_additional_units']}
export function invoke(name:string,args:unknown[],role='authenticated'){return sql(`SELECT public.${name}(${args.map(lit).join(',')});`,role)}
export const objects=new Map<string,Uint8Array>()
export let storageFault='',readHook:(()=>void)|null=null
export function fault(value:string){storageFault=value}
export function onRead(h:(()=>void)|null){readHook=h}
export function identity(a:string,s=a){actor=a;session=s}
export const assets=async()=>({font:new Uint8Array(await readFile('public/cp05/DejaVuSans.ttf')),light:new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal.png')),dark:new Uint8Array(await readFile('apps/android/assets/brand/logo-horizontal-dark.png'))})
export const client=(role:string)=>({auth:{getUser:async()=>({data:{user:{id:actor,email_confirmed_at:'synthetic-confirmed'}},error:null})},rpc:async(name:string,args:Record<string,unknown>)=>{if(!order[name])throw Error('UNEXPECTED_RPC '+name);try{return {data:invoke(name,order[name].map(k=>args[k]??null),role),error:null}}catch(e){return {data:null,error:{message:(e as Error).message}}}},storage:{from:(bucket:string)=>({upload:async(path:string,b:Uint8Array,options:{upsert:boolean})=>{if(bucket!=='bt-inspection-documents'||options.upsert!==false)throw Error('INVALID_STORAGE');if(storageFault==='upload')return {error:{statusCode:'503'}};if(objects.has(path))return {error:{statusCode:'409'}};objects.set(path,b.slice());return {error:null}},download:async(path:string)=>{readHook?.();if(storageFault==='read')return {data:null,error:{statusCode:'503'}};const b=objects.get(path);return b?{data:new Blob([(storageFault==='corrupt'?new Uint8Array([1,2,3]):b).slice().buffer]),error:null}:{data:null,error:{statusCode:'404'}}}})}} as unknown as SupabaseClient)
export const handler=multipuntoHandler({user:()=>client('authenticated'),trusted:()=>client('service_role'),assets,origin:'https://synthetic.invalid',readEnabled:true,writeEnabled:true})
export const post=(action:string,extra:Record<string,unknown>={})=>handler(new Request('https://synthetic.invalid',{method:'POST',headers:{origin:'https://synthetic.invalid',authorization:'Bearer synthetic', 'content-type':'application/json'},body:JSON.stringify({version:2,action,workshopId:fixture.wid,...extra})}))
export const info=():MPInfo=>invoke('bt_mp_info',[fixture.wid,fixture.oid])
export const prepare=(kind='final',credit:string|null=null,max=credit?0:1,id=randomUUID()):MPJob=>{const i=info();return invoke('bt_mp_prepare',[fixture.wid,fixture.oid,id,kind,i.sourceHash,i.snapshotHash,max,true,credit])}
export const setPlan=(p:string)=>sql(`UPDATE bt_platform_private.subscriptions SET plan=${lit(p)},state='active' WHERE workshop_id=${lit(fixture.wid)};`)
export const confirmed=()=>sql(`SELECT count(*) FROM bt_commercial_private.consumption WHERE workshop_id=${lit(fixture.wid)} AND state='confirmed' AND capability='multipunto';`)
