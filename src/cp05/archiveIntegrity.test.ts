import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  CP05_BUCKET, CP05_MAX_PDF_BYTES, isArchivePath, isArchivedPdf,
  privateArchiveCandidate
} from '../../server/cp05/archiveCandidate'

const uuid = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const wid = uuid(1)
const quote = uuid(2)
const path = wid + '/quotes/' + quote + '/r1/' + 'a'.repeat(64) + '.pdf'
const pdf = new TextEncoder().encode('%PDF-1.7\nSynthetic QA archive, no customer information\n%%EOF\n')
const digest = async (bytes: Uint8Array) =>
  Buffer.from(await crypto.subtle.digest('SHA-256', bytes.slice().buffer)).toString('hex')

function fixture() {
  const stored = new Map<string, Uint8Array>()
  const upload = vi.fn(async (key: string, bytes: Uint8Array) => {
    if (stored.has(key)) return { error: Error('Object already exists') }
    stored.set(key, bytes.slice())
    return { error: null }
  })
  const download = vi.fn(async (key: string) => ({
    error: stored.has(key) ? null : Error('Not found'),
    data: stored.has(key) ? new Blob([stored.get(key)!.slice().buffer],
      { type: 'application/pdf' }) : null
  }))
  const from = vi.fn((bucket: string) => {
    if (bucket !== CP05_BUCKET) throw Error('UNEXPECTED_BUCKET')
    return { upload, download }
  })
  const client = { storage: { from } } as unknown as SupabaseClient
  return { stored, upload, download, from, client }
}
describe('CP05 private immutable archive candidate (synthetic storage, no hosted data)', () => {
  it('rejects malformed paths, revisions, long PDFs and non-PDF content before Storage', async () => {
    const f = fixture()
    const a = privateArchiveCandidate(f.client, { approved: true })
    expect(isArchivePath(path)).toBe(true)
    for (const unsafe of [
      '../../another-workshop/quotes/' + quote + '/r1/' + 'a'.repeat(64) + '.pdf',
      'b'.repeat(36) + '/quotes/' + quote + '/r1/' + 'a'.repeat(64) + '.pdf',
      wid + '/quotes/' + quote + '/r0/' + 'a'.repeat(64) + '.pdf',
      wid + '/quotes/' + quote + '/r01/' + 'a'.repeat(64) + '.pdf'
    ]) {
      expect(isArchivePath(unsafe)).toBe(false)
      await expect(a.putIfAbsent(unsafe, pdf)).rejects.toThrow('PRIVATE_ARCHIVE_DISABLED')
    }
    expect(isArchivedPdf(pdf)).toBe(true)
    expect(isArchivedPdf(new TextEncoder().encode('not PDF'))).toBe(false)
    expect(isArchivedPdf(new Uint8Array(CP05_MAX_PDF_BYTES + 1))).toBe(false)
    await expect(a.putIfAbsent(path, new TextEncoder().encode('not PDF')))
      .rejects.toThrow('INVALID_PDF')
    expect(f.from).not.toHaveBeenCalled()
  })
  it('never reaches Storage while archive has not been expressly enabled', async () => {
    const f = fixture()
    await expect(privateArchiveCandidate(f.client, { approved: false }).putIfAbsent(path, pdf))
      .rejects.toThrow('PRIVATE_ARCHIVE_DISABLED')
    await expect(privateArchiveCandidate(f.client, { approved: false }).restore(path, 'a'.repeat(64)))
      .rejects.toThrow('PRIVATE_ARCHIVE_DISABLED')
    expect(f.from).not.toHaveBeenCalled()
  })
  it('stores only once, verifies the readback and permits an identical idempotent retry', async () => {
    const f = fixture()
    const a = privateArchiveCandidate(f.client, { approved: true })
    const first = await a.putIfAbsent(path, pdf)
    const second = await a.putIfAbsent(path, pdf)
    expect(first).toEqual(second)
    expect(first).toMatchObject({ path, size: pdf.length, sha256: await digest(pdf) })
    expect(f.stored.size).toBe(1)
    expect(f.upload).toHaveBeenCalledTimes(2)
    expect(f.upload.mock.calls[0][1]).toEqual(pdf)
    const restored = await a.restore(path, first.sha256, first.size)
    expect(restored).toEqual(pdf)
  })
  it('does not overwrite another revision and rejects a conflicting blob at the same path', async () => {
    const f = fixture()
    const a = privateArchiveCandidate(f.client, { approved: true })
    await a.putIfAbsent(path, pdf)
    const different = new TextEncoder().encode('%PDF-1.7\nDifferent immutable document\n%%EOF\n')
    await expect(a.putIfAbsent(path, different)).rejects.toThrow('ARCHIVE_CONFLICT')
    expect(f.stored.get(path)).toEqual(pdf)
    const otherPath = wid + '/quotes/' + quote + '/r2/' + 'a'.repeat(64) + '.pdf'
    await a.putIfAbsent(otherPath, different)
    expect(f.stored.size).toBe(2)
  })
  it('fails closed on corruption, unexpected byte count, wrong hash, missing object or malformed metadata', async () => {
    const f = fixture()
    const a = privateArchiveCandidate(f.client, { approved: true })
    const receipt = await a.putIfAbsent(path, pdf)
    await expect(a.restore(path, receipt.sha256, receipt.size + 1))
      .rejects.toThrow('ARCHIVE_INTEGRITY_ERROR')
    await expect(a.restore(path, 'b'.repeat(64), receipt.size))
      .rejects.toThrow('ARCHIVE_INTEGRITY_ERROR')
    await expect(a.restore(path, 'invalid'))
      .rejects.toThrow('INVALID_ARCHIVE_METADATA')
    f.stored.set(path, new TextEncoder().encode('%PDF-1.7\nCorrupted PDF\n%%EOF\n'))
    await expect(a.restore(path, receipt.sha256, receipt.size))
      .rejects.toThrow('ARCHIVE_INTEGRITY_ERROR')
    f.stored.delete(path)
    await expect(a.restore(path, receipt.sha256, receipt.size))
      .rejects.toThrow('ARCHIVE_UNAVAILABLE')
  })
})
