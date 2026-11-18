/** Private CP05-only gate. A separate hosted rollout is required before use. */
import { useEffect, useState, type ComponentType } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import type { Quote, Revision } from './contracts'

type Props = {
  client: SupabaseClient
  context: Context
  quote: Quote
  revision: Revision
}
export function FlowLive02Loader(props: Props) {
  const [Panel, setPanel] = useState<ComponentType<Props> | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    if (import.meta.env.VITE_BT_FLOW_LIVE_02_ENABLED === 'true')
      void import('../entrega/FlowLive02Panel')
        .then(mod => { if (active) setPanel(() => mod.FlowLive02Panel) })
        .catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [])
  if (import.meta.env.VITE_BT_FLOW_LIVE_02_ENABLED !== 'true') return null
  if (failed) return <p role="alert">
    No se pudo cargar la constancia privada. Ninguna acción se registró.
  </p>
  if (!Panel) return <p role="status">Preparando acceso seguro a ejecución y entrega…</p>
  return <Panel {...props} />
}
