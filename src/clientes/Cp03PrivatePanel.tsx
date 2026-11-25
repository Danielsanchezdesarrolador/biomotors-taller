/**
 * CP03 private use: AuthController owns identity, and provides its EXISTING
 * Supabase client. The bound repository closes on hard Auth invalidation or
 * tenant change. Routine revalidation retains the verified binding.
 * No separate SDK, fake data, service keys or browser storage.
 * This module is only imported after an explicitly enabled private R1 route.
 */
import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthController } from '../auth/controller'
import { cp03PilotAccessBinding } from './cp03PilotAccessBinding'
import { Cp06HistoryLoader } from './Cp06HistoryLoader'
import { Cp03PilotDirectoryView } from './cp03PilotDirectoryView'

const RecordsLoader = import.meta.env.VITE_BT_RECORDS_PRIVATE_ENABLED === 'true' ? lazy(() => import('../records/RecordsLoader')) : null

const FinalArchiveLoader = import.meta.env.VITE_BT_FINAL_ARCHIVE_ENABLED === 'true' ? lazy(() => import('../expedientes/FinalArchiveLoader')) : null

type Binding = ReturnType<typeof cp03PilotAccessBinding>

function BoundDirectory({ binding, client, onAccessLost, onVehicleQuotes, onGuided }: { binding: Binding; client:SupabaseClient; onAccessLost:()=>void; onGuided?: (id:string)=>void; onVehicleQuotes?: (id:string)=>void }) {
  const [administration, setAdministration] = useState(false)
  const [archiveOpen,setArchiveOpen]=useState(false)
  const [directoryRevision, setDirectoryRevision] = useState(0)
  const access = useSyncExternalStore(binding.subscribe,binding.getSnapshot,() => null)
  if (!access) return <p role="status">Verificando el acceso al directorio privado…</p>
  const { context, repository } = access
  const canManage = RecordsLoader && ['owner','admin'].includes(context.role)
  const canReadArchive=FinalArchiveLoader&&['owner','admin'].includes(context.role)
  const showArchive=!!canReadArchive&&archiveOpen
  const showAdministration = !!canManage && administration
  return <div className="cp03-private-panel">
    {canReadArchive&&!administration&&!archiveOpen&&<button className="cp03-secondary" onClick={()=>setArchiveOpen(true)}>Expedientes anteriores · documentos originales</button>}
    {showArchive&&FinalArchiveLoader&&<Suspense fallback={<p>Abriendo archivo privado…</p>}><FinalArchiveLoader client={client} context={context} onBack={()=>setArchiveOpen(false)}/></Suspense>}
    {canManage && !administration && !archiveOpen && <button className="cp03-secondary" onClick={()=>setAdministration(true)}>Administrar registros</button>}
    {administration && canManage && <Suspense fallback={<p role="status">Preparando administración…</p>}><RecordsLoader client={client} context={context} onBack={()=>{setAdministration(false); setDirectoryRevision(n=>n+1)}}/></Suspense>}
    <div hidden={showAdministration||showArchive} inert={showAdministration||showArchive}>
    <Cp03PilotDirectoryView refreshRevision={directoryRevision} key={context.userId+'-'+context.workshop.id+'-'+context.role}
    renderHistory={import.meta.env.VITE_BT_CP06_PRIVATE_ENABLED==='true'?(vehicle,onBack)=><Cp06HistoryLoader key={vehicle.id} client={client} context={context} vehicleId={vehicle.id} onBack={onBack} onAccessLost={onAccessLost}/>:undefined}
    onGuided={onGuided} onVehicleQuotes={onVehicleQuotes} repository={repository} role={context.role} workshopName={context.workshop.name}
    draftScope={{userId:context.userId,workshopId:context.workshop.id}}/>
    </div></div>
}
function AuthClientDirectory({ controller, client, onVehicleQuotes, onGuided }: {
  controller: AuthController; client: SupabaseClient; onGuided?: (id:string)=>void; onVehicleQuotes?: (id:string)=>void
}) {
  const [binding, setBinding] = useState<Binding|null>(null)
  useEffect(() => {
    const created = cp03PilotAccessBinding(controller,client)
    setBinding(created)
    return () => { created.dispose() }
  }, [controller,client])
  return binding ? <BoundDirectory binding={binding} client={client} onAccessLost={()=>{void controller.validate()}} onGuided={onGuided} onVehicleQuotes={onVehicleQuotes}/> :
    <p role="status">Validando la sesión del taller…</p>
}
export function Cp03PrivatePanel({ controller, onVehicleQuotes, onGuided }: { controller: AuthController; onGuided?: (id:string)=>void; onVehicleQuotes?: (id:string)=>void }) {
  const [client,setClient] = useState<SupabaseClient|null>(null)
  const [error,setError] = useState(false)
  useEffect(() => {
    let active=true
    void controller.directoryClient().then(value=>{
      if (!active) return
      if (!value || !['authorized','restricted'].includes(controller.getSnapshot().phase)) {
        setError(true)
        return
      }
      setClient(value)
    }).catch(()=>{if (active) setError(true)})
    return ()=>{active=false}
  },[controller])
  if (error) return <p role="alert">Acceso al directorio no disponible. Cierra sesión y vuelve a verificar.</p>
  return client ? <AuthClientDirectory controller={controller} client={client} onGuided={onGuided} onVehicleQuotes={onVehicleQuotes}/> :
    <p role="status">Abriendo fichas del taller autorizado…</p>
}
