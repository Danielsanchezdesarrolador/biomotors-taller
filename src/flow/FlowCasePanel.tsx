import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CarFront, Check, ClipboardList, Layers } from 'lucide-react'
import {
  caseContext,
  caseProgress,
  confirmVisitOrder,
  milestones,
  type FlowResource
} from './flowSession'
export function FlowCasePanel({
  id,
  onBack,
  onOpen,
  onClient
}: {
  id: string
  onBack: () => void
  onOpen: (resource: FlowResource) => void
  onClient: (vehicleId: string) => void
}) {
  const { visit, client, vehicle, order } = caseContext(id),
    progress = caseProgress(id)
  const initial =
    progress.stage === 'respuesta_cliente'
      ? 'cotizacion'
      : progress.stage === 'informe_final'
        ? 'ejecucion'
        : progress.stage
  const [stage, setStage] = useState<string>(initial),
    [confirm, setConfirm] = useState(false),
    [error, setError] = useState('')
  const heading = useRef<HTMLHeadingElement>(null)
  const current = milestones.find((m) => m.id === stage) ?? milestones[0]
  function select(value: string) {
    setStage(value)
    setConfirm(false)
    requestAnimationFrame(() => {
      heading.current?.focus()
      heading.current?.scrollIntoView({ block: 'start' })
    })
  }
  return (
    <section className="fl-case">
      <header className="fl-heading">
        <button className="rp-secondary" aria-label="Volver al Inicio guiado" onClick={onBack}>
          <ArrowLeft />
        </button>
        <span className="fl-heading-icon">
          <Layers />
        </span>
        <div>
          <h1>Expediente de visita · DEMO</h1>
          <p>{visit.id} · Memoria temporal de esta pestaña</p>
        </div>
      </header>
      <p className="fl-memory">
        Navega libremente por los cinco paneles y vuelve a este expediente. Al recargar o cerrar la
        pestaña se descartan los cambios DEMO. No hay envío ni guardado permanente.
      </p>
      <section className="dashboard-card fl-case-summary">
        {[
          ['Cliente', client.name],
          ['Vehículo', vehicle.description],
          ['Patente', vehicle.plate],
          ['Kilometraje', visit.reception.mileage.toLocaleString('es-CL') + ' km'],
          ['Orden asociada', order?.id ?? 'Sin crear'],
          ['Actividad actual', progress.action]
        ].map(([label, value]) => (
          <div key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </section>
      <div className="fl-case-layout">
        <nav className="dashboard-card fl-milestones" aria-label="Hitos del expediente">
          {milestones.map((m, i) => (
            <button
              key={m.id}
              onClick={() => select(m.id)}
              aria-current={stage === m.id ? 'step' : undefined}
              className={(stage === m.id ? 'active ' : '') + progress.states[m.id]}
            >
              <span>{progress.states[m.id] === 'completado' ? <Check /> : i + 1}</span>
              <div>
                <strong>{m.label}</strong>
                <small>
                  {progress.states[m.id] === 'completado'
                    ? 'Completado con evidencia'
                    : progress.states[m.id] === 'en_curso'
                      ? 'En curso'
                      : progress.states[m.id] === 'bloqueado'
                        ? 'Bloqueado / pendiente'
                        : 'Pendiente'}
                </small>
              </div>
            </button>
          ))}
        </nav>
        <section className="dashboard-card fl-stage-content">
          <span className="fl-pill">
            Hito {milestones.findIndex((m) => m.id === stage) + 1} de 7 ·{' '}
            {progress.states[current.id]}
          </span>
          <h2 tabIndex={-1} ref={heading}>
            {current.label}
          </h2>
          {stage === 'recepcion' ? (
            <>
              <h3>
                <CarFront />
                Antecedentes originales de la visita
              </h3>
              <dl className="fl-review">
                {[
                  ['Cliente', client.name],
                  ['Contacto', client.phone + ' · ' + client.email],
                  ['Ingreso', visit.reception.date],
                  ['Kilometraje confirmado', visit.reception.mileage + ' km'],
                  ['Motivo declarado', visit.reception.reason],
                  ['Solicitud de origen', visit.intakeRequestId ?? 'Recepción manual DEMO']
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="fl-help">
                La recepción no contiene diagnóstico ni supone aprobación de trabajos.
              </p>
              <button className="rp-primary" onClick={() => onClient(vehicle.id)}>
                Ver cliente y vehículo
                <ArrowRight />
              </button>
            </>
          ) : stage === 'orden' ? (
            <>
              <h3>
                <ClipboardList />
                {order ? 'Orden vinculada por ID' : 'Confirma la creación de la OT'}
              </h3>
              <p>{visit.reception.reason}</p>
              <p>
                {client.name} · {vehicle.description} ·{' '}
                {visit.reception.mileage.toLocaleString('es-CL')} km
              </p>
              {order ? (
                <>
                  <p>
                    Orden existente: <strong>{order.id}</strong>. Volver a confirmar nunca crea otra
                    OT para esta visita.
                  </p>
                  <button className="rp-primary" onClick={() => onOpen('order')}>
                    Ver orden asociada
                    <ArrowRight />
                  </button>
                </>
              ) : (
                <>
                  <p className="fl-notice">
                    Se reutilizarán cliente, vehículo, fecha, km y motivo. El diagnóstico, los
                    trabajos y sus precios quedan pendientes de revisión humana.
                  </p>
                  {!confirm ? (
                    <button className="rp-primary" onClick={() => setConfirm(true)}>
                      Crear orden de trabajo
                      <ArrowRight />
                    </button>
                  ) : (
                    <div className="fl-confirm">
                      <p>
                        <strong>¿Crear una única OT ficticia para esta visita?</strong>
                      </p>
                      <button className="rp-secondary" onClick={() => setConfirm(false)}>
                        Volver a revisar
                      </button>
                      <button
                        className="rp-primary"
                        onClick={() => {
                          try {
                            confirmVisitOrder(id)
                            setConfirm(false)
                            select('inspeccion')
                          } catch (e) {
                            setError((e as Error).message)
                          }
                        }}
                      >
                        Confirmar creación de OT DEMO
                        <Check />
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : stage === 'inspeccion' ? (
            <>
              <p>
                Reutiliza el informe multipunto BT-INS-01 de 34 componentes para{' '}
                <strong>{order?.id ?? 'la OT aún pendiente'}</strong>.
              </p>
              {progress.inspection ? (
                <div className="fl-notice">
                  <strong>{progress.inspection.id}</strong>
                  <p>
                    {progress.inspection.items.filter((i) => i.state !== 'unreviewed').length} de{' '}
                    {progress.inspection.items.length} revisados ·{' '}
                    {progress.inspection.finalized
                      ? 'Finalizado DEMO con evidencia del módulo'
                      : 'Revisión en curso; abrir o guardar un borrador no completa el hito.'}
                  </p>
                </div>
              ) : (
                <p>
                  Sin inspección iniciada. Todos los controles nuevos comienzan sin revisar, salvo
                  equivalencias exactas ya documentadas en la OT.
                </p>
              )}
              <p className="fl-help">
                Los pendientes no se convierten en OK. El informe y sus fotos temporales se retoman
                por el mismo ID.
              </p>
              <button className="rp-primary" disabled={!order} onClick={() => onOpen('inspection')}>
                {progress.inspection ? 'Continuar inspección' : 'Iniciar inspección'}
                <ArrowRight />
              </button>
            </>
          ) : stage === 'propuesta' ? (
            <>
              <p>
                Registra diagnóstico, trabajos y repuestos de la misma OT. Los ítems y precios deben
                ser decisiones explícitas del mecánico.
              </p>
              <p className="fl-notice">
                Coordinación de propuesta y versiones pendiente de BT-FLOW-01D. Se abre el módulo
                existente; este hito no se marca completado por consultarlo ni por añadir un ítem.
              </p>
              <button className="rp-primary" disabled={!order} onClick={() => onOpen('order')}>
                Definir trabajos
                <ArrowRight />
              </button>
            </>
          ) : stage === 'cotizacion' ? (
            <>
              <p>
                Abre BT-COT-01 con los antecedentes de{' '}
                <strong>{order?.id ?? 'la OT pendiente'}</strong>, su revisión disponible e ítems
                definidos por el operador.
              </p>
              {progress.quote && (
                <div className="fl-notice">
                  <strong>
                    {progress.quote.id} · Revisión {progress.quote.revision}
                  </strong>
                  <p>
                    Estado del documento: {progress.quote.status}.{' '}
                    {progress.quote.approval
                      ? 'Aprobación simulada, sin consentimiento legal.'
                      : 'Sin aprobación simulada vigente.'}
                  </p>
                </div>
              )}
              <p className="fl-help">
                La coordinación de respuesta del cliente para esa versión, rechazo o cambios
                corresponde a 01D. Nada se aprueba ni se envía automáticamente.
              </p>
              <button className="rp-primary" disabled={!order} onClick={() => onOpen('quote')}>
                {progress.quote?.approval
                  ? 'Revisar aprobación'
                  : progress.quote
                    ? 'Continuar cotización'
                    : 'Preparar cotización'}
                <ArrowRight />
              </button>
            </>
          ) : stage === 'ejecucion' ? (
            <>
              <p>BT-COT-01 registra solo trabajos marcados expresamente como realizados.</p>
              {progress.work && (
                <p className="fl-notice">
                  {progress.work.id} · {progress.work.status} ·{' '}
                  {progress.work.items.filter((i) => i.performed).length} ítems realizados por el
                  operador DEMO.
                </p>
              )}
              <p className="fl-help">
                Se abre la revisión de la misma OT; copiar y coordinar partidas aprobadas entre
                versiones queda pendiente de 01D. No se infiere ejecución a partir de una
                cotización. Finalizar el documento no entrega ni cierra esta visita.
              </p>
              <button className="rp-primary" disabled={!order} onClick={() => onOpen('work')}>
                {progress.work?.approval
                  ? 'Revisar informe final'
                  : progress.work
                    ? 'Registrar trabajos realizados'
                    : 'Preparar informe final'}
                <ArrowRight />
              </button>
            </>
          ) : (
            <>
              <p className="fl-notice">
                La entrega y el cierre guiado están pendientes de BT-FLOW-01E. Esta visita no se ha
                finalizado ni se ha enviado documentación.
              </p>
              <p>
                La revisión final de pendientes, evidencia de entrega y confirmación explícita del
                operador se integrarán en esa fase. No se generan firmas ni autorizaciones legales.
              </p>
              <button className="rp-primary" disabled>
                Cierre guiado pendiente 01E
              </button>
            </>
          )}
          {error && (
            <p role="alert" className="fl-error">
              {error}
            </p>
          )}
          <footer className="fl-stage-footer">
            <span>
              Visita {visit.id} · {order?.id ?? 'Recepción sin OT'}
            </span>
            <button className="rp-inline" onClick={onBack}>
              Volver a Inicio
            </button>
          </footer>
        </section>
      </div>
    </section>
  )
}
