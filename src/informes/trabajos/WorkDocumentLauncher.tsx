import { useState } from 'react'
import { sessionOrders } from '../../ordenes/orderSession'
import { vehicleForOrder } from '../../clientes/clientesData'
import { workDrafts } from './trabajosSession'
import { workModes, type WorkMode, type WorkRequest } from './trabajosData'
export function WorkDocumentLauncher({
  mode,
  onOpen
}: {
  mode: WorkMode
  onOpen: (request: WorkRequest) => void
}) {
  const [orderId, setOrderId] = useState('OT-1002')
  return (
    <section className="rp-source">
      <h3>{mode === 'quote' ? 'Cotización premium R2' : 'Nuevo informe de trabajo'}</h3>
      <p>
        Editor con ítems, condiciones, aprobación simulada y documento imprimible. Solo en memoria
        hasta recargar.
      </p>
      <label>
        Orden para {workModes[mode].toLowerCase()}
        <select
          aria-label={`Orden para ${workModes[mode].toLowerCase()}`}
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        >
          {sessionOrders()
            .filter((o) => !!vehicleForOrder(o))
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} · {o.vehicle} · {o.client}
              </option>
            ))}
        </select>
      </label>
      <button className="rp-primary" onClick={() => onOpen({ mode, orderId })}>
        {mode === 'quote' ? 'Crear cotización premium' : 'Crear informe de trabajo'}
      </button>
      {workDrafts().filter((d) => d.mode === mode).length > 0 && (
        <>
          <h4>Borradores de {workModes[mode].toLowerCase()} · Memoria temporal</h4>
          {workDrafts()
            .filter((d) => d.mode === mode)
            .map((d) => (
              <p key={d.id}>
                <button
                  className="rp-secondary"
                  onClick={() => onOpen({ mode: d.mode, orderId: d.orderId, draftId: d.id })}
                >
                  {d.id} · {d.orderId} · {d.status}
                </button>
              </p>
            ))}
        </>
      )}
      <hr />
    </section>
  )
}
