import type {SupabaseClient} from '@supabase/supabase-js'
import type {Context} from '../auth/controller'
import {UUID} from '../clientes/cp03PilotContracts'
import {AgendaFailure,type Catalog,type Command} from './contracts'
export function agendaRepository(client:SupabaseClient,context:Context){
 const wid=context.workshop.id;let disposed=false,epoch=0
 if(!UUID.test(wid)||!UUID.test(context.userId))throw new AgendaFailure('denied')
 const attempts=new Map<string,string>()
 async function guard(){const current=epoch;const {data,error}=await client.auth.getUser();if(disposed||current!==epoch||error||!data.user?.email_confirmed_at||data.user.id!==context.userId)throw new AgendaFailure('denied');return current}
 function valid(e:number){if(disposed||e!==epoch)throw new AgendaFailure('denied')}
 function failure(error:{code?:string;message?:string}):never {throw new AgendaFailure(error.message?.includes('AGENDA_DISABLED')?'disabled':error.code==='42501'?'denied':['40001','23505'].includes(error.code||'')?'conflict':['22023','22P02','23514','23502','55000','22007','22008'].includes(error.code||'')?'invalid':'unavailable')}
 return {dispose(){disposed=true;epoch++;attempts.clear()},async catalog(first:string,last:string):Promise<Catalog>{const e=await guard();const result=await client.rpc('bt_agenda_catalog',{p_workshop_id:wid,p_first_day:first,p_last_day:last});valid(e);if(result.error)failure(result.error);const d=result.data as Catalog;if(!d||!Array.isArray(d.entries)||!Array.isArray(d.requests)||!Array.isArray(d.upcoming)||[...d.entries,...d.upcoming].some(a=>a.workshop_id!==wid))throw new AgendaFailure('denied');return d},async command(kind:Command,input:Record<string,unknown>):Promise<{order_id:string;id?:string;appointment?:unknown}>{const e=await guard();const key=JSON.stringify([kind,Object.entries(input).sort(([a],[b])=>a.localeCompare(b))]);let request=attempts.get(key);if(!request){request=crypto.randomUUID();attempts.set(key,request)}const result=await client.rpc('bt_agenda_command',{p_workshop_id:wid,p_request_id:request,p_kind:kind,p_input:input});valid(e);if(result.error)failure(result.error);if(!result.data||!UUID.test(result.data.order_id))throw new AgendaFailure('unavailable');return result.data}}
}
export type AgendaRepository=ReturnType<typeof agendaRepository>
