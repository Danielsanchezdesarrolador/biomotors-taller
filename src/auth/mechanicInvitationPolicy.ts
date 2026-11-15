/**
 * ByteTorque BT-AUTH-R2 — pure policy for planning mechanic invitations.
 *
 * NOT an authorization boundary. The eventual backend must resolve actor,
 * membership, plan and counts from the database inside a single transaction,
 * lock the relevant workshop/quota, and enforce isolation with RLS.
 * No API calls, email sending, persistence or public registration here.
 */
export type WorkshopRole = 'owner' | 'admin' | 'mechanic' | 'reception'
export type WorkshopPlan = 'basic' | 'plus' | 'full'
export type WorkshopMember = {
  workshopId: string
  role: WorkshopRole
  status: 'active' | 'disabled'
}
export type WorkshopInvitation = {
  workshopId: string
  role: WorkshopRole
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  expiresAt: string
}
export type MechanicSeatInput = {
  workshopId: string
  actor: WorkshopMember
  targetRole: WorkshopRole
  plan: WorkshopPlan
  memberships: readonly WorkshopMember[]
  invitations: readonly WorkshopInvitation[]
  nowIso: string
}
export type MechanicSeatResult = {
  allowed: boolean
  limit: number
  occupied: number
  reason: 'available' | 'invalid-context' | 'forbidden' | 'role-not-allowed' | 'quota-full'
}
export const mechanicSeatLimits: Readonly<Record<WorkshopPlan, number>> = Object.freeze({
  basic: 2,
  plus: 8,
  full: 8
})
export function evaluateMechanicSeat(input: MechanicSeatInput): MechanicSeatResult {
  const { workshopId, actor, targetRole, plan, memberships, invitations, nowIso } = input
  const limit = mechanicSeatLimits[plan]
  const now = Date.parse(nowIso)
  // Fail closed on invalid context; do not infer privileges from UI selectors.
  if (!workshopId || !actor || !Number.isFinite(now) || !Number.isInteger(limit)) {
    return { allowed: false, limit: 0, occupied: 0, reason: 'invalid-context' }
  }
  const occupied =
    memberships.filter(
      (m) => m.workshopId === workshopId && m.role === 'mechanic' && m.status === 'active'
    ).length +
    invitations.filter((inv) => {
      if (inv.workshopId !== workshopId || inv.role !== 'mechanic' || inv.status !== 'pending')
        return false
      const expires = Date.parse(inv.expiresAt)
      // Invalid expirations require explicit server review, not a free seat.
      return !Number.isFinite(expires) || expires > now
    }).length
  if (actor.workshopId !== workshopId || actor.status !== 'active' ||
      (actor.role !== 'owner' && actor.role !== 'admin'))
    return { allowed: false, limit, occupied, reason: 'forbidden' }
  if (targetRole !== 'mechanic')
    return { allowed: false, limit, occupied, reason: 'role-not-allowed' }
  if (occupied >= limit)
    return { allowed: false, limit, occupied, reason: 'quota-full' }
  return { allowed: true, limit, occupied, reason: 'available' }
}
