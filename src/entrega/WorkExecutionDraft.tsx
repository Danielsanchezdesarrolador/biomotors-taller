/**
 * Authenticated CP05 view only: operator-assisted PRELIMINARY WORK REVIEW.
 * Does not infer performance, persist choices, send messages, sign, or deliver.
 */
import { useRef, useState } from 'react'
import type { Quote, Revision } from '../cp05/contracts'
import { clp } from '../ordenes/orderMoney'
import { executionPreview, type ExecutionDecision, type ExecutionInput } from './executionPreview'
import './execution.css'

export function WorkExecutionDraft({
  revision,
  quote,
  onRecord
}: {
  revision: Revision
  quote: Quote
  /** Only supplied by BT-FLOW-LIVE-02 after explicit private rollout approval. */
  onRecord?: (input: ExecutionInput) => Promise<void>
}) {
  const [decisions, setDecisions] = useState<Record<string, ExecutionDecision>>({})
  const [pendingExplanation, setPendingExplanation] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const lock = useRef(false)
  let review: ReturnType<typeof executionPreview> | null = null
  try {
    review = executionPreview(revision, quote, {
      decisions, pendingExplanation, operatorReviewed: reviewed
    })
  } catch {
    // An unexpected tenant/OT/snapshot mismatch must not expose
    // an "export report" action or silently substitute the editable draft.
  }
  const change = (id: string, decision: ExecutionDecision) => {
    setDecisions(current => ({ ...current, [id]: decision }))
    setReviewed(false)
    setError('')
  }
  async function record() {
    if (!onRecord || !review?.readyForDraftPdf || lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      await onRecord({
        decisions: { ...decisions },
        pendingExplanation: review.pendingExplanation,
        operatorReviewed: reviewed
      })
    } catch {
      setError('No se pudo confirmar el registro en el servidor. Consulta los registros antes de repetirlo.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  async function download() {
    if (!review?.readyForDraftPdf || lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      const [{ browserExecutionDraftPdf }, { downloadPdf }] = await Promise.all([
        import('./executionPdf'), import('../cp05/pdf')
      ])
      const bytes = await browserExecutionDraftPdf(review)
      downloadPdf(
        bytes,
        'INFORME-BORRADOR-COT-' + String(revision.payload.quote.number).padStart(6,'0') +
          '-R' + revision.revision + '.pdf'
      )
    } catch {
      setError('No se pudo descargar el informe preliminar. No se registró entrega ni trabajo ejecutado.')
    } finally {
      lock.current = false
      setBusy(false)
    }
  }
  return (
    <section className="dashboard-card cp05-execution" aria-label="Informe técnico preliminar">
      <h3>Trabajos realizados · revisión preliminar</h3>
      <p role="status" className="cp05-notice">
        Selección local SIN GUARDAR. Esta pantalla no registra reparaciones ni aceptación del
        cliente; el documento será un borrador interno, nunca una constancia de entrega.
      </p>
      {!review ? (
        <p role="alert">La revisión no coincide con la orden, vehículo o cotización actual. No se puede preparar el informe.</p>
      ) : (
        <>
          <p>Basado exclusivamente en COT-{String(revision.payload.quote.number).padStart(6,'0')}
            {' '}· revisión emitida {revision.revision}. No incluye cambios posteriores del borrador.</p>
          {review.rows.map(({ item, decision }) => (
            <div key={item.id} className="cp05-execution-line">
              <div>
                <strong>{item.type} · {item.description}</strong>
                <small>{(item.quantity100 / 100).toLocaleString('es-CL')} unidades
                  {' '}· {clp(item.line_net)} neto cotizado</small>
              </div>
              <div className="cp05-execution-choices" role="group"
                aria-label={'Estado registrado localmente de ' + item.description}>
                <button type="button" className="cp04-secondary"
                  aria-pressed={decision === 'performed'}
                  disabled={busy} onClick={() => change(item.id, 'performed')}>
                  Marcado realizado
                </button>
                <button type="button" className="cp04-secondary"
                  aria-pressed={decision === 'not_performed'}
                  disabled={busy} onClick={() => change(item.id, 'not_performed')}>
                  No realizado
                </button>
                {decision === 'unreviewed' && <small>Sin revisar</small>}
              </div>
            </div>
          ))}
          <div className="cp05-execution-totals">
            <p>Cotizado total: <strong>{clp(review.quoted.total)}</strong></p>
            <p>Marcado realizado · neto: <strong>{clp(review.executed.subtotal)}</strong></p>
            <p>IVA 19 % calculado: <strong>{clp(review.executed.tax)}</strong></p>
            <p>Marcado realizado · total: <strong>{clp(review.executed.total)}</strong></p>
            <p>Diferencia: <strong>{clp(review.difference)}</strong></p>
          </div>
          <label className="cp05-execution-note">
            Observaciones y trabajos que no se realizaron
            <textarea rows={3} maxLength={2000} disabled={busy}
              value={pendingExplanation}
              onChange={e => { setPendingExplanation(e.target.value); setReviewed(false) }}
              placeholder="Detalla lo pendiente y lo que se debe informar al cliente…" />
          </label>
          <label className="cp05-execution-confirm">
            <input type="checkbox" checked={reviewed} disabled={busy}
              onChange={e => setReviewed(e.target.checked)} />
            Revisé personalmente las marcas y los importes para este borrador interno.
            No significa aceptación ni entrega del cliente.
          </label>
          {review.missing.length > 0 && (
            <ul className="cp05-execution-missing">
              {review.missing.map(item => <li key={item}>{item}</li>)}
            </ul>
          )}
          <button type="button" className="cp04-primary"
            disabled={busy || !review.readyForDraftPdf}
            onClick={() => void download()}>
            {busy ? 'Generando borrador…' : 'Descargar informe técnico · BORRADOR'}
          </button>
          {onRecord && (
            <button type="button" className="cp04-secondary"
              disabled={busy || !review.readyForDraftPdf}
              onClick={() => void record()}>
              {busy ? 'Verificando con el servidor…' :
                'Registrar declaración de trabajos · requiere autorización'}
            </button>
          )}
          {error && <p role="alert" className="cp04-error">{error}</p>}
          <small>{review.notice}</small>
        </>
      )}
    </section>
  )
}
