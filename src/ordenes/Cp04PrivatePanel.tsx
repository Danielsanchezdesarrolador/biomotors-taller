/**
 * CP04 authenticated private panel. The only identity source is the existing
 * verified R1 controller; the repository uses the same publishable SDK and
 * is disposed as soon as this session-bound component unmounts.
 */
import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthController, Context } from '../auth/controller'
import { cp04Repository } from './cp04Repository'
import { Cp04OrdersView } from './Cp04OrdersView'

function VerifiedOrderScreen({ client, context }: { client: SupabaseClient; context: Context }) {
  const [repository, setRepository] = useState<ReturnType<typeof cp04Repository> | null>(null)
  // Each effect lifetime owns a fresh binding. StrictMode cleanup invalidates
  // its predecessor; the next mount must never reuse that disposed repository.
  useEffect(() => {
    const binding = cp04Repository(client, context)
    setRepository(binding)
    return () => binding.dispose()
  }, [client, context])
  if (!repository) return <p role="status">Preparando órdenes autorizadas…</p>
  return <Cp04OrdersView repository={repository} context={context} />
}
export function Cp04PrivatePanel({ controller }: { controller: AuthController }) {
  const [ready, setReady] = useState<{ client: SupabaseClient; context: Context } | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    void controller
      .directoryClient()
      .then((client) => {
        if (!active) return
        const state = controller.getSnapshot()
        if (
          !client ||
          !state.context ||
          (state.phase !== 'authorized' && state.phase !== 'restricted')
        ) {
          setError(true)
          return
        }
        setReady({ client, context: state.context })
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [controller])
  if (error)
    return (
      <p role="alert">
        No se pudo verificar la sesión para las órdenes. Cierra sesión e inténtalo de nuevo.
      </p>
    )
  if (!ready) return <p role="status">Preparando órdenes del taller autorizado…</p>
  return (
    <VerifiedOrderScreen
      key={ready.context.userId + '-' + ready.context.workshop.id}
      client={ready.client}
      context={ready.context}
    />
  )
}
