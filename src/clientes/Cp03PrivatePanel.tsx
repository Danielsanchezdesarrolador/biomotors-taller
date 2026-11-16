/**
 * CP03 private use: AuthController owns identity, and provides its EXISTING
 * Supabase client. The bound repository closes on logout, revalidation or
 * tenant change. No separate SDK, fake data, service keys or browser storage.
 * This module is only imported after an explicitly enabled private R1 route.
 */
import { useEffect, useState, useSyncExternalStore } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthController } from '../auth/controller'
import { cp03PilotAccessBinding } from './cp03PilotAccessBinding'
import { Cp03PilotDirectoryView } from './cp03PilotDirectoryView'

type Binding = ReturnType<typeof cp03PilotAccessBinding>

function BoundDirectory({ binding, onVehicleQuotes }: { binding: Binding; onVehicleQuotes?: (id:string)=>void }) {
  const access = useSyncExternalStore(binding.subscribe,binding.getSnapshot,() => null)
  if (!access) return <p role="status">Verificando el acceso al directorio privado…</p>
  const { context, repository } = access
  return <Cp03PilotDirectoryView key={context.userId+'-'+context.workshop.id+'-'+context.role}
    onVehicleQuotes={onVehicleQuotes} repository={repository} role={context.role} workshopName={context.workshop.name}
    draftScope={{userId:context.userId,workshopId:context.workshop.id}}/>
}
function AuthClientDirectory({ controller, client, onVehicleQuotes }: {
  controller: AuthController; client: SupabaseClient; onVehicleQuotes?: (id:string)=>void
}) {
  const [binding, setBinding] = useState<Binding|null>(null)
  useEffect(() => {
    const created = cp03PilotAccessBinding(controller,client)
    setBinding(created)
    return () => { created.dispose() }
  }, [controller,client])
  return binding ? <BoundDirectory binding={binding} onVehicleQuotes={onVehicleQuotes}/> :
    <p role="status">Validando la sesión del taller…</p>
}
export function Cp03PrivatePanel({ controller, onVehicleQuotes }: { controller: AuthController; onVehicleQuotes?: (id:string)=>void }) {
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
  return client ? <AuthClientDirectory controller={controller} client={client} onVehicleQuotes={onVehicleQuotes}/> :
    <p role="status">Abriendo fichas del taller autorizado…</p>
}
