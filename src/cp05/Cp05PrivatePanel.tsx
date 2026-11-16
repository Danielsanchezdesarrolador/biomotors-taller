/**
 * CP05 authenticated private panel. The only identity source is the existing
 * verified R1 controller; the repository uses the same publishable SDK and
 * is disposed as soon as this session-bound component unmounts.
 */
import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthController, Context } from '../auth/controller'
import { cp05Repository } from './repository'
import { QuotePanel } from './QuotePanel'

function VerifiedOrderScreen({
  client,
  context,
  onBack,
  initialVehicleId,
  initialOrderId
}: {
  client: SupabaseClient
  context: Context
  initialVehicleId?: string
  initialOrderId?: string
  onBack: () => void
}) {
  const [repository, setRepository] = useState<ReturnType<typeof cp05Repository> | null>(null)
  // Each effect lifetime owns a fresh binding. StrictMode cleanup invalidates
  // its predecessor; the next mount must never reuse that disposed repository.
  useEffect(() => {
    const binding = cp05Repository(client, context)
    setRepository(binding)
    return () => binding.dispose()
  }, [client, context])
  if (!repository) return <p role="status">Preparando órdenes autorizadas…</p>
  return (
    <QuotePanel
      repository={repository}
      context={context}
      onBack={onBack}
      initialVehicleId={initialVehicleId}
      initialOrderId={initialOrderId}
    />
  )
}
export function Cp05PrivatePanel({
  controller,
  onBack,
  initialVehicleId,
  initialOrderId
}: {
  controller: AuthController
  initialVehicleId?: string
  initialOrderId?: string
  onBack: () => void
}) {
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
      initialVehicleId={initialVehicleId}
      initialOrderId={initialOrderId}
      onBack={onBack}
      client={ready.client}
      context={ready.context}
    />
  )
}
