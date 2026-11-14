import { FileText, UserRound, Wrench } from 'lucide-react'
import { documentContext } from '../documentosData'
import { currency, includedItems, workModes, workTotals, type WorkDocument } from './trabajosData'
export function WorkApproval({ document: d }: { document: WorkDocument }) {
  const { client } = documentContext(d)
  return (
    <div className="wt-approval">
      <p className="wt-approval-state">
        {d.approval
          ? d.mode === 'quote'
            ? 'Aprobación simulada'
            : 'Finalización simulada'
          : 'Sin ' + (d.mode === 'quote' ? 'aprobación' : 'finalización') + ' simulada'}
      </p>
      <p>{client.name}</p>
      {d.approval && (
        <p>
          Fecha DEMO:{' '}
          {new Intl.DateTimeFormat('es-CL', {
            dateStyle: 'short',
            timeStyle: 'short',
            timeZone: 'America/Santiago'
          }).format(new Date(d.approval.date))}
          <br />
          Monto {d.mode === 'quote' ? 'aprobado' : 'del cierre'} DEMO:{' '}
          <strong>{currency(d.approval.total)}</strong>
        </p>
      )}
      <div className="wt-signature">
        Firma / aceptación remota futura
        <br />
        <small>No se ha capturado una firma.</small>
      </div>
      <p className="wt-help">
        Simulación sin consentimiento legal, aceptación contractual ni firma electrónica válida. No
        autoriza trabajos reales.
      </p>
    </div>
  )
}
export function WorkDocumentPreview({ document: d }: { document: WorkDocument }) {
  const { client, vehicle, order } = documentContext(d),
    totals = workTotals(d),
    items = includedItems(d)
  const states = d.inspection
    ? Object.fromEntries(
        ['ok', 'attention', 'immediate', 'unreviewed'].map((state) => [
          state,
          d.inspection!.items.filter((i) => i.state === state).length
        ])
      )
    : null
  return (
    <article className={'wt-paper wt-paper-' + d.mode} aria-label={`Documento ${d.id}`}>
      <header>
        <div className="wt-paper-brand">
          {d.workshop.logo ? <img src={d.workshop.logo} alt="Logo del taller DEMO" /> : <Wrench />}
          <div>
            <strong>{d.workshop.name}</strong>
            <small>
              {d.workshop.address} · {d.workshop.phone}
            </small>
            <small>{d.workshop.email}</small>
          </div>
        </div>
        <div>
          <h2>{workModes[d.mode]}</h2>
          <strong>{d.id}</strong>
          <small>
            {d.date} · {d.status}
          </small>
        </div>
      </header>
      {d.sourceQuote && (
        <p className="wt-paper-disclaimer">
          Precarga desde {d.sourceQuote.quoteId} · Revisión {d.sourceQuote.revision} · Solo se
          documentan partidas expresamente realizadas; no acredita entrega ni autorización legal.
        </p>
      )}
      <div className="wt-paper-facts">
        <div>
          <strong>Cliente: {client.name}</strong>
          <span>
            {client.phone} · {client.email}
          </span>
          <span>Vehículo: {vehicle.description}</span>
        </div>
        <div>
          <span>Patente: {vehicle.plate}</span>
          <span>
            OT: {d.orderId} · Ingreso: {order.date}
          </span>
          <span>Kilometraje: {order.mileage.toLocaleString('es-CL')} km</span>
        </div>
      </div>
      <p className="wt-paper-disclaimer">
        DEMO · Datos ficticios ·{' '}
        {d.mode === 'quote'
          ? 'Propuesta; no acredita ejecución de trabajos.'
          : 'Solo ítems marcados expresamente como realizados por el operador DEMO.'}
      </p>
      <h3>
        {d.mode === 'quote'
          ? 'Trabajos propuestos, repuestos e insumos'
          : 'Trabajos registrados como realizados'}
      </h3>
      <table>
        <thead>
          <tr>
            <th>N.º</th>
            <th>Descripción</th>
            <th>Tipo</th>
            <th>Cant.</th>
            <th>P. unitario</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i, index) => (
            <tr key={i.id}>
              <td>{index + 1}</td>
              <td>{i.description}</td>
              <td>{i.type}</td>
              <td>{i.quantity.toLocaleString('es-CL')}</td>
              <td>{currency(i.price)}</td>
              <td>{currency(Math.round(i.quantity * i.price))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!items.length && (
        <p>
          Sin ítems {d.mode === 'quote' ? 'propuestos' : 'marcados como realizados'}. Documento
          incompleto.
        </p>
      )}
      {d.mode === 'work' && (
        <p className="wt-help">
          {d.items.length - items.length} ítems sin marcar como realizados, excluidos de esta tabla
          y de los totales.
        </p>
      )}
      <dl className="wt-paper-totals">
        <div>
          <dt>Subtotal neto</dt>
          <dd>{currency(totals.subtotal)}</dd>
        </div>
        <div>
          <dt>IVA (19 %)</dt>
          <dd>{currency(totals.tax)}</dd>
        </div>
        <div>
          <dt>Total IVA incluido</dt>
          <dd>{currency(totals.total)}</dd>
        </div>
      </dl>
      <section>
        <h3>Motivo informado por el cliente</h3>
        <p>{order.symptoms}</p>
      </section>
      <section>
        <h3>Diagnóstico del mecánico · Antecedente editable</h3>
        <p>{d.diagnosis || 'Sin diagnóstico registrado.'}</p>
      </section>
      <section>
        <h3>Comentarios del técnico</h3>
        <p>{d.comments || 'Sin comentarios registrados.'}</p>
      </section>
      <section>
        <h3>Recomendaciones / pendientes</h3>
        <p>{d.recommendations || 'Sin recomendaciones registradas.'}</p>
      </section>
      {d.inspection && states && (
        <section>
          <h3>Antecedente multipunto: {d.inspection.id}</h3>
          <p>
            OK: {states.ok} · Requiere atención: {states.attention} · Cambio inmediato:{' '}
            {states.immediate} · Sin revisar: {states.unreviewed}.
          </p>
          <p>{d.inspection.observations || 'Sin observaciones de inspección.'}</p>
          <small>
            Referencia tomada de la misma OT; no transforma pendientes en OK ni acredita
            reparaciones.
          </small>
        </section>
      )}
      <section>
        <h3>Términos y condiciones · Ejemplo DEMO</h3>
        {d.mode === 'quote' && <p>Vigencia: {d.validDays} días corridos.</p>}
        <p>{d.terms}</p>
      </section>
      <section>
        <h3>{d.mode === 'quote' ? 'Aprobación del cliente' : 'Finalización del informe'} · DEMO</h3>
        <WorkApproval document={d} />
      </section>
      <footer>
        <FileText /> Preparado con ByteTorque · {d.workshop.footer}
        <br />
        Muestra sin valor tributario. Sin envío externo ni autorización legal.
      </footer>
    </article>
  )
}
export function WorkApprovalCard({ document: d }: { document: WorkDocument }) {
  return (
    <section className="dashboard-card wt-card">
      <h2>
        <UserRound />
        {d.mode === 'quote' ? 'Aprobación del cliente' : 'Finalización del informe'}
      </h2>
      <WorkApproval document={d} />
    </section>
  )
}
