import { useDemoSession } from '../../src/session/useDemoSession'
import { FlowHome } from '../../src/flow/FlowHome'
import { FlowCasePanel } from '../../src/flow/FlowCasePanel'
import { ReceptionWizard } from '../../src/flow/ReceptionWizard'
import {
  activeCaseId,
  selectedCase,
  selectCase,
  allCases,
  openCaseResource,
  type FlowResource
} from '../../src/flow/flowSession'
import '../../src/flow/flow.css'
import { useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  CircleAlert,
  ClipboardCheck,
  FileText,
  Info,
  Wrench,
  X,
  type LucideIcon
} from 'lucide-react'
import { AppShell } from '../../src/layout/AppShell'
import { demoVehicles } from '../../src/clientes/clientesData'
import { ConfiguracionPanel } from '../../src/configuracion/ConfiguracionPanel'
import { InformesPanel } from '../../src/informes/InformesPanel'
import { ClientesPanel } from '../../src/clientes/ClientesPanel'
import { OrdenesPanel } from '../../src/ordenes/OrdenesPanel'

type Screen = 'agenda' | 'inicio' | 'ordenes' | 'clientes' | 'informes' | 'configuracion'
const metricItems: {
  label: string
  value: number
  icon: LucideIcon
  className: string
  destination: Screen
}[] = [
  { label: 'Órdenes activas', value: 18, icon: Wrench, className: 'blue', destination: 'ordenes' },
  {
    label: 'Vehículos en taller',
    value: 14,
    icon: CarFront,
    className: 'violet',
    destination: 'clientes'
  },
  {
    label: 'Informes pendientes',
    value: 6,
    icon: ClipboardCheck,
    className: 'sky',
    destination: 'informes'
  },
  {
    label: 'Cotizaciones pendientes',
    value: 5,
    icon: FileText,
    className: 'purple',
    destination: 'informes'
  }
]

function App() {
  useDemoSession()
  const [homeView, setHomeView] = useState<'dashboard' | 'reception' | 'case'>('dashboard')
  const [receptionRequest, setReceptionRequest] = useState<string | undefined>()
  const [requestedInspectionReportId, setRequestedInspectionReportId] = useState<
    string | undefined
  >()
  const activeVisit = activeCaseId() ? selectedCase() : undefined
  const [screen, setScreen] = useState<Screen>('inicio')
  const [requestedWorkRequest, setRequestedWorkRequest] = useState<
    | { orderId: string; mode: 'quote' | 'work'; draftId?: string; compactQuote?: boolean }
    | undefined
  >()
  const [requestedInspectionOrderId, setRequestedInspectionOrderId] = useState<string | undefined>()
  const [requestedOrderId, setRequestedOrderId] = useState<string | undefined>()
  const [requestedVehicleId, setRequestedVehicleId] = useState<string | undefined>()
  const [searchText, setSearchText] = useState('')
  const [notice, setNotice] = useState('')
  function navigate(next: Screen) {
    setRequestedInspectionReportId(undefined)
    setRequestedWorkRequest(undefined)
    setRequestedInspectionOrderId(undefined)
    setRequestedVehicleId(undefined)
    setRequestedOrderId(undefined)
    setScreen(next)
    if (next === 'inicio') setHomeView('dashboard')
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function openVisit(id: string) {
    selectCase(id)
    setHomeView('case')
    window.scrollTo({ top: 0 })
  }
  function returnToVisit() {
    navigate('inicio')
    setHomeView('case')
  }
  function openResource(resource: FlowResource) {
    if (!activeVisit) return
    const target = openCaseResource(activeVisit.id, resource)
    if (resource === 'order') {
      navigate('ordenes')
      setRequestedOrderId(target.orderId)
    } else {
      navigate('informes')
      if (resource === 'inspection') {
        setRequestedInspectionOrderId(target.orderId)
        setRequestedInspectionReportId(target.resourceId)
      } else
        setRequestedWorkRequest({
          orderId: target.orderId,
          mode: resource === 'quote' ? 'quote' : 'work',
          draftId: target.resourceId,
          compactQuote: resource === 'quote'
        })
    }
  }
  // Visual-only harness fixture, never included in the official Render bundle.
  const requestedPlan = typeof window === 'undefined'
    ? null
    : new URLSearchParams(window.location.search).get('uiPolishPlan')
  const visualPlan = requestedPlan === 'basic' || requestedPlan === 'plus' ||
    requestedPlan === 'full' ? requestedPlan : null
  const formattedDate = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago'
  }).format(new Date())

  return (
    <AppShell
      screen={screen}
      onNavigate={navigate}
      search={{ value: searchText, onChange: setSearchText, label: 'Buscar en órdenes de muestra' }}
      copy={{
        workshopTitle: 'Taller de demostración',
        workshopSubtitle: 'Entorno de muestra',
        workshopStatus: 'Sin datos reales',
        version: 'ByteTorque · BT-UI-02-R2 · DEMO',
        accountTitle: visualPlan ? 'Nombre Apellido de Verificación Extensa' : 'Cuenta de prueba',
        accountSubtitle: visualPlan ? 'Administrador' : 'Taller de demostración',
        accountPlan: visualPlan ? {
          scope: 'personal',
          effectivePlan: visualPlan,
          personalPlan: visualPlan,
          isLifetime: false,
          expiresAt: null,
          workshopId: null
        } : undefined,
        notifications: 'Sin notificaciones reales. Estamos en modo demostración.',
        avatarText: 'BT',
        notificationDot: true
      }}
    >
      {notice && (
        <div className="action-alert" role="status">
          <CircleAlert size={17} />
          <span>{notice}</span>
          <button type="button" aria-label="Cerrar aviso" onClick={() => setNotice('')}>
            <X size={17} />
          </button>
        </div>
      )}
      {screen !== 'inicio' && activeVisit && (
        <div className="fl-return">
          <span>Expediente {activeVisit.orderId ?? activeVisit.id} · Memoria temporal</span>
          <button className="rp-secondary" onClick={returnToVisit}>
            Volver al expediente <ArrowRight />
          </button>
        </div>
      )}
      {screen === 'inicio' && homeView === 'reception' ? (
        <ReceptionWizard
          key={receptionRequest ?? 'reception'}
          requestId={receptionRequest}
          onBack={() => setHomeView('dashboard')}
          onComplete={openVisit}
        />
      ) : screen === 'inicio' && homeView === 'case' && activeVisit ? (
        <FlowCasePanel
          key={activeVisit.id}
          id={activeVisit.id}
          onBack={() => setHomeView('dashboard')}
          onOpen={openResource}
          onClient={(vehicleId) => {
            navigate('clientes')
            setRequestedVehicleId(vehicleId)
          }}
        />
      ) : screen === 'inicio' ? (
        <>
          <section className="welcome-area">
            <div className="welcome-art" aria-hidden="true" />
            <div className="welcome-head">
              <div>
                <h1>¿Qué vamos a hacer hoy?</h1>
                <p>Gestiona el ingreso de vehículos y continúa los trabajos de tu taller.</p>
              </div>
              <span className="date-pill">
                <CalendarDays size={18} /> {formattedDate}
              </span>
            </div>
            <div className="metric-grid">
              {metricItems.map(({ label, value, icon: Icon, className, destination }) => (
                <button
                  type="button"
                  key={label}
                  className="metric-card"
                  onClick={() => navigate(destination)}
                >
                  <span className={'metric-icon ' + className}>
                    <Icon size={27} strokeWidth={2.2} />
                  </span>
                  <span className="metric-content">
                    <span className="metric-title">{label}</span>
                    <strong>{value}</strong>
                  </span>
                  <span className="metric-footnote sr-only">Valor de demostración</span>
                </button>
              ))}
            </div>
          </section>

          <FlowHome
            query={searchText}
            onNew={() => {
              setReceptionRequest(undefined)
              setHomeView('reception')
              window.scrollTo({ top: 0 })
            }}
            onContinue={openVisit}
            onOrders={() => navigate('ordenes')}
          />
        </>
      ) : screen === 'ordenes' ? (
        <OrdenesPanel
          onWorkDocument={(orderId, mode) => {
            navigate('informes')
            setRequestedWorkRequest({ orderId, mode })
          }}
          onMultipunto={(orderId) => {
            navigate('informes')
            setRequestedInspectionOrderId(orderId)
          }}
          globalSearch={searchText}
          onNotify={setNotice}
          initialOrderId={requestedOrderId}
          onClient={(vehicleId) => {
            const vehicle = demoVehicles.find((v) => v.id === vehicleId)
            if (vehicle) {
              navigate('clientes')
              setRequestedVehicleId(vehicle.id)
            } else {
              setNotice('Este vehículo temporal todavía no tiene una ficha DEMO asociada.')
            }
          }}
        />
      ) : screen === 'clientes' ? (
        <ClientesPanel
          onReviewRequest={(id) => {
            const existing = allCases().find((v) => v.intakeRequestId === id)
            navigate('inicio')
            if (existing) openVisit(existing.id)
            else {
              setReceptionRequest(id)
              setHomeView('reception')
            }
          }}
          initialVehicleId={requestedVehicleId}
          globalSearch={searchText}
          onOrder={(id) => {
            navigate('ordenes')
            setRequestedOrderId(id)
          }}
        />
      ) : screen === 'informes' ? (
        <InformesPanel
          initialInspectionReportId={requestedInspectionReportId}
          initialWorkRequest={requestedWorkRequest}
          globalSearch={searchText}
          initialInspectionOrderId={requestedInspectionOrderId}
        />
      ) : (
        <ConfiguracionPanel globalSearch={searchText} />
      )}
      <div className="demo-strip" role="note">
        <Info size={15} />
        <span>
          <strong>Entorno de demostración:</strong> datos ficticios solo en memoria de esta pestaña.
          Recargar descarta los cambios nuevos. Sin guardado permanente ni correos.
        </span>
      </div>
    </AppShell>
  )
}
export default App
