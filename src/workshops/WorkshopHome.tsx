import {PlanComparison} from '../plans/commercialPresentation'
import { useEffect,useRef,useState,type FormEvent } from 'react'
import type { AuthController } from '../auth/controller'
import { parsePlanStatus,planLabel } from '../plans/planStatus'
import { requestIdentity,workshopRpc,uuid } from './client'
import '../auth/personal.css'
export function WorkshopHome({controller,planSnapshot,onCreated}:{controller:AuthController;planSnapshot?:string;onCreated?:(id:string)=>Promise<void>}) {
  const [eligible,setEligible]=useState(false),[loading,setLoading]=useState(true),[name,setName]=useState(''),[notice,setNotice]=useState('')
  const [own,setOwn]=useState<{id:string;name:string}|null>(null),[failed,setFailed]=useState(false),[unavailableOwn,setUnavailableOwn]=useState(false),[retry,setRetry]=useState(0)
  const busy=useRef(false),identity=useRef(requestIdentity())
  useEffect(()=>{let active=true;setLoading(true);setFailed(false);setEligible(false);void workshopRpc(controller,'bt_commercial_own_workshop').then(value=>{
    const data=value as {personalPlan:unknown;canCreate:unknown;workshop:{id:string;name:string}|null;bound:unknown;blockedByOwnership:unknown}
    const plan=parsePlanStatus(data.personalPlan)
    if(!plan||plan.scope!=='personal'||typeof data.canCreate!=='boolean'||typeof data.bound!=='boolean'||typeof data.blockedByOwnership!=='boolean'||data.workshop&&(!uuid.test(data.workshop.id)||typeof data.workshop.name!=='string'))throw Error('INVALID')
    if(active){setOwn(data.workshop);setUnavailableOwn(!data.workshop&&(data.bound||data.blockedByOwnership));setEligible(data.canCreate&&!data.workshop&&!data.bound&&!data.blockedByOwnership&&['plus','full'].includes(plan.effectivePlan));setNotice(planLabel(plan))}
  }).catch(()=>{if(active){setOwn(null);setEligible(false);setFailed(true);setNotice('No se pudo verificar tu taller propio. La creación permanece bloqueada.')}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[controller,planSnapshot,retry])
  async function create(event:FormEvent) {
    event.preventDefault();if(busy.current||!eligible)return;busy.current=true;setLoading(true)
    try{
      const result=await workshopRpc(controller,'bt_plan04_create_workshop',{p_name:name.trim(),p_request_id:identity.current.for(name.trim())}) as {workshopId?:string}
      if(!result||!result.workshopId||!uuid.test(result.workshopId))throw Error('INVALID')
      if(onCreated)await onCreated(result.workshopId)
      else {await controller.choose(result.workshopId);if(controller.getSnapshot().context?.workshop.id!==result.workshopId)throw Error('ACCESS_NOT_CONFIRMED')}
      identity.current.clear()
    }catch{setNotice('No se pudo crear el taller. Revalida tu plan; al reintentar se conserva el identificador de la operación.')}
    finally{busy.current=false;setLoading(false)}
  }
  return <section className="dashboard-card"><h2>Mi taller</h2><p role="status">{notice}</p>
    {failed&&<button disabled={loading} onClick={()=>setRetry(n=>n+1)}>Reintentar consulta</button>}
    {own?<div><h3>{own.name}</h3><p>Tu taller propio permanece vinculado, también si cambia tu plan.</p><button disabled={loading} onClick={()=>void (onCreated?onCreated(own.id):controller.choose(own.id))}>Entrar a mi taller</button></div>:eligible?<form onSubmit={e=>void create(e)}><label>Nombre de mi taller<input value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={120} required disabled={loading}/></label>
      <p>Una licencia se vincula a un solo taller. No se incorporan datos de otros talleres.</p><button className="rp-primary" disabled={loading}>Crear mi taller</button></form>
    :loading?<p role="status">Consultando la vinculación de tu taller…</p>:failed?<p>No se pudo confirmar la vinculación. Reintenta la consulta; no se creará otro taller sin validación del servidor.</p>:unavailableOwn?<p>Existe un taller propio vinculado o una titularidad previa. No se confirmó acceso a ese taller y no se creará otro. Revalida tu sesión o solicita revisar la membresía existente.</p>:<PlanComparison/>}</section>
}
