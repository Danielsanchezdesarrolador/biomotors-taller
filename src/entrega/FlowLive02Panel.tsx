/**
 * Authenticated rollout-only execution / handover candidate.
 * No real email, client signature, payment or automatic closing of work orders.
 * Unless the SQL candidate has been separately installed, history() fails
 * and all write forms remain disabled (no false completion).
 */
import { useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Context } from '../auth/controller'
import type { Quote, Revision } from '../cp05/contracts'
import { clp } from '../ordenes/orderMoney'
import { WorkExecutionDraft } from './WorkExecutionDraft'
import {
  flowLiveCandidate, type ApprovalMethod, type ExecutionRecord,
  type HandoverChecklist, type HandoverMethod
} from './flowLiveCandidate'
import type { ExecutionInput } from './executionPreview'

const methods: [ApprovalMethod, string][] = [
  ['in_person', 'Declaración presencial del operador'],
  ['phone', 'Confirmación telefónica anotada'],
  ['written', 'Confirmación escrita declarada'],
  ['other', 'Otro medio declarado']
]
const handoverMethods: [HandoverMethod, string][] = [
  ['in_person', 'Entrega presencial declarada'],
  ['authorized_pickup', 'Retiro por tercero autorizado declarado'],
  ['other', 'Otro modo de entrega declarado']
]
const emptyChecklist: HandoverChecklist = {
  vehicleChecked: false, workChecked: false,
  documentsChecked: false, pendingExplained: false
}
const keys: { key: keyof HandoverChecklist; label: string }[] = [
  { key: 'vehicleChecked', label: 'Verifiqué vehículo e identidad de quien retira.' },
  { key: 'workChecked', label: 'Revisé trabajos marcados y pendientes con el receptor.' },
  { key: 'documentsChecked', label: 'Revisé cotización e informe de ejecución.' },
  { key: 'pendingExplained', label: 'Expliqué pendientes y recomendaciones registradas.' }
]
const errorText = 'No se confirmó la operación. Consulta el historial antes de volver a intentarlo.'
type Port = ReturnType<typeof flowLiveCandidate>
type Records = Awaited<ReturnType<Port['history']>>
export function FlowLive02Panel({
  client, context, quote, revision
}: {
  client: SupabaseClient
  context: Context
  quote: Quote
  revision: Revision
}) {
  const [port, setPort] = useState<Port | null>(null)
  const [records, setRecords] = useState<Records | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [approvalMethod, setApprovalMethod] = useState<ApprovalMethod>('in_person')
  const [approvalNote, setApprovalNote] = useState('')
  const [approvalConfirmed, setApprovalConfirmed] = useState(false)
  const [checklist, setChecklist] = useState<HandoverChecklist>(emptyChecklist)
  const [handoverMethod, setHandoverMethod] = useState<HandoverMethod>('in_person')
  const [handoverNote, setHandoverNote] = useState('')
  const [handoverConfirmed, setHandoverConfirmed] = useState(false)
  const lock = useRef(false)
  const requestIds = useRef<Record<string, { key: string; id: string }>>({})
  const alive = useRef(true)
  const generation = useRef(0)
  const current = (version: number) => alive.current && generation.current === version

  function requestId(kind: string, payload: unknown) {
    const key = JSON.stringify(payload)
    if (!requestIds.current[kind] || requestIds.current[kind].key !== key)
      requestIds.current[kind] = { key, id: crypto.randomUUID() }
    return requestIds.current[kind].id
  }
  useEffect(() => {
    alive.current = true
    const version = ++generation.current
    const connection = flowLiveCandidate(client, context, { explicitlyApproved: true })
    lock.current = false
    setPort(connection)
    setRecords(null)
    setBusy(false)
    setMessage('')
    setLoading(true)
    setError('')
    void connection.history(quote, revision)
      .then(result => { if (current(version)) setRecords(result) })
      .catch(() => {
        if (current(version)) setError('El registro persistente no está disponible o no tienes acceso. No se realizó ninguna operación.')
      })
      .finally(() => { if (current(version)) setLoading(false) })
    return () => {
      alive.current = false
      generation.current++
      connection.dispose()
    }
  }, [client, context, quote.id, revision.id])
  async function reload() {
    if (!port || lock.current) return
    const version = generation.current
    setLoading(true)
    setError('')
    try {
      const response = await port.history(quote, revision)
      if (current(version)) setRecords(response)
    } catch {
      if (current(version)) setError('No se pudo recuperar el registro del servidor. No registres una entrega sin comprobarlo.')
    } finally {
      if (current(version)) setLoading(false)
    }
  }
  async function write<T>(
    task: () => Promise<T>,
    onConfirmed: (item: T) => void,
    confirmationMessage: string
  ) {
    if (!port || lock.current || !records) return
    const version = generation.current
    lock.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const response = await task()
      if (!current(version)) return
      onConfirmed(response)
      setMessage(confirmationMessage)
    } catch {
      if (current(version)) setError(errorText)
    } finally {
      if (current(version)) {
        lock.current = false
        setBusy(false)
      }
    }
  }
  const recordApproval = () => write(
    () => port!.approval(quote, revision, approvalMethod, approvalNote,
      requestId('approval', { revision: revision.id, method: approvalMethod, note: approvalNote })),
    a => setRecords(old => old ? { ...old, approval: a } : old),
    'Declaración de aprobación registrada por el servidor. No constituye firma verificada.'
  )
  const recordExecution = (input: ExecutionInput) => write(
    () => port!.execution(quote, revision, input,
      requestId('execution', { revision: revision.id, input })),
    e => setRecords(old => old ? { ...old, execution: e } : old),
    'Informe de ejecución declarado por operador y confirmado por el servidor.'
  )
  const recordHandover = (report: ExecutionRecord) => write(
    () => port!.handover(report, checklist, handoverMethod, handoverNote,
      handoverConfirmed, requestId('handover', {
        report: report.id, checklist, method: handoverMethod, note: handoverNote
      })),
    d => setRecords(old => old ? { ...old, handover: d } : old),
    'Constancia declarada por operador guardada. No se verificó firma ni recepción del cliente.'
  )
  return (
    <section className="dashboard-card cp05-execution" aria-label="Registro persistente de trabajos y entrega">
      <h3>Registro técnico y entrega · acceso privado</h3>
      <p className="cp05-notice">
        Declaraciones registradas por personal del taller, NO firma del cliente,
        comprobante tributario, correo enviado ni prueba independiente de entrega.
        Requiere servidor autorizado, revisión emitida e identidad verificada.
      </p>
      <p>COT-{String(quote.number).padStart(6,'0')} · Revisión {revision.revision}
        {' '}· OT {quote.order_id}</p>
      <button type="button" className="cp04-secondary" disabled={loading || busy}
        onClick={() => void reload()}>
        Consultar registros guardados
      </button>
      {loading && <p role="status">Consultando registros autorizados…</p>}
      {error && <p role="alert" className="cp04-error">{error}</p>}
      {message && <p role="status">{message}</p>}
      {records && !loading && (
        <>
          <h4>1. Autorización de cotización · declaración del operador</h4>
          {records.approval ? (
            <p>Declaración registrada ({records.approval.method}). Nota guardada:
              {' '}{records.approval.note}. Asociada a esta revisión; no es una firma verificada.</p>
          ) : (
            <div className="cp05-execution-form">
              <label>Medio declarado de aprobación
                <select value={approvalMethod} disabled={busy}
                  onChange={e => { setApprovalMethod(e.target.value as ApprovalMethod); setApprovalConfirmed(false) }}>
                  {methods.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>Descripción concreta de la autorización (mínimo 12 caracteres)
                <textarea value={approvalNote} maxLength={1000} rows={3} disabled={busy}
                  onChange={e => { setApprovalNote(e.target.value); setApprovalConfirmed(false) }} />
              </label>
              <label className="cp05-execution-confirm">
                <input type="checkbox" checked={approvalConfirmed} disabled={busy}
                  onChange={e => setApprovalConfirmed(e.target.checked)} />
                Declaro que verifiqué la aprobación de esta revisión concreta; entiendo que
                este registro es mi declaración, no una firma del cliente.
              </label>
              <button type="button" className="cp04-primary" disabled={
                busy || !approvalConfirmed || approvalNote.trim().length < 12
              } onClick={() => void recordApproval()}>
                Registrar declaración de aprobación
              </button>
            </div>
          )}
          <h4>2. Trabajos seleccionados como realizados · registro del operador</h4>
          {records.execution ? (
            <div className="cp05-execution-totals">
              <p>Registro confirmado por el servidor. No es comprobante de pago ni garantía de ejecución.</p>
              <p>Total cotizado: <strong>{clp(records.execution.quoted_total)}</strong></p>
              <p>Total declarado: <strong>{clp(records.execution.performed_total)}</strong></p>
              <ul aria-label="Partidas declaradas de esta revisión">
                {revision.payload.items.map(item => (
                  <li key={item.id}>
                    <strong>{records.execution!.decisions[item.id] === 'performed'
                      ? 'Marcado realizado' : 'No realizado'}</strong>
                    {' · '}{item.description} · Neto cotizado: {clp(item.line_net)}
                  </li>
                ))}
              </ul>
              {records.execution.pending_note &&
                <p>Trabajos pendientes: {records.execution.pending_note}</p>}
            </div>
          ) : records.approval ? (
            <WorkExecutionDraft revision={revision} quote={quote} onRecord={recordExecution} />
          ) : (
            <p>Primero registra la declaración de aprobación de esta revisión.</p>
          )}
          <h4>3. Constancia de entrega · declaración del operador</h4>
          {records.handover ? (
            <p>Constancia registrada por el operador ({records.handover.handover_method}).
              Nota guardada: {records.handover.handover_note}.
              No acredita firma, lectura del correo ni pago del cliente.</p>
          ) : records.execution ? (
            <div className="cp05-execution-form">
              {keys.map(({ key,label }) => (
                <label key={key} className="cp05-execution-confirm">
                  <input type="checkbox" checked={checklist[key]} disabled={busy}
                    onChange={e => {
                      setChecklist(old => ({ ...old, [key]: e.target.checked }))
                      setHandoverConfirmed(false)
                    }}/>
                  {label}
                </label>
              ))}
              <label>Modalidad de entrega declarada
                <select value={handoverMethod} disabled={busy}
                  onChange={e => { setHandoverMethod(e.target.value as HandoverMethod); setHandoverConfirmed(false) }}>
                  {handoverMethods.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>Nota concreta de entrega (mínimo 12 caracteres)
                <textarea maxLength={1000} rows={3} value={handoverNote} disabled={busy}
                  onChange={e => { setHandoverNote(e.target.value); setHandoverConfirmed(false) }} />
              </label>
              <label className="cp05-execution-confirm">
                <input type="checkbox" checked={handoverConfirmed} disabled={busy}
                  onChange={e => setHandoverConfirmed(e.target.checked)} />
                Confirmo la entrega descrita como declaración del operador.
                No se obtuvo una firma digital del cliente.
              </label>
              <button className="cp04-primary" type="button" disabled={
                busy || !handoverConfirmed || handoverNote.trim().length < 12 ||
                !Object.values(checklist).every(Boolean)
              } onClick={() => void recordHandover(records.execution!)}>
                Registrar constancia del operador (OT debe estar lista)
              </button>
            </div>
          ) : (
            <p>Registra primero el informe de ejecución. El servidor también exigirá que la OT esté lista para entregar.</p>
          )}
          <small>Si se cambia la cotización, sus nuevos documentos requieren otra revisión;
            los registros históricos originales se conservan sin sobrescritura.
            Ninguna acción de esta pantalla envía correos ni cierra automáticamente la OT.</small>
        </>
      )}
    </section>
  )
}
