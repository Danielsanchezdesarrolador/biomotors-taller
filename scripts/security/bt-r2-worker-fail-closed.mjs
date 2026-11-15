/**
 * ByteTorque P6 — prevent accidental activation in the public main branch.
 * No network, env keys, RPC or mail. Only repo-source invariants.
 * If deployment is ever authorized, replace these invariants with the
 * reviewed and independently tested mandatory secret-auth gate.
 */
import { readFileSync } from 'node:fs'
import { strict as assert } from 'node:assert'

const config = readFileSync('supabase/config.toml', 'utf8')
const index = readFileSync('supabase/functions/bt-invite-worker/index.ts', 'utf8')
const candidate = readFileSync(
  'supabase/functions/bt-invite-worker/serviceAuthCandidate.ts', 'utf8'
)
const workerBlock = config.match(/\[functions\.bt-invite-worker\]([\s\S]*?)(?=\n\[|$)/)
assert(workerBlock, 'worker config missing')
assert.match(workerBlock[1], /^\s*verify_jwt\s*=\s*true\s*$/m,
  'worker must retain verify_jwt=true while live endpoint has no SDK gate')
assert.doesNotMatch(workerBlock[1], /verify_jwt\s*=\s*false/,
  'worker config unexpectedly disabled JWT')

assert.equal((index.match(/Deno\.serve\s*\(/g) ?? []).length, 1,
  'worker needs exactly one inert entrypoint')
assert.match(index, /status:\s*503\b/,
  'worker must reject all requests')
assert.doesNotMatch(index, /\b(import|from)\s+.*(serviceAuthCandidate|invitationEmailWorker|resendInviteTransportCandidate)/,
  'worker entrypoint must not wire privileged candidates')
assert.doesNotMatch(index, /\b(fetch\(|Deno\.env|createClient|processOneInvitationEmail|ctx\.supabaseAdmin)\b/,
  'worker must not access network, secrets, DB or job coordinator yet')
assert.match(candidate, /auth:\s*WORKER_NAMED_AUTH/,
  'candidate must retain explicit SDK auth')
assert.match(candidate, /npm:@supabase\/server@1\.9\.2/,
  'SDK version must remain pinned')
assert.doesNotMatch(candidate, /Deno\.serve|export\s+default|auth:\s*['"]none['"]/,
  'candidate must not become a callable entrypoint')
console.log('PASS: P6 worker remains unconditional 503, config verify_jwt=true, named-key candidate not deployed')
