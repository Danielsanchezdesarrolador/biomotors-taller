import { ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { currency, workTotals, type WorkDocument } from './trabajosData'

// A read-only view of the same quotation. Editing always uses the existing editor.
export function WorkQuoteSummary({
  document: doc,
  expanded,
  editorId,
  onToggle
}: {
  document: WorkDocument
  expanded: boolean
  editorId: string
  onToggle: () => void
}) {
  const totals = workTotals(doc)
  return (
    <section className="dashboard-card wt-quote-summary" aria-label="Cotización compacta">
      <header>
        <FileText aria-hidden="true" />
        <div>
          <h1>Cotización · DEMO</h1>
          <p>
            {doc.id} · Revisión {doc.revision} · {doc.orderId}
          </p>
        </div>
      </header>
      <p className="wt-compact-help">
        {doc.items.length} partidas · Valores en CLP. Cambios solo en memoria hasta recargar; sin
        envío real.
      </p>
      {doc.items.length ? (
        <ol className="wt-compact-lines" aria-label="Partidas de la cotización">
          {doc.items.map((item) => (
            <li key={item.id}>
              <strong className="wt-compact-description">{item.description}</strong>
              <span className="wt-compact-type">{item.type}</span>
              <dl>
                <div>
                  <dt>Cant.</dt>
                  <dd>{item.quantity.toLocaleString('es-CL')}</dd>
                </div>
                <div>
                  <dt>Unitario</dt>
                  <dd>{currency(item.price)}</dd>
                </div>
                <div>
                  <dt>Total</dt>
                  <dd>{currency(workTotals({ ...doc, items: [item] }).subtotal)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      ) : (
        <p className="wt-empty">
          Sin partidas. Abre «Ver detalle / Editar ítems» para agregar repuestos, insumos, servicios
          o mano de obra.
        </p>
      )}
      <dl className="wt-compact-totals" aria-label="Totales de la cotización">
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
      <button
        className="rp-secondary"
        type="button"
        aria-expanded={expanded}
        aria-controls={editorId}
        onClick={onToggle}
      >
        {expanded ? <ChevronUp /> : <ChevronDown />}
        {expanded ? 'Ocultar detalle de edición' : 'Ver detalle / Editar ítems'}
      </button>
    </section>
  )
}
