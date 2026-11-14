import { BrandLogo } from '../brand/BrandLogo'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Bell,
  CarFront,
  ChevronDown,
  FileText,
  House,
  Menu,
  Search,
  Settings2,
  UserRound,
  Wrench,
  X,
  type LucideIcon
} from 'lucide-react'
export type Screen = 'inicio' | 'ordenes' | 'clientes' | 'informes' | 'configuracion'
export const navItems: { id: Screen; label: string; compact: string; icon: LucideIcon }[] = [
  { id: 'inicio', label: 'Inicio', compact: 'Inicio', icon: House },
  { id: 'ordenes', label: 'Órdenes de trabajo', compact: 'Órdenes', icon: Wrench },
  { id: 'clientes', label: 'Clientes y vehículos', compact: 'Clientes', icon: CarFront },
  { id: 'informes', label: 'Informes y cotizaciones', compact: 'Informes', icon: FileText },
  { id: 'configuracion', label: 'Configuración', compact: 'Config.', icon: Settings2 }
]
type ShellCopy = {
  workshopTitle: string
  workshopSubtitle: string
  workshopStatus: string
  version: string
  accountTitle: string
  accountSubtitle: string
  notifications: string
  avatarText?: string
  notificationDot?: boolean
}
const officialCopy: ShellCopy = {
  workshopTitle: 'Tu taller aún no está configurado',
  workshopSubtitle: 'Acceso seguro en preparación',
  workshopStatus: 'Configuración pendiente',
  version: 'ByteTorque · Gestión de talleres',
  accountTitle: 'Acceso en preparación',
  accountSubtitle: 'Sin sesión iniciada',
  notifications: 'No hay notificaciones disponibles. El acceso seguro aún está en preparación.'
}
export function AppShell({
  screen,
  onNavigate,
  search,
  copy = officialCopy,
  children
}: {
  screen: Screen
  onNavigate: (screen: Screen) => void
  search?: { value: string; onChange: (value: string) => void; label: string }
  copy?: ShellCopy
  children: ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false),
    [showAccount, setShowAccount] = useState(false),
    [showNotifications, setShowNotifications] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const focus = (event: KeyboardEvent) => {
      if (search && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', focus)
    return () => window.removeEventListener('keydown', focus)
  }, [search])
  function navigate(next: Screen) {
    onNavigate(next)
    setMobileMenuOpen(false)
    setShowAccount(false)
    setShowNotifications(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          type="button"
          aria-label="Cerrar menú"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={'sidebar' + (mobileMenuOpen ? ' sidebar-open' : '')}
        aria-label="Menú principal"
      >
        <div className="sidebar-top">
          <button
            className="brand"
            type="button"
            onClick={() => navigate('inicio')}
            aria-label="ByteTorque, ir al inicio"
          >
            <BrandLogo decorative />
          </button>
          <button
            type="button"
            className="menu-close"
            aria-label="Cerrar menú"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={22} />
          </button>
        </div>
        <p className="sidebar-caption">MENÚ PRINCIPAL</p>
        <nav className="side-nav">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={'side-link' + (id === screen ? ' active' : '')}
              aria-current={screen === id ? 'page' : undefined}
              onClick={() => navigate(id)}
            >
              <Icon size={20} strokeWidth={1.9} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-end">
          <div className="workshop-info">
            <span className="workshop-badge">
              <Wrench size={23} />
            </span>
            <div>
              <strong>{copy.workshopTitle}</strong>
              <small>{copy.workshopSubtitle}</small>
              <span>{copy.workshopStatus}</span>
            </div>
          </div>
          <p className="sidebar-version">{copy.version}</p>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button
            type="button"
            className="mobile-hamburger"
            aria-label="Abrir menú"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={23} />
          </button>
          <span className="shell-mobile-brand">
            <BrandLogo variant="icon" />
          </span>
          <div className="topbar-search">
            <Search size={18} aria-hidden="true" />
            <input
              ref={searchRef}
              disabled={!search}
              title={
                !search
                  ? 'Disponible cuando se habilite el acceso seguro y el guardado permanente.'
                  : undefined
              }
              aria-label={search?.label ?? 'Búsqueda no disponible'}
              placeholder={
                search
                  ? 'Buscar cliente, vehículo u orden de trabajo...'
                  : 'Búsqueda disponible con acceso seguro'
              }
              value={search?.value ?? ''}
              onChange={(e) => search?.onChange(e.target.value)}
            />
            {search?.value ? (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => search?.onChange('')}
              >
                <X size={15} />
              </button>
            ) : search ? (
              <span className="shortcut-hint" aria-hidden="true">
                <kbd>Ctrl</kbd>
                <kbd>K</kbd>
              </span>
            ) : null}
          </div>
          <div className="topbar-controls">
            <div className="popover-anchor">
              <button
                type="button"
                className="icon-button"
                aria-label="Notificaciones"
                aria-expanded={showNotifications}
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  setShowAccount(false)
                }}
              >
                <Bell size={21} />
                {copy.notificationDot && <i className="bell-dot" />}
              </button>
              {showNotifications && (
                <div className="top-popover" role="status">
                  <strong>Notificaciones</strong>
                  <p>{copy.notifications}</p>
                </div>
              )}
            </div>
            <span className="top-divider" />
            <div className="popover-anchor">
              <button
                className="account-trigger"
                type="button"
                aria-expanded={showAccount}
                onClick={() => {
                  setShowAccount(!showAccount)
                  setShowNotifications(false)
                }}
              >
                <span className="avatar">{copy.avatarText ?? <UserRound size={21} />}</span>
                <span className="account-copy">
                  <strong>{copy.accountTitle}</strong>
                  <small>{copy.accountSubtitle}</small>
                </span>
                <ChevronDown size={16} />
              </button>
              {showAccount && (
                <div className="top-popover account-popover">
                  <strong>ByteTorque</strong>
                  <a className="access-entry-link" href="/#/acceso">
                    Ver pantalla de acceso
                  </a>
                  <p>
                    La autenticación y gestión de talleres se habilitarán en una etapa posterior.
                  </p>
                  <button type="button" onClick={() => navigate('configuracion')}>
                    Ver configuración <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="dashboard-main" id="main-content">
          {children}
        </main>
      </div>
      <nav className="bottom-nav" aria-label="Navegación móvil">
        {navItems.map(({ id, compact, icon: Icon }) => (
          <button
            type="button"
            key={id}
            className={'bottom-item' + (screen === id ? ' selected' : '')}
            aria-current={screen === id ? 'page' : undefined}
            onClick={() => navigate(id)}
          >
            <Icon size={22} strokeWidth={screen === id ? 2.3 : 1.8} />
            <span>{compact}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
