import {useEffect,useState} from 'react'
import type {AuthController} from '../auth/controller'
import {workshopRpc,uuid} from './client'
export function PendingInvitations({controller}:{controller:AuthController}){
 const [rows,setRows]=useState<{id:string;workshopName:string}[]>([]),[message,setMessage]=useState(''),[busy,setBusy]=useState(false)
 useEffect(()=>{let active=true;void workshopRpc(controller,'bt_plan04_pending_invitations').then(value=>{
  if(!Array.isArray(value)||!value.every(r=>uuid.test(r.id)&&typeof r.workshopName==='string'))throw Error('INVALID')
  if(active)setRows(value)
 }).catch(()=>{if(active)setMessage('No se pudieron consultar invitaciones pendientes. Revalida tu acceso para reintentar.')});return()=>{active=false}},[controller])
 async function accept(id:string){if(busy)return;setBusy(true);try{
  const value=await workshopRpc(controller,'bt_plan04_accept_pending',{p_invitation_id:id}) as {workshopId?:string}
  if(!value?.workshopId||!uuid.test(value.workshopId))throw Error('INVALID')
  await controller.choose(value.workshopId)
  if(controller.getSnapshot().context?.workshop.id!==value.workshopId)throw Error('UNCONFIRMED')
  window.location.hash='/acceso'
 }catch{setMessage('No se pudo aceptar. Verifica correo confirmado, vigencia de la invitación y cupos del taller.')}finally{setBusy(false)}}
 return <section className="dashboard-card" aria-label="Invitaciones pendientes"><h2>Invitaciones a talleres</h2><p>Se consultan de forma segura con tu correo confirmado. No guardamos el enlace confidencial en este navegador.</p><p role="status">{message}</p>{rows.map(row=><div key={row.id}><strong>{row.workshopName}</strong><button disabled={busy} onClick={()=>void accept(row.id)}>Aceptar invitación pendiente</button></div>)}{!rows.length&&!message&&<p>Sin invitaciones pendientes para esta cuenta.</p>}</section>
}
