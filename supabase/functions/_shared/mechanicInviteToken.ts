// ByteTorque BT-AUTH-R2-A2 — SERVER-SIDE draft, not deployed.
// A 256-bit random invitation token is delivered only by a trusted backend.
// Store only its SHA-256 digest in the private database; never log either.
// Caller must not persist token in localStorage/URLs before a reviewed flow.
const tokenHex = /^[a-f0-9]{64}$/
const toHex = (bytes: Uint8Array) => Array.from(bytes, (byte) =>
  byte.toString(16).padStart(2, '0')).join('')

export type AcceptMechanicInviteRequest = { token: string }
export function parseAcceptMechanicInviteRequest(input: unknown):
  AcceptMechanicInviteRequest | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const record = input as Record<string, unknown>
  // No email, role, workshop ID, actor ID or plan supplied by the caller.
  if (Object.keys(record).length !== 1 || !Object.hasOwn(record, 'token')) return null
  if (typeof record.token !== 'string' || !tokenHex.test(record.token)) return null
  return { token: record.token }
}
export async function hashMechanicInviteToken(token: string): Promise<string> {
  if (!tokenHex.test(token)) throw new TypeError('Invalid invitation token')
  // WebCrypto receives the original 32 random bytes, NOT the UTF-8 hex text.
  const bytes = new Uint8Array(new ArrayBuffer(32))
  for (let i = 0; i < 32; i++) bytes[i] = Number.parseInt(token.slice(i * 2, i * 2 + 2), 16)
  const hash = await crypto.subtle.digest('SHA-256', bytes.buffer)
  return toHex(new Uint8Array(hash))
}
export async function createMechanicInviteToken():
  Promise<{ token: string; token_sha256_hex: string }> {
  const bytes = new Uint8Array(new ArrayBuffer(32))
  crypto.getRandomValues(bytes)
  const token = toHex(bytes)
  return { token, token_sha256_hex: await hashMechanicInviteToken(token) }
}
