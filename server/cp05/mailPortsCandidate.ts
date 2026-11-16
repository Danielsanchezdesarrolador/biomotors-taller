/** Backend-only attachment/provider adapter; no provider instance is activated here. */
import type { SupabaseClient } from '@supabase/supabase-js'
import { quoteId, type Revision } from '../../src/cp05/contracts'
import { restoreRevisionCandidate } from './supabasePortsCandidate'
import type { DeliveryPorts } from './deliveryCandidate'
export type Mail = {
  recipient: string
  customerName: string
  subject: string
  text: string
  filename: string
  pdf: Uint8Array
  idempotencyKey: string
}
export type MailProvider = {
  send: (mail: Mail) => Promise<{
    confirmed: boolean
    providerId?: string
    definitiveFailure?: boolean
    errorCode?: string
  }>
}
export function deliveryPortsCandidate(
  userClient: SupabaseClient,
  trusted: SupabaseClient,
  workshopId: string,
  provider: MailProvider,
  policy: { archiveApproved: boolean; emailApproved: boolean }
): DeliveryPorts {
  const wid = quoteId(workshopId),
    attachments = new Map<string, Uint8Array>()
  const gate = () => {
    if (!policy.emailApproved || !policy.archiveApproved) throw Error('EMAIL_DISABLED')
  }
  async function ledger(
    revisionId: string,
    attempt: number,
    status: string,
    providerId: string | null,
    errorCode: string | null
  ) {
    gate()
    const result = await trusted.rpc('bt_cp05_record_delivery', {
      p_workshop_id: wid,
      p_revision_id: revisionId,
      p_attempt: attempt,
      p_status: status,
      p_provider_id: providerId,
      p_error_code: errorCode
    })
    if (result.error) throw Error('DELIVERY_NOT_CONFIRMED')
  }
  async function verifyActor() {
    const user = await userClient.auth.getUser()
    if (user.error || !user.data.user?.email_confirmed_at) throw Error('VERIFIED_USER_REQUIRED')
    const m = await userClient
      .from('workshop_memberships')
      .select('workshop_id,user_id,role,status')
      .eq('workshop_id', wid)
      .eq('user_id', user.data.user.id)
      .eq('status', 'active')
      .maybeSingle()
    const w = await userClient
      .from('workshops')
      .select('id,status')
      .eq('id', wid)
      .eq('status', 'active')
      .maybeSingle()
    if (
      m.error ||
      w.error ||
      m.data?.workshop_id !== wid ||
      m.data.user_id !== user.data.user.id ||
      m.data.status !== 'active' ||
      !['owner', 'admin', 'reception'].includes(m.data.role) ||
      w.data?.id !== wid ||
      w.data.status !== 'active'
    )
      throw Error('ACCESS_DENIED')
  }
  return {
    async authorize(revisionId) {
      gate()
      await verifyActor()
      const r = await userClient
        .from('quote_revisions')
        .select('*')
        .eq('workshop_id', wid)
        .eq('id', quoteId(revisionId))
        .maybeSingle()
      if (r.error || r.data?.workshop_id !== wid || r.data.id !== revisionId)
        throw Error('REVISION_NOT_AUTHORIZED')
      const quote = await userClient
        .from('quotes')
        .select('id,workshop_id,status,issued_revision')
        .eq('workshop_id', wid)
        .eq('id', r.data.quote_id)
        .maybeSingle()
      if (
        quote.error ||
        !quote.data ||
        quote.data.id !== r.data.quote_id ||
        quote.data.workshop_id !== wid ||
        quote.data.status === 'voided' ||
        quote.data.issued_revision !== r.data.revision
      )
        throw Error('DOCUMENT_NOT_CURRENT')
      const pdf = await restoreRevisionCandidate(
        userClient,
        trusted,
        { approved: true },
        wid,
        revisionId
      )
      if (new TextDecoder().decode(pdf.slice(0, 5)) !== '%PDF-')
        throw Error('PDF_ATTACHMENT_REQUIRED')
      attachments.set(revisionId, pdf)
      return r.data as Revision
    },
    async queue(revisionId, attempt) {
      gate()
      const previous = await userClient
        .from('quote_delivery_events')
        .select('attempt,status')
        .eq('workshop_id', wid)
        .eq('revision_id', revisionId)
        .order('attempt', { ascending: false })
        .limit(1000)
      if (previous.error) throw Error('DELIVERY_NOT_CONFIRMED')
      if (previous.data?.some((r) => r.status === 'sent')) return 'already_sent'
      if (
        previous.data?.some(
          (r) =>
            r.status === 'queued' &&
            !previous.data.some(
              (end) => end.attempt === r.attempt && ['sent', 'failed'].includes(end.status)
            )
        )
      )
        throw Error('DELIVERY_PENDING')
      await ledger(revisionId, attempt, 'queued', null, null)
    },
    async send({ recipient, revision, idempotencyKey }) {
      gate()
      await verifyActor()
      if (revision.workshop_id !== wid || recipient !== revision.payload.customer.email)
        throw Error('AUTHORIZED_RECIPIENT_REQUIRED')
      const pdf = attachments.get(revision.id)
      if (!pdf) throw Error('PDF_ATTACHMENT_REQUIRED')
      return provider.send({
        recipient,
        customerName: revision.payload.customer.full_name,
        subject: `Cotización COT-${String(revision.payload.quote.number).padStart(6, '0')} · revisión ${revision.revision}`,
        text: `${revision.payload.customer.full_name}: adjuntamos la cotización de ${revision.payload.workshop.name} para su vehículo ${revision.payload.vehicle.plate || revision.payload.vehicle.model}. El documento no constituye aceptación del cliente ni acredita ejecución de trabajos.`,
        filename: `cotizacion-${revision.quote_id}-r${revision.revision}.pdf`,
        pdf,
        idempotencyKey
      })
    },
    record: (revisionId, attempt, status, providerId, errorCode) =>
      ledger(revisionId, attempt, status, providerId, errorCode)
  }
}
