import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight, BarChart3, Bell, CalendarDays, CarFront, Check, ChevronDown, Clock3, Zap,
  ChevronRight, CircleAlert, ClipboardCheck, FilePlus2,
  FileText, House, Info, Menu, Search, Settings2,
  UsersRound, Wrench, X, type LucideIcon,
} from 'lucide-react'
import { demoActivities, filterDemoOrders, getDashboardMetrics, orderStatuses, type OrderStatus } from './demo/dashboard'
import { demoVehicles } from './clientes/clientesData'
import { ClientesPanel } from './clientes/ClientesPanel'
import { OrdenesPanel } from './ordenes/OrdenesPanel'

type Screen = 'inicio' | 'ordenes' | 'clientes' | 'informes' | 'configuracion'
type NavItem = { id: Screen; label: string; compact: string; icon: LucideIcon }
const navItems: NavItem[] = [
  { id: 'inicio', label: 'Inicio', compact: 'Inicio', icon: House },
  { id: 'ordenes', label: 'Órdenes de trabajo', compact: 'Órdenes', icon: Wrench },
  { id: 'clientes', label: 'Clientes y vehículos', compact: 'Clientes', icon: CarFront },
  { id: 'informes', label: 'Informes y cotizaciones', compact: 'Informes', icon: FileText },
  { id: 'configuracion', label: 'Configuración', compact: 'Más', icon: Settings2 },
]
const moduleDetails: Record<Exclude<Screen, 'inicio'>, { title: string; description: string; items: string[]; icon: LucideIcon }> = {
  ordenes: { title: 'Órdenes de trabajo', description: 'Gestiona diagnósticos, servicios y observaciones de los vehículos.', icon: Wrench, items: ['Crear una orden de trabajo', 'Inspección multipunto', 'Seguimiento del estado de la reparación'] },
  clientes: { title: 'Clientes y vehículos', description: 'Mantén las fichas y el historial técnico asociados a tu taller.', icon: UsersRound, items: ['Registro de clientes mediante enlace', 'Fichas de vehículos y patentes', 'Historial y observaciones pendientes'] },
  informes: { title: 'Informes y cotizaciones', description: 'Prepara los documentos y envíalos por correo cuando esté habilitado.', icon: ClipboardCheck, items: ['Informes de revisión multipunto', 'Presupuestos en PDF', 'Envío verificado al correo del cliente'] },
  configuracion: { title: 'Configuración', description: 'Gestiona el perfil del taller y las preferencias del equipo.', icon: Settings2, items: ['Datos e identidad del taller', 'Usuarios y permisos', 'Plantillas, correos y enlaces'] },
}
const quickActions: { label: string; sub: string; icon: LucideIcon; to: Screen }[] = [
  { label: 'Nueva orden', sub: 'Crear OT', icon: FilePlus2, to: 'ordenes' },
  { label: 'Nuevo cliente', sub: 'Registrar cliente', icon: UsersRound, to: 'clientes' },
  { label: 'Nuevo informe', sub: 'Preparar revisión', icon: FileText, to: 'informes' },
]
const metricItems: { label: string; value: number; icon: LucideIcon; className: string; destination: Screen }[] = [
  { label: 'Órdenes activas', value: 18, icon: Wrench, className: 'blue', destination: 'ordenes' },
  { label: 'Vehículos en taller', value: 14, icon: CarFront, className: 'violet', destination: 'clientes' },
  { label: 'Informes pendientes', value: 6, icon: ClipboardCheck, className: 'sky', destination: 'informes' },
  { label: 'Cotizaciones pendientes', value: 5, icon: FileText, className: 'purple', destination: 'informes' },
]

function StateBadge({ status }: { status: OrderStatus }) {
  return <span className={'order-status status-' + status.key}>{status.label}</span>
}

function App() {
  const [screen, setScreen] = useState<Screen>('inicio')
  const [requestedOrderId, setRequestedOrderId] = useState<string | undefined>()
  const [requestedVehicleId, setRequestedVehicleId] = useState<string | undefined>()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState('')
  const [showAccount, setShowAccount] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [filter, setFilter] = useState('todas')
  const metrics = useMemo(getDashboardMetrics, [])
  const visibleOrders = useMemo(() => filterDemoOrders(searchText, filter), [searchText, filter])

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  function navigate(next: Screen) {
    setRequestedVehicleId(undefined)
    setRequestedOrderId(undefined)
    setScreen(next)
    setMobileMenuOpen(false)
    setShowAccount(false)
    setShowNotifications(false)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function planned(action: string) {
    setNotice(action + ' estará disponible después de conectar la cuenta segura del taller.')
  }
  const formattedDate = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Santiago' }).format(new Date())

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button className="mobile-overlay" type="button" aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={'sidebar' + (mobileMenuOpen ? ' sidebar-open' : '')} aria-label="Menú principal">
        <div className="sidebar-top">
          <button className="brand" type="button" onClick={() => navigate('inicio')} aria-label="ByteTorque, ir al inicio">
            <span className="brand-mark"><Wrench size={23} strokeWidth={2.8} /></span>
            <span className="brand-name">Byte<span>Torque</span><small>Gestión de Talleres</small></span>
          </button>
          <button type="button" className="menu-close" aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)}><X size={22} /></button>
        </div>
        <p className="sidebar-caption">MENÚ PRINCIPAL</p>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button type="button" key={id} className={'side-link' + (id === screen ? ' active' : '')}
              aria-current={screen === id ? 'page' : undefined} onClick={() => navigate(id)}>
              <Icon size={20} strokeWidth={1.9} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-end">
          <div className="workshop-info">
            <span className="workshop-badge"><Wrench size={23} /></span>
            <div><strong>Taller de demostración</strong><small>Entorno de muestra</small><span><i /> Sin datos reales</span></div>
          </div>
          <p className="sidebar-version">ByteTorque · BT-UI-02-R2 · DEMO</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button type="button" className="mobile-hamburger" aria-label="Abrir menú" onClick={() => setMobileMenuOpen(true)}><Menu size={23} /></button>
          <div className="topbar-search">
            <Search size={18} aria-hidden="true" />
            <input ref={searchRef} aria-label="Buscar en órdenes de muestra" placeholder="Buscar cliente, vehículo u orden de trabajo..." value={searchText}
              onFocus={() => { if (screen !== 'inicio' && screen !== 'ordenes' && screen !== 'clientes') navigate('inicio') }} onChange={e => setSearchText(e.target.value)} />
            {searchText ? <button type="button" aria-label="Limpiar búsqueda" onClick={() => setSearchText('')}><X size={15} /></button> : <span className="shortcut-hint" aria-hidden="true"><kbd>Ctrl</kbd><kbd>K</kbd></span>}
          </div>
          <div className="topbar-controls">
            <div className="popover-anchor">
              <button type="button" className="icon-button" aria-label="Notificaciones" aria-expanded={showNotifications}
                onClick={() => { setShowNotifications(!showNotifications); setShowAccount(false) }}><Bell size={21} /><i className="bell-dot" /></button>
              {showNotifications && <div className="top-popover" role="status"><strong>Notificaciones</strong><p>Sin notificaciones reales. Estamos en modo demostración.</p></div>}
            </div>
            <span className="top-divider" />
            <div className="popover-anchor">
              <button className="account-trigger" type="button" aria-expanded={showAccount} onClick={() => { setShowAccount(!showAccount); setShowNotifications(false) }}>
                <span className="avatar">BT</span><span className="account-copy"><strong>Cuenta de prueba</strong><small>Taller de demostración</small></span><ChevronDown size={16} />
              </button>
              {showAccount && <div className="top-popover account-popover"><strong>ByteTorque</strong><p>La autenticación y gestión de talleres se habilitarán en una etapa posterior.</p><button type="button" onClick={() => navigate('configuracion')}>Ver configuración <ArrowRight size={15} /></button></div>}
            </div>
          </div>
        </header>

        <main className="dashboard-main" id="main-content">
          {notice && <div className="action-alert" role="status"><CircleAlert size={17}/><span>{notice}</span><button type="button" aria-label="Cerrar aviso" onClick={() => setNotice('')}><X size={17}/></button></div>}
          {screen === 'inicio' ? (
            <>
              <section className="welcome-area">
                <div className="welcome-art" aria-hidden="true" />
                <div className="welcome-head">
                  <div><h1>¡Hola, equipo! <span aria-hidden="true">👋</span></h1><p>Aquí tienes el resumen de tu taller hoy.</p></div>
                  <span className="date-pill"><CalendarDays size={18}/> {formattedDate}</span>
                </div>
                <div className="metric-grid">
                  {metricItems.map(({ label, value, icon: Icon, className, destination }) => (
                    <button type="button" key={label} className="metric-card" onClick={() => navigate(destination)}>
                      <span className={'metric-icon ' + className}><Icon size={27} strokeWidth={2.2}/></span>
                      <span className="metric-content"><span className="metric-title">{label}</span><strong>{value}</strong></span>
                      <span className="metric-footnote sr-only">Valor de demostración</span>
                    </button>
                  ))}
                </div>
              </section>

              <div className="overview-grid">
                <section className="dashboard-card statuses-panel" aria-labelledby="statuses-title">
                  <div className="card-head"><h2 id="statuses-title"><BarChart3 size={21} aria-hidden="true"/> Estado de órdenes</h2><span className="tag-demo">Ejemplo</span></div>
                  <div className="statuses-layout">
                    <div className="donut"><span><strong>{metrics.active}</strong><small>órdenes</small></span></div>
                    <div className="status-legend">
                      {orderStatuses.map(status => (
                        <button type="button" key={status.key} className="legend-line" onClick={() => setFilter(filter === status.key ? 'todas' : status.key)}>
                          <i style={{ background: status.color }} /> <span>{status.label}</span><strong>{status.count}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="card-help">Selecciona un estado para filtrar las órdenes de ejemplo.</p>
                </section>
                <section className="dashboard-card orders-panel" aria-labelledby="orders-title">
                  <div className="card-head"><h2 id="orders-title"><CarFront size={21} aria-hidden="true"/> Órdenes recientes</h2><button type="button" className="text-action" onClick={() => navigate('ordenes')}>Ver todas <ArrowRight size={16}/></button></div>
                  {filter !== 'todas' && <button type="button" className="active-filter" onClick={() => setFilter('todas')}>Filtro activo · Limpiar <X size={13}/></button>}
                  <div className="orders-list">
                    {visibleOrders.length === 0 ? <div className="empty-results"><Search size={24}/><p>Sin coincidencias en los ejemplos.</p><button onClick={() => {setFilter('todas');setSearchText('')}} type="button">Restablecer búsqueda</button></div> : visibleOrders.map(order => (
                      <button className="order-row" type="button" key={order.id} onClick={() => navigate('ordenes')}>
                        <span className="order-car"><CarFront size={26}/></span>
                        <span className="order-detail"><strong>{order.id}</strong><span>{order.vehicle}</span><small>{order.work}</small></span>
                        <StateBadge status={order.status}/>
                        <ChevronRight size={16} className="row-arrow"/>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
              <div className="lower-grid">
                <section className="dashboard-card activity-panel" aria-labelledby="activity-title">
                  <div className="card-head"><h2 id="activity-title"><Clock3 size={21} aria-hidden="true"/> Actividad reciente</h2><span className="tag-demo">Simulada</span></div>
                  <div className="activity-list">
                    {demoActivities.map(activity => (
                      <div className="activity-row" key={activity.id}>
                        <span className={'activity-icon ' + activity.type}>{activity.type === 'success' ? <Check size={19}/> : activity.type === 'document' ? <FileText size={18}/> : <Wrench size={18}/>}</span>
                        <span><strong>{activity.title}</strong><small>{activity.description}</small></span>
                        <time>{activity.time}</time>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="dashboard-card shortcuts-panel" aria-labelledby="shortcuts-title">
                  <div className="card-head"><h2 id="shortcuts-title"><Zap size={21} aria-hidden="true"/> Accesos rápidos</h2></div>
                  <div className="shortcuts-grid">
                    {quickActions.map(({ label, sub, icon: Icon, to }, index) => (
                      <button type="button" key={label} className={'shortcut ' + (index === 0 ? 'primary' : '')} onClick={() => navigate(to)}>
                        <Icon size={27} strokeWidth={1.8}/><strong>{label}</strong><small>{sub}</small>
                      </button>
                    ))}
                  </div>
                  <p className="card-help sr-only">Los módulos se habilitarán al conectar la base de datos.</p>
                </section>
              </div>
            </>
          ) : screen === 'ordenes' ? (
            <OrdenesPanel globalSearch={searchText} onNotify={setNotice} initialOrderId={requestedOrderId} onClient={plate => { const vehicle = demoVehicles.find(v => v.plate === plate); if (vehicle) { navigate('clientes'); setRequestedVehicleId(vehicle.id) } else { setNotice('Este vehículo temporal todavía no tiene una ficha DEMO asociada.') } }} />
          ) : screen === 'clientes' ? (
            <ClientesPanel initialVehicleId={requestedVehicleId} globalSearch={searchText} onOrder={id => { navigate('ordenes'); setRequestedOrderId(id) }} />
          ) : (
            <section className="module-placeholder">
              <div className="module-title-row">
                <div><p className="section-eyebrow">MÓDULO EN DESARROLLO</p><h1>{moduleDetails[screen].title}</h1><p>{moduleDetails[screen].description}</p></div>
                <span className="module-big-icon">{(() => { const Icon = moduleDetails[screen].icon; return <Icon size={35}/> })()}</span>
              </div>
              <div className="module-card dashboard-card">
                <h2>¿Qué podrás hacer aquí?</h2>
                {moduleDetails[screen].items.map(item => <div key={item} className="planned-row"><span><Check size={16}/></span>{item}</div>)}
                <button className="main-action" type="button" onClick={() => planned('Este módulo')}>Próximamente <ArrowRight size={16}/></button>
              </div>
              <button className="return-home" type="button" onClick={() => navigate('inicio')}><House size={16}/> Volver al Inicio</button>
            </section>
          )}
          <div className="demo-strip" role="note"><Info size={15} /><span><strong>Entorno de demostración:</strong> todas las cifras y órdenes son ficticias. No se registran clientes ni se envían correos.</span></div>
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Navegación móvil">
        {navItems.map(({ id, compact, icon: Icon }) =>
          <button type="button" key={id} className={'bottom-item' + (screen === id ? ' selected' : '')} aria-current={screen === id ? 'page' : undefined} onClick={() => navigate(id)}>
            <Icon size={22} strokeWidth={screen === id ? 2.3 : 1.8} /><span>{compact}</span>
          </button>)}
      </nav>
    </div>
  )
}

export default App
