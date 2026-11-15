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
import { acceptMechanicInviteCandidate } from '../../supabase/functions/_shared/mechanicInviteAcceptCandidate.ts'
import { verifyInviteActor, INVITE_AUTH_ORIGIN } from '../../supabase/functions/_shared/verifiedInviteActor.ts'

const container = Deno.args[0]
if (!container || !/^[a-z0-9][a-z0-9_.-]{7,127}$/i.test(container))
  throw Error('Invalid isolated Postgres container identifier')

const workshopId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const ownerId = '11111111-1111-4111-8111-111111111111'
const outsiderId = '55555555-5555-4555-8555-555555555555'
const from = 'invitaciones@bytetorque.example'
const messageId = '12345678-1234-4234-8234-123456789abc'
const key = crypto.getRandomValues(new Uint8Array(32))
function assert(ok: unknown, reason: string): asserts ok {
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
      '::uuid)::text;')) === 'true',
  ack: async (current, providerMessageId) =>
    (await sql('SELECT public.bt_r2_mark_invitation_email_sent(' +
      quote(current.outbox_id) + '::uuid,' + quote(current.lease_id) +
      '::uuid,' + quote(providerMessageId) + ')::text;')) === 'true',
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

// R2-A6-6: read the synthetic one-time token from decrypted TEST email.
// It never touches logs or a real URL/HTTP service. The real user would receive
// this via their inbox; no acceptance page or public endpoint is active.
const tokenMatch = frozen.text.match(/#\/auth\/aceptar-invitacion\?token=([a-f0-9]{64})/)
assert(tokenMatch, 'synthetic encrypted email did not retain acceptance token')
const acceptanceToken = tokenMatch[1]

// Exercise the actual Auth verifier with a fully injected fake /auth/v1/user.
// This is NOT a real Supabase Auth session; the source & verification checks
// are real, the HTTP response is supplied locally without network permission.
async function trustedTestIdentity(userId: string, email: string, confirmed = true) {
  const fakeAuth: typeof fetch = async (url) => {
    assert(url === INVITE_AUTH_ORIGIN + '/auth/v1/user',
      'Auth verifier queried an unexpected host')
    return Response.json({
      id: userId, email, is_anonymous: false,
      email_confirmed_at: confirmed ? new Date().toISOString() : null
    })
  }
  return verifyInviteActor('Bearer synthetic.header.signature', {
    baseUrl: INVITE_AUTH_ORIGIN,
    publicKey: 'sb_publishable_SYNTHETIC_LOCAL_ONLY'
  }, fakeAuth)
}
const acceptedIdentity = await trustedTestIdentity(
  '66666666-6666-4666-8666-666666666666','newmech1@example.com'
)
assert(acceptedIdentity.ok, 'mocked Auth confirmed user failed verification')
const otherIdentity = await trustedTestIdentity(
  '77777777-7777-4777-8777-777777777777','newmech2@example.com'
)
assert(otherIdentity.ok, 'mocked alternate identity did not verify')
const unconfirmedIdentity = await trustedTestIdentity(
  '66666666-6666-4666-8666-666666666666','newmech1@example.com',false
)
assert(!unconfirmedIdentity.ok && unconfirmedIdentity.status === 403,
  'unconfirmed Auth email would have reached database')

let acceptRpcCalls = 0
const acceptRpc = async (args: {
  p_verified_user_id: string
  p_verified_email: string
  p_token_sha256_hex: string
}) => {
  acceptRpcCalls++
  return (await sql(
    'SELECT public.bt_r2_accept_mechanic_invite(' +
    quote(args.p_verified_user_id) + '::uuid,' +
    quote(args.p_verified_email) + ',' +
    quote(args.p_token_sha256_hex) + ')::text;'
  )) === 'true'
}
const wrongEmail = await acceptMechanicInviteCandidate(
  { token: acceptanceToken }, otherIdentity.actor, { accept: acceptRpc }
)
assert(wrongEmail.status === 'denied',
  'SQL accepted token for a different confirmed Auth email')
const changedToken = acceptanceToken[0] === 'a'
  ? 'b' + acceptanceToken.slice(1)
  : 'a' + acceptanceToken.slice(1)
const wrongToken = await acceptMechanicInviteCandidate(
  { token: changedToken }, acceptedIdentity.actor, { accept: acceptRpc }
)
assert(wrongToken.status === 'denied', 'SQL accepted incorrect token digest')
const accepted = await acceptMechanicInviteCandidate(
  { token: acceptanceToken }, acceptedIdentity.actor, { accept: acceptRpc }
)
assert(accepted.status === 'accepted', 'real SQL did not accept matching confirmed identity')
const replay = await acceptMechanicInviteCandidate(
  { token: acceptanceToken }, acceptedIdentity.actor, { accept: acceptRpc }
)
assert(replay.status === 'denied', 'real SQL allowed token replay')
assert(acceptRpcCalls === 4, 'unexpected number of SQL acceptance calls')
const membership = await sql(
  'SELECT count(*)::text FROM public.workshop_memberships' +
  ' WHERE workshop_id=' + quote(workshopId) + '::uuid' +
  ' AND user_id=' + quote(acceptedIdentity.actor.userId) + '::uuid' +
  ' AND role=' + quote('mechanic') + ' AND status=' + quote('active') + ';'
)
assert(membership === '1', 'acceptance did not create exactly one mechanic membership')
const unchangedOther = await sql(
  'SELECT count(*)::text FROM public.workshop_memberships' +
  ' WHERE workshop_id=' + quote(workshopId) + '::uuid' +
  ' AND user_id=' + quote(otherIdentity.actor.userId) + '::uuid;'
)
assert(unchangedOther === '0', 'acceptance leaked access to wrong confirmed user')
const acceptedAudit = await sql(
  'SELECT count(*)::text FROM bt_private.workshop_invitation_audit' +
  ' WHERE invitation_id=' + quote(inviteId) + '::uuid' +
  ' AND event=' + quote('invite_accepted') + ';'
)
assert(acceptedAudit === '1', 'acceptance did not record exactly one audit event')
const acceptedStatus = await sql(
  'SELECT count(*)::text FROM bt_private.workshop_mechanic_invitations' +
  ' WHERE id=' + quote(inviteId) + '::uuid AND status=' + quote('accepted') + ';'
)
assert(acceptedStatus === '1', 'token did not transition atomically to accepted')
console.log(
  'PASS: R2-A6-6 confirmed synthetic Auth -> SHA-256 token -> real PostgreSQL' +
  ' atomic acceptance, single membership and audit, email mismatch/replay denied'
)

console.log(
  'PASS: P5 local PostgreSQL 17 integration, V3 ciphertext DB round-trip,' +
  ' owner reservation, cross-tenant rejection, real lease and ACK,' +
  ' immutable HTTP mocked once, ciphertext purged; NO EXTERNAL SEND'
)
