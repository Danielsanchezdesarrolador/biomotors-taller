import { useMemo, useState } from 'react'
import {
  ArrowLeft, ArrowRight, CalendarDays, CarFront, Check, CheckCircle2, ChevronRight,
  ClipboardCheck, ClipboardList, Clock3, FilePlus2, FileText, Filter, Info, LoaderCircle,
  Plus, RotateCcw, Search, ShieldCheck, TriangleAlert, UserRound, Wrench, X,
  type LucideIcon,
} from 'lucide-react'
import {
  demoWorkOrders, inspectionCategories, nextWorkStatus, searchWorkOrders, workStatusLabels,
  workStatusSequence, type InspectionState, type WorkOrder, type WorkStatus,
} from './ordenesData'
import './ordenes.css'

type Props = { globalSearch: string; onNotify: (message: string) => void }
type View = 'listado' | 'detalle' | 'nueva'
type Tab = 'resumen' | 'diagnostico' | 'inspeccion' | 'trabajos' | 'historial'
type Preview = 'normal' | 'vacio' | 'cargando' | 'error'
const formatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
const demoTotals: { label: string; value: number; icon: LucideIcon; tone: string; status: WorkStatus | 'todas' }[] = [
  { label: 'Órdenes activas', value: 18, icon: Wrench, tone: 'blue', status: 'todas' },
  { label: 'En diagnóstico', value: 4, icon: Search, tone: 'sky', status: 'diagnostico' },
  { label: 'En servicio', value: 6, icon: CarFront, tone: 'violet', status: 'servicio' },
  { label: 'Listas para entrega', value: 3, icon: CheckCircle2, tone: 'purple', status: 'entrega' },
]
const tabs: { id: Tab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' }, { id: 'diagnostico', label: 'Diagnóstico' },
  { id: 'inspeccion', label: 'Inspección multipunto' }, { id: 'trabajos', label: 'Trabajos y repuestos' },
  { id: 'historial', label: 'Historial' },
]
const formatMileage = (value: number) => new Intl.NumberFormat('es-CL').format(value) + ' km'
const demoDate = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date())
function Status({ value }: { value: WorkStatus }) {
  return <span className={'order-status status-' + value}>{workStatusLabels[value]}</span>
}
function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="bt-ot-card-title">{children}</h2>
}

export function OrdenesPanel({ globalSearch, onNotify }: Props) {
  const [orders, setOrders] = useState<WorkOrder[]>(demoWorkOrders)
  const [view, setView] = useState<View>('listado')
  const [selectedId, setSelectedId] = useState('OT-1001')
  const [tab, setTab] = useState<Tab>('resumen')
  const [filter, setFilter] = useState<WorkStatus | 'todas'>('todas')
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<Preview>('normal')
  const [inspection, setInspection] = useState<Record<string, InspectionState>>({})
  const [step, setStep] = useState(1)
  const [formError, setFormError] = useState('')
  const [draft, setDraft] = useState({
    client: '', vehicle: '', plate: '', date: demoDate(), mileage: '', reason: '', symptoms: '', notes: '',
  })
  const combinedQuery = [query, globalSearch].filter(Boolean).join(' ')
  const filtered = useMemo(() => searchWorkOrders(orders, combinedQuery, filter), [orders, combinedQuery, filter])
  const selected = orders.find(o => o.id === selectedId) || orders[0]

  function openDetail(id: string) {
    setSelectedId(id)
    setTab('resumen')
    setInspection({})
    setView('detalle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function newOrder() {
    setStep(1)
    setFormError('')
    setDraft({ client: '', vehicle: '', plate: '', date: demoDate(), mileage: '', reason: '', symptoms: '', notes: '' })
    setView('nueva')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function advance() {
    setFormError('')
    if (step === 1 && (!draft.client || !draft.plate)) {
      setFormError('Selecciona un cliente y su vehículo de demostración.')
      return
    }
    if (step === 2 && (!draft.reason.trim() || !draft.mileage || Number(draft.mileage) < 0 || !draft.date)) {
      setFormError('Completa el motivo de ingreso, kilometraje válido y fecha.')
      return
    }
    if (step < 3) setStep(step + 1)
  }
  function createLocalOrder() {
    if (!draft.client || !draft.plate || !draft.reason.trim() || draft.mileage === '' ||
      !Number.isFinite(Number(draft.mileage)) || Number(draft.mileage) < 0 || !draft.date) {
      setFormError('Faltan datos obligatorios: revisa los pasos anteriores.')
      return
    }
    const id = 'OT-DEMO-' + String(orders.length + 1).padStart(3, '0')
    const created: WorkOrder = {
      id, client: draft.client, vehicle: draft.vehicle, plate: draft.plate, service: draft.reason.trim(),
      date: draft.date.split('-').reverse().join('-'), mileage: Number(draft.mileage),
      status: 'diagnostico', technician: 'Sin asignar · DEMO', symptoms: draft.symptoms || 'Sin síntomas añadidos.',
      diagnosis: 'Diagnóstico pendiente (DEMOSTRACIÓN).',
      recommendation: 'Completar revisión técnica.', pending: draft.notes.trim() ? [draft.notes.trim()] : [],
    }
    setOrders(previous => [created, ...previous])
    onNotify('Orden creada únicamente en memoria DEMO. No se guardó en Supabase ni en un servidor; se perderá al recargar.')
    openDetail(id)
  }
  function changeStatus(order: WorkOrder) {
    if (order.status === 'finalizada') {
      onNotify('Esta orden de ejemplo ya está finalizada.')
      return
    }
    const next = nextWorkStatus(order.status)
    setOrders(previous => previous.map(item => item.id === order.id ? { ...item, status: next } : item))
    onNotify('Estado actualizado solamente en esta sesión DEMO. No se guardaron datos reales.')
  }
  function resetFilters() {
    setQuery('')
    setFilter('todas')
    setPreview('normal')
  }

  return (
    <div className="bt-ot" aria-label="Órdenes de trabajo DEMO">
      {view === 'listado' && <>
        <section className="bt-ot-hero">
          <div>
            <p className="bt-ot-eyebrow">OPERACIONES DEL TALLER · DEMOSTRACIÓN</p>
            <h1>Órdenes de trabajo</h1>
            <p>Gestiona diagnósticos, reparaciones y seguimiento de vehículos.</p>
          </div>
          <button type="button" className="bt-ot-primary" onClick={newOrder}><Plus size={20} /> Nueva orden</button>
        </section>
        <div className="metric-grid bt-ot-metrics">
          {demoTotals.map(({ label, value, icon: Icon, tone, status }) => (
            <button type="button" key={label} className="metric-card" aria-pressed={filter === status && status !== 'todas'}
              onClick={() => { setFilter(status); setPreview('normal') }}>
              <span className={'metric-icon ' + tone}><Icon size={27} strokeWidth={2.1}/></span>
              <span className="metric-content"><span className="metric-title">{label}</span><strong>{value}</strong></span>
            </button>
          ))}
        </div>
        <section className="dashboard-card bt-ot-list-card">
          <div className="bt-ot-section-top">
            <div><Title><ClipboardList size={23}/> Listado de órdenes</Title><p>Consulta y continúa tus trabajos de ejemplo.</p></div>
            <span className="bt-ot-demo-label"><Info size={14}/> Datos ficticios</span>
          </div>
          <div className="bt-ot-toolbar">
            <label className="bt-ot-search"><Search size={19}/><span className="sr-only">Buscar en órdenes de ejemplo</span>
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar OT, cliente, vehículo o patente..." />
            </label>
            <label className="bt-ot-select-wrap"><Filter size={17}/><span className="sr-only">Filtrar por estado</span>
              <select value={filter} onChange={event => setFilter(event.target.value as WorkStatus | 'todas')}>
                <option value="todas">Todos los estados</option>
                {workStatusSequence.map(status => <option value={status} key={status}>{workStatusLabels[status]}</option>)}
              </select>
            </label>
            <button type="button" className="bt-ot-secondary bt-ot-reset" onClick={resetFilters}><RotateCcw size={16}/> Limpiar</button>
            <label className="bt-ot-preview-control"><span className="sr-only">Previsualizar estado de interfaz</span>
              <select value={preview} onChange={event => setPreview(event.target.value as Preview)} aria-label="Previsualizar estados DEMO">
                <option value="normal">Vista DEMO</option><option value="vacio">Sin órdenes</option>
                <option value="cargando">Cargando</option><option value="error">Error de lectura</option>
              </select>
            </label>
          </div>
          {preview !== 'normal' ? (
            <div className="bt-ot-state" role="status">
              {preview === 'cargando' ? <LoaderCircle className="bt-ot-spin" size={38}/> :
                preview === 'error' ? <TriangleAlert size={38}/> : <ClipboardCheck size={38}/>}
              <h3>{preview === 'cargando' ? 'Cargando información…' : preview === 'error' ? 'No pudimos consultar las órdenes' : 'Sin órdenes registradas'}</h3>
              <p>{preview === 'cargando' ? 'Vista previa del estado de carga del sistema.' :
                preview === 'error' ? 'Esta es una simulación de error. Revisa tu conexión e inténtalo nuevamente.' :
                  'Cuando registres una orden de trabajo, aparecerá en este espacio.'}</p>
              <button type="button" className="bt-ot-secondary" onClick={() => setPreview('normal')}>{preview === 'error' ? 'Reintentar' : 'Volver a las órdenes DEMO'}</button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bt-ot-state" role="status"><Search size={36}/><h3>Sin resultados de búsqueda</h3>
              <p>No se encontraron órdenes que coincidan con tus filtros.</p>
              <button className="bt-ot-secondary" type="button" onClick={resetFilters}>Limpiar filtros del módulo</button>
            </div>
          ) : <>
            <div className="bt-ot-table-wrap">
              <table className="bt-ot-table"><thead><tr>
                <th>Orden</th><th>Cliente</th><th>Vehículo / patente</th><th>Servicio</th><th>Ingreso</th><th>Estado</th><th><span className="sr-only">Acciones</span></th>
              </tr></thead><tbody>{filtered.map(order => <tr key={order.id}>
                <td><button className="bt-ot-link" type="button" onClick={() => openDetail(order.id)}>{order.id}</button></td>
                <td>{order.client}</td><td><span className="bt-ot-vehicle"><CarFront size={24}/><span>{order.vehicle}<small>{order.plate}</small></span></span></td>
                <td>{order.service}</td><td>{order.date}</td><td><Status value={order.status}/></td>
                <td><button type="button" className="bt-ot-open" aria-label={'Abrir ' + order.id} onClick={() => openDetail(order.id)}><ChevronRight size={20}/></button></td>
              </tr>)}</tbody></table>
            </div>
            <div className="bt-ot-mobile-list">
              {filtered.map(order => <button type="button" key={order.id} className="bt-ot-mobile-order" onClick={() => openDetail(order.id)}>
                <span className="bt-ot-mobile-order-head"><strong>{order.id}</strong><Status value={order.status}/></span>
                <span className="bt-ot-mobile-order-name"><CarFront size={23}/><span>{order.vehicle}<small>{order.client} · {order.plate}</small></span><ChevronRight size={20}/></span>
                <span className="bt-ot-mobile-order-work">{order.service} · {order.date}</span>
              </button>)}
            </div>
            <p className="bt-ot-count">Mostrando {filtered.length} órdenes ficticias · indicadores globales también simulados.</p>
          </>}
        </section>
      </>}

      {view === 'detalle' && selected && <>
        <section className="bt-ot-hero bt-ot-hero-compact">
          <div className="bt-ot-heading"><button type="button" className="bt-ot-back" onClick={() => setView('listado')} aria-label="Volver a las órdenes"><ArrowLeft size={20}/></button>
            <div><p className="bt-ot-eyebrow">FICHA TÉCNICA · DEMO</p><h1>{selected.id}</h1><p>{selected.vehicle} · {selected.plate}</p></div>
            <Status value={selected.status}/>
          </div>
          <div className="bt-ot-hero-actions">
            <button type="button" className="bt-ot-secondary" onClick={() => onNotify('Preparar informe estará disponible cuando se conecten documentos y permisos seguros.')}><FileText size={17}/> Crear informe</button>
            <button type="button" className="bt-ot-primary" onClick={() => changeStatus(selected)} disabled={selected.status === 'finalizada'}>
              <ArrowRight size={18}/> {selected.status === 'finalizada' ? 'Finalizada' : 'Continuar orden · DEMO'}
            </button>
          </div>
        </section>
        <div className="bt-ot-tabs" role="tablist" aria-label="Secciones de la orden">
          {tabs.map(item => <button type="button" role="tab" aria-selected={tab === item.id} className={tab === item.id ? 'active' : ''}
            key={item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}
        </div>
        {tab === 'resumen' && <>
          <div className="bt-ot-detail-grid">
            <section className="dashboard-card"><Title><UserRound size={21}/> Cliente y vehículo</Title>
              <dl className="bt-ot-facts">
                <div><dt>Cliente</dt><dd>{selected.client}</dd></div><div><dt>Vehículo</dt><dd>{selected.vehicle}</dd></div>
                <div><dt>Patente</dt><dd>{selected.plate}</dd></div><div><dt>Kilometraje</dt><dd>{formatMileage(selected.mileage)}</dd></div>
                <div><dt>Fecha de ingreso</dt><dd>{selected.date}</dd></div><div><dt>Técnico asignado</dt><dd>{selected.technician}</dd></div>
              </dl>
            </section>
            <section className="dashboard-card"><Title><ClipboardCheck size={21}/> Trabajo solicitado</Title>
              <div className="bt-ot-highlight"><strong>{selected.service}</strong><p>{selected.symptoms}</p></div>
              <p className="bt-ot-muted">Estado actual</p><Status value={selected.status}/>
            </section>
          </div>
          <div className="bt-ot-detail-grid">
            <section className="dashboard-card"><Title><Wrench size={21}/> Diagnóstico y recomendación</Title>
              <p className="bt-ot-description">{selected.diagnosis}</p>
              <p className="bt-ot-muted">Trabajo recomendado</p><p className="bt-ot-description">{selected.recommendation}</p>
              <button type="button" className="bt-ot-inline" onClick={() => setTab('diagnostico')}>Abrir diagnóstico <ArrowRight size={15}/></button>
            </section>
            <section className="dashboard-card bt-ot-pending"><Title><TriangleAlert size={21}/> Observaciones pendientes</Title>
              {selected.pending.length ? <ul>{selected.pending.map((item, index) => <li key={index}>{item}</li>)}</ul> :
                <p className="bt-ot-description">Sin observaciones técnicas pendientes en este ejemplo.</p>}
              <p className="bt-ot-muted">Las observaciones deberán conservarse en futuras visitas cuando exista backend seguro.</p>
            </section>
          </div>
        </>}
        {tab === 'diagnostico' && <div className="bt-ot-detail-grid">
          <section className="dashboard-card"><Title><ClipboardList size={21}/> Diagnóstico técnico</Title>
            <h3>Problema señalado por el cliente</h3><p className="bt-ot-description">{selected.symptoms}</p>
            <h3>Diagnóstico preliminar / fallas detectadas</h3><p className="bt-ot-description">{selected.diagnosis}</p>
            <h3>Trabajos recomendados</h3><p className="bt-ot-description">{selected.recommendation}</p>
          </section>
          <section className="dashboard-card"><Title><ShieldCheck size={21}/> Prioridad y seguimiento</Title>
            <span className="bt-ot-warn">Revisión técnica · DEMO</span>
            <p className="bt-ot-description">La prioridad definitiva se determinará después de completar la inspección real.</p>
            <Title><TriangleAlert size={20}/> Pendientes registrados</Title>
            {selected.pending.length ? <ul className="bt-ot-simple-list">{selected.pending.map(item => <li key={item}>{item}</li>)}</ul> :
              <p className="bt-ot-description">Sin pendientes registrados.</p>}
          </section>
        </div>}
        {tab === 'inspeccion' && <section className="dashboard-card bt-ot-inspection">
          <div className="bt-ot-section-top"><div><Title><ClipboardCheck size={23}/> Inspección multipunto</Title>
            <p>Modelo provisional: se adaptará a la hoja original de Ignacio.</p></div><span className="bt-ot-demo-label">Cambios locales DEMO</span></div>
          <div className="bt-ot-inspection-rows">{inspectionCategories.map(category => <label className="bt-ot-inspection-row" key={category.key}>
            <span><Wrench size={18}/>{category.label}</span>
            <select value={inspection[category.key] || 'no-revisado'} onChange={event => setInspection(previous => ({ ...previous, [category.key]: event.target.value as InspectionState }))}>
              <option value="no-revisado">No revisado</option><option value="correcto">Correcto</option><option value="atencion">Requiere atención</option>
            </select></label>)}</div>
          <p className="bt-ot-muted">Clasificaciones editables solamente en memoria. Los comentarios técnicos y el guardado definitivo se habilitarán con la ficha aprobada y el backend seguro.</p>
        </section>}
        {tab === 'trabajos' && <div className="bt-ot-detail-grid">
          <section className="dashboard-card"><Title><Wrench size={21}/> Trabajos y repuestos</Title>
            <div className="bt-ot-cost-row"><span>Servicio: {selected.service}</span><strong>{formatter.format(65000)}</strong></div>
            <div className="bt-ot-cost-row"><span>Repuesto de ejemplo (1 un.)</span><strong>{formatter.format(35000)}</strong></div>
            <div className="bt-ot-cost-row bt-ot-cost-total"><span>Total ilustrativo</span><strong>{formatter.format(100000)}</strong></div>
            <p className="bt-ot-muted">Precios ficticios, no constituyen presupuesto ni documento tributario.</p>
          </section>
          <section className="dashboard-card"><Title><FileText size={21}/> Observaciones</Title>
            <p className="bt-ot-description">{selected.recommendation}</p>
            <button type="button" className="bt-ot-secondary" onClick={() => onNotify('Las cotizaciones se habilitarán en Informes y cotizaciones, después de aprobar plantillas y seguridad.')}>Preparar cotización (próximamente)</button>
          </section>
        </div>}
        {tab === 'historial' && <section className="dashboard-card"><Title><Clock3 size={22}/> Progreso de la orden</Title>
          <ol className="bt-ot-timeline">{workStatusSequence.map((status, index) => {
            const current = workStatusSequence.indexOf(selected.status)
            return <li key={status} className={index < current ? 'done' : index === current ? 'current' : ''}>
              <span className="bt-ot-timeline-bullet">{index < current ? <Check size={16}/> : index + 1}</span>
              <div><strong>{workStatusLabels[status]}</strong><small>{index === current ? 'Estado actual (simulado)' : index < current ? 'Etapa de referencia completada' : 'Pendiente'}</small></div>
            </li>
          })}</ol><p className="bt-ot-muted">Línea de tiempo referencial: no representa una bitácora real ni guarda fechas de cambios.</p>
        </section>}
      </>}

      {view === 'nueva' && <>
        <section className="bt-ot-hero bt-ot-hero-compact">
          <div className="bt-ot-heading"><button type="button" className="bt-ot-back" aria-label="Cancelar nueva orden" onClick={() => { setView('listado'); onNotify('Creación de orden cancelada. No se almacenó información.') }}><ArrowLeft size={20}/></button>
            <div><p className="bt-ot-eyebrow">CREACIÓN GUIADA · DEMOSTRACIÓN</p><h1>Nueva orden</h1><p>Registra un trabajo en tres pasos sencillos.</p></div></div>
          <span className="bt-ot-demo-label"><Info size={15}/> Sin guardado real</span>
        </section>
        <div className="bt-ot-steps" aria-label="Progreso de nueva orden">
          {['Cliente y vehículo', 'Información del trabajo', 'Revisión y confirmación'].map((label, index) =>
            <div key={label} className={step === index + 1 ? 'current' : step > index + 1 ? 'done' : ''}>
              <span>{step > index + 1 ? <Check size={17}/> : index + 1}</span><strong>{label}</strong>
            </div>)}
        </div>
        <section className="dashboard-card bt-ot-form">
          {step === 1 && <><Title><CarFront size={23}/> Cliente y vehículo</Title><p>Elige un registro completamente ficticio.</p>
            <label>Cliente DEMO <select value={draft.client} onChange={event => {
              const order = demoWorkOrders.find(item => item.client === event.target.value)
              setDraft(previous => ({ ...previous, client: event.target.value, vehicle: order?.vehicle || '', plate: order?.plate || '' }))
            }}><option value="">Selecciona un cliente</option>{demoWorkOrders.map(o => <option key={o.id} value={o.client}>{o.client}</option>)}</select></label>
            <label>Vehículo asociado<input value={draft.vehicle ? draft.vehicle + ' · ' + draft.plate : ''} readOnly placeholder="Selecciona primero un cliente" /></label>
            <button type="button" className="bt-ot-inline" onClick={() => onNotify('El registro de nuevos clientes se habilitará en el módulo Clientes y vehículos.')}>Registrar otro cliente (próximamente) <ArrowRight size={15}/></button>
          </>}
          {step === 2 && <><Title><Wrench size={23}/> Información del trabajo</Title>
            <div className="bt-ot-form-grid"><label>Motivo de ingreso *<input value={draft.reason} maxLength={140} onChange={event => setDraft(previous => ({ ...previous, reason: event.target.value }))} placeholder="Ej.: revisión de frenos" /></label>
              <label>Kilometraje *<input type="number" min="0" max="9999999" value={draft.mileage} onChange={event => setDraft(previous => ({ ...previous, mileage: event.target.value }))} placeholder="Ej.: 60000" /></label>
              <label>Fecha de ingreso *<input type="date" value={draft.date} onChange={event => setDraft(previous => ({ ...previous, date: event.target.value }))}/></label>
              <label>Síntomas comunicados<textarea rows={3} maxLength={600} value={draft.symptoms} onChange={event => setDraft(previous => ({ ...previous, symptoms: event.target.value }))} placeholder="Descripción de la falla (DEMO)" /></label>
              <label className="bt-ot-span">Observaciones iniciales<textarea rows={3} maxLength={600} value={draft.notes} onChange={event => setDraft(previous => ({ ...previous, notes: event.target.value }))} placeholder="Notas técnicas preliminares (DEMO)" /></label>
            </div>
          </>}
          {step === 3 && <><Title><ClipboardCheck size={23}/> Revisa antes de crear</Title>
            <div className="bt-ot-review"><p><strong>Cliente</strong>{draft.client}</p><p><strong>Vehículo / patente</strong>{draft.vehicle} · {draft.plate}</p>
              <p><strong>Trabajo solicitado</strong>{draft.reason}</p><p><strong>Kilometraje</strong>{draft.mileage} km</p>
              <p><strong>Ingreso</strong>{draft.date}</p><p><strong>Síntomas</strong>{draft.symptoms || 'No informado'}</p>
              <p><strong>Observaciones</strong>{draft.notes || 'Sin observaciones'}</p></div>
            <p className="bt-ot-memory"><Info size={18}/> Al confirmar solo se creará una orden ficticia en la memoria de esta página. No se guardará, enviará ni publicará información.</p>
          </>}
          {formError && <p className="bt-ot-form-error" role="alert"><TriangleAlert size={17}/>{formError}</p>}
          <div className="bt-ot-form-actions">
            <button type="button" className="bt-ot-secondary" onClick={() => { setView('listado'); onNotify('Creación cancelada. No se almacenó información.') }}><X size={16}/> Cancelar</button>
            {step > 1 && <button type="button" className="bt-ot-secondary" onClick={() => { setStep(step - 1); setFormError('') }}><ArrowLeft size={16}/> Anterior</button>}
            <button type="button" className="bt-ot-primary" onClick={step < 3 ? advance : createLocalOrder}>
              {step < 3 ? <>Continuar <ArrowRight size={17}/></> : <><FilePlus2 size={17}/> Crear orden DEMO</>}
            </button>
          </div>
        </section>
      </>}
    </div>
  )
}
