import { fetchWithTimeout } from './fetchWithTimeout'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { AuthFailure, type AuthGateway, type Membership, type Workshop } from './controller'
import type { AuthConfig } from './config'
import { parseRegistrationProfile, visibleAccountName } from './registrationProfile'
function check(error: unknown): void {
  if (!error) return
  const e = error as { status?: number; name?: string; code?: string }
  if (
    (typeof navigator !== 'undefined' && navigator.onLine === false) ||
    e.name === 'AuthRetryableFetchError' ||
    e.name === 'TypeError' ||
    e.name === 'AbortError' ||
    e.name === 'TimeoutError'
  )
    throw new AuthFailure('offline')
  if (e.code === 'email_not_confirmed') throw new AuthFailure('unconfirmed')
  if (
    e.name === 'AuthSessionMissingError' ||
    e.status === 401 ||
    e.status === 403 ||
    ['session_not_found', 'refresh_token_not_found', 'refresh_token_already_used'].includes(
      e.code || ''
    )
  )
    throw new AuthFailure('expired')
  throw new AuthFailure('permission')
}
export function supabaseGateway(client: SupabaseClient): AuthGateway {
  return {
    getDataClient: async () => client,
    async hasSession() {
      const { data, error } = await client.auth.getSession()
      check(error)
      return !!data.session
    },
    async getUser() {
      const { data, error } = await client.auth.getUser()
      check(error)
      if (!data.user) return null
      // Private profile data is display-only; authorization still comes from RLS memberships.
      let displayName = visibleAccountName(data.user.user_metadata?.full_name)
      try {
        const profile = await client.from('profiles').select('display_name')
          .eq('user_id', data.user.id).maybeSingle()
        if (!profile.error) displayName = visibleAccountName(profile.data?.display_name) ?? displayName
      } catch { /* A missing profile must not invalidate a confirmed session. */ }
      return { id: data.user.id, confirmed: !!data.user.email_confirmed_at,
        ...(displayName ? { displayName } : {}) }
    },
    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      check(error)
    },
    async register(email, password, profile) {
      const personal = parseRegistrationProfile(profile)
      // Approved production destination, never taken from query strings.
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://bytetorque.cl/#/auth/confirmacion',
          data: { full_name: personal.fullName, date_of_birth: personal.dateOfBirth }
        }
      })
      check(error)
      // Refuse an immediate session: the hosted project must require email confirmation.
      if (data.session) {
        await client.auth.signOut({ scope: 'local' })
        throw new AuthFailure('permission')
      }
    },
    async signOut() {
      const { error } = await client.auth.signOut({ scope: 'local' })
      check(error)
    },
    async memberships(userId) {
      const { data, error } = await client
        .from('workshop_memberships')
        .select('user_id,workshop_id,role,status')
        .eq('user_id', userId)
        .eq('status', 'active')
      check(error)
      return (data || []) as Membership[]
    },
    async workshops(ids) {
      if (!ids.length) return []
      const { data, error } = await client
        .from('workshops')
        .select('id,name,status')
        .in('id', ids)
        .eq('status', 'active')
      check(error)
      return (data || []) as Workshop[]
    },
    async workshopAccess(id) {
      // Missing migration, denied RPC, stale scope or malformed result all fail closed.
      try {
        const {data,error} = await client.rpc('bt_plan04_operations_status', {p_workshop_id:id})
        if (error || data?.workshopId !== id) return {operationsEnabled:false,documentsEnabled:false}
        return {operationsEnabled:data.operationsEnabled === true,documentsEnabled:data.documentsEnabled === true,...(typeof data.inspectionEnabled==='boolean'?{inspectionEnabled:data.inspectionEnabled}:{})}
      } catch { return {operationsEnabled:false,documentsEnabled:false} }
    },
    subscribe(callback) {
      const { data } = client.auth.onAuthStateChange((event, session) => {
        callback(event, session?.user.id)
      })
      return () => data.subscription.unsubscribe()
    }
  }
}
export function createGateway(config: Extract<AuthConfig, { enabled: true }>): AuthGateway {
  return supabaseGateway(
    createClient(config.url, config.key, {
      global: { fetch: fetchWithTimeout },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce'
      }
    })
  )
}
