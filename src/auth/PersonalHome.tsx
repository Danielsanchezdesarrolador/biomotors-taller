import { useEffect, useState, type ComponentType } from 'react'
import { BrandLogo } from '../brand/BrandLogo'
import type { AuthController } from './controller'
import { planDetail, planLabel, type PlanStatus } from '../plans/planStatus'
import './personal.css'
import {PlanBadge} from '../plans/PlanBadge'

type Props = { controller: AuthController; plan: PlanStatus | null; name?: string; workshopPlan?:PlanStatus|null; onBack?:()=>void; onCreated?:(id:string)=>Promise<void>; onCreator?: () => void; onRefresh?: () => void }
export function PersonalHome({ controller, plan, name, workshopPlan, onBack, onCreated, onCreator, onRefresh }: Props) {
  const [Workshop, setWorkshop] = useState<ComponentType<{controller:AuthController;planSnapshot?:string;onCreated?:(id:string)=>Promise<void>}> | null>(null)
  const [Invites,setInvites]=useState<ComponentType<{controller:AuthController}>|null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    if(import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED==='true')void import('../workshops/PendingInvitations').then(m=>{if(active)setInvites(()=>m.PendingInvitations)}).catch(()=>{if(active)setFailed(true)})
    if (import.meta.env.VITE_BT_PLAN04_WORKSHOPS_ENABLED === 'true')
      void import('../workshops/WorkshopHome').then(m => { if (active) setWorkshop(() => m.WorkshopHome) })
        .catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [])
  return <main className="personal-home">
    <header><BrandLogo surface="dark" /><div><strong>{name || 'Mi cuenta'}</strong><p>Licencia personal · <PlanBadge plan={plan?.effectivePlan??null} text={planLabel(plan)} detail={planDetail(plan)}/>{planDetail(plan)&&<span> · {planDetail(plan)}</span>}</p></div>
      <button onClick={() => void controller.logout()}>Cerrar sesión</button></header>
    <section className="dashboard-card"><h1>Mi cuenta ByteTorque</h1>
      {onBack&&<button onClick={onBack}>Volver al taller actual</button>}
      {workshopPlan&&<p>Plan del taller actual: <PlanBadge plan={workshopPlan.effectivePlan} text={planLabel(workshopPlan)} detail={planDetail(workshopPlan)}/>. Es independiente de tu licencia personal.</p>}
      <p>Tu correo está confirmado. Puedes mantener tu cuenta personal gratuita y trabajar como mecánico de un taller que te invite, sin pagar una suscripción individual.</p>
      <p>Para crear tu propio taller necesitas Plus o Full vigente, confirmado por el servidor. No se realiza ningún cobro desde esta pantalla.</p>
      <button className="rp-primary" onClick={() => onRefresh ? onRefresh() : void controller.validate()}>Actualizar mi plan y accesos</button>
      {onCreator && <button onClick={onCreator}>Panel del creador</button>}
      <nav aria-label="Herramientas públicas"><a href="/#/revision/publica">Explorar la interfaz pública</a><a href="/privacidad">Privacidad</a><a href="/terminos">Términos</a></nav>
    </section>
    {failed && <p role="alert">No se pudo cargar la gestión del taller. Reintenta desde tu cuenta.</p>}
    {Invites&&<Invites controller={controller}/>}
    {Workshop && <Workshop controller={controller} planSnapshot={JSON.stringify(plan)} onCreated={onCreated} />}
  </main>
}
