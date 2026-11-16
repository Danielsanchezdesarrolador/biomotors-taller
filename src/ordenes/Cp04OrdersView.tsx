/**
 * ByteTorque CP04 real-data interface, pending separate hosted SQL approval.
 * No fixture, demo item, payment, email, or secret key. The repository is
 * injected only after verified Auth R1, and RLS isolates tenant records.
 */
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ClipboardCheck,
  Search,
  Plus,
  CarFront,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Wrench,
  ChevronRight,
  CalendarDays,
  Gauge,
  CloudUpload,
  Info
} from 'lucide-react'
import type { Context } from '../auth/controller'
import { cp04Repository } from './cp04Repository'
import {
  inspectionCategories,
  workStatusLabel,
  workMessage,
  inspectionResolutionLabel,
  recentOrdersLimit,
  type Finding,
  type FindingResult,
  type OrderWithVehicle,
  type OrderStatus,
  type VehicleChoice
} from './cp04Contracts'
import { readCp04Draft, writeCp04Draft, emptyCp04Draft, rememberCp04Position } from './cp04Draft'
import { Cp04MultipuntoChecklist } from './Cp04MultipuntoChecklist'
import { provisionalFinding } from './cp04Autosave'
import './cp04.css'
export type Cp04Port = Pick<
  ReturnType<typeof cp04Repository>,
  | 'findVehicleByPlate'
  | 'recentOrders'
  | 'getOrder'
  | 'findingsForOrder'
  | 'pendingForVehicle'
  | 'createOrder'
  | 'setStatus'
  | 'createFinding'
  | 'updateFindingNote'
  | 'markResolved'
>

const statusNext: Record<OrderStatus, OrderStatus[]> = {
  received: ['inspecting', 'closed'],
  inspecting: ['in_service', 'ready', 'closed'],
  in_service: ['ready', 'closed'],
  ready: ['in_service', 'closed'],
  closed: []
}
function odometer(value: string): number | null {
  if (!value.trim()) return null
  return /^\d+$/.test(value.trim()) ? Number(value) : Number.NaN
}
function safeDate(value: string): string {
  const parsed = new Date(value)
  return Number.isFinite(parsed.valueOf())
    ? parsed.toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })
    : 'Fecha no disponible'
}
export function Cp04OrdersView({
  repository,
  context,
  onQuote,
  initialOrderId
}: {
  repository: Cp04Port
  context: Context
  onQuote?: (id: string) => void
  initialOrderId?: string
}) {
  const active = useRef(true),
    revision = useRef(0),
    lock = useRef(false)
  const [initial] = useState(
    () =>
      readCp04Draft({
        userId: context.userId,
        workshopId: context.workshop.id
      }) ?? emptyCp04Draft
  )
  const viewRoot = useRef<HTMLDivElement>(null)
  const scrollPosition = useRef(initial.scrollY ?? 0)
  const restoredPosition = useRef(false)
  const [orders, setOrders] = useState<OrderWithVehicle[]>([])
  const [selected, setSelected] = useState<OrderWithVehicle | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [pending, setPending] = useState<Finding[]>([])
  const [plate, setPlate] = useState(initial.plate)
  const [vehicle, setVehicle] = useState<VehicleChoice | null>(null)
  const [complaint, setComplaint] = useState(initial.complaint)
  const [intake, setIntake] = useState(initial.intakeOdometer)
  const [category, setCategory] = useState(initial.category)
  const [result, setResult] = useState<FindingResult>(initial.result)
  const [note, setNote] = useState(initial.note)
  const [multipuntoOpen, setMultipuntoOpen] = useState(initial.multipunto?.open ?? false)
  const [multipuntoOutstanding, setMultipuntoOutstanding] = useState(0)
  const [multipuntoIncomplete, setMultipuntoIncomplete] = useState(false)
  const multipuntoSection = useRef<HTMLDivElement>(null)
  const receptionSection = useRef<HTMLElement>(null)
  const plateInput = useRef<HTMLInputElement>(null)
  const orderDetail = useRef<HTMLElement>(null)
  const listRevision = useRef(0)
  const [ordersState, setOrdersState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [ordersError, setOrdersError] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const canCreate =
    context.role === 'owner' || context.role === 'admin' || context.role === 'reception'
  const canInspect = canCreate || context.role === 'mechanic'
  const scope = { userId: context.userId, workshopId: context.workshop.id }

  // Text stays in a same-tab draft during focus/session revalidation. Never
  // send unsaved descriptions to the server or store an authorization token.
  useEffect(() => {
    if (!viewRoot.current?.isConnected) return
    writeCp04Draft(scope, {
      scrollY: scrollPosition.current,
      selectedOrderId: selected?.order.id ?? initial.selectedOrderId,
      plate,
      complaint,
      intakeOdometer: intake,
      category,
      result,
      note,
      multipunto: { open: multipuntoOpen, choice: { itemId: null, state: 'unreviewed', note: '' } }
    })
  }, [
    context.userId,
    context.workshop.id,
    selected?.order.id,
    plate,
    complaint,
    intake,
    category,
    result,
    note,
    multipuntoOpen
  ])

  useEffect(() => {
    let frame: number | undefined
    const remember = () => {
      if (!restoredPosition.current || !active.current || !viewRoot.current?.isConnected) return
      scrollPosition.current = window.scrollY
      if (frame === undefined)
        frame = window.requestAnimationFrame(() => {
          frame = undefined
          if (active.current && restoredPosition.current && viewRoot.current?.isConnected)
            rememberCp04Position(scope, scrollPosition.current)
        })
    }
    const hidden = () => {
      if (
        document.visibilityState === 'hidden' &&
        active.current &&
        restoredPosition.current &&
        viewRoot.current?.isConnected
      )
        rememberCp04Position(scope, window.scrollY)
    }
    window.addEventListener('scroll', remember, { passive: true })
    document.addEventListener('visibilitychange', hidden)
    return () => {
      window.removeEventListener('scroll', remember)
      document.removeEventListener('visibilitychange', hidden)
      if (frame !== undefined) window.cancelAnimationFrame(frame)
      restoredPosition.current = false
    }
  }, [context.userId, context.workshop.id])

  useEffect(() => {
    active.current = true
    let cancelled = false
    async function initialize() {
      setLoading(true)
      try {
        await reload()
        if (!active.current || cancelled) return
        if (initialOrderId || initial.selectedOrderId) await openOrder(initialOrderId || initial.selectedOrderId!)
        if (initial.plate && !initial.selectedOrderId && !initialOrderId) {
          try {
            const found = await repository.findVehicleByPlate(initial.plate)
            if (active.current && !cancelled) setVehicle(found)
          } catch {
            /* operator can search again; never trust saved plate */
          }
        }
      } catch (error) {
        if (active.current && !cancelled) setMessage(workMessage(error))
      } finally {
        if (active.current && !cancelled) {
          setLoading(false)
          window.requestAnimationFrame(() =>
            window.requestAnimationFrame(() => {
              if (!active.current || cancelled || !viewRoot.current?.isConnected) return
              window.scrollTo({ top: scrollPosition.current, behavior: 'auto' })
              restoredPosition.current = true
            })
          )
        }
      }
    }
    void initialize()
    return () => {
      cancelled = true
      active.current = false
      revision.current++
      listRevision.current++
    }
  }, [repository])

  async function openOrder(id: string, focusDetail = false) {
    const request = ++revision.current
    setLoading(true)
    setMessage('')
    setNotice('')
    try {
      const item = await repository.getOrder(id)
      if (!item) throw Error('not_found')
      const [list, outstanding] = await Promise.all([
        repository.findingsForOrder(item.order.id),
        repository.pendingForVehicle(item.order.vehicle_id)
      ])
      if (!active.current || request !== revision.current) return
      if (selected && selected.order.id !== item.order.id) {
        setMultipuntoOpen(false)
        setMultipuntoOutstanding(0)
        setMultipuntoIncomplete(false)
      }
      setSelected(item)
      setVehicle(item.vehicle)
      setPlate(item.vehicle.plate ?? '')
      setFindings(list)
      setPending(outstanding)
      if (focusDetail)
        window.requestAnimationFrame(() => {
          orderDetail.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
          orderDetail.current?.focus({ preventScroll: true })
        })
    } catch (error) {
      if (active.current && request === revision.current) setMessage(workMessage(error))
    } finally {
      if (active.current && request === revision.current) setLoading(false)
    }
  }
  async function reload() {
    const request = ++listRevision.current
    setOrdersState('loading')
    setOrdersError('')
    try {
      const items = await repository.recentOrders()
      if (!active.current || request !== listRevision.current) return
      setOrders(items)
      setOrdersState('ready')
    } catch (error) {
      if (active.current && request === listRevision.current) {
        setOrdersState('error')
        setOrdersError(workMessage(error))
      }
    }
  }
  function scrollBehavior(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  }
  function newReception() {
    if (!canCreate) return
    receptionSection.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
    plateInput.current?.focus({ preventScroll: true })
  }
  async function searchVehicle(e: FormEvent) {
    e.preventDefault()
    setMessage('')
    setNotice('')
    setBusy(true)
    try {
      const found = await repository.findVehicleByPlate(plate)
      if (!active.current) return
      setVehicle(found)
      if (!found)
        setMessage(
          'No existe esa patente en el taller. Registra primero el vehículo en Clientes y vehículos.'
        )
      else {
        setIntake(found.odometer_km === null ? '' : String(found.odometer_km))
        setNotice('Vehículo localizado. Puedes abrir una orden de trabajo.')
      }
    } catch (error) {
      if (active.current) setMessage(workMessage(error))
    } finally {
      if (active.current) setBusy(false)
    }
  }
  async function createOrder(e: FormEvent) {
    e.preventDefault()
    if (lock.current || !canCreate) return
    lock.current = true
    setBusy(true)
    setMessage('')
    setNotice('')
    try {
      const chosen = vehicle ?? (await repository.findVehicleByPlate(plate))
      if (!chosen) throw Error('vehicle_not_found')
      const created = await repository.createOrder({
        vehicle_id: chosen.id,
        complaint,
        intake_odometer: odometer(intake)
      })
      if (!active.current) return
      setComplaint('')
      setIntake('')
      setNote('')
      await reload()
      await openOrder(created.id, true)
      if (active.current) setNotice('Orden de trabajo guardada en el servidor.')
    } catch (error) {
      if (active.current) setMessage(workMessage(error))
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  async function saveFinding(e: FormEvent) {
    e.preventDefault()
    if (lock.current || !selected || selected.order.status === 'closed' || !canInspect) return
    lock.current = true
    setBusy(true)
    setMessage('')
    setNotice('')
    try {
      await repository.createFinding({
        order_id: selected.order.id,
        vehicle_id: selected.order.vehicle_id,
        category,
        result,
        note: note.trim() || null
      })
      if (!active.current) return
      setNote('')
      setResult('not_checked')
      const [list, outstanding] = await Promise.all([
        repository.findingsForOrder(selected.order.id),
        repository.pendingForVehicle(selected.order.vehicle_id)
      ])
      if (!active.current) return
      setFindings(list)
      setPending(outstanding)
      setNotice('Resultado de inspección guardado en Supabase.')
    } catch (error) {
      if (active.current) setMessage(workMessage(error))
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  function multipuntoCommitted(record: Finding) {
    if (!active.current || !selected || record.order_id !== selected.order.id) return
    // Updates replace the same finding ID, not a duplicate pending diagnosis.
    setFindings((prev) => {
      const index = prev.findIndex((x) => x.id === record.id)
      if (index < 0) return [...prev, record]
      return prev.map((x) => (x.id === record.id ? record : x))
    })
    setPending((prev) => {
      const remaining = prev.filter((x) => x.id !== record.id)
      return record.resolution === 'pending' ? [record, ...remaining] : remaining
    })
  }
  function openMultipunto() {
    setMultipuntoOpen(true)
    window.requestAnimationFrame(() =>
      multipuntoSection.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    )
  }
  async function changeStatus(next: OrderStatus) {
    if (!selected || lock.current || !canCreate) return
    if (
      next === 'closed' &&
      (multipuntoOutstanding > 0 || multipuntoIncomplete || findings.some(provisionalFinding))
    ) {
      setMessage(
        'No cierres la orden: existen X sin guardar o detalles técnicos pendientes de completar.'
      )
      return
    }
    lock.current = true
    setBusy(true)
    setMessage('')
    setNotice('')
    try {
      const saved = await repository.setStatus(selected.order.id, selected.order.updated_at, next)
      if (!active.current) return
      setSelected({ ...selected, order: saved })
      await reload()
      setNotice(
        next === 'closed'
          ? 'Orden cerrada y conservada en el historial del vehículo.'
          : 'Estado de la orden actualizado en Supabase.'
      )
    } catch (error) {
      if (active.current) setMessage(workMessage(error))
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  async function resolve(item: Finding) {
    if (lock.current || !selected || !canInspect) return
    lock.current = true
    setBusy(true)
    setMessage('')
    setNotice('')
    try {
      await repository.markResolved(item.id, item.updated_at, true)
      if (!active.current) return
      const [list, outstanding] = await Promise.all([
        repository.findingsForOrder(selected.order.id),
        repository.pendingForVehicle(selected.order.vehicle_id)
      ])
      if (!active.current) return
      setFindings(list)
      setPending(outstanding)
      setNotice('Observación marcada como resuelta. El diagnóstico original se conserva.')
    } catch (error) {
      if (active.current) setMessage(workMessage(error))
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  const metrics = [
    {
      label: 'Órdenes activas',
      value: orders.filter((x) => x.order.status !== 'closed').length,
      icon: ClipboardCheck,
      tone: 'blue'
    },
    {
      label: 'En inspección',
      value: orders.filter((x) => x.order.status === 'inspecting').length,
      icon: Search,
      tone: 'amber'
    },
    {
      label: 'En reparación',
      value: orders.filter((x) => x.order.status === 'in_service').length,
      icon: Wrench,
      tone: 'blue'
    },
    {
      label: 'Listas para entregar',
      value: orders.filter((x) => x.order.status === 'ready').length,
      icon: CheckCircle2,
      tone: 'green'
    }
  ]
  return (
    <div className="official-panel cp04-private" ref={viewRoot}>
      <section className="welcome-area cp04-heading">
        <span className="official-eyebrow">Recepción e inspección — taller autorizado</span>
        <h1>Órdenes de trabajo</h1>
        <p>Recibe vehículos, documenta inspecciones y consulta el avance de las órdenes.</p>
      </section>
      <div className="cp04-autosave-bar" role="note">
        <CloudUpload aria-hidden="true" />
        <strong>Guardado automático</strong>
        <span>Las X de inspección se sincronizan con Supabase.</span>
        <details className="cp04-save-help">
          <summary aria-label="Información sobre el guardado">
            <Info aria-hidden="true" />
          </summary>
          <p>
            La creación de órdenes requiere confirmación. Cada X distingue Guardando, Guardado y
            Error; si falla la conexión, reintenta desde el componente.
          </p>
        </details>
      </div>
      <section
        className="cp04-metrics"
        aria-label="Indicadores de órdenes recientes"
        aria-describedby="cp04-metrics-scope"
        aria-busy={ordersState === 'loading'}
      >
        {metrics.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className={'cp04-metric cp04-metric-' + tone}>
            <Icon aria-hidden="true" />
            <div>
              <strong className={ordersState === 'loading' ? 'cp04-skeleton-number' : ''}>
                {ordersState === 'ready' ? (
                  value
                ) : ordersState === 'loading' ? (
                  <span className="sr-only">Cargando</span>
                ) : (
                  '—'
                )}
              </strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </section>
      <p id="cp04-metrics-scope" className="cp04-scope">
        {ordersState === 'ready'
          ? `Resumen de ${orders.length} órdenes recientes · Hasta ${recentOrdersLimit} registros; no es el total histórico.`
          : ordersState === 'loading'
            ? 'Consultando las órdenes recientes del taller…'
            : 'Indicadores no disponibles: la consulta de órdenes falló.'}
      </p>
      <div className="cp04-quick-actions">
        <button
          type="button"
          className="cp04-primary"
          disabled={!canCreate}
          title={!canCreate ? 'Tu rol no puede crear órdenes.' : undefined}
          onClick={newReception}
        >
          <Plus aria-hidden="true" /> Nueva recepción
        </button>
        <button
          type="button"
          className="cp04-secondary"
          disabled={busy || ordersState === 'loading'}
          onClick={() => void reload()}
        >
          <RefreshCw aria-hidden="true" /> Actualizar
        </button>
      </div>
      {message && (
        <p className="cp04-error" role="alert">
          {message}
        </p>
      )}
      {notice && (
        <p className="cp04-success" role="status">
          {notice}
        </p>
      )}
      <section className="cp04-layout">
        <section
          className="dashboard-card cp04-panel cp04-order-list"
          aria-labelledby="cp04-orders-title"
          aria-busy={ordersState === 'loading'}
        >
          <div className="cp04-list-heading">
            <h2 id="cp04-orders-title">
              <ClipboardCheck aria-hidden="true" /> Órdenes del taller
            </h2>
            {ordersState === 'ready' && (
              <span className="cp04-list-count">Recientes ({orders.length})</span>
            )}
          </div>
          {ordersState === 'loading' && (
            <div className="cp04-order-skeleton" role="status">
              <span className="sr-only">Consultando órdenes autorizadas…</span>
              {[0, 1, 2].map((item) => (
                <div key={item} className="cp04-skeleton-card" aria-hidden="true">
                  <i />
                  <div>
                    <b />
                    <b />
                    <b />
                  </div>
                </div>
              ))}
            </div>
          )}
          {ordersState === 'error' && (
            <div className="cp04-list-error" role="alert">
              <AlertTriangle aria-hidden="true" />
              <h3>No se pudieron cargar las órdenes</h3>
              <p>{ordersError}</p>
              <button type="button" className="cp04-secondary" onClick={() => void reload()}>
                <RefreshCw size={17} /> Reintentar
              </button>
            </div>
          )}
          {ordersState === 'ready' && orders.length === 0 && (
            <div className="cp04-empty">
              <CarFront aria-hidden="true" />
              <h3>Todavía no hay órdenes en tu taller</h3>
              <p>Recibe un vehículo registrado para iniciar su seguimiento e inspección.</p>
              {canCreate && (
                <button type="button" className="cp04-primary" onClick={newReception}>
                  <Plus size={18} /> Nueva recepción
                </button>
              )}
            </div>
          )}
          {ordersState === 'ready' && (
            <div className="cp04-orders">
              {orders.map((item) => (
                <button
                  type="button"
                  key={item.order.id}
                  className={
                    'cp04-order' + (selected?.order.id === item.order.id ? ' selected' : '')
                  }
                  aria-pressed={selected?.order.id === item.order.id}
                  disabled={busy || loading}
                  onClick={() => void openOrder(item.order.id, true)}
                >
                  <span className="cp04-car-icon" aria-hidden="true">
                    <CarFront />
                  </span>
                  <span className="cp04-order-content">
                    <span className="cp04-order-heading">
                      <strong className="cp04-plate">{item.vehicle.plate ?? 'Sin patente'}</strong>
                      <span className={'cp04-status cp04-status-' + item.order.status}>
                        {workStatusLabel[item.order.status]}
                      </span>
                    </span>
                    <strong className="cp04-vehicle-name">
                      {item.vehicle.make} {item.vehicle.model}
                    </strong>
                    <span className="cp04-complaint">
                      <Wrench aria-hidden="true" />
                      {item.order.complaint}
                    </span>
                    <span className="cp04-order-meta">
                      <time dateTime={item.order.opened_at}>
                        <CalendarDays aria-hidden="true" />
                        {safeDate(item.order.opened_at)}
                      </time>
                      {item.order.intake_odometer !== null && (
                        <span>
                          <Gauge aria-hidden="true" />
                          {item.order.intake_odometer.toLocaleString('es-CL')} km
                        </span>
                      )}
                    </span>
                  </span>
                  <ChevronRight className="cp04-order-chevron" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
        </section>
        <section
          className="dashboard-card cp04-panel cp04-reception"
          ref={receptionSection}
          aria-labelledby="cp04-reception-title"
        >
          <h2 id="cp04-reception-title">
            <CarFront size={20} /> Nueva recepción
          </h2>
          <p id="cp04-reception-help" className="cp04-info">
            Busca el vehículo registrado en Clientes y vehículos y confirma su ingreso.
          </p>
          {canCreate ? (
            <>
              <form onSubmit={searchVehicle} className="cp04-form">
                <label>
                  Buscar patente registrada
                  <input
                    ref={plateInput}
                    aria-describedby="cp04-reception-help"
                    required
                    maxLength={14}
                    value={plate}
                    placeholder="Ej.: QA1234"
                    onChange={(e) => {
                      setPlate(e.target.value)
                      setVehicle(null)
                    }}
                  />
                </label>
                <button type="submit" className="cp04-secondary" disabled={busy}>
                  <Search size={17} /> Buscar vehículo
                </button>
              </form>
              {vehicle && (
                <p className="cp04-found">
                  <CheckCircle2 size={17} />
                  {vehicle.make} {vehicle.model} · {vehicle.plate ?? 'Sin patente'}
                </p>
              )}
              <form className="cp04-form" onSubmit={createOrder}>
                <label>
                  Motivo de ingreso *
                  <textarea
                    rows={3}
                    maxLength={2000}
                    minLength={3}
                    required
                    value={complaint}
                    placeholder="Ej.: Ruido en el tren delantero al pasar por baches"
                    onChange={(e) => setComplaint(e.target.value)}
                  />
                </label>
                <label>
                  Kilometraje de recepción
                  <input
                    type="number"
                    min={0}
                    max={3000000}
                    value={intake}
                    onChange={(e) => setIntake(e.target.value)}
                  />
                </label>
                <button className="cp04-primary" disabled={busy || !vehicle} type="submit">
                  <Plus size={17} /> Guardar orden en Supabase
                </button>
              </form>
            </>
          ) : (
            <p>Tu rol tiene permiso de consulta e inspección, pero no puede crear órdenes.</p>
          )}
          <p className="cp04-pilot-note">
            Piloto controlado: no registres datos personales sin autorización.
          </p>
        </section>
      </section>
      {selected && (
        <section
          className="dashboard-card cp04-panel cp04-detail"
          ref={orderDetail}
          tabIndex={-1}
          aria-label="Detalle de la orden"
          aria-busy={loading}
          inert={loading}
        >
          <div className="cp04-detail-head">
            <div>
              <span className="official-eyebrow">Orden persistente</span>
              <h2>
                {selected.vehicle.plate ?? 'Sin patente'} — {selected.vehicle.make}{' '}
                {selected.vehicle.model}
              </h2>
              <p>{selected.order.complaint}</p>
              <small>
                Recibido el {safeDate(selected.order.opened_at)} ·
                {selected.order.intake_odometer === null
                  ? ' Sin kilometraje'
                  : ` ${selected.order.intake_odometer.toLocaleString('es-CL')} km`}
              </small>
            </div>
            <span className={'cp04-status cp04-status-' + selected.order.status}>
              {workStatusLabel[selected.order.status]}
            </span>
          </div>
          {onQuote && (
            <button
              className="cp04-secondary"
              disabled={loading || busy}
              onClick={() => onQuote(selected.order.id)}
            >
              Preparar / consultar cotización
            </button>
          )}
          <div className="cp04-checklist-launch">
            <button
              type="button"
              className="cp04-primary"
              disabled={loading || busy}
              onClick={openMultipunto}
            >
              <ClipboardCheck size={18} /> Abrir inspección multipunto con X
            </button>
            <small>
              Revisar los componentes de la hoja original y registrar cada X en Supabase.
            </small>
          </div>
          {canCreate && statusNext[selected.order.status].length > 0 && (
            <div className="cp04-actions">
              {statusNext[selected.order.status].map((next) => (
                <button
                  type="button"
                  key={next}
                  className={next === 'closed' ? 'cp04-secondary' : 'cp04-primary'}
                  disabled={busy}
                  onClick={() => {
                    if (
                      next !== 'closed' ||
                      window.confirm('¿Cerrar esta orden y conservar las observaciones pendientes?')
                    )
                      void changeStatus(next)
                  }}
                >
                  {next === 'closed' ? 'Cerrar y conservar historial' : workStatusLabel[next]}
                </button>
              ))}
            </div>
          )}
          {multipuntoOpen && (
            <div ref={multipuntoSection} className="cp04-multipunto-anchor">
              <Cp04MultipuntoChecklist
                key={selected.order.id}
                repository={repository}
                scope={{
                  userId: context.userId,
                  workshopId: context.workshop.id,
                  orderId: selected.order.id,
                  vehicleId: selected.order.vehicle_id
                }}
                findings={findings}
                onSaved={multipuntoCommitted}
                onQueueChange={(outstanding, incomplete) => {
                  setMultipuntoOutstanding(outstanding)
                  setMultipuntoIncomplete(incomplete)
                }}
                disabled={busy || loading}
                readOnly={!canInspect || selected.order.status === 'closed'}
                plate={selected.vehicle.plate}
                onBack={() => setMultipuntoOpen(false)}
              />
            </div>
          )}
          {!multipuntoOpen && (
            <div className="cp04-detail-grid">
              <div>
                <h3>
                  <ClipboardCheck size={18} /> Inspección multipunto
                </h3>
                {findings.length === 0 && <p>Todavía no se han registrado puntos de inspección.</p>}
                {findings.map((item) => (
                  <div key={item.id} className="cp04-finding">
                    <strong>{item.category}</strong>
                    <span>
                      Diagnóstico:{' '}
                      {item.result === 'ok'
                        ? 'Correcto'
                        : item.result === 'attention'
                          ? 'Requiere atención'
                          : 'No revisado'}
                    </span>
                    {item.result === 'attention' && (
                      <span
                        className={
                          'cp04-resolution ' +
                          (item.resolution === 'resolved' ? 'is-resolved' : 'is-pending')
                        }
                      >
                        {inspectionResolutionLabel(item)}
                        {item.resolution === 'resolved' && item.resolved_at
                          ? ' · ' + safeDate(item.resolved_at)
                          : ''}
                      </span>
                    )}
                    {item.note && <p>{item.note}</p>}
                    <small>Registrado: {safeDate(item.created_at)}</small>
                  </div>
                ))}
                {canInspect && selected.order.status !== 'closed' && (
                  <form className="cp04-form" onSubmit={saveFinding}>
                    <label>
                      Punto a revisar
                      <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        {inspectionCategories.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Resultado
                      <select
                        value={result}
                        onChange={(e) => setResult(e.target.value as FindingResult)}
                      >
                        <option value="not_checked">No revisado</option>
                        <option value="ok">Correcto</option>
                        <option value="attention">Requiere atención</option>
                      </select>
                    </label>
                    <label>
                      Observación técnica {result === 'attention' ? '*' : '(opcional)'}
                      <textarea
                        rows={3}
                        value={note}
                        maxLength={2000}
                        required={result === 'attention'}
                        minLength={result === 'attention' ? 3 : undefined}
                        placeholder="Detalle técnico y recomendación"
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </label>
                    <button className="cp04-primary" type="submit" disabled={busy}>
                      <Plus size={17} /> Guardar punto de inspección
                    </button>
                  </form>
                )}
              </div>
              <div>
                <h3>
                  <AlertTriangle size={18} /> Observaciones pendientes del vehículo
                </h3>
                <p className="cp04-info">
                  Incluye problemas pendientes de órdenes anteriores, incluso si se cerraron.
                </p>
                {pending.length === 0 && <p>No hay problemas técnicos pendientes registrados.</p>}
                {pending.map((item) => (
                  <div key={item.id} className="cp04-pending">
                    <strong>{item.category}</strong>
                    <p>{item.note}</p>
                    <small>Detectado el {safeDate(item.created_at)}</small>
                    {canInspect && (
                      <button
                        className="cp04-secondary"
                        type="button"
                        disabled={busy}
                        onClick={() => void resolve(item)}
                      >
                        <CheckCircle2 size={16} /> Marcar resuelto
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
