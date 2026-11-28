import {BasicInspectionPromotion} from '../plans/commercialPresentation'
import {blockMessages} from '../plans/commercialErrors'
import {parseKilometres} from '../clientes/kilometres'
/**
 * ByteTorque CP04 real-data interface, pending separate hosted SQL approval.
 * No fixture, demo item, payment, email, or secret key. The repository is
 * injected only after verified Auth R1, and RLS isolates tenant records.
 */
import { useEffect, useLayoutEffect, useRef, useState, useId, type FormEvent, type MouseEvent } from 'react'
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
  Info,
  ChevronDown,
  X,
  ListFilter
} from 'lucide-react'
import type { Context } from '../auth/controller'
import { onRecordChange } from '../official/recordChanges'
import { commitAndRefresh } from '../official/confirmedWrite'
import { cp04Repository } from './cp04Repository'
import {
  inspectionCategories,
  workStatusLabel,
  workMessage,
  inspectionResolutionLabel,
  effectivePendingFindings,
  currentFindings,
  compareFindings,
  recentOrdersLimit,
  type Finding,
  type FindingResult,
  type OrderWithVehicle,
  type OrderStatus,
  type VehicleChoice
} from './cp04Contracts'
import { readCp04Draft, writeCp04Draft, emptyCp04Draft, rememberCp04Position, rememberCp04PanelPosition } from './cp04Draft'
import { Cp04MultipuntoChecklist } from './Cp04MultipuntoChecklist'
import {MultipuntoDocuments} from '../multipunto/MultipuntoDocuments'
import { Cp04MultipuntoPdfPreview } from './Cp04MultipuntoPdfPreview'
import { hasCurrentProvisionalFindings } from './cp04Autosave'
import {multipuntoItemsFromFindings,multipuntoDisplayNote} from './cp04Multipunto'
import {categories,resultLabels} from '../informes/multipunto/multipuntoTemplate'
import './cp04.css'
import './ordersWorkspace.css'
export type Cp04Port = Pick<
  ReturnType<typeof cp04Repository>,
  | 'pdfIdentity'
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
> & {multipunto?:ReturnType<typeof cp04Repository>['multipunto'];inspectionDocument?:ReturnType<typeof cp04Repository>['inspectionDocument']}

const statusNext: Record<OrderStatus, OrderStatus[]> = {
  received: ['inspecting', 'closed'],
  inspecting: ['in_service', 'ready', 'closed'],
  in_service: ['ready', 'closed'],
  ready: ['in_service', 'closed'],
  closed: []
}
function odometer(value: string): number | null {
  return parseKilometres(value)
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
  onQuote, onGuided,
  initialOrderId
}: {
  repository: Cp04Port
  context: Context
  onGuided?: (id: string) => void
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
  // Presentation only: both panels retain their original form/queue instances.
  const [receptionOpen, setReceptionOpen] = useState(Boolean(initial.complaint || initial.intakeOdometer))
  const [listOpen, setListOpen] = useState(false)
  const receptionTrigger = useRef<HTMLButtonElement | null>(null)
  const primaryReceptionTrigger = useRef<HTMLButtonElement>(null)
  const receptionFocusIntent = useRef<'open' | 'close' | null>(null)
  const [receptionFocusVersion, setReceptionFocusVersion] = useState(0)
  const viewRoot = useRef<HTMLDivElement>(null)
  const scrollPosition = useRef(initial.scrollY ?? 0)
  const restoredPosition = useRef(false)
  const [orders, setOrders] = useState<OrderWithVehicle[]>([])
  const [selected, setSelected] = useState<OrderWithVehicle | null>(null)
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null)
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
  const [detailTab,setDetailTab]=useState<'summary'|'inspection'|'pending'|'history'>(initial.detailTab??(initial.multipunto?.open?'inspection':'summary'))
  const panelScroll=useRef(initial.detailScroll??{})
  const tabId=useId()
  const toolbar=useRef<HTMLDivElement>(null)
  const detailTabs=[['summary','Resumen'],['inspection','Inspección multipunto'],['pending','Observaciones pendientes'],['history','Historial de diagnósticos']] as const
  useEffect(()=>{
    const node=toolbar.current,root=orderDetail.current
    if(!node||!root)return
    const observer=new ResizeObserver(()=>root.style.setProperty('--cp04-toolbar-height',node.offsetHeight+'px'))
    observer.observe(node);return()=>observer.disconnect()
  },[!!selected])
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
  const canInspect = (canCreate || context.role === 'mechanic')&&context.inspectionEnabled!==false
  const scope = { userId: context.userId, workshopId: context.workshop.id }

  // Apply focus only after React has committed hidden/visible. Consume the
  // explicit intent once, including when an already-open panel is requested.
  useLayoutEffect(() => {
    const intent = receptionFocusIntent.current
    receptionFocusIntent.current = null
    if (!intent || !viewRoot.current?.isConnected || viewRoot.current.closest('[hidden]')) return
    if (intent === 'open' && receptionOpen) {
      receptionSection.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
      plateInput.current?.focus({ preventScroll: true })
    } else if (intent === 'close' && !receptionOpen) {
      const trigger = receptionTrigger.current
      receptionTrigger.current = null
      if (trigger?.isConnected && !trigger.disabled) trigger.focus({ preventScroll: true })
      if (document.activeElement !== trigger) {
        const fallback = primaryReceptionTrigger.current
        if (fallback?.isConnected && !fallback.disabled) fallback.focus({ preventScroll: true })
      }
    }
  }, [receptionOpen, receptionFocusVersion])

  // Text stays in a same-tab draft during focus/session revalidation. Never
  // send unsaved descriptions to the server or store an authorization token.
  useEffect(() => {
    if (!viewRoot.current?.isConnected) return
    writeCp04Draft(scope, {
      detailTab,detailScroll:panelScroll.current,
      scrollY: scrollPosition.current,
      selectedOrderId: selected?.order.id ?? confirmedOrderId ?? initial.selectedOrderId,
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
    confirmedOrderId,
    plate,
    complaint,
    intake,
    category,
    result,
    note,
    multipuntoOpen,detailTab
  ])

  useEffect(() => {
    let frame: number | undefined
    const remember = () => {
      if (!restoredPosition.current || !active.current || (!viewRoot.current?.isConnected || viewRoot.current.closest('[hidden]'))) return
      scrollPosition.current = window.scrollY
      if (frame === undefined)
        frame = window.requestAnimationFrame(() => {
          frame = undefined
          if (active.current && restoredPosition.current && viewRoot.current?.isConnected && !viewRoot.current.closest('[hidden]'))
            rememberCp04Position(scope, scrollPosition.current)
        })
    }
    const hidden = () => {
      if (
        document.visibilityState === 'hidden' &&
        active.current &&
        restoredPosition.current &&
        viewRoot.current?.isConnected && !viewRoot.current.closest('[hidden]')
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
              restoredPosition.current = true
              if (!viewRoot.current.closest('[hidden]')) window.scrollTo({ top: scrollPosition.current, behavior: 'auto' })
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

  useEffect(()=>{
    if(selected?.order.id!==initial.selectedOrderId)return
    const frame=requestAnimationFrame(()=>{
      viewRoot.current?.querySelectorAll<HTMLElement>('[data-detail-tab]').forEach(node=>{
        node.scrollTop=panelScroll.current[node.dataset.detailTab as keyof typeof panelScroll.current]??0
      })
    })
    return()=>cancelAnimationFrame(frame)
  },[selected?.order.id])
  function rememberPanel(tab:NonNullable<typeof initial.detailTab>,node:HTMLElement){
    if(!active.current||node.closest('[hidden]'))return
    panelScroll.current={...panelScroll.current,[tab]:node.scrollTop}
    rememberCp04PanelPosition(scope,tab,node.scrollTop)
  }
  useEffect(() => onRecordChange(change => {
    if(change.workshopId!==context.workshop.id)return
    void reload()
    if(change.resource==='work_orders' && selected?.order.id===change.id) {
      if(change.action==='delete') {revision.current++; setSelected(null); setFindings([]); setPending([])}
      else if(change.action==='cancel')void openOrder(change.id)
    }
  }),[repository,context.workshop.id,selected?.order.id])
  async function openOrder(id: string, focusDetail = false): Promise<boolean> {
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
      if (!active.current || request !== revision.current) return false
      if (selected && selected.order.id !== item.order.id) {
        setMultipuntoOpen(false)
        setDetailTab('summary')
        panelScroll.current={}
        setMultipuntoOutstanding(0)
        setMultipuntoIncomplete(false)
      }
      setSelected(item)
      // Selection/creation closes reception without requesting trigger focus.
      receptionFocusIntent.current = null
      receptionTrigger.current = null
      setReceptionOpen(false)
      setListOpen(false)
      setVehicle(item.vehicle)
      setPlate(item.vehicle.plate ?? '')
      setFindings(list)
      setPending(outstanding)
      if (focusDetail)
        window.requestAnimationFrame(() => {
          orderDetail.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' })
          orderDetail.current?.focus({ preventScroll: true })
        })
      return true
    } catch (error) {
      if (active.current && request === revision.current) setMessage(workMessage(error))
      return false
    } finally {
      if (active.current && request === revision.current) setLoading(false)
    }
  }
  async function reload(): Promise<boolean> {
    const request = ++listRevision.current
    setOrdersState('loading')
    setOrdersError('')
    try {
      const items = await repository.recentOrders()
      if (!active.current || request !== listRevision.current) return false
      setOrders(items)
      setOrdersState('ready')
      return true
    } catch (error) {
      if (active.current && request === listRevision.current) {
        setOrdersState('error')
        setOrdersError(workMessage(error))
      }
      return false
    }
  }
  function scrollBehavior(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
  }
  function newReception(event: MouseEvent<HTMLButtonElement>) {
    if (!canCreate) return
    receptionTrigger.current = event.currentTarget
    receptionFocusIntent.current = 'open'
    setReceptionOpen(true)
    setReceptionFocusVersion(value => value + 1)
  }
  function closeReception() {
    receptionFocusIntent.current = 'close'
    setReceptionOpen(false)
    setReceptionFocusVersion(value => value + 1)
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
      const outcome = await commitAndRefresh(
        () => repository.createOrder({
          vehicle_id: chosen.id,
          complaint,
          intake_odometer: odometer(intake)
        }),
        created => {
          // Server confirmed a new OT. Save its ID before readback: failing to
          // fetch the list/detail must not offer to create the same OT again.
          writeCp04Draft(scope, {
            ...(readCp04Draft(scope) ?? emptyCp04Draft),
            selectedOrderId: created.id,
            plate,
            complaint: '',
            intakeOdometer: '',
            note: ''
          })
          if (!active.current) return
          setSelected(null)
          setConfirmedOrderId(created.id)
          setComplaint('')
          setIntake('')
          setNote('')
          setNotice('Orden de trabajo guardada en el servidor.')
        },
        async created => {
          if (!active.current) return false
          const listed = await reload()
          const opened = await openOrder(created.id, true)
          return listed && opened
        }
      )
      if (!active.current) return
      setMessage('')
      setNotice(outcome.viewRefreshed
        ? 'Orden de trabajo guardada en el servidor.'
        : 'Orden guardada en el servidor. La actualización de la pantalla está pendiente: pulsa Actualizar o vuelve a abrir la OT, pero no guardes otra orden.')
    } catch (error) {
      if (active.current) setMessage(workMessage(error))
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  async function saveFinding(e: FormEvent) {
    e.preventDefault()
    if (lock.current || !selected || ['ready','closed'].includes(selected.order.status) || !canInspect) return
    lock.current = true
    setBusy(true)
    setMessage('')
    setNotice('')
    try {
      const order = selected.order
      const outcome = await commitAndRefresh(
        () => repository.createFinding({
          order_id: order.id,
          vehicle_id: order.vehicle_id,
          category,
          result,
          note: note.trim() || null
        }),
        saved => {
          if (!active.current) return
          setNote('')
          setResult('not_checked')
          multipuntoCommitted(saved)
          setNotice('Guardado correctamente.')
        },
        async () => {
          const [list, outstanding] = await Promise.all([
            repository.findingsForOrder(order.id),
            repository.pendingForVehicle(order.vehicle_id)
          ])
          if (!active.current) return false
          setFindings(list)
          setPending(outstanding)
          return true
        }
      )
      if (active.current && !outcome.viewRefreshed) {
        setMessage('')
        setNotice(
          'Inspección guardada en el servidor. La lista está pendiente de actualizar; no vuelvas a registrar el mismo resultado.'
        )
      }
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
    setPending(prev=>effectivePendingFindings([
      ...prev.filter(x=>x.id!==record.id),...findings.filter(x=>x.id!==record.id),record
    ]))
  }
  function openMultipunto() {
    setMultipuntoOpen(true)
    setDetailTab('inspection')
  }
  async function changeStatus(next: OrderStatus) {
    if (!selected || lock.current || !canCreate) return
    if (
      next === 'closed' &&
      (multipuntoOutstanding > 0 || multipuntoIncomplete || hasCurrentProvisionalFindings(findings))
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
          : 'Guardado correctamente.'
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
      const order = selected.order
      const outcome = await commitAndRefresh(
        () => repository.markResolved(item.id, item.updated_at, true),
        saved => {
          if (!active.current) return
          multipuntoCommitted(saved)
          setNotice('Observación marcada como resuelta. El diagnóstico original se conserva.')
        },
        async () => {
          const [list, outstanding] = await Promise.all([
            repository.findingsForOrder(order.id),
            repository.pendingForVehicle(order.vehicle_id)
          ])
          if (!active.current) return false
          setFindings(list)
          setPending(outstanding)
          return true
        }
      )
      if (active.current && !outcome.viewRefreshed) {
        setMessage('')
        setNotice(
          'Observación resuelta en el servidor. La lista está pendiente de actualizar; no repitas esta acción.'
        )
      }
    } catch (error) {
      if (active.current) setMessage(workMessage(error))
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  const inspectionItems=multipuntoItemsFromFindings(findings,selected?{
    workshopId:context.workshop.id,vehicleId:selected.order.vehicle_id,orderId:selected.order.id
  }:undefined)
  const inspectionCounts=inspectionItems.reduce((counts,item)=>({...counts,[item.state]:counts[item.state]+1}),{ok:0,attention:0,immediate:0,unreviewed:0})
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
    <div className={"official-panel cp04-private cp04-orders-workspace"+(selected?" has-selection":"")+(listOpen?" list-open":"")} ref={viewRoot}>
      <section className="welcome-area cp04-heading">
        <span className="official-eyebrow">Recepción e inspección — taller autorizado</span>
        <h1>Órdenes de trabajo</h1>
        <p>Recibe vehículos, documenta inspecciones y consulta el avance de las órdenes.</p>
      </section>
      <details className="cp04-overview" open={!selected}>
        <summary>Indicadores y guardado <span>{ordersState==='ready'?`${metrics[0].value} activas · ${metrics[3].value} listas`:'Resumen de órdenes recientes'}</span><ChevronDown size={16} aria-hidden="true"/></summary>
      <div className="cp04-autosave-bar" role="note">
        <CloudUpload aria-hidden="true" />
        <strong>Guardado automático</strong>
        <span>Los cambios se guardan automáticamente al recibir confirmación.</span>
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
      </details>
      <div className="cp04-quick-actions">
        <button
          type="button"
          className="cp04-primary"
          disabled={!canCreate}
          title={!canCreate ? 'Tu rol no puede crear órdenes.' : undefined}
          ref={primaryReceptionTrigger}
          onClick={newReception}
          aria-expanded={receptionOpen}
          aria-controls={tabId+'-reception'}
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
        <button type="button" className="cp04-secondary cp04-list-toggle" aria-expanded={listOpen} aria-controls={tabId+'-orders'} onClick={()=>setListOpen(value=>!value)}>
          <ListFilter aria-hidden="true"/> {listOpen?'Ocultar listado':'Cambiar de orden'}
        </button>
        {!receptionOpen && (complaint || intake) && <span className="cp04-draft-hint">Recepción: borrador conservado en esta pestaña</span>}
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
          id={tabId+'-orders'}
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
                        {item.order.cancelled_at?'Cancelada':workStatusLabel[item.order.status]}
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
          id={tabId+'-reception'}
          hidden={!receptionOpen}
          onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();closeReception()}}}
          aria-labelledby="cp04-reception-title"
        >
          <div className="cp04-reception-heading"><h2 id="cp04-reception-title">
            <CarFront size={20} /> Nueva recepción
          </h2><button type="button" className="cp04-secondary" onClick={closeReception} aria-label="Cerrar recepción y conservar borrador"><X size={18} aria-hidden="true"/></button></div>
          <p className="cp04-info">Puedes cerrar este panel: se conserva el borrador en esta pestaña, sin crear una orden.</p>
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
                    minLength={1}
                    required
                    value={complaint}
                    placeholder="Ej.: Ruido en el tren delantero al pasar por baches"
                    onChange={(e) => setComplaint(e.target.value)}
                  />
                </label>
                <label>
                  Kilometraje de recepción
                  <input
                    type="text"
                    aria-label="Kilometraje de recepción"
                    inputMode="numeric"
                    maxLength={10}
                    value={intake}
                    onChange={(e) => setIntake(e.target.value)}
                  />{(()=>{try{parseKilometres(intake);return null}catch(e){return <small role="alert">{(e as Error).message}</small>}})()}
                </label>
                <button className="cp04-primary" disabled={busy || !vehicle} type="submit">
                  <Plus size={17} /> Guardar orden
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
      {selected && (
        <section
          className="dashboard-card cp04-panel cp04-detail"
          ref={orderDetail}
          tabIndex={-1}
          aria-label="Detalle de la orden"
          aria-busy={loading}
          inert={loading}
        >
          <div className="cp04-workspace-toolbar" ref={toolbar}>
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
              {selected.order.cancelled_at?'Cancelada':workStatusLabel[selected.order.status]}
            </span>
          </div>
          <div className="cp04-main-actions">
          {onGuided&&<button className="cp04-primary" disabled={busy} onClick={()=>onGuided(selected.order.id)}>Continuar recorrido guiado</button>}
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
            {context.inspectionEnabled===false&&<BasicInspectionPromotion/>}
              <button
              type="button"
              className="cp04-secondary"
              disabled={loading || busy}
              onClick={openMultipunto}
            >
              <ClipboardCheck size={18} /> Abrir inspección multipunto con X
            </button>
            <small>
              Revisar los componentes de la hoja original y guardar cada X con confirmación.
            </small>
          </div>
          </div>
          <div className="cp04-secondary-actions">
          <details className="cp04-action-group" onKeyDown={event=>{if(event.key==='Escape'&&!event.currentTarget.querySelector('dialog[open]')){event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus()}}}>
            <summary>Documentos <ChevronDown size={16} aria-hidden="true"/></summary>
            <div className="cp04-action-content">
          {repository.multipunto?<MultipuntoDocuments port={repository.multipunto} orderId={selected.order.id} scope={context.userId+':'+context.workshop.id} blocked={busy||loading||multipuntoOutstanding>0||multipuntoIncomplete}/>:<Cp04MultipuntoPdfPreview
            documentScope={context.userId+':'+context.workshop.id}
            loadIdentity={repository.pdfIdentity}
            loadDocument={repository.inspectionDocument}
            workshopName={context.workshop.name}
            order={selected}
            findings={findings}
            outstanding={multipuntoOutstanding}
            incomplete={multipuntoIncomplete}
            disabled={busy || loading || context.inspectionEnabled===false}
          />}
            </div>
          </details>
          {canCreate && statusNext[selected.order.status].length > 0 && (
            <details className="cp04-action-group" onKeyDown={event=>{if(event.key==='Escape'&&!event.currentTarget.querySelector('dialog[open]')){event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus()}}}>
              <summary>Estado e historial <ChevronDown size={16} aria-hidden="true"/></summary>
              <p className="cp04-info">Los cambios se confirman en el servidor. Cerrar conserva el historial.</p>
            <div className="cp04-actions">
              {statusNext[selected.order.status].map((next) => (
                <button
                  type="button"
                  key={next}
                  className="cp04-secondary"
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
            </details>
          )}
          </div>
          <div className="cp04-inspection-counts" aria-label="Estados confirmados de los 34 componentes">
            {(['ok','attention','immediate','unreviewed'] as const).map(state=><span key={state} className={'cp04-count-'+state}><strong>{inspectionCounts[state]}</strong> {resultLabels[state]}</span>)}
          </div>
          <div className="cp04-detail-tabs" role="tablist" aria-label="Secciones de la orden">
            {detailTabs.map(([key,label])=><button type="button" role="tab" key={key}
              id={tabId+'-tab-'+key} aria-controls={tabId+'-panel-'+key} aria-selected={detailTab===key}
              tabIndex={detailTab===key?0:-1} onClick={()=>{setDetailTab(key);if(key==='inspection')setMultipuntoOpen(true)}}
              onKeyDown={event=>{
                const index=detailTabs.findIndex(([id])=>id===key)
                const next=event.key==='ArrowRight'?(index+1)%detailTabs.length:event.key==='ArrowLeft'?(index+detailTabs.length-1)%detailTabs.length:event.key==='Home'?0:event.key==='End'?detailTabs.length-1:-1
                if(next>=0){event.preventDefault();setDetailTab(detailTabs[next][0]);document.getElementById(tabId+'-tab-'+detailTabs[next][0])?.focus({preventScroll:true})}
              }}>{label}</button>)}
          </div>
          </div>
          <div className="cp04-workspace-content">
          <div ref={multipuntoSection} role="tabpanel" data-detail-tab="inspection" onScroll={e=>rememberPanel('inspection',e.currentTarget)} id={tabId+'-panel-inspection'} aria-labelledby={tabId+'-tab-inspection'} hidden={detailTab!=='inspection'} tabIndex={0} className="cp04-tab-content cp04-multipunto-anchor">
              {['ready','closed'].includes(selected.order.status)&&<p role="status">{blockMessages.readonly}</p>}
              <Cp04MultipuntoChecklist
                workspacePresentation
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
                readOnly={!canInspect || ['ready','closed'].includes(selected.order.status)}
                plate={selected.vehicle.plate}
                onBack={() => {setMultipuntoOpen(false);setDetailTab('summary')}}
              />

          </div>
          <div role="tabpanel" data-detail-tab="summary" onScroll={e=>rememberPanel('summary',e.currentTarget)} id={tabId+'-panel-summary'} aria-labelledby={tabId+'-tab-summary'} hidden={detailTab!=='summary'} tabIndex={0} className="cp04-tab-content">
            {['ready','closed'].includes(selected.order.status)&&<p role="status">{blockMessages.readonly}</p>}<h3>Diagnóstico vigente de esta visita</h3>
            <p className="cp04-info">Una marca por componente. Cambiar a OK no certifica una reparación; limpiar una X significa Sin revisar. Los registros anteriores se conservan en el historial.</p>
            <div className="cp04-current-groups">
              {categories.map(group=><section key={group.id} aria-label={group.name}>
                <h4>{group.name}</h4>
                {inspectionItems.filter(item=>item.category===group.id).map(item=><div key={item.id} data-current-item={item.id} className={'cp04-current-row result-'+item.state}>
                  <strong>{item.name}</strong><span>{resultLabels[item.state]}</span>
                  {(item.state==='attention'||item.state==='immediate')&&item.note&&<p>{item.note}</p>}
                </div>)}
              </section>)}
            </div>
            {currentFindings(findings).filter(row=>!row.category.startsWith('Multipunto · ')).map(row=><article key={row.id} className="cp04-finding"><strong>{row.category} · {row.result==='ok'?'OK':row.result==='attention'?'Requiere atención':'Sin revisar'}</strong><p>{row.note}</p><small>{inspectionResolutionLabel(row)}</small></article>)}
            <details className="cp04-additional-finding"><summary>Registrar diagnóstico adicional por categoría</summary>
              {canInspect && !['ready','closed'].includes(selected.order.status) && (
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
                        minLength={result === 'attention' ? 1 : undefined}
                        placeholder="Detalle técnico y recomendación"
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </label>
                    <button className="cp04-primary" type="submit" disabled={busy}>
                      <Plus size={17} /> Guardar punto de inspección
                    </button>
                  </form>
                )}

            </details>
          </div>
          <div role="tabpanel" data-detail-tab="pending" onScroll={e=>rememberPanel('pending',e.currentTarget)} id={tabId+'-panel-pending'} aria-labelledby={tabId+'-tab-pending'} hidden={detailTab!=='pending'} tabIndex={0} className="cp04-tab-content">
                <h3>
                  <AlertTriangle size={18} /> Observaciones pendientes del vehículo
                </h3>
                <p className="cp04-info">
                  Incluye problemas pendientes de órdenes anteriores, incluso si se cerraron.
                </p>
                {pending.length === 0 && <p>No hay problemas técnicos pendientes registrados.</p>}
                {pending.map((item) => (
                  <div key={item.id} className="cp04-pending">
                    <div className="cp04-pending-content">
                      <strong>{item.category}</strong>
                      <p>{item.note}</p>
                      <small>Detectado el {safeDate(item.created_at)}</small>
                    </div>
                    {(canCreate||!['ready','closed'].includes(selected.order.status)) && (
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

            <p className="cp04-info">Una X limpiada no acredita reparación ni descarta antecedentes pendientes. Un OK posterior sustituye el diagnóstico vigente, sin cambiar la resolución histórica.</p>
          </div>
          <div role="tabpanel" data-detail-tab="history" onScroll={e=>rememberPanel('history',e.currentTarget)} id={tabId+'-panel-history'} aria-labelledby={tabId+'-tab-history'} hidden={detailTab!=='history'} tabIndex={0} className="cp04-tab-content">
            <h3>Historial de diagnósticos de esta orden</h3>
            <p className="cp04-info">Registros históricos de esta visita, incluidos cambios de X. No representan todos el diagnóstico actual.</p>
            {!findings.length&&<p>No hay diagnósticos registrados en esta orden.</p>}
            {[...findings].sort((a,b)=>compareFindings(b,a)).map(item=><article key={item.id} className="cp04-finding" data-finding-id={item.id}>
              <div className="cp04-finding-heading"><strong>{item.category}</strong><span>{item.result==='ok'?'OK':item.result==='attention'?'Requiere atención':'Sin revisar'}</span></div>
              {multipuntoDisplayNote(item)&&<p className="cp04-finding-note">{multipuntoDisplayNote(item)}</p>}
              <small>{safeDate(item.created_at)} · {inspectionResolutionLabel(item)}</small>
            </article>)}
          </div>
          </div>

        </section>
      )}
      {!selected && <section className="dashboard-card cp04-panel cp04-selection-empty" aria-label="Selecciona una orden"><CarFront size={32} aria-hidden="true"/><h2>Tu espacio de trabajo</h2><p>Selecciona una orden del listado para consultar su diagnóstico, continuar la atención o abrir el multipunto.</p><p className="cp04-info">La nueva recepción está disponible sin salir de este espacio.</p></section>}
      </section>
    </div>
  )
}
