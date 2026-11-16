/** Backend candidate only. Caller supplies an authenticated SDK and a trusted SDK.
 * No SDK construction, endpoint, secret lookup, bucket creation or deployed worker.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { quoteId, type Revision } from '../../src/cp05/contracts'
import { quotePdf } from '../../src/cp05/pdf'
import { privateArchiveCandidate } from './archiveCandidate'
import type { IssuePorts, Reservation } from './issuanceCandidate'
export function issuancePortsCandidate(
  userClient: SupabaseClient,
  trustedClient: SupabaseClient,
  workshopId: string,
  assets: { font: Uint8Array; logo: Uint8Array },
  policy: { archiveApproved: boolean }
): IssuePorts {
  const wid = quoteId(workshopId),
    archive = privateArchiveCandidate(trustedClient, { approved: policy.archiveApproved })
  const gate = () => {
    if (!policy.archiveApproved) throw Error('ARCHIVE_NOT_AUTHORIZED')
  }
  async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    gate()
    const result = await trustedClient.rpc(name, { p_workshop_id: wid, ...args })
    if (result.error || !result.data) throw Error('ISSUE_NOT_CONFIRMED')
    return result.data as T
  }
  return {
    async verifyUser() {
      gate()
      const result = await userClient.auth.getUser()
      if (result.error || !result.data.user) throw Error('VERIFIED_USER_REQUIRED')
      return { id: result.data.user.id, confirmed: !!result.data.user.email_confirmed_at }
    },
    async reserve(actorId, quoteId, version, requestId) {
      gate()
      const visible = await userClient
        .from('quotes')
        .select('id')
        .eq('workshop_id', wid)
        .eq('id', quoteId)
        .maybeSingle()
      if (visible.error || visible.data?.id !== quoteId) throw Error('QUOTE_NOT_AUTHORIZED')
      const reservation = await rpc<Reservation>('bt_cp05_prepare_issue', {
        p_quote_id: quoteId,
        p_expected_version: version,
        p_request_id: requestId,
        p_actor_id: actorId
      })
      if (reservation.payload.quote.workshop_id !== wid) throw Error('INVALID_TENANT')
      return reservation
    },
    render: (snapshot) => {
      gate()
      return quotePdf(snapshot, assets)
    },
    archive: (path, bytes) => {
      gate()
      return archive.putIfAbsent(path, bytes)
    },
    finish: (actorId, requestId, receipt) =>
      rpc<Revision>('bt_cp05_finish_issue', {
        p_request_id: requestId,
        p_actor_id: actorId,
        p_path: receipt.path,
        p_pdf_sha256: receipt.sha256,
        p_pdf_size: receipt.size
      })
  }
}
/** Restore only a revision visible through caller's RLS; never accept a browser path. */
export async function restoreRevisionCandidate(
  userClient: SupabaseClient,
  trustedClient: SupabaseClient,
  policy: { approved: boolean },
  workshopId: string,
  revisionId: string
) {
  if (!policy.approved) throw Error('PRIVATE_ARCHIVE_DISABLED')
  const user = await userClient.auth.getUser()
  if (user.error || !user.data.user?.email_confirmed_at) throw Error('VERIFIED_USER_REQUIRED')
  const wid = quoteId(workshopId),
    rid = quoteId(revisionId)
  const r = await userClient
    .from('quote_revisions')
    .select('*')
    .eq('workshop_id', wid)
    .eq('id', rid)
    .maybeSingle()
  if (r.error || !r.data || r.data.workshop_id !== wid || r.data.id !== rid)
    throw Error('REVISION_NOT_AUTHORIZED')
  return privateArchiveCandidate(trustedClient, policy).restore(
    r.data.pdf_object_path,
    r.data.pdf_sha256
  )
}
