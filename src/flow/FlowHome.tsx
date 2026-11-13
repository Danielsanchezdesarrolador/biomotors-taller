import { ArrowRight, CarFront, Layers, Plus, Wrench } from 'lucide-react'
import {
  allCases,
  caseContext,
  caseProgress,
  milestones,
  selectCase,
  selectedCase
} from './flowSession'
export function FlowHome({
  onNew,
  onContinue,
  onOrders,
  query
}: {
  onNew: () => void
  onContinue: (id: string) => void
  onOrders: () => void
  query: string
}) {
  const visits = allCases().filter((v) => {
      const { client, vehicle } = caseContext(v.id)
      return [client.name, vehicle.description, vehicle.plate, v.orderId ?? '', v.id]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase())
    }),
    selected = selectedCase(),
    context = selected ? caseContext(selected.id) : undefined,
    progress = selected ? caseProgress(selected.id) : undefined
  const choose = (id: string) => {
    selectCase(id)
    onContinue(id)
  }
  return (
    <div className="fl-home">
      <div className="fl-home-main">
        <section className="dashboard-card fl-new-visit">
          <div>
            <span className="fl-pill">Flujo de Trabajo Inteligente · DEMO</span>
            <h2>Nuevo ingreso de vehículo</h2>
            <p>
              Registra un cliente y vehículo o selecciona una ficha existente. Abre su expediente y
              continúa el proceso sin repetir los antecedentes.
            </p>
            <button className="rp-primary" onClick={onNew}>
              <Plus />
              Nuevo ingreso de vehículo
            </button>
          </div>
          <div className="fl-hero-art" aria-hidden="true" />
        </section>
        <section className="dashboard-card fl-continuing">
          <header>
            <h2>
              <Wrench />
              Continuar trabajos
            </h2>
            <button className="rp-inline" onClick={onOrders}>
              Ver todas las órdenes
              <ArrowRight />
            </button>
          </header>
          <p className="fl-help">
            Expedientes de esta sesión DEMO; los KPI superiores siguen siendo muestras ilustrativas.
          </p>
          {visits.map((visit) => {
            const { vehicle } = caseContext(visit.id),
              p = caseProgress(visit.id)
            return (
              <article key={visit.id} className="fl-case-row">
                <span className="fl-car-icon">
                  <CarFront />
                </span>
                <div>
                  <strong>{vehicle.description}</strong>
                  <small>
                    {visit.orderId ?? 'Recepción sin OT'} · {vehicle.plate}
                  </small>
                </div>
                <span className="fl-state-tag">
                  {p.stage === 'orden'
                    ? 'Recepción DEMO'
                    : p.stage === 'inspeccion'
                      ? 'Inspección pendiente'
                      : 'En curso DEMO'}
                </span>
                <div className="fl-next">
                  <small>Siguiente actividad</small>
                  <strong>{p.action}</strong>
                </div>
                <button
                  className="rp-primary"
                  aria-label={`Continuar ${visit.orderId ?? visit.id}`}
                  onClick={() => choose(visit.id)}
                >
                  Continuar
                  <ArrowRight />
                </button>
              </article>
            )
          })}
          {!visits.length && (
            <p className="fl-empty">Sin expedientes que coincidan con la búsqueda.</p>
          )}
        </section>
      </div>
      <aside className="dashboard-card fl-current">
        <h2>
          <Layers />
          Expediente de visita · DEMO
        </h2>
        {context && progress ? (
          <>
            <p>
              {context.vehicle.description} · {context.visit.orderId ?? 'Recepción por confirmar'}
            </p>
            <ol>
              {milestones.map((m, i) => {
                const current =
                  m.id ===
                  (['respuesta_cliente'].includes(progress.stage)
                    ? 'cotizacion'
                    : progress.stage === 'informe_final'
                      ? 'ejecucion'
                      : progress.stage)
                return (
                  <li
                    key={m.id}
                    className={
                      current ? 'active' : progress.states[m.id] === 'completado' ? 'done' : ''
                    }
                  >
                    <span>{progress.states[m.id] === 'completado' ? '✓' : i + 1}</span>
                    <div>
                      <strong>{m.label}</strong>
                      <small>{current ? progress.action : m.detail}</small>
                    </div>
                  </li>
                )
              })}
            </ol>
            <button className="rp-secondary" onClick={() => choose(context.visit.id)}>
              Continuar trabajo
              <ArrowRight />
            </button>
          </>
        ) : (
          <p>Inicia una recepción DEMO para abrir el expediente.</p>
        )}
        <p className="fl-help">
          Navegar no completa hitos. Integración profunda y cierre guiado pendientes de
          BT-FLOW-01D/E.
        </p>
      </aside>
    </div>
  )
}
