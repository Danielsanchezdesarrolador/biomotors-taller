import {it,expect,vi} from 'vitest'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import type {SupabaseClient} from '@supabase/supabase-js'
import {PlanBenefits,BasicInspectionPromotion,type CommercialStatus} from './commercialPresentation'
import {CommercialFailure,blockReason,blockMessages,documentFailure} from '../plans/commercialErrors'
import {commercialPlans} from '../plans/commercialContract'
import {meteredDocument,CommercialOperationNotCurrent} from '../../server/commercial/meteredDocument'
import {commercialDocumentHandler} from '../../server/commercial/documentHandler'
import {workMessage,workFailure} from '../ordenes/cp04Contracts'
import {cp03Message} from '../clientes/cp03PilotDirectoryView'
import {archiveMessage} from '../expedientes/contracts'
import {quoteMessage} from '../cp05/contracts'
const id=(n:number)=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),wid=id(1),uid=id(2)
const status=(plan:'basic'|'plus'|'full'):CommercialStatus=>({workshopId:wid,plan,periodStart:'2026-11-23',periodEnd:'2026-11-30',customers:2,customerLimit:plan==='basic'?5:null,ownedWorkshops:1,usage:Object.fromEntries(['quote','multipunto','email'].map(k=>[k,{used:2,reserved:0,limit:plan==='full'?null:10}])) as CommercialStatus['usage']})
it.each(['basic','plus','full'] as const)('%s always compares all plans and identifies current from server status',(plan)=>{
 const html=renderToStaticMarkup(createElement(PlanBenefits,{status:status(plan),team:null}))
 for(const name of ['Básico','Plus','Full'])expect(html).toContain('aria-label="Plan '+name+'"')
 expect(html).toContain('Plan actual del taller');expect(html).toContain('2 mecánicos incluidos');expect(html).toContain('4 mecánicos incluidos');expect(html).not.toContain('Elegir Full');expect(html).not.toContain('de sin límite');expect(html).toContain('data-plan-icon="crown"');expect(html).toContain('Contratación y pagos no disponibles')
})
it('pricing/capacity presentation is 0/2/4, USD 0/5/15',()=>{expect(Object.values(commercialPlans).map(p=>[p.mechanics,p.monthlyUSD])).toEqual([[0,0],[2,5],[4,15]])})
it('fictional promotion is informational without real order, export or save control',()=>{const html=renderToStaticMarkup(createElement(BasicInspectionPromotion));expect(html).toContain('Ver demostración ficticia');expect(html).toContain('Ver planes y beneficios');expect(html).not.toMatch(/Descargar|Guardar|iframe|blob:/)})
it.each(Object.keys(blockMessages) as (keyof typeof blockMessages)[])('messages preserve distinct reason %s',reason=>{const e=new CommercialFailure(reason);for(const message of [workMessage(e),cp03Message(e),archiveMessage(e),quoteMessage(e)])expect(message).toBe(blockMessages[reason])})
it('unknown security/technical errors never promise commercial upgrades',()=>{expect(blockReason({code:'42501',message:'Other guard'})).toBeNull();expect(blockReason({code:'XX000',message:'connection lost'})).toBeNull();expect(blockReason({message:'COMMERCIAL_QUOTA_EXHAUSTED'})).toBe('quota');expect(blockReason({message:'FINAL_INSPECTION_READ_ONLY'})).toBe('readonly');expect(()=>workFailure({message:'FINAL_INSPECTION_READ_ONLY'})).toThrow(blockMessages.readonly)})
it('HTTP decoder only interprets exact sanitized code, unknown 403 is permission and network is connection',async()=>{expect((await documentFailure({context:Response.json({error:'COMMERCIAL_QUOTA_EXHAUSTED'},{status:429})})).reason).toBe('quota');expect((await documentFailure({context:Response.json({error:'other'},{status:403})})).reason).toBe('permission');expect((await documentFailure(new Error('offline'))).reason).toBe('connection')})
it.each([['COMMERCIAL_QUOTA_EXHAUSTED','quota'],['PLAN_CAPABILITY_REQUIRED','plan'],['Confirmed live session required','session']] as const)('reserve %s is distinct and never renders, confirms or returns fallback bytes',async(message,reason)=>{
 const user={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'now'}},error:null})},rpc:vi.fn(async()=>({data:null,error:{message}}))} as unknown as SupabaseClient
 const rpc=vi.fn(),read=vi.fn();await expect(meteredDocument(user,{rpc} as unknown as SupabaseClient,{workshopId:wid,capability:'quote',resourceId:id(3),requestId:id(4)},read)).rejects.toMatchObject({reason});expect(read).not.toHaveBeenCalled();expect(rpc).not.toHaveBeenCalled()
})
it('expired confirmed operation still uses explicit-renewal class, no new reservation or render',async()=>{const read=vi.fn(),rpc=vi.fn(async()=>({error:{message:'CONSUMPTION_REPLAY_EXPIRED'},data:null}));const user={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'now'}},error:null})},rpc} as unknown as SupabaseClient;await expect(meteredDocument(user,{} as SupabaseClient,{workshopId:wid,capability:'quote',resourceId:id(3),requestId:id(4)},read)).rejects.toBeInstanceOf(CommercialOperationNotCurrent);expect(rpc).toHaveBeenCalledOnce();expect(read).not.toHaveBeenCalled()})
it('actual commercial HTTP Basic inspection returns safe plan reason without table access or rendering',async()=>{const from=vi.fn(),assets=vi.fn(),user={auth:{getUser:async()=>({data:{user:{id:uid,email_confirmed_at:'now'}},error:null})},rpc:async()=>({data:{workshopId:wid,inspectionEnabled:false},error:null}),from} as unknown as SupabaseClient;const h=commercialDocumentHandler({user:()=>user,trusted:()=>({} as SupabaseClient),assets},'https://synthetic.invalid');const r=await h(new Request('https://synthetic.invalid',{method:'POST',headers:{authorization:'Bearer synthetic'},body:JSON.stringify({action:'multipunto',workshopId:wid})}));expect(r.status).toBe(403);expect(await r.json()).toEqual({error:'PLAN_CAPABILITY_REQUIRED'});expect(from).not.toHaveBeenCalled();expect(assets).not.toHaveBeenCalled()})
