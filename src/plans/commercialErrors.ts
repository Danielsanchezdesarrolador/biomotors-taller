export type BlockReason='plan'|'quota'|'seats'|'expired'|'session'|'permission'|'connection'|'readonly'
export const blockMessages:Record<BlockReason,string>={
 plan:'Esta función está disponible en ByteTorque Plus y Full. Conoce los beneficios de nuestros planes.',
 quota:'Has utilizado las solicitudes disponibles de tu plan. Podrás continuar cuando se renueve tu cuota o al acceder a un plan superior.',
 seats:'Tu taller ha alcanzado el límite de mecánicos de su plan actual. Las invitaciones pendientes también reservan cupos.',
 expired:'La autorización documental ya no está vigente. Solicita una nueva operación explícitamente; el servidor comprobará tu plan y el cupo disponible.',
 session:'Tu sesión ya no es válida. Inicia sesión nuevamente para verificar tu acceso.',
 permission:'No tienes permisos para realizar esta operación en el taller seleccionado.',
 connection:'No se pudo confirmar la operación con el servidor. Comprueba la conexión y reintenta sin cambiar su identidad.',
 readonly:'Esta inspección se encuentra en modo de solo lectura porque la orden está lista para entregar o ya fue entregada.'
}
export class CommercialFailure extends Error {constructor(readonly reason:BlockReason){super(blockMessages[reason]);this.name='CommercialFailure'}}
/** Exact known server contracts only. Unknown errors are never advertised as upgrades. */
export function blockReason(error:unknown):BlockReason|null{
 const e=error as {message?:string;code?:string}|null,m=e?.message
 if(m==='PLAN_CAPABILITY_REQUIRED'||m==='INSPECTION_PLAN_REQUIRED')return 'plan'
 if(m==='COMMERCIAL_QUOTA_EXHAUSTED'||m==='BASIC_CUSTOMER_LIMIT')return 'quota'
 if(m==='No confirmed seat available'||m==='Seat no longer available')return 'seats'
 if(m==='FINAL_INSPECTION_READ_ONLY')return 'readonly'
 if(m==='CONFIRMED_SESSION_REQUIRED'||m==='Confirmed live session required'||m==='SESSION_CHANGED'||e?.code==='PGRST301')return 'session'
 return null
}
export async function documentFailure(error:unknown):Promise<CommercialFailure>{
 const response=(error as {context?:Response})?.context
 if(!(response instanceof Response))return new CommercialFailure('connection')
 const body=await response.clone().json().catch(()=>null)
 // HTTP security semantics win over a contradictory body. Only exact commercial
 // code/status pairs may be promoted; integrity/service failures belong to their caller.
 if(response.status===401)return new CommercialFailure('session')
 if(response.status===403)return new CommercialFailure(body?.error==='PLAN_CAPABILITY_REQUIRED'?'plan':'permission')
 if(response.status===429&&body?.error==='COMMERCIAL_QUOTA_EXHAUSTED')return new CommercialFailure('quota')
 return new CommercialFailure('connection')
}
