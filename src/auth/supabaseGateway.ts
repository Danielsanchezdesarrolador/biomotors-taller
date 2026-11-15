import { fetchWithTimeout } from './fetchWithTimeout'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { AuthFailure, type AuthGateway, type Membership, type Workshop } from './controller'
import type { AuthConfig } from './config'
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
      return data.user ? { id: data.user.id, confirmed: !!data.user.email_confirmed_at } : null
    },
    async signIn(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      check(error)
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
    subscribe(callback) {
      const { data } = client.auth.onAuthStateChange((event) => {
        callback(event)
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
