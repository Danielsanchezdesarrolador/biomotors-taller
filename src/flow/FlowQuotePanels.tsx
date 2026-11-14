import { useState, type ReactNode } from 'react'
import { ArrowRight, ClipboardCheck, FileText } from 'lucide-react'
import { prepareCaseWork, readCase, type FlowCase } from './flowSession'
import {
  businessState,
  decisionLabels,
  markQuoteReviewed,
  recordClientResponse,
  type ClientDecision,
  type QuoteRef
} from './flowBusiness'
import { currency, workTotals } from '../informes/trabajos/trabajosData'
const date = (value: string) =>
  new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Santiago'
  }).format(new Date(value))
export function FlowQuotePanel({
  visit,
  onProposal,
  onQuote,
  onWork
}: {
  visit: FlowCase
  onProposal: () => void
  onQuote: () => void
  onWork: () => void
}) {
  const state = businessState(visit),
    q = state.quote
  const [modal, setModal] = useState<({ type: 'review' | 'response' } & QuoteRef) | null>(null),
    [ack, setAck] = useState(false),
    [decision, setDecision] = useState<ClientDecision | ''>(''),
    [note, setNote] = useState(''),
    [error, setError] = useState('')
  function open(type: 'review' | 'response') {
    if (!q) return
    setModal({ type, quoteId: q.id, revision: q.revision })
    setAck(false)
    setDecision('')
    setNote('')
    setError('')
  }
  if (!q)
    return (
      <>
        <p>
          Primero define y confirma el diagnóstico y las partidas de esta visita. No hay una
          cotización preparada automáticamente.
        </p>
        <button className="rp-primary" onClick={onProposal}>
          Definir propuesta
          <ArrowRight />
        </button>
      </>
    )
  const totals = workTotals(q)
  return (
    <div className="fl-quote">
      <p className="fl-notice">
        <strong>
          {q.id} · Revisión {q.revision}
        </strong>
        <br />
        Estado del documento: {q.status}. Su aprobación local en BT-COT-01 no equivale a una
        respuesta del cliente.
      </p>
      <dl className="fl-business-totals">
        {[
          ['Subtotal', totals.subtotal],
          ['IVA (19 %)', totals.tax],
          ['Total IVA incluido', totals.total]
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{currency(Number(value))}</dd>
          </div>
        ))}
      </dl>

      <dl className="fl-business-status">
        <div>
          <dt>Propuesta del mecánico</dt>
          <dd>{state.proposalValid ? 'Confirmada y vigente' : 'Pendiente de confirmar'}</dd>
        </div>
        <div>
          <dt>Revisión económica y condiciones</dt>
          <dd>{state.reviewValid ? 'Revisada · DEMO' : 'Pendiente de revisión'}</dd>
        </div>
        <div>
          <dt>Respuesta del cliente · Simulación</dt>
          <dd>
            {state.response ? decisionLabels[state.response.decision] : 'Sin respuesta vigente'}
          </dd>
        </div>
        <div>
          <dt>Autorización simulada</dt>
          <dd>{state.authorized ? 'Vigente para esta revisión' : 'No habilitada'}</dd>
        </div>
      </dl>
      {state.response && (
        <p className="fl-help">
          Registro del operador: {date(state.response.date)} · {state.response.note || 'Sin nota.'}
        </p>
      )}
      <div className="fl-business-actions">
        {!state.proposalValid ? (
          <button className="rp-primary" onClick={onProposal}>
            Revisar propuesta
            <ArrowRight />
          </button>
        ) : !state.reviewValid ? (
          q.saved ? (
            <button className="rp-primary" onClick={() => open('review')}>
              Confirmar revisión de cotización
              <ClipboardCheck />
            </button>
          ) : (
            <button className="rp-primary" onClick={onQuote}>
              Preparar cotización
              <ArrowRight />
            </button>
          )
        ) : !state.response ? (
          <button className="rp-primary" onClick={() => open('response')}>
            Registrar respuesta DEMO
            <ArrowRight />
          </button>
        ) : state.authorized ? (
          <button className="rp-primary" onClick={onWork}>
            Continuar a trabajos
            <ArrowRight />
          </button>
        ) : (
          <button className="rp-primary" onClick={onProposal}>
            Revisar propuesta
            <ArrowRight />
          </button>
        )}
        <button className="rp-secondary" onClick={onQuote}>
          <FileText />
          Revisar cotización
        </button>
        {state.proposalValid && !state.reviewValid && !q.saved && (
          <button className="rp-secondary" onClick={() => open('review')}>
            Confirmar revisión de cotización
          </button>
        )}
        {state.reviewValid && state.response && (
          <button className="rp-secondary" onClick={() => open('response')}>
            Registrar otra respuesta DEMO
          </button>
        )}
      </div>
      <p className="fl-help">
        La respuesta es una simulación activada por el operador: no representa identidad verificada,
        recepción real, correo, firma ni aceptación contractual.
      </p>
      {state.history.length > 0 && (
        <details className="fl-response-history" open>
          <summary>Historial de respuestas por revisión ({state.history.length})</summary>
          {state.history.map((r) => (
            <article key={r.id}>
              <strong>
                {decisionLabels[r.decision]} · {r.quoteId} · Revisión {r.revision}
              </strong>
              <span>
                {date(r.date)} · {r.actor} ·{' '}
                {r.id === state.response?.id
                  ? 'Respuesta vigente'
                  : 'Registro anterior, sin autorización vigente'}
              </span>
              <p>{r.note || 'Sin nota.'}</p>
            </article>
          ))}
        </details>
      )}
      {modal && (
        <FlowDialog
          title={
            modal.type === 'review'
              ? 'Revisar cotización vigente · DEMO'
              : 'Registrar respuesta del cliente · DEMO'
          }
          onClose={() => setModal(null)}
        >
          <p>
            <strong>
              {modal.quoteId} · Revisión {modal.revision}
            </strong>
          </p>
          <p>Total de la revisión mostrada: {currency(totals.total)}</p>
          {modal.type === 'review' && (
            <div className="fl-review-content">
              <ul className="fl-preload-list">
                {q.items.map((i) => (
                  <li key={i.id}>
                    <strong>{i.description}</strong>
                    <span>
                      {i.type} · {i.quantity.toLocaleString('es-CL')} × {currency(i.price)}
                    </span>
                  </li>
                ))}
              </ul>
              <p>Vigencia: {q.validDays} días.</p>
              <strong>Condiciones de esta revisión</strong>
              <p className="fl-terms-preview">{q.terms}</p>
            </div>
          )}
          {modal.type === 'response' && (
            <>
              <label>
                Resultado simulado
                <select
                  aria-label="Resultado simulado"
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as ClientDecision)}
                >
                  <option value="">Selecciona una respuesta</option>
                  {Object.entries(decisionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nota de la respuesta DEMO
                <textarea
                  aria-label="Nota de la respuesta DEMO"
                  rows={3}
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
              <small>{note.length} / 500</small>
            </>
          )}
          <label className="fl-business-consent">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            {modal.type === 'review'
              ? 'Confirmo que revisé expresamente partidas, precios, IVA y condiciones de esta revisión DEMO.'
              : 'Confirmo que registro una respuesta simulada como operador DEMO; no recibí una aceptación real ni genero firma, correo o consentimiento contractual.'}
          </label>
          {error && (
            <p className="fl-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="rp-primary"
            disabled={!ack || (modal.type === 'response' && !decision)}
            onClick={() => {
              try {
                const current = readCase(visit.id)
                if (modal.type === 'review') markQuoteReviewed(current, modal, true)
                else recordClientResponse(current, modal, decision as ClientDecision, note, true)
                setModal(null)
                if (modal.type === 'response' && decision !== 'aceptada_demo') onProposal()
              } catch (e) {
                setError((e as Error).message)
              }
            }}
          >
            {modal.type === 'review'
              ? 'Confirmar cotización revisada DEMO'
              : 'Confirmar respuesta simulada'}
          </button>
        </FlowDialog>
      )}
    </div>
  )
}
export function FlowExecutionPanel({
  visit,
  onQuote,
  onOpenWork
}: {
  visit: FlowCase
  onQuote: () => void
  onOpenWork: () => void
}) {
  const state = businessState(visit),
    q = state.quote,
    work = state.work
  const [modal, setModal] = useState<QuoteRef | null>(null),
    [ack, setAck] = useState(false),
    [error, setError] = useState('')
  const existing = q
    ? state.transfers.find((t) => t.quoteId === q.id && t.revision === q.revision)
    : undefined
  return (
    <div className="fl-execution">
      <p>
        Solo una aceptación DEMO vigente de esta revisión habilita la precarga guiada. No se marcan
        trabajos como realizados automáticamente.
      </p>
      {!state.authorized ? (
        <>
          <p className="fl-business-warning">
            Sin aceptación DEMO vigente.{' '}
            {state.responseStale
              ? 'La cotización cambió y necesita nueva respuesta.'
              : 'Revisa la cotización y registra su respuesta por versión.'}
          </p>
          <button className="rp-primary" onClick={onQuote}>
            Revisar cotización y respuesta
            <ArrowRight />
          </button>
        </>
      ) : work ? (
        <>
          <p className="fl-business-ok">
            <strong>
              {work.id} · {work.status}
            </strong>
            <br />
            Origen: {work.sourceQuote?.quoteId} · Revisión {work.sourceQuote?.revision}
          </p>
          <dl className="fl-business-status">
            <div>
              <dt>Trabajos realizados por el operador</dt>
              <dd>
                {work.items.filter((i) => i.performed).length} de {work.items.length}
              </dd>
            </div>
            <div>
              <dt>Pendientes de realizar</dt>
              <dd>{work.items.filter((i) => !i.performed).length}</dd>
            </div>
            <div>
              <dt>Total del informe (solo realizados)</dt>
              <dd>{currency(workTotals(work).total)}</dd>
            </div>
          </dl>
          <button className="rp-primary" onClick={onOpenWork}>
            {work.approval ? 'Revisar informe final' : 'Registrar trabajos realizados'}
            <ArrowRight />
          </button>
        </>
      ) : existing ? (
        <>
          <p className="fl-business-warning">
            El informe {existing.workReportId} ya fue precargado para esta revisión, pero sus
            partidas se modificaron o el borrador se descartó. No se sobrescribirá ni se duplicará.
            Corrige las partidas por su ruta clásica o revisa la cotización para preparar otra
            versión.
          </p>
          <button className="rp-primary" onClick={onQuote}>
            Revisar cotización y respuesta
            <ArrowRight />
          </button>
        </>
      ) : (
        <>
          <p className="fl-notice">
            Cotización aceptada DEMO:{' '}
            <strong>
              {q?.id} · Revisión {q?.revision}
            </strong>
            . {q?.items.length} partidas se copiarán con todos los controles Realizado desactivados.
          </p>
          <button
            className="rp-primary"
            onClick={() => {
              if (q) {
                setModal({ quoteId: q.id, revision: q.revision })
                setAck(false)
                setError('')
              }
            }}
          >
            Preparar trabajo desde cotización
            <ArrowRight />
          </button>
        </>
      )}
      <p className="fl-help">
        El editor clásico continúa disponible para consulta y correcciones. Finalizar el informe
        mantiene la visita abierta hasta confirmar expresamente la entrega en su hito.
      </p>
      {state.transfers.length > 0 && (
        <details>
          <summary>Informes precargados conservados ({state.transfers.length})</summary>
          {state.transfers.map((t) => (
            <p key={t.workReportId} className="fl-help">
              {t.workReportId} · {t.quoteId} · Revisión {t.revision} · {date(t.date)}. Disponible en
              los borradores de Informes.
            </p>
          ))}
        </details>
      )}
      {modal && q && (
        <FlowDialog title="Confirmar precarga desde cotización" onClose={() => setModal(null)}>
          <p>
            <strong>
              {modal.quoteId} · Revisión {modal.revision}
            </strong>
          </p>
          <ul className="fl-preload-list">
            {q.items.map((i) => (
              <li key={i.id}>
                <strong>{i.description}</strong>
                <span>
                  {i.type} · {i.quantity.toLocaleString('es-CL')} × {currency(i.price)}
                </span>
                <small>No realizado</small>
              </li>
            ))}
          </ul>
          <p>
            Valor cotizado: {currency(workTotals(q).total)}. El informe comenzará en $0 CLP porque
            ninguna partida se habrá marcado Realizado.
          </p>
          {state.transfers.length > 0 && (
            <p>
              Se conserva cualquier informe anterior, con sus trabajos realizados y su revisión
              original. Esta acción no los reemplaza.
            </p>
          )}
          <label className="fl-business-consent">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />{' '}
            Confirmo la precarga de esta revisión aceptada DEMO, con todos los ítems sin realizar;
            no es una autorización legal.
          </label>
          {error && (
            <p className="fl-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="rp-primary"
            disabled={!ack}
            onClick={() => {
              try {
                prepareCaseWork(visit.id, modal, true)
                setModal(null)
                onOpenWork()
              } catch (e) {
                setError((e as Error).message)
              }
            }}
          >
            Confirmar precarga DEMO
          </button>
        </FlowDialog>
      )}
    </div>
  )
}
export function FlowDialog({
  title,
  children,
  onClose
}: {
  title: string
  children: ReactNode
  onClose: () => void
}) {
  return (
    <dialog
      className="wt-panel wt-dialog fl-business-dialog"
      aria-label={title}
      ref={(node) => {
        if (node && !node.open) node.showModal()
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <header>
        <h2>{title}</h2>
        <button className="rp-secondary" onClick={onClose}>
          Cerrar
        </button>
      </header>
      {children}
      <button className="rp-secondary wt-cancel" onClick={onClose}>
        Cancelar / volver
      </button>
    </dialog>
  )
}
