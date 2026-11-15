// Shared R2-A input guard: no privileges, sessions, plans or roles in payload.
// This validation helps UX but is NOT backend authorization.
export type MechanicInviteRequest = { workshop_id: string; email: string }
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function parseMechanicInviteRequest(value: unknown): MechanicInviteRequest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const input = value as Record<string, unknown>
  // Deliberately forbid role, plan, member user ID, token, actor UID in payload.
  const keys = Object.keys(input)
  if (keys.length !== 2 || !keys.includes('workshop_id') || !keys.includes('email'))
    return null
  if (typeof input.workshop_id !== 'string' || !uuid.test(input.workshop_id)) return null
  if (typeof input.email !== 'string') return null
  const normalized = input.email.trim().toLowerCase()
  if (normalized.length < 5 || normalized.length > 254 || !email.test(normalized))
    return null
  return { workshop_id: input.workshop_id.toLowerCase(), email: normalized }
}
