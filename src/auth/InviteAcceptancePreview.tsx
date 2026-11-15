import { ArrowLeft, CheckCircle2, Clock3, LockKeyhole, Wrench } from 'lucide-react'
import { BrandLogo } from '../brand/BrandLogo'
import { accessPaths } from '../access/accessContract'
import './inviteAcceptance.css'

/**
 * R2-A5 mobile-first preview. Deliberately NO token, network request,
 * acceptance callback, registration form or success state.
 */
export function InviteAcceptancePreview({ onNavigate }: {
  onNavigate: (path: string) => void
}) {
  return (
    <main className="invite-acceptance-stage">
      <header className="invite-acceptance-header">
        <BrandLogo surface="dark" />
        <span>Acceso seguro de personal</span>
      </header>
      <section className="invite-acceptance-card" aria-labelledby="invite-title">
        <div className="invite-acceptance-icon" aria-hidden="true"><Wrench /></div>
        <p className="invite-acceptance-eyebrow">Invitación a un taller</p>
        <h1 id="invite-title">Tu acceso como mecánico</h1>
        <p className="invite-acceptance-description">
          El sistema de invitaciones se encuentra en preparación.
          Por ahora no es posible activar una invitación ni crear una cuenta desde este enlace.
        </p>
        <div className="invite-acceptance-note" role="status">
          <Clock3 aria-hidden="true" />
          <span>Invitaciones aún no disponibles. No se ha creado ningún acceso.</span>
        </div>
        <h2>Así funcionará cuando se habilite</h2>
        <ol className="invite-acceptance-steps">
          <li><CheckCircle2 aria-hidden="true" /> <span>Recibir una invitación de tu taller.</span></li>
          <li><LockKeyhole aria-hidden="true" /> <span>Iniciar sesión y confirmar tu correo electrónico.</span></li>
          <li><Wrench aria-hidden="true" /> <span>Acceder únicamente a tus funciones de mecánico.</span></li>
        </ol>
        <button
          className="invite-acceptance-back"
          type="button"
          onClick={() => onNavigate(accessPaths.mechanic)}
        >
          <ArrowLeft aria-hidden="true" /> Volver al acceso de mecánicos
        </button>
        <p className="invite-acceptance-footnote">
          Para proteger tu información, los códigos de invitación no se muestran ni guardan
          en esta pantalla. No ingreses datos de clientes reales.
        </p>
      </section>
    </main>
  )
}
