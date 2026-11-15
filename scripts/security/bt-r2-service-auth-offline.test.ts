/**
 * P6: REAL @supabase/server named-secret auth in a synthetic Deno process.
 * No network permission, no hosted Supabase access, no provider, no jobs.
 * Never print the environment or secrets, including synthetic test values.
 */
import { offlineAuthenticatedWorkerCandidate } from '../../supabase/functions/bt-invite-worker/serviceAuthCandidate.ts'

// Synthetic strings only; are not Supabase API keys or production secrets.
const named = 'sb_secret_SYNTHETIC_BYTE_TORQUE_WORKER_ONLY_12345'
const other = 'sb_secret_SYNTHETIC_OTHER_SERVICE_ONLY_567890'
const pub = 'sb_publishable_SYNTHETIC_BROWSER_ONLY_123456789'
Deno.env.set('SUPABASE_URL', 'https://offline-auth-test.invalid')
Deno.env.set('SUPABASE_SECRET_KEYS', JSON.stringify({
  'bytetorque-worker': named, default: other, billing: other
}))
Deno.env.set('SUPABASE_PUBLISHABLE_KEYS', JSON.stringify({default:pub}))
Deno.env.set('SUPABASE_JWKS', '{"keys":[]}')
// Eliminate legacy fallbacks (this is an offline dedicated CI process).
Deno.env.delete('SUPABASE_SECRET_KEY')
Deno.env.delete('SUPABASE_SERVICE_ROLE_KEY')
Deno.env.delete('SUPABASE_ANON_KEY')

function req(key?: string, extras?: RequestInit): Request {
  const headers = new Headers(extras?.headers)
  if (key !== undefined) headers.set('apikey',key)
  return new Request(
    'https://offline-auth-test.invalid/functions/v1/bt-invite-worker',
    {method:'POST',...extras,headers}
  )
}

Deno.test('real @supabase/server: correct named secret is authenticated but worker stays off',async () => {
  const response=await offlineAuthenticatedWorkerCandidate(req(named))
  if(response.status!==503) throw Error('Named service key did not pass SDK auth or fail closed')
  const body=await response.json()
  if(body.error!=='El trabajador de invitaciones todavía no está habilitado.')
    throw Error('Unexpected worker response')
})

Deno.test('real @supabase/server: missing, wrong, default and publishable keys denied',async () => {
  for(const key of [undefined,other,pub,'sb_secret_INVALID_ONLY']) {
    const response=await offlineAuthenticatedWorkerCandidate(req(key))
    if(response.status!==401 && response.status!==403)
      throw Error('SDK accepted unauthorized service key')
  }
})

Deno.test('real @supabase/server: user Authorization alone cannot authenticate service',async () => {
  const response=await offlineAuthenticatedWorkerCandidate(
    req(undefined,{headers:{authorization:'Bearer synthetic.jwt.value'}})
  )
  if(response.status!==401 && response.status!==403)
    throw Error('SDK treated a user JWT as service access')
})

Deno.test('real @supabase/server: named key still denies payload and browser Origin',async () => {
  const injected=await offlineAuthenticatedWorkerCandidate(
    req(named,{body:'{"workshop_id":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"}'})
  )
  if(injected.status!==413) throw Error('Authenticated worker accepted injected payload')
  const browser=await offlineAuthenticatedWorkerCandidate(
    req(named,{headers:{origin:'https://biomotors-taller-demo.onrender.com'}})
  )
  if(browser.status!==403) throw Error('Authenticated worker accepted a browser origin')
})
