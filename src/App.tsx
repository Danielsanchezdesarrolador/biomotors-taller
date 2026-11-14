import { useDemoSession } from './session/useDemoSession'
import { FlowHome } from './flow/FlowHome'
import { FlowCasePanel } from './flow/FlowCasePanel'
import { ReceptionWizard } from './flow/ReceptionWizard'
import { activeCaseId, selectedCase, selectCase, allCases, openCaseResource, type FlowResource } from './flow/flowSession'
import './flow/flow.css'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight, Bell, CalendarDays, CarFront, ChevronDown,
  CircleAlert, ClipboardCheck,
  FileText, House, Info, Menu, Search, Settings2,
  Wrench, X, type LucideIcon,
} from 'lucide-react'
import { demoVehicles } from './clientes/clientesData'
import { ConfiguracionPanel } from './configuracion/ConfiguracionPanel'
import { InformesPanel } from './informes/InformesPanel'
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
const metricItems: { label: string; value: number; icon: LucideIcon; className: string; destination: Screen }[] = [
  { label: 'Órdenes activas', value: 18, icon: Wrench, className: 'blue', destination: 'ordenes' },
  { label: 'Vehículos en taller', value: 14, icon: CarFront, className: 'violet', destination: 'clientes' },
  { label: 'Informes pendientes', value: 6, icon: ClipboardCheck, className: 'sky', destination: 'informes' },
  { label: 'Cotizaciones pendientes', value: 5, icon: FileText, className: 'purple', destination: 'informes' },
]

function App() {
  useDemoSession()
  const [homeView,setHomeView]=useState<'dashboard'|'reception'|'case'>('dashboard')
  const [receptionRequest,setReceptionRequest]=useState<string|undefined>()
  const [requestedInspectionReportId,setRequestedInspectionReportId]=useState<string|undefined>()
  const activeVisit=activeCaseId()?selectedCase():undefined
  const [screen, setScreen] = useState<Screen>('inicio')
  const [requestedWorkRequest,setRequestedWorkRequest]=useState<{orderId:string;mode:'quote'|'work';draftId?:string;compactQuote?:boolean}|undefined>()
  const [requestedInspectionOrderId,setRequestedInspectionOrderId]=useState<string|undefined>()
  const [requestedOrderId, setRequestedOrderId] = useState<string | undefined>()
  const [requestedVehicleId, setRequestedVehicleId] = useState<string | undefined>()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState('')
  const [showAccount, setShowAccount] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

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
    setRequestedInspectionReportId(undefined)
    setRequestedWorkRequest(undefined)
    setRequestedInspectionOrderId(undefined)
    setRequestedVehicleId(undefined)
    setRequestedOrderId(undefined)
    setScreen(next)
    if(next==='inicio')setHomeView('dashboard')
    setMobileMenuOpen(false)
    setShowAccount(false)
    setShowNotifications(false)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function openVisit(id:string){selectCase(id);setHomeView('case');window.scrollTo({top:0})}
  function returnToVisit(){navigate('inicio');setHomeView('case')}
  function openResource(resource:FlowResource){if(!activeVisit)return;const target=openCaseResource(activeVisit.id,resource);if(resource==='order'){navigate('ordenes');setRequestedOrderId(target.orderId)}else{navigate('informes');if(resource==='inspection'){setRequestedInspectionOrderId(target.orderId);setRequestedInspectionReportId(target.resourceId)}else setRequestedWorkRequest({orderId:target.orderId,mode:resource==='quote'?'quote':'work',draftId:target.resourceId,compactQuote:resource==='quote'})}}
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
              onFocus={() => { if (screen !== 'inicio' && screen !== 'ordenes' && screen !== 'clientes' && screen !== 'informes' && screen !== 'configuracion') navigate('inicio') }} onChange={e => setSearchText(e.target.value)} />
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
          {screen!=='inicio'&&activeVisit&&<div className="fl-return"><span>Expediente {activeVisit.orderId??activeVisit.id} · Memoria temporal</span><button className="rp-secondary" onClick={returnToVisit}>Volver al expediente <ArrowRight/></button></div>}
          {screen==='inicio'&&homeView==='reception'?<ReceptionWizard key={receptionRequest??'reception'} requestId={receptionRequest} onBack={()=>setHomeView('dashboard')} onComplete={openVisit}/>:screen==='inicio'&&homeView==='case'&&activeVisit?<FlowCasePanel key={activeVisit.id} id={activeVisit.id} onBack={()=>setHomeView('dashboard')} onOpen={openResource} onClient={vehicleId=>{navigate('clientes');setRequestedVehicleId(vehicleId)}}/>:screen === 'inicio' ? (
            <>
              <section className="welcome-area">
                <div className="welcome-art" aria-hidden="true" />
                <div className="welcome-head">
                  <div><h1>¿Qué vamos a hacer hoy?</h1><p>Gestiona el ingreso de vehículos y continúa los trabajos de tu taller.</p></div>
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

              <FlowHome query={searchText} onNew={()=>{setReceptionRequest(undefined);setHomeView('reception');window.scrollTo({top:0})}} onContinue={openVisit} onOrders={()=>navigate('ordenes')}/>
            </>
          ) : screen === 'ordenes' ? (
            <OrdenesPanel onWorkDocument={(orderId,mode)=>{navigate('informes');setRequestedWorkRequest({orderId,mode})}} onMultipunto={orderId=>{navigate('informes');setRequestedInspectionOrderId(orderId)}} globalSearch={searchText} onNotify={setNotice} initialOrderId={requestedOrderId} onClient={vehicleId => { const vehicle = demoVehicles.find(v => v.id === vehicleId); if (vehicle) { navigate('clientes'); setRequestedVehicleId(vehicle.id) } else { setNotice('Este vehículo temporal todavía no tiene una ficha DEMO asociada.') } }} />
          ) : screen === 'clientes' ? (
            <ClientesPanel onReviewRequest={id=>{const existing=allCases().find(v=>v.intakeRequestId===id);navigate('inicio');if(existing)openVisit(existing.id);else{setReceptionRequest(id);setHomeView('reception')}}} initialVehicleId={requestedVehicleId} globalSearch={searchText} onOrder={id => { navigate('ordenes'); setRequestedOrderId(id) }} />
          ) : screen === 'informes' ? (
            <InformesPanel initialInspectionReportId={requestedInspectionReportId} initialWorkRequest={requestedWorkRequest} globalSearch={searchText} initialInspectionOrderId={requestedInspectionOrderId} />
          ) : (
            <ConfiguracionPanel globalSearch={searchText} />
          )}
          <div className="demo-strip" role="note"><Info size={15} /><span><strong>Entorno de demostración:</strong> datos ficticios solo en memoria de esta pestaña. Recargar descarta los cambios nuevos. Sin guardado permanente ni correos.</span></div>
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
