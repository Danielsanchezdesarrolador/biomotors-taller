/** Undeployed HTTP boundary. No credentials, endpoint registration or environment activation. */
import type { SupabaseClient } from '@supabase/supabase-js'
import { quoteId, type Revision } from '../../src/cp05/contracts'
import { issueQuoteCandidate } from './issuanceCandidate'
import { issuancePortsCandidate, restoreRevisionCandidate } from './supabasePortsCandidate'
import { deliverQuoteCandidate } from './deliveryCandidate'
import { deliveryPortsCandidate, type MailProvider } from './mailPortsCandidate'
export type DocumentPolicy = {
  archiveApproved: boolean
  emailApproved: boolean
  allowedOrigin: string
  pilotWorkshopId: string
}
export type DocumentDependencies = {
  userClient: (authorization: string) => SupabaseClient
  trustedClient: () => SupabaseClient
  assets: () => Promise<{ font: Uint8Array; logo: Uint8Array }>
  provider: () => MailProvider
}
export function documentHandlerCandidate(policy: DocumentPolicy, deps: DocumentDependencies) {
  return async (request: Request): Promise<Response> => {
    const origin = request.headers.get('origin')
    const headers = {
      'Cache-Control': 'no-store',
      Vary: 'Origin',
      ...(origin === policy.allowedOrigin ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Headers': 'authorization,apikey,content-type,x-client-info',
      'Access-Control-Allow-Methods': 'POST,OPTIONS'
    }
    const reply = (body: unknown, status = 200) => Response.json(body, { status, headers })
    if (origin && origin !== policy.allowedOrigin) return reply({ error: 'ORIGIN_DENIED' }, 403)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers })
    if (request.method !== 'POST') return reply({ error: 'METHOD_NOT_ALLOWED' }, 405)
    try {
      if (Number(request.headers.get('content-length') || 0) > 16384)
        return reply({ error: 'INVALID_REQUEST' }, 400)
      if (!/^application\/json(?:;|$)/i.test(request.headers.get('content-type') || ''))
        return reply({ error: 'INVALID_REQUEST' }, 400)
      const reader = request.body?.getReader()
      let text = '',
        size = 0
      const decoder = new TextDecoder()
      if (!reader) return reply({ error: 'INVALID_REQUEST' }, 400)
      for (;;) {
        const part = await reader.read()
        if (part.done) break
        size += part.value.byteLength
        if (size > 16384) {
          await reader.cancel()
          return reply({ error: 'INVALID_REQUEST' }, 400)
        }
        text += decoder.decode(part.value, { stream: true })
      }
      text += decoder.decode()
      const body = JSON.parse(text) as Record<string, unknown>,
        action = body.action
      if (!['issue', 'download', 'cancel', 'send'].includes(String(action)))
        return reply({ error: 'INVALID_REQUEST' }, 400)
      if (!policy.archiveApproved || (action === 'send' && !policy.emailApproved))
        return reply({ error: 'SERVICE_DISABLED' }, 503)
      // Pilot allowlist is server-owned. An unset or mismatched workshop fails closed.
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(policy.pilotWorkshopId) ||
          body.workshopId !== policy.pilotWorkshopId)
        return reply({ error: 'SERVICE_DISABLED' }, 503)
      const authorization = request.headers.get('authorization') || ''
      if (!/^Bearer [^\s]+$/.test(authorization)) return reply({ error: 'SESSION_REQUIRED' }, 401)
      const wid = quoteId(String(body.workshopId || '')),
        userClient = deps.userClient(authorization)
      const user = await userClient.auth.getUser()
      if (user.error || !user.data.user?.email_confirmed_at)
        return reply({ error: 'SESSION_REQUIRED' }, 401)
      const uid = user.data.user.id
      const member = await userClient
        .from('workshop_memberships')
        .select('workshop_id,user_id,status,role')
        .eq('workshop_id', wid)
        .eq('user_id', uid)
        .eq('status', 'active')
        .maybeSingle()
      const workshop = await userClient
        .from('workshops')
        .select('id,status')
        .eq('id', wid)
        .eq('status', 'active')
        .maybeSingle()
      const m = member.data
      if (
        member.error ||
        workshop.error ||
        !m ||
        m.workshop_id !== wid ||
        m.user_id !== uid ||
        m.status !== 'active' ||
        !['owner', 'admin', 'reception', 'mechanic'].includes(m.role) ||
        workshop.data?.id !== wid ||
        workshop.data.status !== 'active' ||
        (action !== 'download' && !['owner', 'admin', 'reception'].includes(m.role))
      )
        return reply({ error: 'ACCESS_DENIED' }, 403)
      const trusted = deps.trustedClient()
      if (action === 'download') {
        const rid = quoteId(String(body.revisionId || ''))
        const pdf = await restoreRevisionCandidate(
          userClient,
          trusted,
          { approved: true },
          wid,
          rid
        )
        return new Response(pdf.slice().buffer, {
          headers: {
            ...headers,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="cotizacion-${rid}.pdf"`
          }
        })
      }
      if (action === 'send') {
        const rid = quoteId(String(body.revisionId || '')),
          attempt = Number(body.attempt)
        const result = await deliverQuoteCandidate(
          { emailApproved: true },
          deliveryPortsCandidate(userClient, trusted, wid, deps.provider(), {
            archiveApproved: true,
            emailApproved: true
          }),
          rid,
          attempt,
          body.review
        )
        return reply({ delivery: result || 'sent' })
      }
      const requestId = quoteId(String(body.requestId || ''))
      if (action === 'cancel') {
        const pending = await trusted.rpc('bt_cp05_issue_status', {
          p_workshop_id: wid,
          p_quote_id: quoteId(String(body.quoteId || '')),
          p_actor_id: uid
        })
        if (pending.error || !pending.data) throw Error('ISSUE_NOT_CONFIRMED')
        const result = await trusted.rpc('bt_cp05_cancel_issue', {
          p_workshop_id: wid,
          p_request_id: pending.data.request_id,
          p_actor_id: uid
        })
        if (result.error) throw Error('ISSUE_NOT_CONFIRMED')
        return reply({ cancelled: true })
      }
      const id = quoteId(String(body.quoteId || '')),
        version = Number(body.version)
      if (!Number.isSafeInteger(version) || version < 1)
        return reply({ error: 'INVALID_REQUEST' }, 400)
      const revision: Revision = await issueQuoteCandidate(
        { archiveApproved: true },
        issuancePortsCandidate(userClient, trusted, wid, deps.assets, {
          archiveApproved: true
        }),
        { id, version },
        requestId
      )
      return reply({ revision })
    } catch (error) {
      // Deliberately sanitized; no SQL, customer details, provider response or token in errors.
      const message = error instanceof Error ? error.message : ''
      if (message === 'DOCUMENT_NOT_CURRENT') return reply({ error: 'DOCUMENT_NOT_CURRENT' }, 409)
      if (['ACCESS_DENIED', 'REVISION_NOT_AUTHORIZED', 'QUOTE_NOT_AUTHORIZED'].includes(message))
        return reply({ error: 'ACCESS_DENIED' }, 403)
      if (['VERIFIED_USER_REQUIRED', 'UNVERIFIED_ACTOR'].includes(message))
        return reply({ error: 'SESSION_REQUIRED' }, 401)
      return reply(
        {
          error:
            message === 'PROVIDER_ACK_UNKNOWN'
              ? 'PROVIDER_ACK_UNKNOWN'
              : message === 'DELIVERY_PENDING'
                ? 'DELIVERY_PENDING'
                : 'OPERATION_NOT_CONFIRMED'
        },
        409
      )
    }
  }
}
