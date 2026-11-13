// Shared page-memory invalidation. No storage, timers, network or authentication.
let revision = 0
const listeners = new Set<() => void>()
export function sessionChanged() {
  revision++
  for (const listener of listeners) listener()
}
export const sessionRevision = () => revision
export function subscribeSession(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
