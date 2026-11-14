import { useRef, useState } from 'react'
import { ReviewBanner } from './ReviewBanner'
import { UserPlus } from 'lucide-react'
import { mechanicLimits } from './accessContract'
import { unavailableReason } from '../official/officialWorkspace'
export function UsersPreparation() {
  return (
    <div className="access-users-preparation">
      <div className="access-member-list" role="group" aria-label="Listado de mecánicos">
        <strong>Mecánicos del taller</strong>
        <p>Sin mecánicos registrados.</p>
        <p>
          Invitaciones pendientes: <strong>0</strong>
        </p>
        <small>No hay invitaciones pendientes ni cuentas creadas.</small>
      </div>
      <p>
        Plan del taller: <strong>Sin configurar</strong>
      </p>
      <dl aria-label="Referencia de cupos por plan">
        {Object.entries(mechanicLimits).map(([plan, limit]) => (
          <div key={plan}>
            <dt>{plan}</dt>
            <dd>Mecánicos 0/{limit}</dd>
          </div>
        ))}
      </dl>
      <small>
        Referencia de cupos, sin plan activo. El propietario y los administradores no ocupan cupos
        de mecánico. Las invitaciones vigentes reservarán una plaza al habilitar el servicio.
      </small>
      <button
        type="button"
        disabled
        aria-describedby="official-readiness"
        title={unavailableReason}
      >
        <UserPlus />
        Invitar mecánico
      </button>
      <small>
        Solo para mecánicos del propio taller. No se envían invitaciones ni se crean usuarios.
      </small>
    </div>
  )
}

export function UsersPreparationDialog() {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  function close() {
    setOpen(false)
    requestAnimationFrame(() => trigger.current?.focus())
  }
  return (
    <>
      <button
        className="access-users-trigger"
        type="button"
        ref={trigger}
        onClick={() => setOpen(true)}
      >
        Ver usuarios y permisos
      </button>
      {open && (
        <dialog
          className="access-users-dialog"
          aria-label="Usuarios y permisos · Revisión"
          ref={(node) => {
            if (node && !node.open) node.showModal()
          }}
          onCancel={close}
        >
          <header>
            <h2>Usuarios y permisos</h2>
            <button type="button" onClick={close}>
              Cerrar
            </button>
          </header>
          <ReviewBanner compact />
          <UsersPreparation />
        </dialog>
      )}
    </>
  )
}
