import {Crown,Gem} from 'lucide-react'
import type {PlanName} from './planStatus'
import './planBadge.css'
/** Display only: callers supply confirmed server state; this badge grants nothing. */
export function PlanBadge({plan,text,detail='',className=''}:{plan:PlanName|null;text?:string;detail?:string;className?:string}) {
 const label=text??(plan?{basic:'Básico',plus:'Plus',full:'Full'}[plan]:'Plan no disponible')
 return <span className={'bt-plan-badge plan-badge-'+(plan??'unknown')+' '+className} title={detail} data-plan={plan??'unknown'}>
  {plan==='full'&&<Crown size={14} aria-hidden="true" data-plan-icon="crown"/>}
  {plan==='plus'&&<Gem size={14} aria-hidden="true" data-plan-icon="plus"/>}
  <span>{label}</span>
 </span>
}
