/** Loopback-only harness: production UI/repository against disposable PostgreSQL RPC bridge. */
import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../../src/auth/controller'
import '../../src/official/official.css'
import { recordsRepository } from '../../src/records/repository'
import { RecordsAdministration } from '../../src/records/RecordsAdministration'
const context = {userId:'11111111-1111-4111-8111-111111111111',role:'owner',workshop:{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',name:'Taller ficticio'}} as Context
const client = {
  auth: {getUser: async () => ({data:{user:{id:context.userId,email_confirmed_at:'2026-11-24T00:00:00Z'}},error:null})},
  rpc: async (name: string, args: unknown) => {
    const response = await fetch('http://127.0.0.1:47115/rpc', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,args})})
    return response.json()
  }
} as unknown as SupabaseClient
export default function RecordsFixture() {
  const [repository,setRepository] = useState<ReturnType<typeof recordsRepository>|null>(null)
  useEffect(()=>{const port=recordsRepository(client,context);setRepository(port);return()=>port.dispose()},[])
  return repository ? <main style={{padding:20}}><RecordsAdministration repository={repository} onBack={()=>{}}/></main> : <p>Preparando datos sintéticos…</p>
}
