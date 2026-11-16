/** Optional provider candidate. No signup, DNS, key lookup or real request at module load. */
import { Buffer } from 'node:buffer'
import type { MailProvider } from './mailPortsCandidate'
export function resendProviderCandidate(
  config: { approved: boolean; from: string; apiKey: string },
  request: typeof fetch = fetch
): MailProvider {
  return {
    async send(mail) {
      if (!config.approved) throw Error('EMAIL_DISABLED')
      if (!config.apiKey || !/^.+@[^\s@]+\.[^\s@]+$/.test(config.from))
        throw Error('PROVIDER_NOT_CONFIGURED')
      if (new TextDecoder().decode(mail.pdf.slice(0, 5)) !== '%PDF-')
        throw Error('PDF_ATTACHMENT_REQUIRED')
      let response: Response
      try {
        response = await request('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
            'Idempotency-Key': mail.idempotencyKey
          },
          body: JSON.stringify({
            from: config.from,
            to: [mail.recipient],
            subject: mail.subject,
            text: mail.text,
            attachments: [
              { filename: mail.filename, content: Buffer.from(mail.pdf).toString('base64') }
            ]
          })
        })
      } catch {
        return { confirmed: false }
      }
      if (response.status >= 500 || [408, 409, 429].includes(response.status))
        return { confirmed: false }
      if (!response.ok)
        return { confirmed: false, definitiveFailure: true, errorCode: 'PROVIDER_REJECTED' }
      const body = (await response.json().catch(() => null)) as { id?: unknown } | null
      return typeof body?.id === 'string' && body.id.length > 0 && body.id.length <= 200
        ? { confirmed: true, providerId: body.id }
        : { confirmed: false }
    }
  }
}
