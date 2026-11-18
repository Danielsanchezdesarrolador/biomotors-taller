/** CP06 -> CP05 private archive: never download by user-selected Storage path.
 * The established document client validates verified Auth, tenant and SHA-256.
 * This boundary additionally binds the selected vehicle and immutable snapshot.
 */
import { QuoteFailure, type Revision } from '../cp05/contracts'
import { historyId } from './contracts'

export async function archivedRevisionPdf(
  revision: Revision,
  vehicleId: string,
  workshopId: string,
  port: { download: (revision: Revision) => Promise<Uint8Array> } | null,
  save: (pdf: Uint8Array, name: string) => void
): Promise<void> {
  if (!port) throw new QuoteFailure('blocked')
  if (revision.workshop_id !== historyId(workshopId) ||
      revision.payload?.quote?.workshop_id !== workshopId ||
      revision.payload?.quote?.id !== revision.quote_id ||
      revision.payload?.vehicle?.id !== historyId(vehicleId) ||
      revision.payload?.order?.id === undefined ||
      !Number.isSafeInteger(revision.revision) || revision.revision < 1 ||
      !Number.isSafeInteger(revision.payload?.quote?.number) ||
      revision.payload.quote.number < 1) throw new QuoteFailure('denied')
  const bytes = await port.download(revision)
  const name = 'COT-' + String(revision.payload.quote.number).padStart(6, '0') +
    '-R' + revision.revision + '.pdf'
  save(bytes, name)
}
