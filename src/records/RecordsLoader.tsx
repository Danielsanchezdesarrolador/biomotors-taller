import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import { recordsRepository } from './repository'
import { RecordsAdministration } from './RecordsAdministration'
export default function RecordsLoader({client, context, onBack}: {client: SupabaseClient; context: Context; onBack: () => void}) {
  const [repository, setRepository] = useState<ReturnType<typeof recordsRepository> | null>(null)
  useEffect(() => {const bound = recordsRepository(client,context); setRepository(bound); return () => bound.dispose()},[client,context])
  return repository ? <RecordsAdministration repository={repository} onBack={onBack}/> : <p role="status">Verificando administración del taller…</p>
}
