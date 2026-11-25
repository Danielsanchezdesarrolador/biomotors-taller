import {
  Activity,
  ArrowRight,
  CalendarDays,
  CarFront,
  ClipboardCheck,
  Clock3,
  Database,
  FileText,
  Image,
  Layers,
  Link,
  Mail,
  Plus,
  Settings2,
  ShieldCheck,
  Store,
  UsersRound,
  Wrench,
  type LucideIcon
} from 'lucide-react'
import { UsersPreparationDialog } from '../access/UsersPreparation'
import type { ReactNode } from 'react'
import type { Screen } from '../layout/AppShell'
import { officialWorkspace as workspace, unavailableReason } from './officialWorkspace'

export function UnavailableAction({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      className="rp-primary official-unavailable"
      disabled
      aria-describedby="official-readiness"
      title={unavailableReason}
    >
      {children}
    </button>
  )
}
export function EmptyCard({
  title,
  message,
  icon: Icon,
  children
}: {
  title: string
  message: string
  icon: LucideIcon
  children?: ReactNode
}) {
  return (
    <section className="dashboard-card official-empty">
      <span className="official-empty-icon">
        <Icon aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </section>
  )
}
const headings: Record<Screen, [string, string]> = {
  inicio: [
    '¿Qué vamos a hacer hoy?',
    'Tu taller, conectado y organizado desde el primer ingreso hasta la entrega.'
  ],
  ordenes: [
    'Órdenes de trabajo',
    'Organiza los servicios y sigue cada etapa del trabajo de tu taller.'
  ],
  clientes: [
    'Clientes y vehículos',
    'Fichas, vehículos asociados e historial técnico en un solo lugar.'
  ],
  informes: [
    'Informes y cotizaciones',
    'Inspección, diagnóstico, presupuestos e informes de trabajo.'
  ],
  configuracion: [
    'Configuración',
    'Prepara la identidad, el acceso y las preferencias de tu taller.'
  ]
}
const metrics: Record<
  Screen,
  { label: string; value: number | string; icon: LucideIcon; color: string }[]
> = {
  inicio: [
    { label: 'Órdenes activas', value: workspace.orders.length, icon: Wrench, color: 'blue' },
    {
      label: 'Vehículos en taller',
      value: workspace.vehicles.length,
      icon: CarFront,
      color: 'violet'
    },
    {
      label: 'Informes pendientes',
      value: workspace.documents.length,
      icon: ClipboardCheck,
      color: 'sky'
    },
    {
      label: 'Cotizaciones pendientes',
      value: workspace.documents.length,
      icon: FileText,
      color: 'purple'
    }
  ],
  ordenes: [
    { label: 'Órdenes registradas', value: workspace.orders.length, icon: Wrench, color: 'blue' },
    {
      label: 'En diagnóstico',
      value: workspace.orders.length,
      icon: ClipboardCheck,
      color: 'violet'
    },
    { label: 'En servicio', value: workspace.orders.length, icon: Settings2, color: 'sky' },
    {
      label: 'Pendientes de entrega',
      value: workspace.orders.length,
      icon: CarFront,
      color: 'purple'
    }
  ],
  clientes: [
    {
      label: 'Clientes registrados',
      value: workspace.clients.length,
      icon: UsersRound,
      color: 'blue'
    },
    {
      label: 'Vehículos asociados',
      value: workspace.vehicles.length,
      icon: CarFront,
      color: 'violet'
    },
    {
      label: 'Visitas registradas',
      value: workspace.visits.length,
      icon: ClipboardCheck,
      color: 'sky'
    },
    {
      label: 'Observaciones pendientes',
      value: workspace.observations.length,
      icon: FileText,
      color: 'purple'
    }
  ],
  informes: [
    {
      label: 'Informes disponibles',
      value: workspace.documents.length,
      icon: FileText,
      color: 'blue'
    },
    {
      label: 'Cotizaciones disponibles',
      value: workspace.documents.length,
      icon: FileText,
      color: 'violet'
    },
    { label: 'Historial documental', value: workspace.history.length, icon: Clock3, color: 'sky' },
    { label: 'Servicio de correo', value: 'Sin configurar', icon: Mail, color: 'purple' }
  ],
  configuracion: [
    {
      label: 'Usuarios habilitados',
      value: workspace.members.length,
      icon: UsersRound,
      color: 'blue'
    },
    { label: 'Identidad del taller', value: 'Sin configurar', icon: Store, color: 'violet' },
    { label: 'Servicio de correo', value: 'Sin configurar', icon: Mail, color: 'sky' },
    { label: 'Respaldos', value: 'Sin configurar', icon: Database, color: 'purple' }
  ]
}
export function OfficialPanel({
  screen,
  onNavigate, onIntake
}: {
  screen: Screen
  onIntake?:()=>void
  onNavigate: (screen: Screen) => void
}) {
  const [title, subtitle] = headings[screen]
  const date = new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'America/Santiago'
  }).format(new Date())
  return (
    <div className={'official-panel official-' + screen}>
      <section className="welcome-area">
        <div className="welcome-art" aria-hidden="true" />
        <div className="welcome-head">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <span className="date-pill">
            <CalendarDays size={18} />
            {date}
          </span>
        </div>
        <div className="metric-grid">
          {metrics[screen].map(({ label, value, icon: Icon, color }) => (
            <div className="metric-card" key={label}>
              <span className={'metric-icon ' + color}>
                <Icon size={27} />
              </span>
              <span className="metric-content">
                <span className="metric-title">{label}</span>
                <strong className={typeof value === 'string' ? 'official-metric-text' : ''}>
                  {value}
                </strong>
              </span>
            </div>
          ))}
        </div>
      </section>
      {screen === 'inicio' ? (
        <div className="official-home-grid">
          <div className="official-stack">
            <section className="dashboard-card official-intake">
              <span className="official-intake-art">
                <CarFront />
              </span>
              <div>
                <span className="official-eyebrow">Flujo de trabajo</span>
                <h2>Nuevo ingreso de vehículo</h2>
                <p>Recepción, orden, inspección, cotización, trabajo e informe hasta la entrega.</p>
                {onIntake?<button className="rp-primary" onClick={onIntake}><Plus/> Nuevo ingreso de vehículo</button>:<UnavailableAction><Plus/> Nuevo ingreso de vehículo</UnavailableAction>}
                <small>{onIntake?"Recorrido privado · habilitación verificada al abrir":unavailableReason}</small>
              </div>
            </section>
            <EmptyCard
              icon={Wrench}
              title={onIntake?"Continuar trabajos pendientes":"Todavía no hay trabajos por continuar"}
              message={onIntake?"Consulta las visitas confirmadas y retoma su etapa pendiente real.":"Las órdenes de tu taller aparecerán aquí cuando se habilite el registro seguro."}
            >
              <button className="rp-secondary" onClick={onIntake??(() => onNavigate('ordenes'))}>
                Ver órdenes de trabajo
                <ArrowRight size={17} />
              </button>
            </EmptyCard>
          </div>
          <section className="dashboard-card official-journey">
            <h2>
              <Layers />
              Expediente de visita
            </h2>
            <p>Un mismo contexto para acompañar cada servicio.</p>
            <ol>
              {[
                'Recepción del vehículo',
                'Orden de trabajo',
                'Inspección multipunto',
                'Diagnóstico, trabajos y repuestos',
                'Cotización y respuesta',
                'Ejecución e informe de trabajo',
                'Entrega del vehículo'
              ].map((label, i) => (
                <li key={label}>
                  <span>{i + 1}</span>
                  <div>
                    <strong>{label}</strong>
                    <small>Disponible con el acceso seguro</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      ) : screen === 'ordenes' ? (
        <>
          <div className="official-toolbar">
            <div>
              <h2>Órdenes del taller</h2>
              <p>Sin registros disponibles</p>
            </div>
            <UnavailableAction>
              <Plus />
              Nueva orden
            </UnavailableAction>
          </div>
          <EmptyCard
            icon={Wrench}
            title="Aún no hay órdenes de trabajo"
            message="Cada orden reunirá los antecedentes del cliente, su vehículo, la inspección y los trabajos autorizados."
          >
            <p className="official-help">
              El ingreso y seguimiento estarán disponibles después de habilitar el acceso seguro y
              el guardado permanente.
            </p>
          </EmptyCard>
        </>
      ) : screen === 'clientes' ? (
        <>
          <div className="official-toolbar">
            <div>
              <h2>Directorio del taller</h2>
              <p>Clientes y vehículos conectados por su ficha</p>
            </div>
            <UnavailableAction>
              <Plus />
              Nuevo cliente
            </UnavailableAction>
          </div>
          <div className="official-columns">
            <EmptyCard
              icon={UsersRound}
              title="Todavía no hay clientes"
              message="Las fichas y sus vehículos aparecerán aquí cuando el registro seguro esté habilitado."
            />
            <EmptyCard
              icon={CarFront}
              title="Sin vehículos asociados"
              message="Selecciona una ficha cuando haya clientes registrados para consultar sus vehículos."
            />
          </div>
          <div className="official-columns">
            <EmptyCard
              icon={Clock3}
              title="Sin historial técnico"
              message="Las visitas y trabajos quedarán vinculados al vehículo correspondiente."
            />
            <EmptyCard
              icon={ClipboardCheck}
              title="Sin observaciones pendientes"
              message="No hay observaciones registradas para mostrar."
            />
          </div>
        </>
      ) : screen === 'informes' ? (
        <>
          <div className="dashboard-card official-doc-actions">
            <UnavailableAction>
              <FileText />
              Nuevo informe
            </UnavailableAction>
            <UnavailableAction>
              <Plus />
              Nueva cotización
            </UnavailableAction>
            <p>{unavailableReason}</p>
          </div>
          <div className="official-columns">
            <div className="official-stack">
              <EmptyCard
                icon={FileText}
                title="Sin informes disponibles"
                message="Los informes y cotizaciones de las órdenes del taller se mostrarán aquí."
              />
              <EmptyCard
                icon={Clock3}
                title="Sin historial de documentos"
                message="Todavía no hay documentos registrados ni envíos disponibles."
              />
            </div>
            <EmptyCard
              icon={FileText}
              title="Vista previa del documento"
              message="Selecciona un documento cuando existan registros autorizados para revisar su contenido y formato A4."
            >
              <div className="official-paper-placeholder" aria-hidden="true">
                <FileText />
                <i />
                <i />
                <i />
              </div>
            </EmptyCard>
          </div>
        </>
      ) : (
        <OfficialSettings />
      )}
    </div>
  )
}
const settings: { title: string; description: string; state: string; icon: LucideIcon }[] = [
  {
    title: 'Datos del taller',
    description: 'Información comercial y datos de contacto.',
    state: 'Sin configurar',
    icon: Store
  },
  {
    title: 'Logo e información comercial',
    description: 'La identidad que acompañará tus documentos.',
    state: 'Sin configurar',
    icon: Image
  },
  {
    title: 'Usuarios y permisos',
    description: 'Acceso autorizado para las personas de tu taller.',
    state: 'Acceso en preparación',
    icon: UsersRound
  },
  {
    title: 'Plantillas de documentos',
    description: 'Formatos de órdenes, cotizaciones e informes.',
    state: 'No disponibles todavía',
    icon: FileText
  },
  {
    title: 'Configuración de correos',
    description: 'Identidad y servicio de envío de documentos.',
    state: 'Sin configurar',
    icon: Mail
  },
  {
    title: 'Enlaces de registro de clientes',
    description: 'Ingreso seguro vinculado a tu taller.',
    state: 'No habilitados',
    icon: Link
  },
  {
    title: 'Preferencias generales',
    description: 'Formatos, unidades y ajustes de operación.',
    state: 'Pendientes de configuración',
    icon: Settings2
  },
  {
    title: 'Seguridad y respaldos',
    description: 'Protección de información y recuperación.',
    state: 'Sin respaldo configurado',
    icon: ShieldCheck
  },
  {
    title: 'Plan y suscripción',
    description: 'Información de tu plan cuando se habilite el servicio.',
    state: 'Sin suscripción configurada',
    icon: Layers
  }
]
function OfficialSettings() {
  return (
    <div className="official-settings-layout">
      <div className="official-settings-grid">
        {settings.map(({ title, description, state, icon: Icon }) => (
          <section className="dashboard-card official-setting" key={title}>
            <h2>
              <Icon />
              {title}
            </h2>
            <p>{description}</p>
            <span>{state}</span>
            {title === 'Usuarios y permisos' ? <UsersPreparationDialog/> : <button
              type="button"
              disabled
              aria-describedby="official-readiness"
              title={unavailableReason}
            >Disponible con acceso seguro</button>}
          </section>
        ))}
      </div>
      <aside className="official-stack">
        <section className="dashboard-card official-system">
          <h2>
            <Activity />
            Estado del sistema
          </h2>
          <dl>
            {[
              ['Acceso seguro', 'En preparación'],
              ['Guardado permanente', 'No habilitado'],
              ['Envío de correos', 'No configurado'],
              ['Respaldos', 'No configurados'],
              ['Almacenamiento', 'Sin datos']
            ].map(([label, state]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{state}</dd>
              </div>
            ))}
          </dl>
        </section>
        <EmptyCard
          icon={Store}
          title="Tu taller aún no está configurado"
          message="La configuración inicial se habilitará con acceso seguro. Por ahora no ingreses información personal o comercial."
        />
      </aside>
    </div>
  )
}
