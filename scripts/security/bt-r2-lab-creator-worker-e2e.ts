/**
 * R2-A6-P5. Strictly local integration: REAL PostgreSQL 17 in ephemeral CI
 * + real P4 AES-GCM V3 creator + real SQL RPCs + mock provider HTTP only.
 *
 * Deno has NO --allow-net. Docker exec targets the Postgres service container
 * supplied by this workflow. No Supabase URLs/keys, Render, Resend, SMTP,
 * externally deployed functions, production data or external network.
 *
 * Never print query bodies, secrets, tokens, addresses or ciphertext.
 */
import {
  issueMechanicInvitationCandidate,
  type CandidateWorkshop,
  type ReserveAndQueueArgs
} from '../../supabase/functions/_shared/invitationIssueCandidate.ts'
import {
  processOneInvitationEmail,
  type LeasedInvitationEmail,
  type TrustedWorkshop
} from '../../supabase/functions/_shared/invitationEmailWorker.ts'
import { createResendHttpCandidate } from '../../supabase/functions/_shared/resendInviteTransportCandidate.ts'
import { openImmutableInviteEnvelope } from '../../supabase/functions/_shared/encryptedInviteEnvelope.ts'

const container = Deno.args[0]
if (!container || !/^[a-z0-9][a-z0-9_.-]{7,127}$/i.test(container))
  throw Error('Invalid isolated Postgres container identifier')

const workshopId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const ownerId = '11111111-1111-4111-8111-111111111111'
const outsiderId = '55555555-5555-4555-8555-555555555555'
const from = 'invitaciones@bytetorque.example'
const messageId = '12345678-1234-4234-8234-123456789abc'
const key = crypto.getRandomValues(new Uint8Array(32))
const assert = (ok: unknown, reason: string): asserts ok => {
  if (!ok) throw Error('P5 PostgreSQL integration: ' + reason)
}
function quote(s: string) {
  if (/[\0-\x1f]/.test(s)) throw Error('Invalid synthetic SQL data')
  return "'" + s.replaceAll("'", "''") + "'"
}

/** SQL goes exclusively over docker exec/psql stdin, never an HTTP channel. */
async function sql(statement: string): Promise<string> {
  const process = new Deno.Command('docker', {
    args: ['exec', '-i', container, 'psql',
      '-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1',
      '-U', 'postgres', '-d', 'bytetorque'],
    stdin: 'piped', stdout: 'piped', stderr: 'piped'
  }).spawn()
  const writer = process.stdin.getWriter()
  await writer.write(new TextEncoder().encode('SET ROLE service_role;\n' + statement + '\n'))
  await writer.close()
  const result = await process.output()
  if (result.code !== 0)
    throw Error('Isolated candidate PostgreSQL operation rejected')
  return new TextDecoder().decode(result.stdout).trim()
}
function singleJson<T>(s: string): T | null {
  if (!s) return null
  try { return JSON.parse(s) as T } catch { throw Error('Malformed local PostgreSQL result') }
}
async function getWorkshop(id: string): Promise<CandidateWorkshop | null> {
  return singleJson<CandidateWorkshop>(
    await sql('SELECT row_to_json(t)::text FROM (' +
      'SELECT id::text AS id,name,status FROM public.workshops WHERE id=' +
      quote(id) + '::uuid) AS t;')
  )
}
async function reserveAndQueue(args: ReserveAndQueueArgs): Promise<string> {
  // Match the seven-parameter SQL contract EXACTLY. No actor from HTTP body.
  const values = [
    args.p_actor_user_id + '::uuid',
    args.p_workshop_id + '::uuid'
  ]
  const q = (v: string) => quote(v)
  const call = [
    q(args.p_actor_user_id) + '::uuid',
    q(args.p_workshop_id) + '::uuid',
    q(args.p_email),
    q(args.p_token_sha256_hex),
    q(args.p_expires_at) + '::timestamptz',
    q(args.p_ciphertext_hex),
    q(args.p_nonce_hex)
  ]
  void values // Keep RPC mapping explicit for security review.
  return await sql('SELECT public.bt_r2_reserve_and_queue_mechanic_invite(' +
    call.join(',') + ')::text;')
}
const deps = {
  getWorkshop,
  reserveAndQueue,
  encryptionKey: key,
  authorizedSender: from,
  nowIso: () => new Date().toISOString()
}

// The existing lab intentionally tests Basic quota separately; upgrade ONLY
// this synthetic workshop in the ephemeral database for this integration run.
await sql(
  'INSERT INTO bt_private.workshop_mechanic_entitlements(workshop_id,plan)' +
  ' VALUES (' + quote(workshopId) + '::uuid,' + quote('plus') + ');'
)

const outcome = await issueMechanicInvitationCandidate({
  workshop_id: workshopId, email: 'newmech1@example.com'
}, {
  userId: ownerId, confirmedEmail: 'ownera@example.com'
}, deps)
assert(outcome.status === 'queued', 'owner invitation did not queue')
const inviteId = outcome.invitationId

const row = singleJson<{
  ciphertext_hex: string
  nonce_hex: string
  digest: string
  recipient: string
  expires_at: string
}>(await sql(
  'SELECT row_to_json(t)::text FROM (' +
  'SELECT encode(o.ciphertext,\'hex\') AS ciphertext_hex,' +
  'encode(o.nonce,\'hex\') AS nonce_hex,' +
  'encode(i.token_sha256,\'hex\') AS digest,' +
  'i.invited_email AS recipient,i.expires_at::text AS expires_at' +
  ' FROM bt_private.workshop_invitation_outbox o' +
  ' JOIN bt_private.workshop_mechanic_invitations i ON i.id=o.invitation_id' +
  ' WHERE i.id=' + quote(inviteId) + '::uuid AND o.status=\'queued\') t;'
))
assert(row && row.recipient === 'newmech1@example.com',
  'no real encrypted outbox entry')
assert(row.ciphertext_hex.length / 2 <= 8192, 'ciphertext SQL byte limit')
assert(row.digest.length === 64 && row.nonce_hex.length === 24,
  'invalid SQL token digest or nonce')

// PostgreSQL timestamptz round-trips through a DIFFERENT textual format.
// The envelope must verify by instant, not literal timestamp characters.
const frozen = await openImmutableInviteEnvelope({
  ciphertext_hex: row.ciphertext_hex,
  nonce_hex: row.nonce_hex,
  token_sha256_hex: row.digest
}, key, {
  workshopId, recipientEmail: row.recipient,
  expiresAt: row.expires_at, token_sha256_hex: row.digest
}, new Date().toISOString())
assert(frozen.to === row.recipient && frozen.from === from,
  'AES-GCM failed real DB round-trip')
assert(frozen.wireBody.includes('newmech1@example.com'),
  'immutable wire body missing')

const denied = await issueMechanicInvitationCandidate({
  workshop_id: workshopId, email: 'newmech2@example.com'
}, {
  userId: outsiderId, confirmedEmail: 'ownerb@example.com'
}, deps)
assert(denied.status === 'unknown', 'cross-tenant SQL did not reject')
const escaped = await sql(
  'SELECT count(*)::text FROM bt_private.workshop_mechanic_invitations' +
  ' WHERE workshop_id=' + quote(workshopId) + '::uuid' +
  ' AND invited_email=' + quote('newmech2@example.com') + ';')
assert(escaped === '0', 'cross-tenant created an invitation')

let httpCalls = 0
const provider = createResendHttpCandidate({
  apiKey: 're_SYNTHETIC_TEST_ONLY_1234567890123456',
  fromEmail: from
}, async (request, signal) => {
  assert(!signal.aborted, 'mock transport received aborted request')
  assert(request.headers['Idempotency-Key'].startsWith('bt-r2-invite:'),
    'missing stable idempotency key')
  assert(request.body === frozen.wireBody, 'HTTP bytes differ from stored snapshot')
  httpCalls++
  return { status: 200, json: async () => ({ id: messageId }) }
})
const claimed = await sql(
  'SELECT row_to_json(t)::text FROM public.bt_r2_claim_invitation_email() AS t;')
const job = singleJson<LeasedInvitationEmail>(claimed)
assert(job && job.invitation_id === inviteId && job.workshop_id === workshopId,
  'worker did not claim correct SQL invitation')
assert(job.attempt_number === 1, 'first lease counter incorrect')
assert(job.expires_at !== undefined, 'claim missing expiry')

// Exercise genuine lease-status RPC, genuine ACK RPC, and provider MOCK.
const worker = await processOneInvitationEmail({
  claim: async () => job,
  getWorkshop: async (id): Promise<TrustedWorkshop | null> =>
    getWorkshop(id),
  leaseIsCurrent: async (current) =>
    (await sql('SELECT public.bt_r2_invitation_email_lease_valid(' +
      quote(current.outbox_id) + '::uuid,' + quote(current.lease_id) +
      '::uuid)::text;')) === 't',
  ack: async (current, providerMessageId) =>
    (await sql('SELECT public.bt_r2_mark_invitation_email_sent(' +
      quote(current.outbox_id) + '::uuid,' + quote(current.lease_id) +
      '::uuid,' + quote(providerMessageId) + ')::text;')) === 't',
  fail: async (current) =>
    (await sql('SELECT public.bt_r2_fail_or_retry_invitation_email(' +
      quote(current.outbox_id) + '::uuid,' + quote(current.lease_id) +
      '::uuid)::text;')) as 'retry' | 'failed' | 'ignored',
  provider, encryptionKey: key, nowIso: () => new Date().toISOString()
})
assert(worker.status === 'provider-accepted', 'SQL worker/ACK did not finish')
assert(httpCalls === 1, 'mock provider called more than once')
const persisted = await sql(
  'SELECT count(*)::text FROM bt_private.workshop_invitation_outbox' +
  ' WHERE id=' + quote(job.outbox_id) + '::uuid AND status=' + quote('sent') +
  ' AND ciphertext IS NULL AND nonce IS NULL AND attempts=1;')
assert(persisted === '1', 'provider ACK did not purge encrypted material')
const noMore = await sql(
  'SELECT count(*)::text FROM bt_private.workshop_invitation_outbox' +
  ' WHERE invitation_id=' + quote(inviteId) + '::uuid' +
  ' AND status IN (\'queued\',\'retry\',\'processing\');')
assert(noMore === '0', 'completed invite remains claimable')

console.log(
  'PASS: P5 local PostgreSQL 17 integration, V3 ciphertext DB round-trip,' +
  ' owner reservation, cross-tenant rejection, real lease and ACK,' +
  ' immutable HTTP mocked once, ciphertext purged; NO EXTERNAL SEND'
)
