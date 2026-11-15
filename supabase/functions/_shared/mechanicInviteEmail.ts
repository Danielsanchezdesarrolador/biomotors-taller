/**
 * ByteTorque R2-A4 — pure email template, not connected to SMTP or Auth Admin.
 * Never log or persist returned text/html: both contain the one-time secret.
 * The acceptance route is NOT active yet. This is a PREVIEW contract only.
 */
export type MechanicInviteMail = Readonly<{ subject: string; text: string; html: string }>
const publicOrigin = 'https://biomotors-taller-demo.onrender.com'
const inviteRoute = '#/auth/aceptar-invitacion?token='
const hex256 = /^[a-f0-9]{64}$/
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]!)

export function mechanicInviteUrl(token: string): string {
  if (!hex256.test(token)) throw new TypeError('Invalid invite token')
  // The secret stays in the hash fragment, never in a server URL query.
  // No functional acceptance page exists yet: only generate in isolated tests.
  return publicOrigin + '/' + inviteRoute + token
}

export function renderMechanicInviteEmail(
  data: { workshopName: string; token: string; expiresAt: string; nowIso: string }
): MechanicInviteMail {
  const workshopName = data.workshopName.trim()
  if (workshopName.length < 2 || workshopName.length > 120 ||
      /[\r\n\x00-\x1f\x7f]/.test(workshopName))
    throw new TypeError('Invalid workshop name')
  const now = Date.parse(data.nowIso)
  const expires = Date.parse(data.expiresAt)
  if (!Number.isFinite(now) || !Number.isFinite(expires) ||
      expires <= now || expires > now + 48 * 60 * 60 * 1000)
    throw new TypeError('Invalid invitation expiry')
  const link = mechanicInviteUrl(data.token)
  const date = new Intl.DateTimeFormat('es-CL', {
    timeZone: 'America/Santiago', dateStyle: 'medium', timeStyle: 'short'
  }).format(new Date(expires))
  const subject = 'Invitación de mecánico a ByteTorque · ' + workshopName
  const text = [
    'Hola:',
    '',
    'Te invitaron a colaborar como mecánico en el taller ' + workshopName + ' mediante ByteTorque.',
    'Solo podrás acceder al taller que te asignó la invitación.',
    'Para continuar, deberás iniciar sesión y confirmar tu correo electrónico.',
    'Esta invitación es de un solo uso y vence el ' + date + ' (Chile).',
    '',
    'Enlace de invitación: ' + link,
    '',
    'Si no esperabas esta invitación, ignora este mensaje. No compartas el enlace.'
  ].join('\n')
  const html = [
    '<!doctype html><html lang="es"><body>',
    '<h1>Invitación a ByteTorque</h1>',
    '<p>Te invitaron a colaborar como <strong>mecánico</strong> en <strong>',
    escapeHtml(workshopName),
    '</strong>.</p>',
    '<p>La invitación es para un solo taller y debes confirmar tu correo al ingresar.</p>',
    '<p><a href="', escapeHtml(link), '">Revisar invitación</a></p>',
    '<p>Vence el ', escapeHtml(date), ' (Chile). Uso único.</p>',
    '<p>Si no esperabas este mensaje, puedes ignorarlo. No compartas el enlace.</p>',
    '</body></html>'
  ].join('')
  return { subject, text, html }
}
