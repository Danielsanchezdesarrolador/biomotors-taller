import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  FileDown,
  Plus,
  Save,
  Send,
  RefreshCw,
  FileText,
  LockKeyhole
} from 'lucide-react'
import type { Context } from '../auth/controller'
import type { OrderWithVehicle } from '../ordenes/cp04Contracts'
import { WorkItemsTable, WorkItemForm } from '../informes/trabajos/WorkItemsEditor'
import type { WorkItem } from '../informes/trabajos/workItemCore'
import { currency } from '../informes/trabajos/workItemCore'
import { calculateTotals } from '../ordenes/orderMoney'
import {
  QuoteFailure,
  draftFrom,
  draftPayload,
  previewSnapshot,
  quoteMessage,
  quoteNumber,
  validateQuoteItem,
  type Bundle,
  type Draft,
  type Quote,
  type Revision
} from './contracts'
import type { Cp05Port } from './repository'
import { documentOperation } from './documentClient'
import { localDraft, rememberDraft, clearLocalDraft } from './temporaryDraft'
import '../informes/trabajos/trabajos.css'
import './cp05.css'
const empty: Draft = { price_basis: 'net', valid_days: 10, terms: '', comments: '', items: [] }
export function QuotePanel({
  repository,
  context,
  initialVehicleId,
  initialOrderId,
  onBack
}: {
  repository: Cp05Port
  context: Context
  initialVehicleId?: string
  initialOrderId?: string
  onBack: () => void
}) {
  const [quotes, setQuotes] = useState<Quote[]>([]),
    [orders, setOrders] = useState<OrderWithVehicle[]>([]),
    [orderId, setOrderId] = useState(initialOrderId || '')
  const [bundle, setBundle] = useState<Bundle | null>(null),
    [draft, setDraft] = useState<Draft>(empty),
    [busy, setBusy] = useState(true),
    [message, setMessage] = useState(''),
    [error, setError] = useState('')
  const [editing, setEditing] = useState<WorkItem | true | null>(null),
    [reason, setReason] = useState(''),
    [recovery, setRecovery] = useState<Draft | null>(null)
  const active = useRef(true),
    sequence = useRef(0),
    lock = useRef(false),
    operation = useRef<{ fingerprint: string; id: string }>({
      fingerprint: '',
      id: crypto.randomUUID()
    })
  const canWrite = ['owner', 'admin', 'reception'].includes(context.role),
    editable = canWrite && bundle?.quote.status === 'draft' && !bundle.quote.issue_pending
  const dirty =
    !!bundle &&
    JSON.stringify(draftPayload(draft)) !== JSON.stringify(draftPayload(draftFrom(bundle)))
  const totals = calculateTotals(draft.items)
  const op = (fingerprint: string) => {
    if (operation.current.fingerprint !== fingerprint)
      operation.current = { fingerprint, id: crypto.randomUUID() }
    return operation.current.id
  }
  useEffect(() => {
    active.current = true
    let cancelled = false
    async function start() {
      try {
        const [list, source] = await Promise.all([
          repository.list(initialVehicleId),
          repository.orders()
        ])
        if (cancelled || !active.current) return
        setQuotes(list)
        setOrders(
          initialVehicleId ? source.filter((o) => o.vehicle.id === initialVehicleId) : source
        )
        const cached = localDraft(context.userId, context.workshop.id)
        if (initialOrderId) {
          const q = await repository.forOrder(initialOrderId)
          if (q) await open(q.id)
        } else if (cached && !initialVehicleId) {
          await open(cached.quoteId)
        }
      } catch (e) {
        if (!cancelled && active.current) failure(e)
      } finally {
        if (!cancelled && active.current) setBusy(false)
      }
    }
    void start()
    return () => {
      cancelled = true
      active.current = false
      sequence.current++
    }
  }, [repository])
  useEffect(() => {
    if (!bundle || !dirty || !canWrite) return
    const fingerprint =
      'save:' +
      bundle.quote.id +
      ':' +
      bundle.quote.version +
      ':' +
      JSON.stringify(draftPayload(draft))
    rememberDraft({
      userId: context.userId,
      workshopId: context.workshop.id,
      quoteId: bundle.quote.id,
      version: bundle.quote.version,
      draft,
      requestId: op(fingerprint),
      fingerprint,
      at: Date.now()
    })
  }, [bundle, draft, dirty, canWrite, context.userId, context.workshop.id])
  function failure(e: unknown) {
    if (e instanceof QuoteFailure && e.kind === 'denied') {
      clearLocalDraft()
      setBundle(null)
      setDraft(empty)
      setQuotes([])
      setOrders([])
      setEditing(null)
      setRecovery(null)
    }
    setError(quoteMessage(e))
  }
  async function open(id: string) {
    if (dirty && !window.confirm('Hay cambios sin guardar. ¿Abrir otra cotización?')) return
    const request = ++sequence.current
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const loaded = await repository.load(id)
      if (!active.current || request !== sequence.current) return
      const cached = localDraft(context.userId, context.workshop.id)
      setRecovery(null)
      setEditing(null)
      setBundle(loaded)
      setOrderId(loaded.quote.order_id)
      if (
        cached &&
        cached.quoteId === id &&
        cached.version === loaded.quote.version &&
        loaded.quote.status === 'draft'
      ) {
        setDraft(cached.draft)
        operation.current = { id: cached.requestId, fingerprint: cached.fingerprint }
        setMessage(
          'Cambios temporales recuperados en esta pestaña. Todavía no están guardados en Supabase.'
        )
      } else {
        setDraft(draftFrom(loaded))
        if (cached?.quoteId === id) {
          setRecovery(cached.draft)
          setMessage(
            'El servidor tiene otra versión. Se cargó la cotización vigente; conserva o revisa el borrador temporal antes de sustituirlo.'
          )
        }
      }
    } catch (e) {
      if (active.current && request === sequence.current) failure(e)
    } finally {
      if (active.current && request === sequence.current) setBusy(false)
    }
  }
  async function action(kind: 'create' | 'save' | 'revise' | 'void') {
    if (lock.current || !canWrite) return
    lock.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      let next: Bundle
      if (kind === 'create') next = await repository.open(orderId, op('create:' + orderId))
      else if (!bundle) return
      else if (kind === 'save')
        next = await repository.save(
          bundle.quote,
          draft,
          op(
            'save:' +
              bundle.quote.id +
              ':' +
              bundle.quote.version +
              ':' +
              JSON.stringify(draftPayload(draft))
          )
        )
      else if (kind === 'revise')
        next = await repository.revise(
          bundle.quote,
          reason,
          op('revise:' + bundle.quote.id + ':' + bundle.quote.version + ':' + reason)
        )
      else
        next = await repository.void(
          bundle.quote,
          reason,
          op('void:' + bundle.quote.id + ':' + bundle.quote.version + ':' + reason)
        )
      if (!active.current) return
      const list = await repository.list(initialVehicleId)
      if (!active.current) return
      clearLocalDraft()
      setEditing(null)
      setBundle(next)
      setDraft(draftFrom(next))
      setReason('')
      setQuotes(list)
      if (active.current)
        setMessage(
          kind === 'save'
            ? 'Borrador confirmado en Supabase.'
            : kind === 'create'
              ? 'Borrador creado y numerado por el servidor.'
              : kind === 'void'
                ? 'Cotización anulada; las revisiones y archivos anteriores se conservan.'
                : 'Nuevo borrador abierto; la revisión emitida permanece intacta.'
        )
    } catch (e) {
      if (active.current) failure(e)
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  function item(value: WorkItem) {
    const next = draft.items.some((i) => i.id === value.id)
      ? draft.items.map((i) => (i.id === value.id ? value : i))
      : [...draft.items, value]
    try {
      draftPayload({ ...draft, items: next })
    } catch {
      throw Error(
        'Revisa las partidas; no se permiten descripciones repetidas de la misma categoría.'
      )
    }
    setDraft({ ...draft, items: next })
    setEditing(null)
  }
  async function pdf(revision?: Revision) {
    if (!bundle || lock.current) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      // Official archived bytes must be downloaded through the approved private archive.
      // The current rollout has no Storage authorization; only a clearly marked draft can be generated.
      const renderer = await import('./pdf')
      const bytes = revision
        ? await repository.documents.download(revision)
        : await renderer.browserQuotePdf(previewSnapshot(bundle, draft), true)
      if (active.current)
        renderer.downloadPdf(
          bytes,
          `${quoteNumber(bundle.quote)}-${revision ? 'r' + revision.revision : 'borrador'}.pdf`
        )
    } catch {
      if (active.current)
        setError(
          'No se pudo generar el PDF. El archivo privado emitido sigue bloqueado hasta autorizar su almacenamiento.'
        )
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  async function documentAction(kind: 'issue' | 'send' | 'cancel', revision?: Revision) {
    if (!bundle || lock.current || !canWrite) return
    if (kind === 'issue' && dirty) {
      setError('Guarda y revisa el borrador antes de emitir.')
      return
    }
    if (
      !window.confirm(
        kind === 'issue'
          ? '¿Emitir y archivar esta revisión inmutable?'
          : kind === 'cancel'
            ? '¿Cancelar la reserva pendiente sin emitir?'
            : `¿Enviar ${quoteNumber(bundle.quote)} revisión ${revision?.revision} a ${revision?.payload.customer.full_name || ''} <${revision?.payload.customer.email || ''}>? ${bundle.quote.status === 'draft' ? 'Los cambios del borrador actual no se incluyen.' : ''}`
      )
    )
      return
    lock.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const requestId = documentOperation(context, bundle.quote)
      let status = ''
      if (kind === 'issue') {
        await repository.documents.issue(bundle.quote, requestId)
        status = 'Revisión emitida y archivo privado verificado.'
      } else if (kind === 'cancel') {
        await repository.documents.cancel(bundle.quote, requestId)
        status = 'Reserva cancelada; borrador disponible para revisión.'
      } else if (revision) {
        const attempts = bundle.deliveries.filter((d) => d.revision_id === revision.id)
        const attempt = 1 + Math.max(0, ...attempts.map((d) => d.attempt))
        const result = await repository.documents.send(revision, attempt)
        status =
          result === 'failed'
            ? 'El proveedor rechazó el envío. Revisa la trazabilidad.'
            : result === 'already_sent'
              ? 'El proveedor ya confirmó esta revisión; no se generó otro envío.'
              : 'Envío aceptado por el proveedor; no acredita lectura ni entrega en la bandeja.'
      }
      const next = await repository.load(bundle.quote.id)
      if (!active.current) return
      setBundle(next)
      setDraft(draftFrom(next))
      setMessage(status)
    } catch (e) {
      if (active.current) failure(e)
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  return (
    <section className="cp05-panel wt-panel" aria-label="Cotizaciones privadas CP05">
      <header className="cp05-heading">
        <button className="cp04-secondary" onClick={onBack}>
          <ArrowLeft size={17} /> Volver al panel anterior
        </button>
        <div>
          <h1>Cotizaciones</h1>
          <p>Orden, cliente y vehículo del taller autorizado.</p>
        </div>
      </header>
      <p className="cp05-notice">
        <LockKeyhole size={19} /> Precios netos CLP · IVA 19 %.{' '}
        {repository.documents.enabled
          ? 'Emisión y archivo sujetos a autorización del servidor.'
          : 'Emisión archivada y correos desactivados.'}{' '}
        No se registra aceptación del cliente.
      </p>
      {busy && <p role="status">Consultando o guardando la cotización…</p>}
      {error && (
        <p className="cp04-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="cp04-success" role="status">
          {message}
        </p>
      )}
      {bundle && (
        <output className="cp05-floating-total" aria-label="Total siempre visible">
          <span>Total · IVA incluido</span>
          <strong>{currency(totals.total)}</strong>
        </output>
      )}
      <div className="cp05-layout">
        <aside className="dashboard-card cp05-list">
          <h2>{initialVehicleId ? 'Cotizaciones del vehículo' : 'Documentos recientes'}</h2>
          <p>Hasta 50 cotizaciones autorizadas.</p>
          {!busy && !quotes.length && <p>Sin cotizaciones registradas.</p>}
          {quotes.map((q) => (
            <button
              disabled={busy}
              key={q.id}
              className="cp04-secondary"
              onClick={() => void open(q.id)}
            >
              {quoteNumber(q)} · R{q.issued_revision} ·{' '}
              {q.status === 'draft' ? 'Borrador' : q.status === 'issued' ? 'Emitida' : 'Anulada'}
            </button>
          ))}
          <label>
            Orden CP04
            <select disabled={busy} value={orderId} onChange={(e) => setOrderId(e.target.value)}>
              <option value="">Selecciona una orden</option>
              {orders.map((o) => (
                <option key={o.order.id} value={o.order.id}>
                  {o.vehicle.plate || 'Sin patente'} · {o.vehicle.make} {o.vehicle.model} ·{' '}
                  {o.order.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
          <small>
            Selección de las últimas 40 órdenes. Desde CP04 puedes abrir cualquier orden recuperada.
          </small>
          {canWrite && (
            <button
              className="cp04-primary"
              disabled={busy || !orderId}
              onClick={() => {
                if (!dirty || window.confirm('¿Continuar sin guardar los cambios actuales?'))
                  void action('create')
              }}
            >
              <Plus size={16} /> Crear / recuperar borrador de la OT
            </button>
          )}
        </aside>
        <div className="cp05-editor">
          {!bundle && !busy && (
            <div className="dashboard-card cp05-empty">
              <FileText />
              <h2>Prepara una cotización desde una orden</h2>
              <p>Solo se utilizan registros confirmados de CP03 y CP04.</p>
            </div>
          )}
          {bundle && (
            <>
              <div className="dashboard-card cp05-context">
                <h2>
                  {quoteNumber(bundle.quote)} ·{' '}
                  {bundle.quote.issued_revision
                    ? `Revisión emitida ${bundle.quote.issued_revision}`
                    : 'Sin revisiones emitidas'}
                </h2>
                <strong>{bundle.source.customer.full_name}</strong>
                <p>
                  {bundle.source.vehicle.make} {bundle.source.vehicle.model} ·{' '}
                  {bundle.source.vehicle.plate || 'Sin patente'}
                </p>
                <small>
                  OT {bundle.quote.order_id} · {bundle.source.workshop.name}
                </small>
                <p>
                  {bundle.quote.status === 'draft'
                    ? dirty
                      ? 'Cambios locales sin guardar'
                      : 'Borrador guardado'
                    : bundle.quote.status === 'issued'
                      ? 'Emitida e inmutable'
                      : 'Anulada'}{' '}
                  · Versión {bundle.quote.version}
                </p>
                {bundle.quote.issue_pending && (
                  <p>Preparación de archivo pendiente; edición bloqueada.</p>
                )}
              </div>
              {recovery && editable && (
                <div className="cp05-notice">
                  <p>
                    Existe un borrador temporal de otra versión. Revisa la versión guardada antes de
                    recuperar tus partidas.
                  </p>
                  <button
                    className="cp04-secondary"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          '¿Recuperar tus partidas para revisión sobre la versión vigente? No se guardarán hasta tu confirmación.'
                        )
                      ) {
                        setDraft(recovery)
                        setRecovery(null)
                      }
                    }}
                  >
                    Recuperar cambios para revisión
                  </button>
                </div>
              )}
              <WorkItemsTable
                document={{ mode: 'quote', items: draft.items }}
                onEdit={(v) => setEditing(v || true)}
                onDelete={(v) =>
                  setDraft({ ...draft, items: draft.items.filter((i) => i.id !== v.id) })
                }
                onPerformed={() => {}}
                readOnly={!editable || busy}
              />
              {editing && editable && !busy && (
                <div className="dashboard-card cp05-item" role="region" aria-label="Editar partida">
                  <WorkItemForm
                    key={editing === true ? 'new' : editing.id}
                    item={editing === true ? undefined : editing}
                    onSave={item}
                    validate={validateQuoteItem}
                    minimumPrice={1}
                    saveLabel="Confirmar partida en el borrador"
                  />
                  <button className="cp04-secondary" onClick={() => setEditing(null)}>
                    Cancelar edición de partida
                  </button>
                </div>
              )}
              <fieldset disabled={!editable || busy} className="dashboard-card cp05-conditions">
                <legend>Condiciones y observaciones</legend>
                <label>
                  Vigencia (días)
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={draft.valid_days}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      if (Number.isInteger(n) && n >= 1 && n <= 365)
                        setDraft({ ...draft, valid_days: n })
                    }}
                  />
                </label>
                <label>
                  Condiciones
                  <textarea
                    maxLength={2000}
                    rows={3}
                    value={draft.terms}
                    onChange={(e) => setDraft({ ...draft, terms: e.target.value })}
                  />
                </label>
                <label>
                  Observaciones
                  <textarea
                    maxLength={2000}
                    rows={3}
                    value={draft.comments}
                    onChange={(e) => setDraft({ ...draft, comments: e.target.value })}
                  />
                </label>
              </fieldset>
              <div className="dashboard-card cp05-totals" aria-label="Totales netos">
                <div>
                  Subtotal neto <strong>{currency(totals.subtotal)}</strong>
                </div>
                <div>
                  IVA (19 %) <strong>{currency(totals.tax)}</strong>
                </div>
                <div>
                  Total <strong>{currency(totals.total)}</strong>
                </div>
                <small>
                  Cada línea se redondea a pesos CLP; IVA sobre el subtotal neto. No es documento
                  tributario.
                </small>
              </div>
              <div className="cp05-actions">
                {editable && (
                  <button
                    className="cp04-primary"
                    disabled={busy}
                    onClick={() => void action('save')}
                  >
                    <Save size={17} /> Guardar borrador en Supabase
                  </button>
                )}
                <button
                  className="cp04-secondary"
                  disabled={busy}
                  onClick={() => void open(bundle.quote.id)}
                >
                  <RefreshCw size={17} /> Recargar versión guardada
                </button>
                {bundle.quote.status === 'draft' && (
                  <button
                    className="cp04-secondary"
                    disabled={busy || !draft.items.length}
                    onClick={() => void pdf()}
                  >
                    <FileDown size={17} /> Descargar PDF de borrador
                  </button>
                )}
                <button
                  disabled={
                    busy ||
                    !canWrite ||
                    !repository.documents.enabled ||
                    bundle.quote.status !== 'draft' ||
                    dirty ||
                    !draft.items.length
                  }
                  className="cp04-secondary"
                  title="Requiere archivo privado y backend autorizados"
                  onClick={() => void documentAction('issue')}
                >
                  {repository.documents.enabled
                    ? bundle.quote.issue_pending
                      ? 'Retomar emisión pendiente'
                      : 'Emitir revisión archivada'
                    : 'Emitir revisión archivada · pendiente'}
                </button>
                <button
                  disabled={
                    busy ||
                    !canWrite ||
                    !repository.documents.emailEnabled ||
                    bundle.quote.status === 'voided' ||
                    !bundle.revisions.length
                  }
                  className="cp04-secondary"
                  title="El backend debe autorizar el proveedor"
                  onClick={() => void documentAction('send', bundle.revisions[0])}
                >
                  <Send size={17} />{' '}
                  {repository.documents.emailEnabled
                    ? 'Enviar última revisión'
                    : 'Enviar correo · desactivado'}
                </button>
                {bundle.quote.issue_pending && repository.documents.enabled && canWrite && (
                  <button
                    className="cp04-secondary"
                    disabled={busy}
                    onClick={() => void documentAction('cancel')}
                  >
                    Cancelar reserva pendiente
                  </button>
                )}
              </div>
              {canWrite && bundle.quote.status !== 'draft' && (
                <div className="dashboard-card cp05-conditions">
                  <label>
                    Motivo de nueva revisión o anulación
                    <textarea
                      maxLength={1000}
                      minLength={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </label>
                  <div className="cp05-actions">
                    <button
                      className="cp04-secondary"
                      disabled={busy || reason.trim().length < 3}
                      onClick={() => void action('revise')}
                    >
                      Abrir nuevo borrador
                    </button>
                    {bundle.quote.status === 'issued' && (
                      <button
                        className="cp04-secondary"
                        disabled={busy || reason.trim().length < 3}
                        onClick={() => {
                          if (window.confirm('¿Anular conservando las revisiones históricas?'))
                            void action('void')
                        }}
                      >
                        Anular con motivo
                      </button>
                    )}
                  </div>
                </div>
              )}
              <section className="dashboard-card cp05-history">
                <h2>Revisiones y trazabilidad</h2>
                {!bundle.revisions.length && (
                  <p>No hay revisiones emitidas ni archivos privados confirmados.</p>
                )}
                {bundle.revisions.map((r) => (
                  <article key={r.id}>
                    <strong>
                      Revisión {r.revision} · {new Date(r.issued_at).toLocaleString('es-CL')}
                    </strong>
                    <p>
                      Total histórico: {currency(r.payload.totals.total)} · Cliente:{' '}
                      {r.payload.customer.full_name} · {r.payload.vehicle.plate}
                    </p>
                    <code>SHA-256: {r.pdf_sha256}</code>
                    <button
                      disabled={busy || !repository.documents.enabled}
                      className="cp04-secondary"
                      onClick={() => void pdf(r)}
                      title="Descarga autenticada del archivo emitido"
                    >
                      {repository.documents.enabled
                        ? 'Descargar PDF emitido'
                        : 'Archivo PDF privado · pendiente de acceso'}
                    </button>
                  </article>
                ))}
                {bundle.events.map((e) => (
                  <p key={e.id}>
                    {e.kind === 'voided' ? 'Anulación' : 'Nueva revisión'} R{e.revision} ·{' '}
                    {new Date(e.created_at).toLocaleString('es-CL')} · {e.reason}
                  </p>
                ))}
                <h3>Envíos</h3>
                {!bundle.deliveries.length ? (
                  <p>Sin envíos registrados. Correo externo desactivado.</p>
                ) : (
                  bundle.deliveries.map((d) => (
                    <p key={d.id}>
                      Intento {d.attempt} ·{' '}
                      {d.status === 'queued'
                        ? 'En cola, no confirmado'
                        : d.status === 'sent'
                          ? 'Aceptado por el proveedor (no acredita recepción)'
                          : 'Error confirmado'}{' '}
                      · {new Date(d.created_at).toLocaleString('es-CL')}
                      {d.error_code ? ' · ' + d.error_code : ''}
                    </p>
                  ))
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
