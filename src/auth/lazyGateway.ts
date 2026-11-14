import type { AuthConfig } from './config'
import type { AuthGateway } from './controller'
// Even importing Auth JS can probe browser storage. Keep the SDK unevaluated while OFF.
export function lazyGateway(config: Extract<AuthConfig, { enabled: true }>): AuthGateway {
  let pending: Promise<AuthGateway> | undefined
  const get = () =>
    (pending ??= import('./supabaseGateway').then((module) => module.createGateway(config)))
  return {
    hasSession: async () => (await get()).hasSession(),
    getUser: async () => (await get()).getUser(),
    signIn: async (email, password) => (await get()).signIn(email, password),
    signOut: async () => (await get()).signOut(),
    memberships: async (id) => (await get()).memberships(id),
    workshops: async (ids) => (await get()).workshops(ids),
    subscribe(callback) {
      let disposed = false
      let unsubscribe: (() => void) | undefined
      void get()
        .then((gateway) => {
          if (!disposed) unsubscribe = gateway.subscribe(callback)
        })
        .catch(() => {
          /* validate() reports the same load failure without exposing details. */
        })
      return () => {
        disposed = true
        unsubscribe?.()
      }
    }
  }
}
