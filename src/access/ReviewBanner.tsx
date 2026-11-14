import { Eye } from 'lucide-react'
import { reviewNotice } from './accessContract'
export function ReviewBanner({
  compact = false,
  onBack
}: {
  compact?: boolean
  onBack?: () => void
}) {
  return (
    <div className={'access-review-note' + (compact ? ' access-review-compact' : '')} role="note">
      <Eye aria-hidden="true" />
      <div>
        <strong>{reviewNotice}</strong>
        <span>
          {compact
            ? 'Solo lectura: sin sesión ni envíos. No ingreses credenciales reales.'
            : 'Presentación de solo lectura. No hay sesión, permisos, envíos ni guardado permanente.'}
        </span>
      </div>
      {onBack && (
        <button type="button" onClick={onBack}>
          Volver al acceso
        </button>
      )}
    </div>
  )
}
