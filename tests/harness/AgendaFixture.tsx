/** Loopback SQL lab only. No hosted URL, real session, or browser persistence. */
import {useEffect,useMemo,useState} from 'react'
import {createClient} from '@supabase/supabase-js'
import type {AuthController,Context} from '../../src/auth/controller'
import {AgendaPanel} from '../../src/agenda/AgendaPanel'
import {agendaRepository} from '../../src/agenda/repository'
import {cp03PilotRepository} from '../../src/clientes/cp03PilotRepository'
import {cp05Repository} from '../../src/cp05/repository'
import {QuotePanel} from '../../src/cp05/QuotePanel'
import GuidedWorkspace from '../../src/guided/GuidedWorkspace'
import {AppShell} from '../../src/layout/AppShell'
export default function AgendaFixture(){
 const [context,setContext]=useState<Context|null>(null)
 useEffect(()=>{void fetch('http://127.0.0.1:4179/fixture').then(r=>r.json()).then(d=>setContext(d.context))},[])
 return context?<Bound context={context}/>:<p role="status">Preparando laboratorio SQL aislado…</p>
}
function Bound({context}:{context:Context}){
 const [quote,setQuote]=useState(''),[order,setOrder]=useState(''),[section,setSection]=useState<'agenda'|'clientes'>('agenda')
 const client=useMemo(()=>{const c=createClient('http://127.0.0.1:4179','synthetic-local-only',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});c.auth.getUser=async()=>({data:{user:{id:context.userId,email_confirmed_at:'2026-11-25T00:00:00Z'}},error:null}) as never;return c},[context])
 const [ports,setPorts]=useState<{agenda:ReturnType<typeof agendaRepository>;directory:ReturnType<typeof cp03PilotRepository>;quotes:ReturnType<typeof cp05Repository>}|null>(null)
 const controller=useMemo(()=>({directoryClient:async()=>client,getSnapshot:()=>({phase:'authorized',context}),subscribe:()=>()=>{}}) as unknown as AuthController,[client,context])
 useEffect(()=>{const p={agenda:agendaRepository(client,context),directory:cp03PilotRepository(client,context),quotes:cp05Repository(client,context)};setPorts(p);return()=>{p.agenda.dispose();p.directory.dispose();p.quotes.dispose()}},[client,context])
 if(!ports)return <p>Preparando conexiones locales…</p>
 const {agenda,directory,quotes}=ports
 return <AppShell screen="agenda" onNavigate={()=>{setQuote('');setSection('agenda')}} copy={{workshopTitle:context.workshop.name,workshopSubtitle:'Laboratorio aislado',workshopStatus:'Sin datos reales',version:'BT-AGENDA-01 · candidato local',accountTitle:'Operador ficticio',accountSubtitle:'Propietario',notifications:'Correos automáticos desactivados'}}><p role="note">LABORATORIO LOCAL · Registros ficticios en PostgreSQL aislado · Sin acceso alojado</p><div hidden={!!quote||section!=='agenda'}><AgendaPanel agenda={agenda} directory={directory} client={client} context={context} isActive={!quote&&!order&&section==='agenda'} onQuote={setQuote} onReceive={setOrder} onDirectory={()=>setSection('clientes')}/></div>{quote&&<QuotePanel repository={quotes} privateClient={client} context={context} initialOrderId={quote} isActive onBack={()=>setQuote('')}/>} {order&&<GuidedWorkspace controller={controller} start={{orderId:order}} onClose={()=>setOrder('')}/>} {section==='clientes'&&<p>Utiliza el directorio CP03 existente. <button onClick={()=>setSection('agenda')}>Volver a Agenda</button></p>}</AppShell>
}
