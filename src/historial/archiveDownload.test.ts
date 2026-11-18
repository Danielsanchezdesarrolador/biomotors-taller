import { describe, expect, it, vi } from 'vitest'
import type { Revision } from '../cp05/contracts'
import { archivedRevisionPdf } from './archiveDownload'
const id = (n: number) => '00000000-0000-4000-8000-' + String(n).padStart(12, '0')
const wid = id(1), vid = id(2), qid = id(3)
const archived = {
  workshop_id: wid,
  quote_id: qid,
  revision: 2,
  payload: {
    quote: { id: qid, workshop_id: wid, number: 7 },
    vehicle: { id: vid },
    order: { id: id(4) }
  }
} as Revision
const bytes = new TextEncoder().encode('%PDF-1.7\nQA archive\n%%EOF')
describe('CP06 historic PDF downloads remain behind private CP05 transport', () => {
  it('fails closed when the document service has not been enabled', async () => {
    const save = vi.fn()
    await expect(archivedRevisionPdf(archived, vid, wid, null, save))
      .rejects.toMatchObject({ kind: 'blocked' })
    expect(save).not.toHaveBeenCalled()
  })
  it('downloads only a revision from the selected workshop and vehicle', async () => {
    const download = vi.fn(async () => bytes)
    const save = vi.fn()
    await archivedRevisionPdf(archived, vid, wid, { download }, save)
    expect(download).toHaveBeenCalledOnce()
    expect(save).toHaveBeenCalledWith(bytes, 'COT-000007-R2.pdf')
  })
  it('never fetches another workshop, vehicle or tampered snapshot', async () => {
    const download = vi.fn(async () => bytes)
    const save = vi.fn()
    for (const changed of [
      { ...archived, workshop_id: id(99) },
      { ...archived, payload: { ...archived.payload, vehicle: { id: id(99) } } },
      { ...archived, payload: { ...archived.payload, quote: { ...archived.payload.quote, id: id(99) } } },
      { ...archived, revision: 0 }
    ]) {
      await expect(archivedRevisionPdf(changed as unknown as Revision, vid, wid, { download }, save))
        .rejects.toMatchObject({ kind: 'denied' })
    }
    expect(download).not.toHaveBeenCalled()
    expect(save).not.toHaveBeenCalled()
  })
  it('does not save if authorization, integrity or archive availability fails', async () => {
    const download = vi.fn(async (_revision: Revision): Promise<Uint8Array> => {
      throw new Error('ARCHIVE_INTEGRITY_ERROR')
    })
    const save = vi.fn()
    await expect(archivedRevisionPdf(archived, vid, wid, { download }, save))
      .rejects.toThrow('ARCHIVE_INTEGRITY_ERROR')
    expect(save).not.toHaveBeenCalled()
  })
})
