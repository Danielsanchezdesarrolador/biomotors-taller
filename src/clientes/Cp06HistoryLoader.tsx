/** This boundary is rendered only inside the live CP03 session binding. */
import { useEffect, useState, type ComponentType } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
type Props = {
  client: SupabaseClient
  context: Context
  vehicleId: string
  onAccessLost?: () => void
  onBack: () => void
}
export function Cp06HistoryLoader(props: Props) {
  const [Panel, setPanel] = useState<ComponentType<Props> | null>(null),
    [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    if (import.meta.env.VITE_BT_CP06_PRIVATE_ENABLED === 'true')
      void import('../historial/VehicleHistory')
        .then((m) => {
          if (active) setPanel(() => m.VehicleHistory)
        })
        .catch(() => {
          if (active) setFailed(true)
        })
    return () => {
      active = false
    }
  }, [])
  return failed ? (
    <div className="cp03-pilot" role="alert">
      <p>No se pudo cargar el historial.</p>
      <button className="cp03-secondary" onClick={props.onBack}>
        Volver a la ficha
      </button>
    </div>
  ) : Panel ? (
    <Panel {...props} />
  ) : (
    <p role="status">Preparando historial…</p>
  )
}
