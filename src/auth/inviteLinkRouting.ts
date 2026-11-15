/**
 * BT-AUTH-R2-A5 — invite deep-link redaction for the non-operational preview.
 * Current product decision: discard ALL invitation fragments before rendering.
 * The operational flow will require a separately audited, memory-only token
 * consumer. This module never retains, transmits, logs or decodes the token.
 */
export const inviteAcceptancePath = '/auth/aceptar-invitacion'
const inviteHashPattern = /^#\/auth\/aceptar-invitacion(?:\?|$)/
const invitePathPattern = /^\/auth\/aceptar-invitacion(?:$|\/)/
export type InviteLocation = {
  readonly pathname: string
  readonly search: string
  readonly hash: string
}
export function sanitizedInviteLink(location: InviteLocation):
  { route: typeof inviteAcceptancePath; replacement: string } | null {
  if (!inviteHashPattern.test(location.hash) &&
      !invitePathPattern.test(location.pathname)) return null
  // In non-operational preview mode ALL query strings are removed, even if
  // they belong to the outer document. No token enters React state/Storage.
  return {
    route: inviteAcceptancePath,
    replacement: '/#' + inviteAcceptancePath
  }
}
export function scrubInviteLocation(location: InviteLocation, replaceUrl: (url: string) => void):
  typeof inviteAcceptancePath | null {
  const clean = sanitizedInviteLink(location)
  if (!clean) return null
  if (location.pathname + location.search + location.hash !== clean.replacement)
    replaceUrl(clean.replacement)
  return clean.route
}
