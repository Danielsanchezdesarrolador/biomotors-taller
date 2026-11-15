/**
 * ByteTorque R2-A6-8: NOT DEPLOYED. Memory-only invite/session continuation.
 *
 * OFFLINE CANDIDATE; never import into App/main/public router/Edge.
 * No Auth credentials, API keys, email or invitation token in view state.
 * The public site still scrubs and DISCARDS the token on arrival.
 *
 * Only a future approved browser flow may construct this with a trusted
 * AuthGateway.getUser() (which checks Supabase Auth, not user_metadata).
 * A confirmed Auth session does NOT grant membership or token validity.
 * The eventual backend must getUser() AGAIN and validate the token by SQL.
 *
 * This client-side guard is UX safety, never a security authorization layer.
 */
import { createMemoryOnlyInviteHandoff } from './inviteHandoffCandidate'
import type { InviteLocation } from './inviteLinkRouting'
import type { AuthGateway, Identity } from './controller'

export type InviteResumeStage =
  | 'empty' | 'awaiting-login' | 'checking' | 'ready'
  | 'expired' | 'discarded' | 'consumed'
type Gateway = Pick<AuthGateway, 'getUser'>

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const authTransitions = new Set(['INITIAL_SESSION', 'TOKEN_REFRESHED', 'USER_UPDATED'])
const authDenied = new Set(['SIGNED_OUT', 'PASSWORD_RECOVERY', 'MFA_CHALLENGE_VERIFIED'])

export function createInviteSessionCandidate(
  gateway: Gateway,
  now: () => number = Date.now
) {
  const handoff = createMemoryOnlyInviteHandoff(now)
  let epoch = 0
  let stage: InviteResumeStage = 'empty'
  let principal: string | undefined
  let lastVerifiedAt: number | undefined
  let consuming = false

  function invalidate(next: InviteResumeStage = 'discarded'): InviteResumeStage {
    epoch++
    principal = undefined
    lastVerifiedAt = undefined
    consuming = false
    handoff.clear()
    stage = next
    return stage
  }
  function current(): InviteResumeStage {
    if (stage === 'consumed' || stage === 'discarded' || stage === 'empty')
      return stage
    const handoffStage = handoff.state()
    if (handoffStage === 'expired') return invalidate('expired')
    if (handoffStage !== 'ready') return invalidate('discarded')
    return stage
  }
  function capture(
    location: InviteLocation,
    replaceUrl: (url: string) => void
  ): InviteResumeStage {
    invalidate('empty')
    const result = handoff.capture(location, replaceUrl)
    if (result === 'ready') stage = 'awaiting-login'
    else if (result === 'rejected') stage = 'discarded'
    return stage
  }
  function isVerifiedUser(user: Identity | null): user is Identity {
    return user !== null && user.confirmed === true &&
      typeof user.id === 'string' && uuid.test(user.id) &&
      user.id === user.id.toLowerCase()
  }
  async function verifySession(): Promise<InviteResumeStage> {
    if (!['awaiting-login', 'checking', 'ready'].includes(current()))
      return current()
    const check = ++epoch
    stage = 'checking'
    let user: Identity | null
    try {
      user = await gateway.getUser()
    } catch {
      // Offline/timeout/expired Auth must fail closed, including in-flight.
      if (epoch === check) return invalidate()
      return current()
    }
    if (epoch !== check) return current()
    if (handoff.state() !== 'ready') return invalidate('expired')
    if (!user) {
      // First sign-in can still happen; a known account disappearing cannot.
      if (principal) return invalidate()
      stage = 'awaiting-login'
      return stage
    }
    if (!isVerifiedUser(user)) return invalidate()
    if (principal && principal !== user.id) return invalidate()
    principal = user.id
    lastVerifiedAt = now()
    stage = 'ready'
    return stage
  }
  /**
   * Auth listener may call this synchronously on sign-out or sign-in.
   * Any account switch (SIGNED_IN after already confirmed) drops the invite.
   * Refreshes/recovery are never sufficient to trust a cached identity:
   * require a new explicit getUser check.
   */
  function onAuthEvent(event: string): InviteResumeStage {
    if (!['awaiting-login', 'checking', 'ready'].includes(current()))
      return current()
    if (event === 'SIGNED_IN') {
      if (principal) return invalidate() // cannot reuse for another account
      epoch++
      stage = 'awaiting-login'
      return stage
    }
    if (authTransitions.has(event)) {
      epoch++ // invalidate any in-flight verification
      stage = 'awaiting-login'
      return stage
    }
    if (authDenied.has(event)) return invalidate()
    return invalidate() // unknown Auth events never authorize
  }

  /**
   * Only safe for an explicitly approved future consumer. Performs a NEW
   * trusted Auth.getUser check before handing token to caller, and hands it
   * off once. No HTTP request is made here.
   */
  async function consumeAfterRecheck(): Promise<string | null> {
    if (current() !== 'ready' || !principal || consuming) return null
    consuming = true
    const check = ++epoch
    stage = 'checking'
    let user: Identity | null
    try {
      user = await gateway.getUser()
    } catch {
      if (epoch === check) invalidate()
      return null
    }
    if (epoch !== check) return null
    if (handoff.state() !== 'ready') {
      invalidate('expired')
      return null
    }
    if (!isVerifiedUser(user) || user.id !== principal ||
        lastVerifiedAt === undefined) {
      invalidate()
      return null
    }
    const token = handoff.consumeOnce()
    principal = undefined
    lastVerifiedAt = undefined
    consuming = false
    stage = token ? 'consumed' : 'expired'
    return token
  }

  /** Explicit logout, navigation, pagehide, change of browser context. */
  function onLeave(): InviteResumeStage { return invalidate() }

  // Safe to render/record: no token, digest, identity, email or Auth JWT.
  function snapshot(): Readonly<{ stage: InviteResumeStage }> {
    return Object.freeze({ stage: current() })
  }
  return Object.freeze({
    capture, verifySession, onAuthEvent, consumeAfterRecheck, onLeave, snapshot
  })
}
