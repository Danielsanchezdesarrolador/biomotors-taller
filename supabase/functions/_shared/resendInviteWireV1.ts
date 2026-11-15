/**
 * R2-A6-P3 — immutable Resend wire format V1, NO HTTP/credentials.
 *
 * Keep field order and serialization stable for the lifetime of pending
 * outbox messages. A format revision MUST get a NEW versioned serializer.
 * Changing this function causes existing encrypted V3 snapshots to FAIL
 * CLOSED instead of sending a different body with the same idempotency key.
 */
export type ResendInviteWireFields = Readonly<{
  from: string
  to: string
  subject: string
  text: string
  html: string
}>

/** Includes NO optional headers, CC/BCC, metadata or mutable provider fields. */
export function serializeResendInviteWireV1(input: ResendInviteWireFields): string {
  return JSON.stringify({
    from: input.from,
    to: [input.to],
    subject: input.subject,
    text: input.text,
    html: input.html
  })
}
export function wireMatchesResendInviteV1(
  input: ResendInviteWireFields, snapshot: unknown
): snapshot is string {
  return typeof snapshot === 'string' &&
    snapshot === serializeResendInviteWireV1(input)
}
