import { useEffect, useRef, useState, useId } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  ArrowLeft,
  FileDown,
  Plus,
  Save,
  RefreshCw,
  FileText,
  LockKeyhole,
  ChevronDown,
  History
} from 'lucide-react'
import { onRecordChange } from '../official/recordChanges'
import type { Context } from '../auth/controller'
import { WorkOrderFailure, type OrderWithVehicle } from '../ordenes/cp04Contracts'
import { WorkItemsTable, WorkItemForm } from '../informes/trabajos/WorkItemsEditor'
import type { WorkItem } from '../informes/trabajos/workItemCore'
import { currency } from '../informes/trabajos/workItemCore'
import { calculateTotals } from '../ordenes/orderMoney'
import {
  QuoteFailure,
  QuoteReadPending,
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
import { localDraft, rememberDraft, clearLocalDraft, rememberCommittedDraft } from './temporaryDraft'
import { readQuoteSelection, rememberQuoteSelection } from './quoteSelection'
import { WorkExecutionDraft } from '../entrega/WorkExecutionDraft'
import { FlowLive02Loader } from './FlowLive02Loader'
import '../informes/trabajos/trabajos.css'
import './cp05.css'
import {QuoteHistory} from './QuoteHistory'
import { QuoteEmailReviewPanel } from './QuoteEmailReviewPanel'
import type { QuoteEmailReview } from './emailReview'
import {workspaceQuotes,quoteStateLabel} from './workspacePresentation'
const empty: Draft = { price_basis: 'net', valid_days: 10, terms: '', comments: '', items: [] }
export function QuotePanel({
  repository,
  privateClient,
  context,
  initialVehicleId,
  initialOrderId,
  registerSave,
  guided = false,
  onPendingChange,
  isActive = true,
  onBack
}: {
  repository: Cp05Port
  privateClient?: SupabaseClient
  context: Context
  initialVehicleId?: string
  initialOrderId?: string
  registerSave?:(save:((exit:boolean)=>Promise<boolean>)|null)=>void
  onPendingChange?:(pending:boolean)=>void
  guided?: boolean
  isActive?: boolean
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
  const [ordersRefreshing,setOrdersRefreshing]=useState(true)
  const [ordersError,setOrdersError]=useState('')
  const [ordersRetry,setOrdersRetry]=useState(0)
  const recordsListRevision=useRef(0),recordsVehicleScope=useRef(initialVehicleId)
  recordsVehicleScope.current=initialVehicleId
  const [tab,setTab]=useState<'trabajos'|'condiciones'|'historial'>('trabajos')
  const [browseOpen,setBrowseOpen]=useState(false),[revisionOpen,setRevisionOpen]=useState(false)
  const workspaceId=useId(),toolbar=useRef<HTMLDivElement>(null),workspace=useRef<HTMLElement>(null)
  const [readPending,setReadPending]=useState<{id:string;version:number}|null>(null)
  const [editing, setEditing] = useState<WorkItem | true | null>(null),
    [reason, setReason] = useState(''),
    [recovery, setRecovery] = useState<Draft | null>(null),
    [executionOpen, setExecutionOpen] = useState(false)
  const active = useRef(true),
    sequence = useRef(0),
    lock = useRef(false),
    operation = useRef<{ fingerprint: string; id: string }>({
      fingerprint: '',
      id: crypto.randomUUID()
    })
  const canWrite = ['owner', 'admin', 'reception'].includes(context.role),
    editable = !readPending && canWrite && bundle?.quote.status === 'draft' && !bundle.quote.issue_pending
  const dirty =
    !!bundle &&
    JSON.stringify(draftPayload(draft)) !== JSON.stringify(draftPayload(draftFrom(bundle)))
  useEffect(()=>{onPendingChange?.(busy||dirty||!!editing||!!readPending);return()=>onPendingChange?.(false)},[busy,dirty,editing,readPending,onPendingChange])
  const totals = calculateTotals(draft.items)
  const visibleQuotes=workspaceQuotes(quotes,bundle?.quote??null)
  const issuedRevision=bundle?.revisions.find(r=>r.revision===bundle.quote.issued_revision)
  const tabs=[['trabajos','Trabajos y repuestos'],['condiciones','Condiciones'],['historial','Historial']] as const
  useEffect(()=>{
    const node=toolbar.current,root=workspace.current
    if(!node||!root)return
    const observer=new ResizeObserver(()=>root.style.setProperty('--cp05-toolbar-height',node.offsetHeight+'px'))
    observer.observe(node)
    return()=>observer.disconnect()
  },[!!bundle])
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
        const list = await repository.list(initialVehicleId)
        if (cancelled || !active.current) return
        setQuotes(list)
        const cached = localDraft(context.userId, context.workshop.id)
        const selected = readQuoteSelection(context.userId, context.workshop.id)
        if (initialOrderId) {
          // A specific OT always takes priority over a remembered selection.
          const q = await repository.forOrder(initialOrderId)
          if (q) await open(q.id)
        } else if (selected && list.some(q => q.id === selected)) {
          // Restore the active quote after navigation/revalidation, not just
          // when there happen to be unsaved changes.
          await open(selected)
        } else if (cached && list.some(q => q.id === cached.quoteId) && !initialVehicleId) {
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
  // Kept-alive navigation hides this panel instead of remounting it. Refresh
  // only the order options on entry; never restore/reload a quote or its draft.
  useEffect(()=>{
    if(!isActive)return
    let cancelled=false
    setOrdersRefreshing(true)
    setOrdersError('')
    void repository.orders().then(source=>{
      if(cancelled||!active.current)return
      const eligible=initialVehicleId?source.filter(o=>o.vehicle.id===initialVehicleId):source
      setOrders(eligible)
      setOrderId(current=>eligible.some(o=>o.order.id===current)?current:'')
    }).catch(e=>{
      if(cancelled||!active.current)return
      if((e instanceof QuoteFailure||e instanceof WorkOrderFailure)&&e.kind==='denied'){
        failure(new QuoteFailure('denied'))
        setOrdersError('No se pudo verificar el acceso a las órdenes. Vuelve a verificar tu sesión.')
        return
      }
      setOrdersError('No se pudo actualizar el selector de órdenes. Tu borrador se conserva; reintenta para continuar.')
    }).finally(()=>{
      if(!cancelled&&active.current)setOrdersRefreshing(false)
    })
    return()=>{cancelled=true}
  },[repository,isActive,initialVehicleId,ordersRetry])
  useEffect(() => onRecordChange(change => {
    if (change.workshopId !== context.workshop.id) return
    setOrdersRetry(n=>n+1)
    const listRevision=++recordsListRevision.current,vehicleScope=initialVehicleId
    const current=()=>active.current&&listRevision===recordsListRevision.current&&vehicleScope===recordsVehicleScope.current
    void repository.list(initialVehicleId).then(list=>{if(current())setQuotes(list)}).catch(e=>{if(current())failure(e)})
    if(change.resource==='quotes' && change.id===bundle?.quote.id) {
      if(change.action==='delete') {
        sequence.current++; setBundle(null); setDraft(empty); setRecovery(null); setEditing(null); setReadPending(null); setOrderId('')
        if(localDraft(context.userId,context.workshop.id)?.quoteId===change.id)clearLocalDraft()
        operation.current={fingerprint:'',id:crypto.randomUUID()}
        setMessage('Borrador eliminado desde Administración de registros.')
      } else if(change.action==='void' && !dirty && !busy)void open(change.id)
    }
  }),[repository,context.workshop.id,context.userId,initialVehicleId,bundle?.quote.id,dirty,busy])
  useEffect(() => {
    if (bundle) rememberQuoteSelection(context.userId, context.workshop.id, bundle.quote.id)
  }, [bundle?.quote.id, context.userId, context.workshop.id])
  useEffect(() => {
    if (!bundle || !dirty || !canWrite || readPending) return
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
  }, [bundle, draft, dirty, canWrite, readPending, context.userId, context.workshop.id])
  function failure(e: unknown) {
    if(e instanceof QuoteReadPending){
      setReadPending({id:e.quoteId,version:e.version})
      rememberCommittedDraft(context.userId,context.workshop.id,e.quoteId,e.version)
      rememberQuoteSelection(context.userId,context.workshop.id,e.quoteId)
    }
    if (e instanceof QuoteFailure && e.kind === 'denied') {
      clearLocalDraft()
      setReadPending(null)
      setBundle(null)
      setDraft(empty)
      setQuotes([])
      setOrders([])
      setOrderId('')
      setEditing(null)
      setRecovery(null)
    }
    setError(quoteMessage(e))
  }
  async function open(id: string) {
    if (!readPending && dirty && !window.confirm('Hay cambios sin guardar. ¿Abrir otra cotización?')) return
    const request = ++sequence.current
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const loaded = await repository.load(id)
      if (!active.current || request !== sequence.current) return
      if(readPending?.id===id&&loaded.quote.version<readPending.version)throw new QuoteFailure('unavailable')
      const cached = localDraft(context.userId, context.workshop.id)
      setReadPending(null)
      setBrowseOpen(false)
      setRecovery(null)
      setEditing(null)
      setBundle(loaded)
      setOrderId(loaded.quote.order_id)
      if(cached?.quoteId===id&&cached.committedVersion&&loaded.quote.version>=cached.committedVersion){
        setDraft(draftFrom(loaded));clearLocalDraft()
        setMessage('Guardado confirmado y versión recuperada del servidor.')
      } else if (
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
    if (lock.current || !canWrite || readPending) return
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
      clearLocalDraft()
      setEditing(null)
      setBundle(next)
      setDraft(draftFrom(next))
      setReason('')
      setRevisionOpen(false)
      if(kind==='create'||kind==='revise')setTab('trabajos')
      try {
        const list=await repository.list(initialVehicleId)
        if(active.current)setQuotes(list)
      } catch(error) {
        if(error instanceof QuoteFailure&&error.kind==='denied')throw error
        if(active.current)setError('Operación confirmada. No se pudo actualizar el listado; recarga la versión guardada sin repetir la operación.')
      }
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
      return next
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
    if (!bundle || lock.current || readPending) return
    lock.current = true
    setBusy(true)
    setError('')
    try {
      // Official archived bytes must be downloaded through the approved private archive.
      // The current rollout has no Storage authorization; only a clearly marked draft can be generated.
      const renderer = await import('./pdf')
      let templatePdf: Uint8Array | undefined
      if (!revision && privateClient &&
          import.meta.env.VITE_BT_CP05_CUSTOM_TEMPLATES_ENABLED === 'true' &&
          ['owner','admin'].includes(context.role)) {
        const { data, error } = await privateClient.rpc('bt_plan04_pdf_template_status',
          { p_workshop_id: context.workshop.id })
        if (error || !data || data.workshopId !== context.workshop.id)
          throw Error('TEMPLATE_AUTH_UNAVAILABLE')
        if (data.eligible && ['plus','full'].includes(data.plan) && data.templatePath) {
          const path: string = data.templatePath
          const prefix = context.workshop.id + '/'
          const filename = path.slice(prefix.length)
          if (!path.startsWith(prefix) ||
              !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.pdf$/.test(filename))
            throw Error('TEMPLATE_PATH_MISMATCH')
          const downloaded = await privateClient.storage
            .from('bt-workshop-quote-templates').download(path)
          if (downloaded.error || !downloaded.data ||
              downloaded.data.size > 4194304) throw Error('PRIVATE_TEMPLATE_UNAVAILABLE')
          templatePdf = new Uint8Array(await downloaded.data.arrayBuffer())
        }
      }
      const bytes = revision
        ? await repository.documents.download(revision)
        : await renderer.browserQuotePdf(previewSnapshot(bundle, draft), true, templatePdf)
      if (active.current)
        renderer.downloadPdf(
          bytes,
          `${quoteNumber(bundle.quote)}-${revision ? 'r' + revision.revision : 'borrador'}.pdf`
        )
    } catch (error) {
      if (active.current)failure(error)
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  async function documentAction(kind: 'issue' | 'send' | 'cancel', revision?: Revision, review?: QuoteEmailReview, confirmedSource?:Bundle) {
    const source=confirmedSource??bundle
    if (!source || lock.current || !canWrite || readPending) return
    if (kind === 'issue' && dirty && !confirmedSource) {
      setError('Guarda y revisa el borrador antes de emitir.')
      return
    }
    if (kind === 'send' && (!revision || !review ||
        revision.revision !== source.quote.issued_revision ||
        !repository.documents.emailEnabled ||
        source.quote.status === 'voided')) return
    if (kind !== 'send' && !window.confirm(
      kind === 'issue' ? '¿Emitir y archivar esta revisión inmutable?'
        : '¿Cancelar la reserva pendiente sin emitir?'
    )) return
    lock.current = true
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const requestId = documentOperation(context, source.quote)
      let status = ''
      if (kind === 'issue') {
        await repository.documents.issue(source.quote, requestId)
        status = 'Revisión emitida y archivo privado verificado.'
      } else if (kind === 'cancel') {
        await repository.documents.cancel(source.quote, requestId)
        status = 'Reserva cancelada; borrador disponible para revisión.'
      } else if (revision) {
        const attempts = source.deliveries.filter((d) => d.revision_id === revision.id)
        const attempt = 1 + Math.max(0, ...attempts.map((d) => d.attempt))
        const result = await repository.documents.send(revision, attempt, review!)
        status =
          result === 'failed'
            ? 'El proveedor rechazó el envío. Revisa la trazabilidad.'
            : result === 'already_sent'
              ? 'El proveedor ya confirmó esta revisión; no se generó otro envío.'
              : 'Envío aceptado por el proveedor; no acredita lectura ni entrega en la bandeja.'
      }
      let next:Bundle
      try { next=await repository.load(source.quote.id) }
      catch(error){
        if(error instanceof QuoteFailure&&error.kind==='denied')throw error
        throw new QuoteReadPending(source.quote.id,source.quote.version+(kind==='issue'?1:0))
      }
      if (!active.current) return
      setBundle(next)
      setDraft(draftFrom(next))
      if(kind==='issue')setTab('trabajos')
      setMessage(status)
      return next
    } catch (e) {
      if (active.current) failure(e)
    } finally {
      lock.current = false
      if (active.current) setBusy(false)
    }
  }
  useEffect(()=>{registerSave?.(async exit=>{
    if(busy||readPending||editing){setError('Termina la partida abierta o recupera la operación pendiente antes de continuar.');return false}
    let current=bundle
    if(!current){current=await action('create')??null;if(!current)return false}
    else if(dirty){current=await action('save')??null;if(!current)return false}
    if(exit)return true
    if(!current.items.length||current.quote.terms.trim().length<3){setError('Añade las partidas y completa las condiciones antes de emitir.');return false}
    if(current.quote.status==='issued'&&!current.quote.issue_pending)return true
    if(!repository.documents.enabled){setError('La emisión archivada no está habilitada. Puedes guardar el borrador y salir.');return false}
    const issued=await documentAction('issue',undefined,undefined,current)
    return issued?.quote.status==='issued'&&!issued.quote.issue_pending
  });return()=>registerSave?.(null)})
  return (
    <section ref={workspace} className={"cp05-panel wt-panel"+(guided?" quote-guided":"")} aria-label="Cotizaciones privadas CP05">
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
      {readPending && <div className="cp05-notice" role="status">
        <p>El servidor confirmó la operación. La edición queda pausada hasta recuperar su versión.</p>
        <button className="cp04-secondary" disabled={busy} onClick={()=>void open(readPending.id)}>
          Recuperar operación confirmada
        </button>
      </div>}
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
      {bundle&&<div className="cp05-workspace-toolbar" ref={toolbar}>
        <div className="cp05-context" aria-label="Cotización actual confirmada">
          <div className="cp05-title-line"><h2>{quoteNumber(bundle.quote)}</h2><span className={'cp05-status cp05-status-'+bundle.quote.status}>{quoteStateLabel[bundle.quote.status]}</span><span className="cp05-revision-tag">R{bundle.quote.issued_revision} · V{bundle.quote.version}</span></div>
          <p className="cp05-client-vehicle"><strong>{bundle.source.customer.full_name}</strong><span>{bundle.source.vehicle.make} {bundle.source.vehicle.model} · {bundle.source.vehicle.plate||'Sin patente'}</span></p>
          <small>{bundle.quote.status==='draft'?(dirty?'Cambios locales sin guardar':'Borrador guardado'):bundle.quote.status==='issued'?'Emitida e inmutable':'Anulada'}{bundle.quote.issue_pending?' · Archivo pendiente; edición bloqueada.':''}</small>
          <output className="cp05-header-total" aria-label="Total siempre visible"><span>Total · IVA incluido</span><strong>{currency(bundle.quote.status==='issued'&&issuedRevision?issuedRevision.payload.totals.total:totals.total)}</strong></output>
        </div>
              <div className="cp05-action-board" aria-label="Acciones de cotización">
                <div className="cp05-action-group cp05-action-group-main">
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
                </div>
                <div className="cp05-action-group cp05-action-group-advanced">
                {bundle.quote.status==='draft'&&<button
                  disabled={
                    busy ||
                    !canWrite ||
                    !repository.documents.enabled ||
                    bundle.quote.status !== 'draft' ||
                    dirty ||
                    !!readPending ||
                    draft.terms.trim().length<3 ||
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
                </button>}
                {bundle.quote.status!=='draft'&&<>
                  {bundle.quote.status==='issued'&&<button className="cp04-primary" disabled={busy||!!readPending||!repository.documents.enabled||!issuedRevision} onClick={()=>issuedRevision&&void pdf(issuedRevision)}><FileDown size={17}/> Descargar PDF emitido</button>}
                  <button className="cp04-secondary" onClick={()=>setTab('historial')}><History size={17}/> Ver historial</button>
                  {canWrite&&<button className="cp04-secondary" disabled={busy||!!readPending} onClick={()=>{setTab('condiciones');setRevisionOpen(true)}}>Abrir nueva revisión</button>}
                </>}
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
              </div>

        <div className="cp05-tabs" role="tablist" aria-label="Secciones de cotización">
          {tabs.map(([key,label],i)=><button type="button" key={key} role="tab" id={workspaceId+'-tab-'+key} aria-selected={tab===key} aria-controls={workspaceId+'-panel-'+key} tabIndex={tab===key?0:-1} onClick={()=>setTab(key)} onKeyDown={event=>{
            const next=event.key==='ArrowRight'?(i+1)%3:event.key==='ArrowLeft'?(i+2)%3:event.key==='Home'?0:event.key==='End'?2:-1
            if(next>=0){event.preventDefault();setTab(tabs[next][0]);document.getElementById(workspaceId+'-tab-'+tabs[next][0])?.focus({preventScroll:true})}
          }}>{label}</button>)}
        </div>
      </div>}
      <div className="cp05-layout">
        <aside className={"dashboard-card cp05-list "+(bundle&&!browseOpen?"cp05-source-collapsed":"")}>
          <button type="button" className="cp04-secondary cp05-source-toggle" aria-expanded={!bundle||browseOpen} onClick={()=>setBrowseOpen(!browseOpen)}>Cambiar cotización u OT <ChevronDown size={16}/></button>
          <div className="cp05-list-body">
          <h2>{initialVehicleId ? 'Cotizaciones del vehículo' : 'Documentos recientes'}</h2>
          <p>Hasta 50 cotizaciones autorizadas.</p>
          {!busy && !visibleQuotes.length && <p>Sin cotizaciones registradas.</p>}
          {visibleQuotes.filter(q=>!guided||q.order_id===initialOrderId).map((q) => (
            <button
              disabled={busy || !!readPending}
              key={q.id}
              className="cp04-secondary"
              onClick={() => void open(q.id)}
            >
              {quoteNumber(q)} · R{q.issued_revision} ·{' '}
              {quoteStateLabel[q.status]}
            </button>
          ))}
          <label>
            Orden CP04
            <select disabled={guided||busy||ordersRefreshing||!!ordersError} aria-busy={ordersRefreshing} value={orderId} onChange={(e) => setOrderId(e.target.value)}>
              <option value="">Selecciona una orden</option>
              {orderId&&!orders.some(o=>o.order.id===orderId)&&<option value={orderId}>OT seleccionada · {orderId.slice(0,8)} · fuera del listado reciente</option>}
              {orders.map((o) => (
                <option key={o.order.id} value={o.order.id}>
                  {o.vehicle.plate || 'Sin patente'} · {o.vehicle.make} {o.vehicle.model} ·{' '}
                  {o.order.id.slice(0, 8)}
                </option>
              ))}
            </select>
          </label>
          {ordersRefreshing&&<small role="status">Actualizando órdenes autorizadas…</small>}
          {ordersError&&<div className="cp05-notice" role="status"><p>{ordersError}</p><button type="button" className="cp04-secondary" onClick={()=>setOrdersRetry(n=>n+1)}>Reintentar órdenes</button></div>}
          <small>
            Selección de las últimas 40 órdenes. Desde CP04 puedes abrir cualquier orden recuperada.
          </small>
          {canWrite && (
            <button
              className="cp04-primary"
              disabled={busy || ordersRefreshing || !!ordersError || !!readPending || !orderId}
              onClick={() => {
                if (!dirty || window.confirm('¿Continuar sin guardar los cambios actuales?'))
                  void action('create')
              }}
            >
              <Plus size={16} /> Crear / recuperar borrador de la OT
            </button>
          )}
          </div>
        </aside>
        <div className="cp05-editor">
          {!bundle&&!busy&&<div className="dashboard-card cp05-empty"><FileText/><h2>Prepara una cotización desde una orden</h2><p>Solo se utilizan registros confirmados de CP03 y CP04.</p></div>}
          {bundle&&<>
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

            <div role="tabpanel" id={workspaceId+'-panel-trabajos'} aria-labelledby={workspaceId+'-tab-trabajos'} hidden={tab!=='trabajos'} className={'cp05-tab-content '+(!editable?'cp05-readonly':'')} tabIndex={0}>
              {(!guided||!editing)&&<WorkItemsTable guided={guided}
                document={{ mode: 'quote', items: draft.items }}
                onEdit={(v) => setEditing(v || true)}
                onDelete={(v) =>
                  setDraft({ ...draft, items: draft.items.filter((i) => i.id !== v.id) })
                }
                onPerformed={() => {}}
                readOnly={!editable || busy}
              />}
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
              {canWrite && bundle.quote.status === 'issued' &&
                bundle.revisions
                  .filter(r => r.revision === bundle.quote.issued_revision)
                  .map(revision => (
                    <section key={revision.id} aria-label="Preparación de informe técnico">
                      <button type="button" className="cp04-secondary"
                        disabled={busy}
                        onClick={() => setExecutionOpen(!executionOpen)}>
                        {import.meta.env.VITE_BT_FLOW_LIVE_02_ENABLED === 'true' && privateClient
                          ? executionOpen ? 'Cerrar registro técnico y entrega'
                            : 'Abrir registro de aprobación, trabajos y entrega'
                          : executionOpen ? 'Cerrar revisión técnica preliminar'
                            : 'Preparar informe técnico preliminar (sin guardar)'}
                      </button>
                      {executionOpen && (
                        import.meta.env.VITE_BT_FLOW_LIVE_02_ENABLED === 'true' && privateClient
                          ? !guided && <FlowLive02Loader stage={bundle?.source.order.intake_phase==='planned'?4:undefined} key={revision.id}
                              client={privateClient} context={context}
                              revision={revision} quote={bundle.quote} />
                          : <WorkExecutionDraft key={revision.id}
                              revision={revision} quote={bundle.quote} />
                      )}
                    </section>
                  ))}

            </div>
            <div role="tabpanel" id={workspaceId+'-panel-condiciones'} aria-labelledby={workspaceId+'-tab-condiciones'} hidden={tab!=='condiciones'} className="cp05-tab-content" tabIndex={0}>
              <div className="cp05-section-heading"><div><h2>Condiciones de la cotización</h2><p>Vigencia y detalle comercial del documento actual.</p></div></div>
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
              {canWrite && bundle.quote.status !== 'draft' && (
                <details className="dashboard-card cp05-conditions cp05-new-revision" open={revisionOpen} onToggle={e=>setRevisionOpen(e.currentTarget.open)}><summary>Nueva revisión o anulación</summary>
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
                </details>
              )}

            </div>
            <div role="tabpanel" id={workspaceId+'-panel-historial'} aria-labelledby={workspaceId+'-tab-historial'} hidden={tab!=='historial'} className="cp05-tab-content" tabIndex={0}>
              <QuoteHistory key={bundle.quote.id} bundle={bundle} busy={busy||!!readPending} archiveEnabled={repository.documents.enabled} onDownload={r=>void pdf(r)}/>
              <details className="cp05-ledger cp05-email-controls"><summary>Comunicaciones · revisar destinatario</summary>
                {issuedRevision ? (
                  <QuoteEmailReviewPanel key={issuedRevision.id}
                    revision={issuedRevision}
                    enabled={repository.documents.emailEnabled}
                    busy={busy || !!readPending}
                    canWrite={canWrite && bundle.quote.status !== 'voided' && !bundle.quote.issue_pending}
                    sent={bundle.deliveries.some(d => d.revision_id === issuedRevision.id && d.status === 'sent')}
                    pending={bundle.deliveries.some(d => d.revision_id === issuedRevision.id && d.status === 'queued' &&
                      !bundle.deliveries.some(end => end.revision_id === issuedRevision.id &&
                        end.attempt === d.attempt && (end.status === 'sent' || end.status === 'failed')))}
                    onSend={review => void documentAction('send', issuedRevision, review)}
                  />
                ) : <p>No existe una revisión emitida para preparar el correo.</p>}
              </details>
            </div>
          </>}
        </div>
      </div>
    </section>
  )
}
