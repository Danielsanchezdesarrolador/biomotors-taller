import { useState } from 'react'
import { Send } from 'lucide-react'
import type { Revision } from './contracts'
import type { QuoteEmailReview } from './emailReview'
import { matchesQuoteEmailReview } from './emailReview'

/** Keyed by immutable revision: operator attestations are local and ephemeral. */
export function QuoteEmailReviewPanel({
  revision, enabled, busy, canWrite, sent, pending, onSend
}: {
  revision: Revision
  enabled: boolean
  busy: boolean
  canWrite: boolean
  sent: boolean
  pending: boolean
  onSend: (review: QuoteEmailReview) => void
}) {
  const [recipient, setRecipient] = useState('')
  const [recipientChecked, setRecipientChecked] = useState(false)
  const [documentChecked, setDocumentChecked] = useState(false)
  const [contactAuthorized, setContactAuthorized] = useState(false)
  const review = { reviewedRevisionId: revision.id, confirmedRecipient: recipient,
    recipientChecked, documentChecked, contactAuthorized }
  const ready = matchesQuoteEmailReview(revision, review)
  const blocked = !enabled || !canWrite || busy || sent || pending
  return (
    <section className="cp05-mail-review" aria-label="Revisión previa del correo de cotización">
      <strong>Solicitud de envío de cotización · revisión {revision.revision}</strong>
      <p>Este correo adjuntaría únicamente la cotización emitida de esta revisión.
        El correo único final con informe y entrega corresponde a BT-COM-01.</p>
      <div className="cp05-mail-summary">
        <span>Destinatario de la revisión emitida:</span>
        <strong>{revision.payload.customer.email || 'Sin correo en el documento'}</strong>
      </div>
      <p>El contacto es histórico y puede haber cambiado. El servidor comprobará la
        dirección actual antes de enviar. Enviar no equivale a aprobación ni recepción.</p>
      <label>Escribe el correo del destinatario para confirmarlo
        <input type="email" autoComplete="off" spellCheck={false} value={recipient}
          maxLength={254} disabled={blocked} placeholder="correo@dominio.cl"
          onChange={e => setRecipient(e.target.value)} />
      </label>
      <label className="cp05-mail-check">
        <input type="checkbox" checked={recipientChecked} disabled={blocked}
          onChange={e => setRecipientChecked(e.target.checked)} />
        Revisé que el destinatario corresponde al documento y su dirección está vigente.
      </label>
      <label className="cp05-mail-check">
        <input type="checkbox" checked={documentChecked} disabled={blocked}
          onChange={e => setDocumentChecked(e.target.checked)} />
        Revisé la cotización emitida, su número y revisión exacta.
      </label>
      <label className="cp05-mail-check">
        <input type="checkbox" checked={contactAuthorized} disabled={blocked}
          onChange={e => setContactAuthorized(e.target.checked)} />
        Declaro que el taller tiene autorización para contactar a este destinatario.
      </label>
      {sent && <p role="status">El proveedor aceptó un envío de esta revisión; no se repetirá automáticamente.</p>}
      {pending && <p role="status">Existe intento pendiente o incierto: no reenviar hasta conciliarlo.</p>}
      {!enabled && <p role="status">Correo externo desactivado. No se realizará ningún envío.</p>}
      <button type="button" className="cp04-secondary" disabled={blocked || !ready}
        onClick={() => { if(!blocked && matchesQuoteEmailReview(revision,review)) onSend(review) }}>
        <Send size={17} /> {enabled ? 'Confirmar envío de esta cotización' : 'Enviar cotización · desactivado'}
      </button>
    </section>
  )
}
