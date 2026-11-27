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
import { executionPreview, type ExecutionInput } from './executionPreview'

const methods: [ApprovalMethod, string][] = [
  ['in_person', 'Presencial'],
  ['phone', 'Teléfono'],
  ['written', 'Escrito'],
  ['other', 'Otro']
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
  client, context, quote, revision, stage, onPendingChange, registerSave, beforeExecution, beforeHandover, beforeWrite
}: {
  beforeWrite?:()=>Promise<void>
  beforeExecution?:()=>Promise<void>
  beforeHandover?:()=>Promise<boolean>
  registerSave?:(save:((exit:boolean)=>Promise<boolean>)|null)=>void
  onPendingChange?:(pending:boolean)=>void
  stage?: 4 | 5 | 6
  client: SupabaseClient
  context: Context
  quote: Quote
  revision: Revision
}) {
  const [executionPending,setExecutionPending]=useState(false)
  const [port, setPort] = useState<Port | null>(null)
  const [records, setRecords] = useState<Records | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [approvalMethod, setApprovalMethod] = useState<ApprovalMethod|''>(stage?'':'in_person')
  const [approvalNote, setApprovalNote] = useState('')
  const [approvalConfirmed, setApprovalConfirmed] = useState(false)
  const [checklist, setChecklist] = useState<HandoverChecklist>(emptyChecklist)
  const [handoverMethod, setHandoverMethod] = useState<HandoverMethod>('in_person')
  const [handoverNote, setHandoverNote] = useState('')
  const [handoverConfirmed, setHandoverConfirmed] = useState(false)
  useEffect(()=>{onPendingChange?.(busy||loading||executionPending||(!records?.approval&&(!!approvalNote||!!approvalMethod||approvalConfirmed))||(!records?.handover&&(!!handoverNote||handoverConfirmed||Object.values(checklist).some(Boolean))));return()=>onPendingChange?.(false)},[busy,loading,executionPending,records,approvalNote,approvalMethod,approvalConfirmed,handoverNote,handoverConfirmed,checklist,onPendingChange])
  const executionSave=useRef<((exit:boolean)=>Promise<boolean>)|null>(null)
  const bindExecution=useRef((save:((exit:boolean)=>Promise<boolean>)|null)=>{executionSave.current=save}).current
  useEffect(()=>{registerSave?.(saveStage);return()=>registerSave?.(null)})
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
    if (!port || lock.current || !records) return false
    const version = generation.current
    lock.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      await beforeWrite?.()
      if(!current(version))return false
      const response = await task()
      if (!current(version)) return
      const stored=await port.history(quote,revision)
      if(!current(version))return false
      if(![stored.approval,stored.execution,stored.handover].some(item=>item?.id===(response as {id:string}).id))throw Error('unconfirmed')
      onConfirmed(response)
      setRecords(stored)
      setMessage(confirmationMessage)
      return true
    } catch (e) {
      if (current(version)) setError(liveError(e))
      return false
    } finally {
      if (current(version)) {
        lock.current = false
        setBusy(false)
      }
    }
  }
  function liveError(e:unknown){const message=e instanceof Error?e.message:'';if(message==='scope')return 'Revisa el alcance técnico frente al presupuesto vigente antes de guardar.';if(message==='budget')return 'Revisa las partidas y obtén aprobación de la revisión vigente.';if(message==='stale')return 'La atención cambió. Conserva los campos y actualiza la evidencia.';const kind=(e as {kind?:string})?.kind;return kind==='order_not_ready'?'La OT no está habilitada para esta acción: debe estar en servicio para ejecución y lista para entrega. Actualiza la visita.':kind==='denied'?'Tu sesión o rol no permite guardar esta operación.':kind==='conflict'?'El registro cambió. Actualiza el historial antes de continuar.':kind==='disabled'?'Esta operación no está habilitada para el taller.':kind==='invalid'?'Revisa los campos y las confirmaciones requeridas.':navigator.onLine===false?'Sin conexión. Conserva esta pantalla y consulta el registro al reconectar.':errorText}
  async function saveStage(exit:boolean):Promise<boolean>{
    if(!port||loading||busy){setError('Espera a que termine la consulta o el guardado.');return false}
    try{
      const saved=await port.history(quote,revision);setRecords(saved)
      if(stage===4){
        if(saved.approval)return true
        if(exit&&!approvalNote&&!approvalConfirmed)return true
        if(!approvalMethod){setError('Selecciona un medio de aprobación.');return false}
        if(!approvalConfirmed){setError('Confirma la autorización del cliente.');return false}
        return (await recordApproval())===true
      }
      if(stage===5){if(saved.execution)return true;return await executionSave.current?.(exit)??false}
      if(stage===6){
        if(saved.handover)return true
        if(exit&&!handoverNote&&!handoverConfirmed&&!Object.values(checklist).some(Boolean))return true
        if(!Object.values(checklist).every(Boolean)){setError('Completa las cuatro verificaciones de entrega.');return false}
        if(!handoverConfirmed){setError('Confirma explícitamente la entrega del vehículo.');return false}
        if(!saved.execution){setError('Registra primero los trabajos realizados.');return false}
        return (await recordHandover(saved.execution))===true
      }
      return false
    }catch(e){setError(liveError(e));return false}
  }
  const recordApproval = () => write(
    () => port!.approval(quote, revision, approvalMethod as ApprovalMethod, approvalNote,
      requestId('approval', { revision: revision.id, method: approvalMethod, note: approvalNote })),
    a => setRecords(old => old ? { ...old, approval: a } : old),
    'Declaración de aprobación registrada por el servidor. No constituye firma verificada.'
  )
  const recordExecution = (input: ExecutionInput) => write(
    async () => {if(!executionPreview(revision,quote,input).readyForDraftPdf)throw {kind:'invalid'};const saved=await port!.history(quote,revision);if(!saved.approval)throw {kind:'invalid'};if(saved.execution)return saved.execution;if(beforeExecution)await beforeExecution();return port!.execution(quote, revision, input,
      requestId('execution', { revision: revision.id, input }))},
    e => setRecords(old => old ? { ...old, execution: e } : old),
    'Informe de ejecución declarado por operador y confirmado por el servidor.'
  )
  const recordHandover = (report: ExecutionRecord) => write(
    async () => {const saved=await port!.history(quote,revision);if(saved.handover)return saved.handover;if(!saved.approval||saved.execution?.id!==report.id)throw {kind:'invalid'};if(!handoverConfirmed||!Object.values(checklist).every(Boolean))throw {kind:'invalid'};if(beforeHandover&&!(await beforeHandover()))throw {kind:'invalid'};return port!.handover(report, checklist, handoverMethod, handoverNote,
      handoverConfirmed, requestId('handover', {
        report: report.id, checklist, method: handoverMethod, note: handoverNote
      }))},
    d => setRecords(old => old ? { ...old, handover: d } : old),
    'Constancia declarada por operador guardada. No se verificó firma ni recepción del cliente.'
  )
  return (
    <section className={"dashboard-card cp05-execution"+(stage?" flow-guided":"")} data-stage={stage} aria-label="Registro persistente de trabajos y entrega">
      {stage?<div className="flow-guided-summary"><p>{stage===4?'Registra la autorización del presupuesto antes de comenzar los trabajos.':stage===5?'Decide qué trabajos se realizaron y declara los pendientes. Al guardar el informe confirmado, la OT pasará a En servicio si corresponde.':'Verifica los antecedentes y declara la entrega. Se solicitará confirmar la OT como Lista para entregar.'}</p><strong>COT-{String(quote.number).padStart(6,'0')} · R{revision.revision} · {clp(revision.payload.totals.total)}{stage===4&&<span className="flow-approval-state"> · {loading?'Consultando':records?.approval?'Aprobación registrada':'Pendiente de aprobación'}</span>}</strong><small>Declaración del operador; no constituye firma digital ni pago.</small><button type="button" disabled={loading||busy} onClick={()=>void reload()}>Actualizar historial</button></div>:<><h3>Registro técnico y entrega · acceso privado</h3><p className="cp05-notice">Declaraciones del operador, no firma del cliente ni comprobante de pago.</p><button type="button" disabled={loading||busy} onClick={()=>void reload()}>Consultar registros guardados</button></>}
      {loading && <p role="status">Consultando registros autorizados…</p>}
      {error && <p role="alert" className="cp04-error">{error}</p>}
      {message && <p role="status">{message}</p>}
      {records && !loading && (
        <>
          {(!stage || stage===4) && <div>{!stage&&<h4>1. Autorización de cotización · declaración del operador</h4>}
          {records.approval ? (
            <p>Declaración registrada ({records.approval.method}). Nota guardada:
              {' '}{records.approval.note}. Asociada a esta revisión; no es una firma verificada.</p>
          ) : (
            <div className="cp05-execution-form">
              <label>Medio de aprobación
                <select aria-label={stage?"Medio de aprobación":undefined} value={approvalMethod} disabled={busy}
                  onChange={e => { setApprovalMethod(e.target.value as ApprovalMethod); setApprovalConfirmed(false) }}>
                  {stage&&<option value="">Selecciona un medio</option>}
                  {methods.map(([value,label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>Observaciones de la autorización
                <textarea placeholder="Ej.: Cliente autoriza el presupuesto por teléfono el día de hoy." value={approvalNote} maxLength={1000} rows={3} disabled={busy}
                  onChange={e => { setApprovalNote(e.target.value); setApprovalConfirmed(false) }} />
              </label>
              <label className="cp05-execution-confirm">
                <input type="checkbox" checked={approvalConfirmed} disabled={busy}
                  onChange={e => setApprovalConfirmed(e.target.checked)} />
                Declaro que verifiqué la aprobación de esta revisión concreta; entiendo que
                este registro es mi declaración, no una firma del cliente.
              </label>
              <button type="button" className="cp04-primary" disabled={
                busy || !approvalConfirmed
              } onClick={() => void recordApproval()}>
                Registrar declaración de aprobación
              </button>
            </div>
          )}
          </div>}
          {(!stage || stage===5) && <div>{!stage&&<h4>2. Trabajos seleccionados como realizados · registro del operador</h4>}
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
            <WorkExecutionDraft authorizeDownload={async()=>{if(!port)throw Error('ACCESS_REQUIRED');return port.history(quote,revision)}} guided={!!stage} registerSave={bindExecution} onPendingChange={setExecutionPending} revision={revision} quote={quote} onRecord={recordExecution} />
          ) : (
            <p>Primero registra la declaración de aprobación de esta revisión.</p>
          )}
          </div>}
          {(!stage || stage===6) && <div>{!stage&&<h4>3. Constancia de entrega · declaración del operador</h4>}
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
              <label>Nota concreta de entrega
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
                busy || !handoverConfirmed || !Object.values(checklist).every(Boolean)
              } onClick={() => void recordHandover(records.execution!)}>
                Registrar constancia del operador (OT debe estar lista)
              </button>
            </div>
          ) : (
            <p>Registra primero el informe de ejecución. El servidor también exigirá que la OT esté lista para entregar.</p>
          )}
          </div>}
          {!stage&&<small>Si se cambia la cotización, sus nuevos documentos requieren otra revisión;
            los registros históricos originales se conservan sin sobrescritura.
            Ninguna acción de esta pantalla envía correos ni cierra automáticamente la OT.</small>}
        </>
      )}
    </section>
  )
}
