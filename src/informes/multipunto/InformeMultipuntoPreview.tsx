import { Wrench } from 'lucide-react'
import { MultipuntoTable } from './MultipuntoTable'
import { counts, type MultipuntoReport, type Result } from './multipuntoData'
export function InformeMultipuntoPreview({
  report: r,
  onChange
}: {
  report: MultipuntoReport
  onChange?: (id: string, state: Result) => void
}) {
  const c = counts(r.items)
  return (
    <article
      className={'mp-sheet' + (onChange ? ' mp-edit-sheet' : '')}
      aria-label={`Inspección multipunto ${r.id}`}
    >
      <header className="mp-sheet-head">
        <div className="mp-workshop">
          {r.workshop.logo ? <img src={r.workshop.logo} alt="Logo del taller DEMO" /> : <Wrench />}
          <div>
            <strong>{r.workshop.name}</strong>
            <small>
              {r.workshop.address} · {r.workshop.phone}
            </small>
            <small>{r.workshop.email} · DEMO</small>
          </div>
        </div>
        <div>
          <small>Informe técnico</small>
          <h2>Inspección Multi Punto</h2>
        </div>
        <div className="mp-number">
          <strong>{r.id}</strong>
          <span>Fecha: {r.date}</span>
          <span>{r.orderId}</span>
        </div>
      </header>
      <dl className="mp-facts">
        <div>
          <dt>Propietario del vehículo:</dt>
          <dd>{r.client}</dd>
        </div>
        <div>
          <dt>Técnico asignado:</dt>
          <dd>{r.technician || 'Sin completar'}</dd>
        </div>
        <div>
          <dt>Fecha de visita:</dt>
          <dd>{r.visitDate || 'Sin completar'}</dd>
        </div>
        <div>
          <dt>Hora de inicio:</dt>
          <dd>
            {r.start || 'Sin completar'}{' '}
            <span className="mp-end-time">Hora de término: {r.end || 'Sin completar'}</span>
          </dd>
        </div>
      </dl>
      <section className="mp-vehicle">
        <h3>Vehículo</h3>
        <dl className="mp-facts">
          <div>
            <dt>Marca:</dt>
            <dd>{r.brand}</dd>
          </div>
          <div>
            <dt>Modelo:</dt>
            <dd>{r.model}</dd>
          </div>
          <div>
            <dt>Año:</dt>
            <dd>{r.year}</dd>
          </div>
          <div>
            <dt>Combustible:</dt>
            <dd>{r.fuel || 'Sin completar'}</dd>
          </div>
          <div>
            <dt>Kilometraje / patente:</dt>
            <dd>
              {r.mileage.toLocaleString('es-CL')} km · {r.plate}
            </dd>
          </div>
        </dl>
      </section>
      <div className="mp-legend">
        <span>
          <i className="mp-ok" /> OK
        </span>
        <span>
          <i className="mp-attention" /> Requiere atención
        </span>
        <span>
          <i className="mp-immediate" /> Cambio inmediato
        </span>
      </div>
      <MultipuntoTable items={r.items} onChange={onChange} />
      <section className="mp-sheet-notes">
        <h3>Observaciones del técnico</h3>
        <p>{r.observations || 'Sin observaciones registradas.'}</p>
      </section>
      <section className="mp-sheet-reason">
        <h3>Motivo declarado por el cliente</h3>
        <p>{r.reason}</p>
      </section>
      <footer className="mp-sheet-footer">
        {c.reviewed} de {c.total} revisados · {c.unreviewed} sin revisar.{' '}
        {r.finalized
          ? 'Finalizado DEMO' + (r.closedWithPending ? ' con pendientes identificados.' : '.')
          : c.unreviewed > 0
            ? 'Inspección incompleta / editable DEMO.'
            : 'Inspección revisada / editable DEMO.'}
        <br />
        Rojo: prioridad técnica del taller; no certifica seguridad de circulación.
        <br />
        {r.photos.length} fotografías temporales (no incorporadas en esta hoja). {r.workshop.footer}
        <br />
        Preparado con ByteTorque · Datos ficticios · Sin envío real.
      </footer>
    </article>
  )
}
