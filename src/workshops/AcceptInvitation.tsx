import { useState } from 'react'
import type { AuthController } from '../auth/controller'
import { invitationHandoff } from './invitationRuntime'
import { workshopRpc,uuid } from './client'
export function AcceptInvitation({controller}:{controller:AuthController}) {
 const [message,setMessage]=useState('Inicia sesión con el correo confirmado que recibió la invitación. El enlace es de un solo uso y permanece en memoria un máximo de cinco minutos.')
 const [busy,setBusy]=useState(false)
 async function accept(){if(busy)return;setBusy(true)
  try{const token=invitationHandoff.consumeOnce();if(!token)throw Error('EXPIRED')
   const result=await workshopRpc(controller,'bt_plan04_accept_mechanic',{p_token:token}) as {workshopId?:string}
   if(!result?.workshopId||!uuid.test(result.workshopId))throw Error('INVALID')
   setMessage('Invitación aceptada. Tu cuenta personal sigue siendo gratuita.');await controller.choose(result.workshopId)
   window.location.hash='/acceso'
  }catch{setMessage('No se pudo confirmar la invitación. Revisa el correo de tu cuenta y solicita al titular un enlace nuevo. No se creó ninguna cuenta automáticamente.')}
  finally{setBusy(false)}}
 return <section className="dashboard-card"><h2>Aceptar invitación de mecánico</h2><p role="status">{message}</p><button disabled={busy||invitationHandoff.state()!=='ready'} onClick={()=>void accept()}>Aceptar con mi cuenta verificada</button></section>
}
