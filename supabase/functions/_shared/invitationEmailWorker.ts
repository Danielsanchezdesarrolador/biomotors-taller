/**
 * ByteTorque R2-A6-worker — pure coordinator for an isolated/mock worker.
 *
 * NEVER used by a deployed endpoint yet. No Supabase client, env secrets,
 * SMTP, fetch, logging or cron. All effects are injected for testing.
 * The caller must implement DB RPCs with a service-only client on the server.
 * IMPORTANT: a provider accept followed by an ack outage is ambiguous.
 * Retries are safe ONLY if a chosen provider enforces the same idempotency key.
 */
import { dispatchPreparedInvite, type ClaimedInvitationEmail, type DeliveryProvider } from './inviteDeliveryAdapter.ts'

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type LeasedInvitationEmail = ClaimedInvitationEmail & Readonly<{
  invitation_id: string
  lease_id: string
  attempt_number: number
}>
export type TrustedWorkshop = Readonly<{
  id: string
  name: string
  status: 'active' | 'suspended'
}>
export type WorkerDependencies = Readonly<{
  claim: () => Promise<LeasedInvitationEmail | null>
  getWorkshop: (workshopId: string) => Promise<TrustedWorkshop | null>
  // Must verify workshop, unexpired pending invite, matching outbox lease,
  // and safe remaining lease time in a backend-only SQL operation.
  leaseIsCurrent: (job: LeasedInvitationEmail) => Promise<boolean>
  ack: (job: LeasedInvitationEmail, providerMessageId: string) => Promise<boolean>
  fail: (job: LeasedInvitationEmail, terminal: boolean) => Promise<'retry' | 'failed' | 'ignored'>
  provider: DeliveryProvider
  encryptionKey: Uint8Array
  nowIso: () => string
}>
export type WorkerOutcome = Readonly<{
  status: 'idle' | 'provider-accepted' | 'retry' | 'failed' | 'stale' | 'ack-unknown'
}>

export async function processOneInvitationEmail(
  deps: WorkerDependencies
): Promise<WorkerOutcome> {
  // Claim is a committed RPC: its row-level lock does not remain held here.
  // No token or email may enter an error string or telemetry event.
  let job: LeasedInvitationEmail | null
  try { job = await deps.claim() } catch { return { status: 'retry' } }
  if (!job) return { status: 'idle' }

  const rejectClaim = async (terminal: boolean): Promise<WorkerOutcome> => {
    try {
      const state = await deps.fail(job!,terminal)
      if (state === 'ignored') return { status: 'stale' }
      return { status: state === 'failed' ? 'failed' : 'retry' }
    } catch {
      return { status: 'retry' }
    }
  }

  if (!uuid.test(job.outbox_id) || !uuid.test(job.invitation_id) ||
      !uuid.test(job.workshop_id) || !uuid.test(job.lease_id) ||
      !Number.isInteger(job.attempt_number) || job.attempt_number < 1 ||
      job.attempt_number > 5) return { status: 'stale' }

  let workshop: TrustedWorkshop | null
  try {
    workshop = await deps.getWorkshop(job.workshop_id)
  } catch { return rejectClaim(false) }
  if (!workshop || workshop.id !== job.workshop_id || workshop.status !== 'active' ||
      workshop.name.trim().length < 2) return rejectClaim(true)

  // Recheck immediately before touching external transport. This minimizes,
  // but cannot eliminate, revocation/send races across an external service.
  try {
    if (!await deps.leaseIsCurrent(job)) return { status: 'stale' }
  } catch { return rejectClaim(false) }

  const result = await dispatchPreparedInvite(
    job, deps.encryptionKey, workshop.name, deps.nowIso(), deps.provider
  )
  if (result.state !== 'accepted')
    return rejectClaim(result.state === 'permanent-failure')

  try {
    if (await deps.ack(job,result.providerMessageId))
      return { status: 'provider-accepted' }
  } catch {
    // The provider may have accepted the send. DO NOT call fail() here.
  }
  // Ambiguous state: allow lease expiry + retry with provider idempotency.
  return { status: 'ack-unknown' }
}
