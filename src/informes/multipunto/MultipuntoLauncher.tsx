import { useState } from 'react'
import { demoVehicles } from '../../clientes/clientesData'
import { sessionOrders } from '../../ordenes/orderSession'
import { listMultipunto } from './multipuntoSession'
export function MultipuntoLauncher({
  onOpen
}: {
  onOpen: (value: { orderId: string; reportId?: string }) => void
}) {
  const [orderId, setOrderId] = useState('OT-1002'),
    drafts = listMultipunto()
  return (
    <section className="rp-source">
      <h3>Inspección multipunto</h3>
      <p>Formato tabular de 34 componentes, fotografías y borrador temporal DEMO.</p>
      <label>
        Orden para inspección multipunto
        <select
          aria-label="Orden para inspección multipunto"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        >
          {sessionOrders()
            .filter((o) => demoVehicles.some((v) => v.plate === o.plate))
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.id} · {o.vehicle} · {o.client}
              </option>
            ))}
        </select>
      </label>
      <button className="rp-primary" onClick={() => onOpen({ orderId })}>
        Crear inspección multipunto
      </button>
      {drafts.length > 0 && (
        <>
          <h4>Borradores multipunto · Solo en memoria hasta recargar</h4>
          {drafts.map((r) => (
            <p key={r.id}>
              <button
                className="rp-secondary"
                onClick={() => onOpen({ orderId: r.orderId, reportId: r.id })}
              >
                {r.id} · {r.orderId} · {r.client} ·{' '}
                {r.finalized ? 'Finalizado DEMO' : 'Continuar borrador'}
              </button>
            </p>
          ))}
        </>
      )}
      <hr />
      <h3>Informe general existente</h3>
    </section>
  )
}
