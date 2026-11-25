import {useEffect,useState} from 'react'
import type {AuthController,Context} from '../auth/controller'
import type {SupabaseClient} from '@supabase/supabase-js'
import {agendaRepository} from './repository'
import {cp03PilotRepository} from '../clientes/cp03PilotRepository'
import {canOpen} from '../guided/progress'
import {AgendaPanel} from './AgendaPanel'
export type AgendaProps={controller:AuthController;isActive:boolean;onQuote:(id:string)=>void;onReceive:(id:string)=>void;onDirectory:()=>void;onOrders:()=>void}
function Bound({client,context,...props}:{client:SupabaseClient;context:Context}&Omit<AgendaProps,'controller'>){
 const [bindings,setBindings]=useState<{agenda:ReturnType<typeof agendaRepository>;directory:ReturnType<typeof cp03PilotRepository>}|null>(null)
 useEffect(()=>{const agenda=agendaRepository(client,context),directory=cp03PilotRepository(client,context);setBindings({agenda,directory});return()=>{agenda.dispose();directory.dispose()}},[client,context])
 return bindings?<AgendaPanel {...props} onReceive={id=>{if(canOpen(context))props.onReceive(id);else props.onOrders()}} {...bindings} client={client} context={context}/>:<p role="status">Preparando Agenda autorizada…</p>
}
export default function AgendaPrivatePanel({controller,...props}:AgendaProps){
 const [binding,setBinding]=useState<{client:SupabaseClient;context:Context}|null>(null),[failed,setFailed]=useState(false)
 useEffect(()=>{let active=true;void controller.directoryClient().then(client=>{if(!active)return;const s=controller.getSnapshot();if(!client||!s.context||!['authorized','restricted'].includes(s.phase)){setFailed(true);return}setBinding({client,context:s.context})}).catch(()=>{if(active)setFailed(true)});return()=>{active=false}},[controller])
 if(failed)return <p role="alert">No se pudo verificar la sesión de Agenda.</p>
 if(!binding)return <p role="status">Verificando acceso a Agenda…</p>
 if(!['owner','admin','reception'].includes(binding.context.role))return <p role="note">La Agenda requiere permisos de propietario, administración o recepción.</p>
 return <Bound key={binding.context.workshop.id+binding.context.userId} {...props} {...binding}/>
}
