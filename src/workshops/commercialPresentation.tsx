import {PlanComparison,BasicInspectionPromotion} from '../plans/commercialPresentation'
import {Crown,LockKeyhole,Store,UsersRound,Mail,FileText,Download} from 'lucide-react'
import {PlanBadge} from '../plans/PlanBadge'
import type {Team} from './client'
import './commercial.css'
export type CommercialStatus={workshopId:string;plan:'basic'|'plus'|'full';periodStart:string;periodEnd:string;customers:number;customerLimit:number|null;ownedWorkshops:number;usage:Record<'quote'|'email'|'multipunto',{used:number;reserved:number;limit:number|null}>}
export function parseCommercial(value:unknown,wid:string):CommercialStatus{
 const v=value as CommercialStatus
 if(!v||v.workshopId!==wid||!['basic','plus','full'].includes(v.plan)||!Number.isInteger(v.customers)||v.customers<0||!Number.isInteger(v.ownedWorkshops)||v.ownedWorkshops<0||!v.usage||!['quote','email','multipunto'].every(k=>{const q=v.usage[k as keyof typeof v.usage];return q&&Number.isInteger(q.used)&&q.used>=0&&Number.isInteger(q.reserved)&&q.reserved>=0&&(q.limit===null||Number.isInteger(q.limit)&&q.limit>=0)}))throw Error('INVALID_COMMERCIAL_STATUS')
 return v
}
export function CommercialHeader({name,address,status,team}:{name:string;address:string;status:unknown;team:Team|null}){
 const s=status as CommercialStatus|null
 return <><section className="dashboard-card commercial-identity"><div className="commercial-logo"><Store size={36}/><small>Logo pendiente</small></div><div><h2>{name} <PlanBadge plan={s?.plan??null}/></h2><p>{address||'Dirección sin configurar'} · Taller autorizado</p><small>Plan efectivo del taller, independiente de la licencia personal.</small></div></section>{s?.plan==='basic'&&s.ownedWorkshops===0&&<PlanComparison/>}{s?.plan==='basic'&&<BasicInspectionPromotion/>}{s?.plan==='basic'&&s.ownedWorkshops>0&&<section className="dashboard-card commercial-locked"><LockKeyhole/><div><h2>Tu taller tiene acceso limitado</h2><p>Conserva sus datos, borradores y operaciones Básico autorizadas. Las capacidades premium requieren Plus o Full.</p></div></section>}<div className="commercial-metrics">{[
 [<UsersRound/>, 'Mecánicos activos',team?`${team.active} de ${team.capacity}`:'No disponible'],[<UsersRound/>,'Cupos disponibles',team?String(Math.max(0,team.capacity-team.active-team.pending)):'No disponible'],[<Store/>,'Talleres propios',s?`${s.ownedWorkshops} de 1`:'No disponible'],[<Crown/>,'Estado de suscripción',s?s.plan==='full'?'Full activo':s.plan==='plus'?'Plus activo':'Básico':'Sin confirmar']
 ].map(([icon,label,value])=><section className="dashboard-card" key={String(label)}><span className="commercial-metric-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong>{label==='Cupos disponibles'&&<small>{team?.pending??'—'} invitaciones reservadas</small>}</div></section>)}</div></>
}
export function PlanBenefits({status,team}:{status:unknown;team:Team|null}){
 const s=status as CommercialStatus|null
 if(!s)return <p role="status">Consumos sin confirmar. Reintenta la consulta del taller; no se muestran cifras estimadas.</p>
 return <>{s.plan==='basic'&&<BasicInspectionPromotion/>}<h2>Plan y beneficios</h2><PlanBadge plan={s.plan}/><p>Consumos compartidos por el taller, confirmados por servidor. {s.plan==='basic'?'Ventana móvil de 48 horas.':'Semana comercial: lunes 00:00 America/Santiago.'}</p><div className="commercial-usage">{([['quote','Cotizaciones',FileText],['email','Correos comerciales',Mail],['multipunto','Descargas multipunto',Download]] as const).map(([key,label,Icon])=>{const q=s.usage[key];return <section key={key}><h3><Icon size={18}/>{label}</h3><strong>{q.used}</strong> utilizadas · {q.limit===null?'Sin límite comercial':q.limit+' disponibles por período'}<p>{q.reserved} reservadas{q.limit!==null&&` · ${Math.max(0,q.limit-q.used-q.reserved)} disponibles`}</p></section>})}<section><h3><UsersRound size={18}/>Mecánicos</h3><strong>{team?.active??'—'}</strong> de {team?.capacity??'—'} activos<p>{team?.pending??'—'} invitaciones reservadas</p></section></div><p>Clientes registrados, incluidos los archivados: {s.customers} / {s.customerLimit??'sin límite comercial'}. Un taller propio como máximo.</p><p>Correo comercial y registro público: capacidad del plan sujeta a activación segura; servicios actualmente apagados. Los correos de Auth no consumen esta cuota.</p><PlanComparison hasWorkshop currentPlan={s.plan}/></>
}
