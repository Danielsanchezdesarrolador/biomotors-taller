/**
 * BT-CP03-P4 — Unpublished Auth → directory lifetime boundary.
 * A configured, shared authenticated SupabaseClient is injected; do NOT
 * create another SDK instance, read local storage or auto-enable routes.
 * The public UI does not import this module until distinct rollout approval.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthController, AuthState, Context } from '../auth/controller'
import { cp03PilotRepository } from './cp03PilotRepository'

export type PilotDirectoryBound = Readonly<{
  context: Context
  repository: ReturnType<typeof cp03PilotRepository>
}>
type AuthReader = Pick<AuthController, 'getSnapshot' | 'subscribe'>

function allowed(state: AuthState): Context | null {
  const context = state.context
  if (!context) return null
  if (state.phase === 'restricted' && context.role === 'reception') return context
  if (state.phase === 'authorized' &&
      (context.role === 'owner' || context.role === 'admin' ||
       context.role === 'mechanic')) return context
  return null
}
function fingerprint(c: Context) {
  return [c.userId, c.workshop.id, c.workshop.name, c.workshop.status, c.role].join('|')
}
/**
 * First-load/explicit checking, offline/logout/choose is a HARD teardown, even when
 * the same user returns. Routine checks keep the verified Auth snapshot.
 * No previous customer data may survive sign-out.
 * The caller must unmount the old Cp03PilotDirectoryView on snapshot change.
 */
export function cp03PilotAccessBinding(auth: AuthReader, client: SupabaseClient) {
  let destroyed = false
  let current: PilotDirectoryBound | null = null
  let key: string | null = null
  const listeners = new Set<() => void>()
  function replace(state: AuthState) {
    if (destroyed) return
    const next = allowed(state)
    const nextKey = next ? fingerprint(next) : null
    if (nextKey === key) return
    current?.repository.dispose()
    current = next ? { context: next, repository: cp03PilotRepository(client, next) } : null
    key = nextKey
    listeners.forEach(notify => notify())
  }
  const unsubscribeAuth = auth.subscribe(() => replace(auth.getSnapshot()))
  replace(auth.getSnapshot())
  function dispose() {
    if (destroyed) return
    destroyed = true
    unsubscribeAuth()
    current?.repository.dispose()
    current = null
    key = null
    listeners.forEach(notify => notify())
    listeners.clear()
  }
  return Object.freeze({
    getSnapshot: () => current,
    subscribe(listener: () => void) {
      if (destroyed) return () => {}
      listeners.add(listener)
      return () => {listeners.delete(listener)}
    },
    dispose
  })
}
