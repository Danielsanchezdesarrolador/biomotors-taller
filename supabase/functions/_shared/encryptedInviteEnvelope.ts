/**
 * ByteTorque R2-A6 — purely local AES-256-GCM envelope, NO SMTP/API writes.
 * Store ONLY ciphertext + random nonce in private outbox. The 32-byte key
 * must be held in a secret manager by the trusted future worker, NEVER in
 * frontend builds, SQL or GitHub. Never log plaintext, key, URL or ciphertext.
 */
import { hashMechanicInviteToken } from './mechanicInviteToken.ts'
import { renderMechanicInviteEmail } from './mechanicInviteEmail.ts'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
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
      iv: iv.buffer as ArrayBuffer,
      additionalData: bindContext(expected.workshopId)
    }, key, encrypted.buffer as ArrayBuffer)
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

/**
 * R2-A6-P2: freeze the complete email BEFORE enqueue; NEVER re-render on retry.
 * Version 1 is retained for historical preview tests, NOT accepted by the worker.
 * All sender, recipient, subject, HTML, text and token bytes are encrypted.
 */
export type ImmutableInviteInput = InvitePayload & Readonly<{
  workshopName: string
  fromEmail: string
}>
export type ImmutableInviteMail = Readonly<{
  from: string
  to: string
  subject: string
  text: string
  html: string
}>
const strictSender = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/
const mailControls = /[\r\n\x00-\x1f\x7f]/
function validSender(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 &&
    strictSender.test(value) && !mailControls.test(value) &&
    value === value.trim() && value === value.toLowerCase()
}

/** Trusted creator obtains workshopName and authorized sender SERVER-SIDE. */
export async function sealImmutableInviteEnvelope(
  input: ImmutableInviteInput, rawKey: Uint8Array, nowIso: string
): Promise<EncryptedInviteEnvelope> {
  const p = checkPayload(input, Date.parse(nowIso))
  if (!validSender(input.fromEmail))
    throw new TypeError('Invalid authorized sender')
  const letter = renderMechanicInviteEmail({
    workshopName: input.workshopName, token: p.token,
    expiresAt: p.expiresAt, nowIso
  })
  const body = JSON.stringify({
    version: 2, workshopId: p.workshopId, recipientEmail: p.recipientEmail,
    expiresAt: p.expiresAt, token: p.token, from: input.fromEmail,
    to: p.recipientEmail, subject: letter.subject, text: letter.text, html: letter.html
  })
  const encoded = new TextEncoder().encode(body)
  // Existing SQL column CHECK: ciphertext max 8192 bytes incl. 16-byte tag.
  if (encoded.byteLength > 8176) throw new TypeError('Invitation exceeds outbox limit')
  const key = await aesKey(rawKey)
  const iv = new Uint8Array(new ArrayBuffer(12))
  crypto.getRandomValues(iv)
  const cipher = await crypto.subtle.encrypt({
    name: 'AES-GCM', iv: iv.buffer,
    additionalData: bindContext(p.workshopId)
  }, key, encoded)
  return {
    ciphertext_hex: toHex(new Uint8Array(cipher)),
    nonce_hex: toHex(iv),
    token_sha256_hex: await hashMechanicInviteToken(p.token)
  }
}

/** Returned text/html contain secret link: never log or persist in plaintext. */
export async function openImmutableInviteEnvelope(
  envelope: EncryptedInviteEnvelope, rawKey: Uint8Array,
  expected: { workshopId: string; recipientEmail: string; expiresAt: string; token_sha256_hex: string },
  nowIso: string
): Promise<ImmutableInviteMail> {
  try {
    const key = await aesKey(rawKey)
    const iv = fromHex(envelope.nonce_hex, 12, 12)
    const ciphertext = fromHex(envelope.ciphertext_hex, 32, 8192)
    if (!uuid.test(expected.workshopId) ||
        !/^[a-f0-9]{64}$/.test(expected.token_sha256_hex) ||
        envelope.token_sha256_hex !== expected.token_sha256_hex)
      throw new TypeError('Invalid context')
    const plain = await crypto.subtle.decrypt({
      name: 'AES-GCM', iv: iv.buffer as ArrayBuffer,
      additionalData: bindContext(expected.workshopId)
    }, key, ciphertext.buffer as ArrayBuffer)
    const parsed: unknown = JSON.parse(new TextDecoder().decode(plain))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
      throw new TypeError('Invalid frozen body')
    const p = parsed as Record<string, unknown>
    if (p.version !== 2 || typeof p.workshopId !== 'string' ||
        typeof p.recipientEmail !== 'string' || typeof p.expiresAt !== 'string' ||
        typeof p.token !== 'string' || typeof p.to !== 'string' ||
        !validSender(p.from) || typeof p.subject !== 'string' ||
        typeof p.text !== 'string' || typeof p.html !== 'string')
      throw new TypeError('Invalid frozen fields')
    const verified = checkPayload({
      workshopId: p.workshopId, recipientEmail: p.recipientEmail,
      token: p.token, expiresAt: p.expiresAt
    }, Date.parse(nowIso))
    if (verified.workshopId !== expected.workshopId.toLowerCase() ||
        verified.recipientEmail !== expected.recipientEmail.trim().toLowerCase() ||
        verified.expiresAt !== expected.expiresAt || p.to !== verified.recipientEmail ||
        (await hashMechanicInviteToken(verified.token)) !== expected.token_sha256_hex ||
        p.subject.length < 1 || p.subject.length > 250 || mailControls.test(p.subject) ||
        p.text.length < 1 || p.text.length > 15000 ||
        p.html.length < 1 || p.html.length > 60000)
      throw new TypeError('Frozen context mismatch')
    return { from: p.from, to: p.to, subject: p.subject, text: p.text, html: p.html }
  } catch {
    throw new Error('Immutable invitation envelope could not be verified')
  }
}
