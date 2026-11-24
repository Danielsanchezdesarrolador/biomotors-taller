import type { SupabaseClient } from '@supabase/supabase-js'
import { recordChanged } from '../official/recordChanges'
import type { Context } from '../auth/controller'
import { recordId, RecordsFailure, resources, type Resource, type Action, type Inspection, type RecordRow, type AuditEvent, type Receipt, type RecordsPort } from './contracts'
const allowedActions = ['delete', 'archive', 'restore', 'cancel', 'void']
/** Publishable SDK + session JWT only. Authorization, locks and dependencies live in PostgreSQL. */
export function recordsRepository(client: SupabaseClient, context: Context): RecordsPort {
  const wid = recordId(context.workshop.id), uid = recordId(context.userId)
  let disposed = false
  function valid() {if (disposed || !['owner', 'admin'].includes(context.role)) throw new RecordsFailure('denied')}
  async function rpc(name: string, args: Record<string, unknown>) {
    valid()
    const user = await client.auth.getUser()
    valid()
    if (user.error || user.data.user?.id !== uid || !user.data.user.email_confirmed_at) throw new RecordsFailure('denied')
    const result = await client.rpc(name, {p_workshop_id: wid, ...args})
    valid()
    if (result.error) {
      // Only fixed error classes reach React; never surface SQL details, PII or JWT.
      const code = result.error.code
      throw new RecordsFailure(code === '42501' || code === 'PGRST301' ? 'denied'
        : code === '55000' ? 'disabled' : code === '40001' ? 'conflict'
          : code === '23503' ? 'dependencies' : ['22023','22P02','23514'].includes(code) ? 'invalid' : 'unavailable')
    }
    return result.data
  }
  function resource(value: Resource) {if (!resources.includes(value)) throw new RecordsFailure('invalid'); return value}
  function unavailable(): never {throw new RecordsFailure('unavailable')}
  return {
    async list(kind, archived, query, after) {
      if (query.length > 80) throw new RecordsFailure('invalid')
      const rows = await rpc('bt_records_list', {p_resource: resource(kind), p_archived: archived, p_query: query.trim(), p_after_id: after ? recordId(after) : null})
      if (!Array.isArray(rows) || rows.length > 51) return unavailable()
      return rows.map((row: RecordRow) => {
        if (!row || !recordId(row.id) || typeof row.label !== 'string' || typeof row.token !== 'string' || typeof row.state !== 'string') return unavailable()
        return row
      })
    },
    async inspect(kind, id) {
      const row = await rpc('bt_records_inspect', {p_resource: resource(kind), p_id: recordId(id)}) as Inspection
      if (!row || row.id !== id || row.resource !== kind || typeof row.token !== 'string' || !Array.isArray(row.actions) ||
        row.actions.some(a => !allowedActions.includes(a)) || !Number.isSafeInteger(row.dependencies) || row.dependencies < 0 ||
        !Number.isSafeInteger(row.draft_items) || row.draft_items < 0 || typeof row.inherited_archive !== 'boolean') return unavailable()
      return row
    },
    async execute(inspection, action: Action, request, reason) {
      if (!inspection.actions.includes(action) || reason.trim().length < 3 || reason.trim().length > 500) throw new RecordsFailure('invalid')
      const receipt = await rpc('bt_records_execute', {p_resource: resource(inspection.resource), p_id: recordId(inspection.id),
        p_action: action, p_token: inspection.token, p_request_id: recordId(request), p_reason: reason.trim()}) as Receipt
      if (!receipt || receipt.id !== inspection.id || receipt.resource !== inspection.resource || receipt.action !== action || receipt.request_id !== request) return unavailable()
      recordChanged({workshopId: wid, ...receipt})
      return receipt
    },
    async audit(kind, id) {
      const events = await rpc('bt_records_audit', {p_resource: resource(kind), p_id: id ? recordId(id) : null}) as AuditEvent[]
      if (!Array.isArray(events) || events.some(e => !Number.isSafeInteger(e.sequence) || typeof e.action !== 'string' ||
        typeof e.resource_id !== 'string' || typeof e.created_at !== 'string' || typeof e.actor_id !== 'string' || (e.reason !== null && typeof e.reason !== 'string'))) return unavailable()
      return events
    },
    dispose() {disposed = true}
  }
}
