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
  assets: { font: Uint8Array; logo: Uint8Array } | (()=>Promise<{font:Uint8Array;logo:Uint8Array}>),
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
    if (result.error?.code === '42501') throw Error('ACCESS_DENIED')
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
      // A completed retry must recover the original immutable file, even if
      // renderer code or optional template assets have since changed.
      const completed=await trustedClient.rpc('bt_cp05_completed_issue',{
        p_workshop_id:wid,p_quote_id:quoteId,p_expected_version:version,p_actor_id:actorId
      })
      if(completed.error)throw Error('ISSUE_NOT_CONFIRMED')
      if(completed.data){
        const reservation=completed.data as Reservation
        if(reservation.completed?.workshop_id!==wid||reservation.completed.quote_id!==quoteId)
          throw Error('INVALID_TENANT')
        await restoreRevisionCandidate(userClient,trustedClient,{approved:true},wid,reservation.completed.id)
        return reservation
      }
      const recovery = await trustedClient.rpc('bt_cp05_issue_status', {
        p_workshop_id: wid,
        p_quote_id: quoteId,
        p_actor_id: actorId
      })
      if (recovery.error || (recovery.data && recovery.data.expected_version !== version))
        throw Error('ISSUE_NOT_CONFIRMED')
      const reservation = await rpc<Reservation>('bt_cp05_prepare_issue', {
        p_quote_id: quoteId,
        p_expected_version: version,
        p_request_id: recovery.data?.request_id || requestId,
        p_actor_id: actorId
      })
      if (reservation.payload.quote.workshop_id !== wid) throw Error('INVALID_TENANT')
      return reservation
    },
    render: async (snapshot) => {
      gate()
      let workshopLogo: Uint8Array | undefined
      const path = snapshot.workshop.logoPath
      if (path) {
        if (snapshot.workshop.id !== wid || !new RegExp('^'+wid+'/[a-f0-9-]{36}\\.png$').test(path)) throw Error('INVALID_BRANDING_PATH')
        const result = await userClient.storage.from('bt-workshop-branding').download(path)
        if (result.error || !result.data || result.data.size>2097152) throw Error('PRIVATE_BRANDING_UNAVAILABLE')
        workshopLogo = new Uint8Array(await result.data.arrayBuffer())
        if (workshopLogo.length<33 || ![137,80,78,71,13,10,26,10].every((b,i)=>workshopLogo![i]===b) ||
            String.fromCharCode(...workshopLogo.slice(12,16))!=='IHDR') throw Error('INVALID_PRIVATE_PNG')
        const header=new DataView(workshopLogo.buffer,workshopLogo.byteOffset,workshopLogo.byteLength)
        if (![header.getUint32(16),header.getUint32(20)].every(n=>n>=1&&n<=1024)) throw Error('PRIVATE_PNG_DIMENSIONS')
      }
      let templatePdf: Uint8Array | undefined
      const templatePath = snapshot.workshop.templatePath
      if (templatePath) {
        const prefix = wid + '/'
        const filename = templatePath.slice(prefix.length)
        if (!templatePath.startsWith(prefix) ||
            !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/.test(filename))
          throw Error('INVALID_PRIVATE_TEMPLATE_PATH')
        const selected = await userClient.rpc('bt_plan04_pdf_template_status',
          { p_workshop_id: wid })
        if (selected.error || !selected.data || selected.data.eligible !== true ||
            !['plus','full'].includes(selected.data.plan) ||
            selected.data.templatePath !== templatePath ||
            selected.data.workshopId !== wid) throw Error('TEMPLATE_NOT_AUTHORIZED')
        const downloaded = await userClient.storage
          .from('bt-workshop-quote-templates').download(templatePath)
        if (downloaded.error || !downloaded.data ||
            downloaded.data.size > 4194304) throw Error('PRIVATE_TEMPLATE_UNAVAILABLE')
        templatePdf = new Uint8Array(await downloaded.data.arrayBuffer())
        if (![37,80,68,70,45].every((n,i)=>templatePdf![i]===n))
          throw Error('INVALID_PRIVATE_TEMPLATE')
      }
      return quotePdf(snapshot, {...(typeof assets==='function'?await assets():assets),workshopLogo,templatePdf})
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
  const expected = `${wid}/quotes/${quoteId(r.data.quote_id)}/r${r.data.revision}/${r.data.payload_sha256}.pdf`
  if (r.data.pdf_object_path !== expected) throw Error('ARCHIVE_PATH_MISMATCH')
  return privateArchiveCandidate(trustedClient, policy).restore(
    r.data.pdf_object_path,
    r.data.pdf_sha256,
    r.data.pdf_size
  )
}
