/**
 * ByteTorque R2-A6 — purely local AES-256-GCM envelope, NO SMTP/API writes.
 * Store ONLY ciphertext + random nonce in private outbox. The 32-byte key
 * must be held in a secret manager by the trusted future worker, NEVER in
 * frontend builds, SQL or GitHub. Never log plaintext, key, URL or ciphertext.
 */
import { hashMechanicInviteToken } from './mechanicInviteToken.ts'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const hex = /^[0-9a-f]+$/
const toHex = (bytes: Uint8Array) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
function fromHex(value: string, minBytes: number, maxBytes: number): Uint8Array {
  if (!hex.test(value) || value.length % 2 !== 0 ||
      value.length < minBytes * 2 || value.length > maxBytes * 2)
    throw new TypeError('Invalid encrypted envelope')
  const bytes = new Uint8Array(new ArrayBuffer(value.length / 2))
  for (let i = 0; i < bytes.length; i++)
    bytes[i] = Number.parseInt(value.slice(i * 2, i * 2 + 2), 16)
  return bytes
}
export type InvitePayload = {
  workshopId: string
  recipientEmail: string
  token: string
  expiresAt: string
}
export type EncryptedInviteEnvelope = {
  ciphertext_hex: string
  nonce_hex: string
  token_sha256_hex: string
}
function checkPayload(input: InvitePayload, now: number): InvitePayload {
  const workshopId = input.workshopId.toLowerCase()
  const recipientEmail = input.recipientEmail.trim().toLowerCase()
  const expires = Date.parse(input.expiresAt)
  if (!uuid.test(workshopId) || recipientEmail.length < 5 ||
      recipientEmail.length > 254 || !email.test(recipientEmail) ||
      !/^[a-f0-9]{64}$/.test(input.token) ||
      !Number.isFinite(now) || !Number.isFinite(expires) ||
      expires < now + 5 * 60_000 || expires > now + 48 * 60 * 60_000)
    throw new TypeError('Invalid invitation payload')
  return { workshopId, recipientEmail, token: input.token, expiresAt: input.expiresAt }
}
function bindContext(workshopId: string) {
  return new TextEncoder().encode('ByteTorque:R2-A6:' + workshopId.toLowerCase())
}
async function aesKey(raw: Uint8Array) {
  if (raw.byteLength !== 32) throw new TypeError('Invalid invitation encryption key')
  // Copy to standalone ArrayBuffer for cross-runtime WebCrypto TS compatibility.
  const bytes = new Uint8Array(new ArrayBuffer(32))
  bytes.set(raw)
  return crypto.subtle.importKey('raw', bytes.buffer, 'AES-GCM', false, ['encrypt', 'decrypt'])
}
export async function sealInviteEnvelope(
  input: InvitePayload,
  rawKey: Uint8Array,
  nowIso: string
): Promise<EncryptedInviteEnvelope> {
  const normalized = checkPayload(input, Date.parse(nowIso))
  const key = await aesKey(rawKey)
  const iv = new Uint8Array(new ArrayBuffer(12))
  crypto.getRandomValues(iv)
  const encoded = new TextEncoder().encode(JSON.stringify({ version: 1, ...normalized }))
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer, additionalData: bindContext(normalized.workshopId) },
    key,
    encoded
  )
  return {
    ciphertext_hex: toHex(new Uint8Array(cipher)),
    nonce_hex: toHex(iv),
    token_sha256_hex: await hashMechanicInviteToken(normalized.token)
  }
}
export async function openInviteEnvelope(
  envelope: EncryptedInviteEnvelope,
  rawKey: Uint8Array,
  expected: { workshopId: string; recipientEmail: string; expiresAt: string; token_sha256_hex: string },
  nowIso: string
): Promise<InvitePayload> {
  try {
    const key = await aesKey(rawKey)
    const iv = fromHex(envelope.nonce_hex, 12, 12)
    const encrypted = fromHex(envelope.ciphertext_hex, 32, 8192)
    if (!uuid.test(expected.workshopId) || !/^[a-f0-9]{64}$/.test(expected.token_sha256_hex) ||
        envelope.token_sha256_hex !== expected.token_sha256_hex)
      throw new TypeError('Invalid expected context')
    const plain = await crypto.subtle.decrypt({
      name: 'AES-GCM',
      iv: iv.buffer,
      additionalData: bindContext(expected.workshopId)
    }, key, encrypted.buffer)
    const raw: unknown = JSON.parse(new TextDecoder().decode(plain))
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
      throw new TypeError('Invalid payload')
    const p = raw as Record<string, unknown>
    if (p.version !== 1 || typeof p.workshopId !== 'string' ||
        typeof p.recipientEmail !== 'string' || typeof p.token !== 'string' ||
        typeof p.expiresAt !== 'string')
      throw new TypeError('Invalid payload')
    const valid = checkPayload({
      workshopId: p.workshopId, recipientEmail: p.recipientEmail,
      token: p.token, expiresAt: p.expiresAt
    }, Date.parse(nowIso))
    if (valid.workshopId !== expected.workshopId.toLowerCase() ||
        valid.recipientEmail !== expected.recipientEmail.trim().toLowerCase() ||
        valid.expiresAt !== expected.expiresAt ||
        (await hashMechanicInviteToken(valid.token)) !== expected.token_sha256_hex)
      throw new TypeError('Context mismatch')
    return valid
  } catch {
    // Prevent leaking which field was wrong, decryption errors or secrets.
    throw new Error('Invitation delivery envelope could not be verified')
  }
}
