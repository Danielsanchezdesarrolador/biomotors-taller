/** Packaging entry ONLY. Not registered in hosted Supabase or the repository's config. */
import { createClient } from '@supabase/supabase-js'
import { documentHandlerCandidate } from './documentHandlerCandidate'
import { resendProviderCandidate } from './resendProviderCandidate'
declare const Deno: {
  env: { get: (name: string) => string | undefined }
  readFile: (url: URL) => Promise<Uint8Array>
  serve: (handler: (request: Request) => Promise<Response>) => void
}
const required = (name: string) => {
  const value = Deno.env.get(name)
  if (!value) throw Error('SERVER_NOT_CONFIGURED')
  return value
}
const archiveApproved = Deno.env.get('BT_CP05_ARCHIVE_ENABLED') === 'true'
const emailApproved = archiveApproved && Deno.env.get('BT_CP05_EMAIL_ENABLED') === 'true'
async function asset(filename: string, expected: string) {
  const bytes = await Deno.readFile(new URL('./assets/' + filename, import.meta.url))
  const hash = Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', bytes.slice().buffer))
  )
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('')
  if (hash !== expected) throw Error('ASSET_INTEGRITY_ERROR')
  return bytes
}
Deno.serve(
  documentHandlerCandidate(
    {
      archiveApproved,
      emailApproved,
      allowedOrigin:
        Deno.env.get('BT_CP05_ALLOWED_ORIGIN') || 'https://biomotors-taller-demo.onrender.com'
    },
    {
      userClient: (authorization) =>
        createClient(required('SUPABASE_URL'), required('BT_CP05_PUBLISHABLE_KEY'), {
          global: { headers: { Authorization: authorization } },
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        }),
      trustedClient: () =>
        createClient(required('SUPABASE_URL'), required('SUPABASE_SERVICE_ROLE_KEY'), {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        }),
      assets: async () => ({
        font: await asset(
          'DejaVuSans.ttf',
          '57f73e11f51999432bf7ab22ce55b6f945d5eca1bf824404cfa9ec2e3718c84e'
        ),
        logo: await asset(
          'icon-192.png',
          '1daa67c7edb94f093ca303461ef4274d00de386843116fc7d6262e85847b4e67'
        )
      }),
      provider: () =>
        resendProviderCandidate({
          approved: emailApproved,
          apiKey: required('RESEND_API_KEY'),
          from: required('BT_CP05_EMAIL_FROM')
        })
    }
  )
)
