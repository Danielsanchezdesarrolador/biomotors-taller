/** Needs a separately approved private bucket/policies and backend-only SDK. No activation here. */
import type { SupabaseClient } from '@supabase/supabase-js'
export const CP05_BUCKET = 'cp05-quote-documents'
const hash = async (bytes: Uint8Array) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes.slice().buffer))]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('')
const validPath = (path: string) =>
  /^[a-f0-9-]{36}\/quotes\/[a-f0-9-]{36}\/r[1-9][0-9]*\/[a-f0-9]{64}\.pdf$/.test(path)
export function privateArchiveCandidate(client: SupabaseClient, policy: { approved: boolean }) {
  const gate = (path: string) => {
    if (!policy.approved || !validPath(path)) throw Error('PRIVATE_ARCHIVE_DISABLED')
  }
  return {
    async putIfAbsent(path: string, pdf: Uint8Array) {
      gate(path)
      const sha256 = await hash(pdf),
        bucket = client.storage.from(CP05_BUCKET)
      const uploaded = await bucket.upload(path, pdf, {
        contentType: 'application/pdf',
        upsert: false
      })
      // Read back even after a successful upload acknowledgement before finalizing SQL.
      const existing = await bucket.download(path)
      if (existing.error || !existing.data) throw Error('ARCHIVE_NOT_CONFIRMED')
      const restored = new Uint8Array(await existing.data.arrayBuffer())
      if (restored.length !== pdf.length || (await hash(restored)) !== sha256)
        throw Error(uploaded.error ? 'ARCHIVE_CONFLICT' : 'ARCHIVE_INTEGRITY_ERROR')
      return { path, sha256, size: pdf.length, contentType: 'application/pdf' as const }
    },
    async restore(path: string, expectedHash: string) {
      gate(path)
      const result = await client.storage.from(CP05_BUCKET).download(path)
      if (result.error || !result.data) throw Error('ARCHIVE_UNAVAILABLE')
      const bytes = new Uint8Array(await result.data.arrayBuffer())
      if ((await hash(bytes)) !== expectedHash) throw Error('ARCHIVE_INTEGRITY_ERROR')
      return bytes
    }
  }
}
