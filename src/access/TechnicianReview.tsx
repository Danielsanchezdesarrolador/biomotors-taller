import type { ReactNode } from 'react'
import { BrandLogo } from '../brand/BrandLogo'
import { ArrowLeft, Camera, ClipboardCheck, Wrench } from 'lucide-react'
import { EmptyCard, UnavailableAction } from '../official/OfficialPanels'
import { ReviewBanner } from './ReviewBanner'
import { accessPaths, technicalAreas } from './accessContract'
export function TechnicianReview({
  onNavigate,
  session
}: {
  onNavigate: (path: string) => void
  session?: ReactNode
}) {
  return (
    <main className="technician-review">
      <header>
        <BrandLogo variant="icon" decorative />
        <div>
          <strong>ByteTorque</strong>
          <small>
            {session ? 'Área técnica · Sesión verificada' : 'Área técnica · Revisión visual'}
          </small>
        </div>
        <button type="button" onClick={() => onNavigate(accessPaths.mechanic)}>
          <ArrowLeft />
          {session ? 'Cerrar sesión' : 'Volver al acceso'}
        </button>
      </header>
      <div className="technician-content">
        {session || <ReviewBanner />}
        <div className="official-readiness" id="official-readiness" role="note">
          {session
            ? 'Sesión verificada. Sin asignaciones autorizadas ni operaciones de negocio habilitadas.'
            : 'No hay sesión ni asignaciones verificadas. El acceso técnico y el guardado permanente están en preparación.'}
        </div>
        <h1>Tu espacio de trabajo técnico</h1>
        <p>Órdenes asignadas, inspecciones y seguimiento de los trabajos de tu taller.</p>
        <div className="technician-tools">
          {technicalAreas.map((area) => (
            <span key={area}>
              <ClipboardCheck />
              {area}
            </span>
          ))}
        </div>
        <div className="technician-grid">
          <EmptyCard
            icon={Wrench}
            title="Sin órdenes asignadas"
            message="Tus órdenes aparecerán aquí cuando se habilite y verifique la asignación del taller."
          >
            <UnavailableAction>Abrir orden asignada</UnavailableAction>
          </EmptyCard>
          <EmptyCard
            icon={ClipboardCheck}
            title="Inspección multipunto"
            message="Los controles se completarán únicamente en órdenes asignadas y con acceso verificado."
          >
            <UnavailableAction>Iniciar inspección</UnavailableAction>
          </EmptyCard>
          <EmptyCard
            icon={Camera}
            title="Observaciones y fotografías"
            message="No hay observaciones ni archivos registrados. La carga y edición aún no están habilitadas."
          >
            <UnavailableAction>Agregar observación o fotografía</UnavailableAction>
          </EmptyCard>
          <EmptyCard
            icon={Wrench}
            title="Trabajos realizados"
            message="La ejecución se registrará expresamente por el técnico en su orden asignada."
          >
            <UnavailableAction>Registrar trabajo realizado</UnavailableAction>
          </EmptyCard>
        </div>
      </div>
    </main>
  )
}
