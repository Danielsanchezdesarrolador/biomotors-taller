/**
 * R2-A6-P6 CANDIDATE ONLY — intentionally NOT an Edge entrypoint.
 * No Deno.serve(), no default exported fetch handler, no executable service.
 * This verifies the official named-key wrapper can be compiled, while the
 * live bt-invite-worker/index.ts retains its unconditional 503 response.
 *
 * DO NOT DEPLOY or import from index.ts before Director approval:
 * the eventual change to verify_jwt=false MUST be paired atomically with
 * this exact SDK auth mode and a reviewed worker implementation.
 */
import { withSupabase } from 'npm:@supabase/server@1.9.2'
import {
  WORKER_NAMED_AUTH, dormantAuthenticatedWorkerCandidate
} from './serviceAuthPolicy.ts'

/**
 * SDK checks the named secret in 'apikey' (NOT a browser JWT).
 * Even an authenticated service reaches a disabled handler, not the worker.
 * ctx.supabaseAdmin is intentionally unused; no privileged operation.
 */
export const offlineAuthenticatedWorkerCandidate = withSupabase(
  { auth: WORKER_NAMED_AUTH },
  async (request) => dormantAuthenticatedWorkerCandidate(request)
)
