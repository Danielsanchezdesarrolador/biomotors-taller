import { useState } from 'react'
import {
  ArrowRight, Building2, CarFront, CheckCircle2, ChevronRight,
  ClipboardCheck, Cloud, FileText, House, Info, LockKeyhole,
  Menu, ShieldCheck, Smartphone, UsersRound, Wrench, X,
  type LucideIcon,
} from 'lucide-react'

type Screen = 'inicio' | 'clientes' | 'vehiculos' | 'revisiones' | 'presupuestos'

type Section = {
  id: Screen
  label: string
  description: string
  icon: LucideIcon
}

const sections: Section[] = [
  { id: 'inicio', label: 'Inicio', description: 'Resumen general', icon: House },
  { id: 'clientes', label: 'Clientes', description: 'Fichas de clientes', icon: UsersRound },
  { id: 'vehiculos', label: 'Vehículos', description: 'Autos e historiales', icon: CarFront },
  { id: 'revisiones', label: 'Revisiones', description: 'Inspección multipunto', icon: ClipboardCheck },
  { id: 'presupuestos', label: 'Presupuestos', description: 'Cotizaciones formales', icon: FileText },
]

const metricCards = [
  { label: 'Clientes', amount: '0', description: 'Sin clientes registrados', icon: UsersRound, screen: 'clientes' },
  { label: 'Vehículos', amount: '0', description: 'Sin vehículos registrados', icon: CarFront, screen: 'vehiculos' },
  { label: 'Revisiones', amount: '0', description: 'Sin inspecciones realizadas', icon: ClipboardCheck, screen: 'revisiones' },
  { label: 'Presupuestos', amount: '0', description: 'Sin presupuestos creados', icon: FileText, screen: 'presupuestos' },
] as const

const sectionDetails: Record<Exclude<Screen, 'inicio'>, { lead: string; steps: string[]; icon: LucideIcon }> = {
  clientes: {
    lead: 'Aquí podrás registrar los datos y el contacto de cada cliente, para no depender de conversaciones antiguas.',
    steps: ['Crear fichas de clientes', 'Buscar por nombre y contacto', 'Relacionar clientes con sus vehículos'],
    icon: UsersRound,
  },
  vehiculos: {
    lead: 'Recupera rápidamente el historial de cada automóvil cuando vuelva al taller, incluso después de varios años.',
    steps: ['Registrar vehículos y patente', 'Consultar historial cronológico', 'Ver observaciones que quedaron pendientes'],
    icon: CarFront,
  },
  revisiones: {
    lead: 'Digitalizaremos la hoja de inspección multipunto real que utiliza Ignacio, respetando su forma de trabajo.',
    steps: ['Completar revisión desde el teléfono', 'Agregar hallazgos y recomendaciones', 'Conservar revisiones anteriores'],
    icon: ClipboardCheck,
  },
  presupuestos: {
    lead: 'Prepara cotizaciones formales asociadas a un vehículo y, más adelante, envíalas por correo al cliente.',
    steps: ['Ingresar repuestos y mano de obra', 'Generar un documento PDF', 'Enviar por correo con registro de entrega'],
    icon: FileText,
  },
}

function App() {
  const [screen, setScreen] = useState<Screen>('inicio')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const active = sections.find((item) => item.id === screen) ?? sections[0]

  function navigate(destination: Screen) {
    setScreen(destination)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button className="mobile-overlay" aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-mark" aria-hidden="true"><Wrench size={22} strokeWidth={2.6} /></div>
            <div className="brand-name">TallerFlow <span>GESTIÓN AUTOMOTRIZ</span></div>
          </div>
          <button className="menu-close" type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú">
            <X size={21} />
          </button>
        </div>
        <div className="workspace-pill">
          <div className="workspace-icon"><Building2 size={18} /></div>
          <div><strong>Espacio inicial</strong><span>Configuración pendiente</span></div>
        </div>
        <p className="sidebar-label">GESTIÓN DEL TALLER</p>
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" aria-current={screen === id ? 'page' : undefined}
              className={`nav-item ${screen === id ? 'is-active' : ''}`} onClick={() => navigate(id)}>
              <Icon size={20} strokeWidth={1.9} /><span>{label}</span>
              {screen === id && <ChevronRight className="nav-chevron" size={16} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="side-help">
            <ShieldCheck size={22} />
            <div><strong>Diseñado para crecer</strong><span>Cada taller tendrá su propio espacio privado.</span></div>
          </div>
          <span className="version">Versión inicial · BT-CP01</span>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" type="button" aria-label="Abrir menú" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <span className="breadcrumb">TallerFlow <ChevronRight size={15} /> <strong>{active.label}</strong></span>
          </div>
          <span className="demo-indicator"><span className="indicator-dot" /> Entorno de demostración</span>
        </header>

        <main className="content" id="main-content">
          <div className="page-head">
            <div>
              <p className="eyebrow">PLATAFORMA DE GESTIÓN AUTOMOTRIZ</p>
              <h1>{screen === 'inicio' ? 'Tu taller, organizado.' : active.label}</h1>
              <p className="page-description">
                {screen === 'inicio' ? 'Toda la información que necesitas, en un solo lugar.' : active.description}
              </p>
            </div>
            <span className="phase-chip"><CheckCircle2 size={16} /> Base inicial</span>
          </div>

          <div className="notice" role="status">
            <Info size={20} />
            <p><strong>Vista preliminar.</strong> Esta pantalla no almacena información real. No ingreses datos de clientes hasta que estén listos el acceso seguro y la base de datos.</p>
          </div>

          {screen === 'inicio' ? (
            <>
              <section className="hero" aria-labelledby="hero-title">
                <div className="hero-glow hero-glow-one" />
                <div className="hero-glow hero-glow-two" />
                <div className="hero-content">
                  <div className="hero-badge"><Wrench size={15} /> TallerFlow</div>
                  <h2 id="hero-title">Menos papeles.<br /><span>Más control.</span></h2>
                  <p>Clientes, vehículos, inspecciones y presupuestos. Estamos construyendo la herramienta que necesita tu taller.</p>
                  <button className="hero-button" type="button" onClick={() => navigate('clientes')}>
                    Explorar los módulos <ArrowRight size={19} />
                  </button>
                </div>
                <div className="hero-graphic" aria-hidden="true">
                  <div className="graphic-orbit orbit-outer"><CarFront size={49} strokeWidth={1.3} /></div>
                  <div className="graphic-orbit orbit-inner"><Wrench size={42} strokeWidth={1.4} /></div>
                </div>
              </section>

              <section aria-labelledby="summary-title" className="summary-section">
                <div className="section-title"><div><h2 id="summary-title">Resumen del taller</h2><p>Los módulos partirán sin datos hasta configurar la base segura.</p></div></div>
                <div className="metric-grid">
                  {metricCards.map(({ label, amount, description, icon: Icon, screen: destination }) => (
                    <button className="metric-card" type="button" key={label} onClick={() => navigate(destination)}>
                      <div className="metric-top"><span className="metric-icon"><Icon size={22} /></span><ChevronRight size={18} className="muted-icon" /></div>
                      <strong className="metric-number">{amount}</strong>
                      <span className="metric-label">{label}</span>
                      <span className="metric-description">{description}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="next-section" aria-labelledby="next-title">
                <div className="section-title"><div><h2 id="next-title">Lo que construiremos</h2><p>Funciones definidas a partir de las necesidades de Ignacio.</p></div></div>
                <div className="feature-grid">
                  <article className="feature-card"><span className="feature-icon"><ClipboardCheck size={23} /></span><h3>Revisión multipunto</h3><p>Completa inspecciones y conserva hallazgos técnicos para futuras visitas.</p></article>
                  <article className="feature-card"><span className="feature-icon"><FileText size={23} /></span><h3>Presupuestos formales</h3><p>Crea cotizaciones en PDF y envíalas al correo de cada cliente.</p></article>
                  <article className="feature-card"><span className="feature-icon"><Cloud size={23} /></span><h3>Historial centralizado</h3><p>Recupera datos de vehículos y reparaciones sin depender de WhatsApp.</p></article>
                </div>
              </section>
              <div className="trust-strip"><Smartphone size={18} /> Diseñado para iPhone, Android y computador <span className="trust-separator">·</span><LockKeyhole size={18} /> Separación de datos por taller: próxima etapa</div>
            </>
          ) : (
            <section className="module-surface" aria-labelledby="module-title">
              <div className="module-illustration"><active.icon size={40} strokeWidth={1.45} /></div>
              <span className="module-overline">MÓDULO EN PREPARACIÓN</span>
              <h2 id="module-title">{screen === 'clientes' ? 'Cada cliente, bien registrado.' : screen === 'vehiculos' ? 'Un historial para cada vehículo.' : screen === 'revisiones' ? 'Inspecciones sin papeleo.' : 'Cotizaciones claras y formales.'}</h2>
              <p className="module-intro">{sectionDetails[screen].lead}</p>
              <div className="module-roadmap">
                {sectionDetails[screen].steps.map((step) => <div key={step}><CheckCircle2 size={18} /><span>{step}</span></div>)}
              </div>
              <div className="module-footer"><Info size={17} /> Funcionalidad planificada. Aún no se pueden guardar registros.</div>
            </section>
          )}
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Navegación móvil">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" aria-current={screen === id ? 'page' : undefined}
            className={`bottom-nav-item ${screen === id ? 'bottom-active' : ''}`} onClick={() => navigate(id)}>
            <Icon size={22} strokeWidth={1.8}/><span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default App
