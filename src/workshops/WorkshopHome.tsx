import { useEffect,useRef,useState,type FormEvent } from 'react'
import type { AuthController } from '../auth/controller'
import { parsePlanStatus,planLabel } from '../plans/planStatus'
import { requestIdentity,workshopRpc,uuid } from './client'
import '../auth/personal.css'
export function WorkshopHome({controller,planSnapshot,onCreated}:{controller:AuthController;planSnapshot?:string;onCreated?:(id:string)=>Promise<void>}) {
  const [eligible,setEligible]=useState(false),[loading,setLoading]=useState(true),[name,setName]=useState(''),[notice,setNotice]=useState('')
  const busy=useRef(false),identity=useRef(requestIdentity())
  useEffect(()=>{let active=true;setLoading(true);void workshopRpc(controller,'bt_plan04_my_status',{p_workshop_id:null}).then(value=>{
    const plan=parsePlanStatus(value);if(active){setEligible(!!plan&&plan.scope==='personal'&&['plus','full'].includes(plan.effectivePlan));setNotice(planLabel(plan))}
  }).catch(()=>{if(active){setEligible(false);setNotice('No se pudo verificar el plan. No se puede crear un taller.')}}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[controller,planSnapshot])
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
    {eligible?<form onSubmit={e=>void create(e)}><label>Nombre de mi taller<input value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={120} required disabled={loading}/></label>
      <p>Una licencia se vincula a un solo taller. No se incorporan datos de otros talleres.</p><button className="rp-primary" disabled={loading}>Crear mi taller</button></form>
    :<p>La creación de taller requiere Plus o Full vigente. Tu cuenta personal sigue siendo gratuita; no se solicita pago aquí.</p>}</section>
}
