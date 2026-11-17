/**
 * BT-AUTH-R2-A6-7 · OFFLINE memory-only invitation handoff candidate.
 * Reused only behind VITE_BT_PLAN04_WORKSHOPS_ENABLED by the PLAN04 runtime.
 * Excluded from the default public bundle and all Edge entrypoints.
 *
 * This is NOT authentication, authorization, database verification, or a
 * session manager. Acceptance requires the live-session, email-bound PLAN04 RPC.
 * No global instance, localStorage, sessionStorage, network or analytics.
 */
import {
  inviteAcceptancePath, scrubInviteLocation, sanitizedInviteLink,
  type InviteLocation
} from './inviteLinkRouting'

export type InviteHandoffCapture = 'ready' | 'rejected' | 'not-invite'
export type InviteHandoffState = 'ready' | 'empty' | 'expired'
const exactQuery = /^\?token=([0-9a-f]{64})$/
const MAX_AGE_MS = 5 * 60_000

export function createMemoryOnlyInviteHandoff(
  now: () => number = Date.now,
  maxAgeMs = MAX_AGE_MS
) {
  if (!Number.isSafeInteger(maxAgeMs) || maxAgeMs < 1 || maxAgeMs > MAX_AGE_MS)
    throw new TypeError('Invalid invite lifetime')

  let token: string | undefined
  let expiresAt = 0
  function clear() { token = undefined; expiresAt = 0 }
  function state(): InviteHandoffState {
    if (!token) return 'empty'
    const current = now()
    if (!Number.isFinite(current) || current >= expiresAt) {
      clear()
      return 'expired'
    }
    return 'ready'
  }
  function capture(
    location: InviteLocation,
    replaceUrl: (url: string) => void
  ): InviteHandoffCapture {
    clear()
    if (!sanitizedInviteLink(location)) return 'not-invite'
    let query: string | undefined
    if (location.pathname === '/' && location.search === '' &&
        location.hash.startsWith('#' + inviteAcceptancePath + '?')) {
      query = location.hash.slice(('#' + inviteAcceptancePath).length)
    }
    // NEVER retain a token from pathname/search: a normal HTTP request already
    // sends query parameters to the web host (potential logs / proxy traces).
    // Old/deep links are scrubbed below but are categorically not redeemable.

    // URL scrubbing MUST succeed BEFORE anything is held in memory.
    try {
      if (scrubInviteLocation(location, replaceUrl) !== inviteAcceptancePath)
        return 'rejected'
    } catch {
      return 'rejected'
    }
    const match = query?.match(exactQuery)
    if (!match) return 'rejected'
    const current = now()
    if (!Number.isFinite(current) || current < 0 ||
        current + maxAgeMs > Number.MAX_SAFE_INTEGER) return 'rejected'
    token = match[1]
    expiresAt = current + maxAgeMs
    return 'ready'
  }

  // Future authorized caller must still verify user via Auth and server RPC.
  function consumeOnce(): string | null {
    if (state() !== 'ready') return null
    const value = token!
    clear()
    return value
  }
  return Object.freeze({ capture, state, consumeOnce, clear })
}
