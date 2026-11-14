import { useState } from 'react'
import { ArrowRight, ClipboardCheck } from 'lucide-react'
import { beginCaseProposal, readCase, type FlowCase } from './flowSession'
import { businessState, confirmProposal } from './flowBusiness'
import {
  editWorkDocument,
  putWorkItem,
  validateWorkDocument,
  type WorkItem,
  type WorkPatch
} from '../informes/trabajos/trabajosData'
import { readWorkDocument, rememberWorkDocument } from '../informes/trabajos/trabajosSession'
import { WorkItemForm, WorkItemsTable } from '../informes/trabajos/WorkItemsEditor'
import { FlowDialog } from './FlowQuotePanels'
type Modal =
  | { type: 'item'; item?: WorkItem; revision: number }
  | { type: 'delete'; id: string }
  | { type: 'confirm'; quoteId: string; revision: number }
export function FlowProposalPanel({
  visit,
  onInspection,
  onQuote,
  onConfirmed
}: {
  visit: FlowCase
  onInspection: () => void
  onQuote: () => void
  onConfirmed: () => void
}) {
  const [modal, setModal] = useState<Modal | null>(null),
    [error, setError] = useState(''),
    [ack, setAck] = useState(false)
  const state = businessState(visit),
    quote = state.quote
  function edit(patch: WorkPatch) {
    if (!quote) return
    rememberWorkDocument(editWorkDocument(readWorkDocument(quote.id)!, patch))
    setError('')
  }
  function open(next: Modal) {
    setModal(next)
    setError('')
    setAck(false)
  }
  if (!quote) {
    return (
      <>
        <p>
          El diagnóstico y los trabajos se definen por el mecánico; el motivo del cliente y las X de
          la inspección son antecedentes, no reparaciones automáticas.
        </p>
        <button
          className="rp-primary"
          onClick={() => {
            try {
              beginCaseProposal(visit.id)
            } catch (e) {
              setError((e as Error).message)
            }
          }}
        >
          Definir trabajos
          <ArrowRight />
        </button>
        {error && (
          <p className="fl-error" role="alert">
            {error}
          </p>
        )}
      </>
    )
  }
  const errors = validateWorkDocument(quote)
  if (!quote.diagnosis.trim()) errors.unshift('Completa el diagnóstico profesional.')
  return (
    <div className="fl-proposal">
      <p className="fl-notice">
        Propuesta sobre <strong>{quote.id}</strong> · Revisión {quote.revision}. La lista de
        partidas es la misma que utiliza BT-COT-01; no se copia a otra propuesta.
      </p>
      <details className="fl-reference">
        <summary>Revisar antecedente multipunto</summary>
        <p>
          La inspección debe estar finalizada para confirmar esta propuesta. No genera precios ni
          diagnósticos.
        </p>
        <button className="rp-secondary" onClick={onInspection}>
          Consultar inspección
        </button>
      </details>
      <div className="fl-original">
        <strong>Motivo original del cliente</strong>
        <p>{visit.reception.reason}</p>
      </div>
      <div className="fl-proposal-fields">
        {(
          [
            ['diagnosis', 'Diagnóstico profesional del mecánico', 2500],
            ['recommendations', 'Observaciones y trabajos pendientes', 2500],
            ['comments', 'Comentarios de la propuesta', 500]
          ] as const
        ).map(([key, label, max]) => (
          <label key={key}>
            {label}
            <textarea
              aria-label={label}
              maxLength={max}
              rows={3}
              value={quote[key]}
              onChange={(e) => edit({ [key]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <div className="wt-panel fl-embedded-items">
        <WorkItemsTable
          document={quote}
          onEdit={(item) => open({ type: 'item', item, revision: quote.revision })}
          onDelete={(item) => open({ type: 'delete', id: item.id })}
          onPerformed={() => {}}
        />
      </div>
      <p className="fl-help">
        Origen de las partidas:{' '}
        {quote.items
          .map((i) => `${i.description}: ${i.origin ?? 'Antecedente revisado'}`)
          .join(' · ') || 'Sin partidas definidas.'}
      </p>
      {errors.length > 0 && (
        <div className="fl-notice">
          Antes de confirmar:
          <ul>
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
      {state.proposalValid ? (
        <>
          <p className="fl-business-ok">
            <ClipboardCheck />
            Propuesta vigente confirmada por el operador DEMO.
          </p>
          <button className="rp-primary" onClick={onQuote}>
            Preparar cotización
            <ArrowRight />
          </button>
        </>
      ) : (
        <button
          className="rp-primary"
          disabled={errors.length > 0}
          onClick={() => open({ type: 'confirm', quoteId: quote.id, revision: quote.revision })}
        >
          Revisar y confirmar propuesta
          <ClipboardCheck />
        </button>
      )}
      {modal && (
        <FlowDialog
          title={
            modal.type === 'item'
              ? 'Partida de la propuesta'
              : modal.type === 'delete'
                ? 'Quitar partida'
                : 'Confirmación del mecánico · DEMO'
          }
          onClose={() => setModal(null)}
        >
          {modal.type === 'item' ? (
            <WorkItemForm
              item={modal.item}
              onSave={(item) => {
                const current = readWorkDocument(quote.id)!
                if (current.revision !== modal.revision)
                  throw new Error('La propuesta cambió. Cierra y vuelve a editar la partida.')
                rememberWorkDocument(putWorkItem(current, item))
                setModal(null)
              }}
            />
          ) : modal.type === 'delete' ? (
            <>
              <p>
                Se eliminará la partida y cualquier confirmación anterior deberá revisarse de nuevo.
              </p>
              <button
                className="rp-primary"
                onClick={() => {
                  edit({ items: quote.items.filter((i) => i.id !== modal.id) })
                  setModal(null)
                }}
              >
                Confirmar eliminación
              </button>
            </>
          ) : (
            <>
              <p>
                {quote.items.length} partidas · {quote.id} · Revisión {modal.revision}
              </p>
              <p>Confirmar no aprueba la cotización ni registra una respuesta del cliente.</p>
              <label className="fl-business-consent">
                <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />{' '}
                Confirmo que revisé expresamente el diagnóstico, las reparaciones, cantidades,
                precios y pendientes de esta propuesta DEMO.
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
                    confirmProposal(readCase(visit.id), modal, true)
                    setModal(null)
                    onConfirmed()
                  } catch (e) {
                    setError((e as Error).message)
                  }
                }}
              >
                Confirmar propuesta DEMO
              </button>
            </>
          )}
        </FlowDialog>
      )}
    </div>
  )
}
