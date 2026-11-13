import { useState } from 'react'
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react'
import { currency, itemTypes, validateItem, type WorkDocument, type WorkItem } from './trabajosData'
export function WorkItemsTable({
  document: d,
  onEdit,
  onDelete,
  onPerformed,
  onTemplate
}: {
  document: WorkDocument
  onEdit: (item?: WorkItem) => void
  onDelete: (item: WorkItem) => void
  onPerformed: (id: string, value: boolean) => void
  onTemplate: () => void
}) {
  return (
    <section className="dashboard-card wt-items wt-card">
      <header>
        <h2>
          <Wrench />
          {d.mode === 'quote'
            ? 'Detalle de los trabajos a realizar'
            : 'Detalle de trabajos · Confirmación del operador'}
        </h2>
        <button className="rp-secondary" onClick={onTemplate}>
          Cargar plantilla
        </button>
      </header>
      {d.mode === 'work' && (
        <p className="wt-help">
          Marca Realizado únicamente cuando corresponda. Los pendientes no se imprimen ni se suman
          al informe; conservarlos aquí no acredita ejecución.
        </p>
      )}
      <table>
        <thead>
          <tr>
            <th>N.º</th>
            <th>Descripción (trabajo / repuesto)</th>
            <th>Tipo</th>
            <th>Cantidad</th>
            <th>Precio unitario (CLP)</th>
            <th>Total (CLP)</th>
            {d.mode === 'work' && <th>Realizado</th>}
            <th>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {d.items.map((item, i) => (
            <tr key={item.id} data-item={item.id}>
              <td data-label="N.º">{i + 1}</td>
              <td data-label="Descripción">{item.description}</td>
              <td data-label="Tipo">
                <span
                  className={
                    'wt-type wt-type-' +
                    (item.type === 'Insumo'
                      ? 'supply'
                      : item.type === 'Mano de obra'
                        ? 'labor'
                        : 'part')
                  }
                >
                  {item.type}
                </span>
              </td>
              <td data-label="Cantidad">{item.quantity.toLocaleString('es-CL')}</td>
              <td data-label="Precio unitario">{currency(item.price)}</td>
              <td data-label="Total">
                <strong>{currency(Math.round(item.quantity * item.price))}</strong>
                {d.mode === 'work' && !item.performed && <small>No incluido · Sin realizar</small>}
              </td>
              {d.mode === 'work' && (
                <td data-label="Ejecución">
                  <label className="wt-performed">
                    <input
                      type="checkbox"
                      aria-label={`Realizado: ${item.description}`}
                      checked={item.performed}
                      onChange={(e) => onPerformed(item.id, e.target.checked)}
                    />{' '}
                    Realizado
                  </label>
                </td>
              )}
              <td className="wt-row-actions">
                <button aria-label={`Editar ítem ${i + 1}`} onClick={() => onEdit(item)}>
                  <Pencil />
                </button>
                <button aria-label={`Eliminar ítem ${i + 1}`} onClick={() => onDelete(item)}>
                  <Trash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!d.items.length && (
        <p className="wt-empty">Sin ítems. Agrega un repuesto, insumo, servicio o mano de obra.</p>
      )}
      <button className="rp-inline" onClick={() => onEdit()}>
        <Plus /> Agregar otro ítem
      </button>
    </section>
  )
}
export function WorkItemForm({
  item,
  onSave
}: {
  item?: WorkItem
  onSave: (value: WorkItem) => void
}) {
  const [value, setValue] = useState<WorkItem>(() =>
    item
      ? { ...item }
      : {
          id: crypto.randomUUID(),
          description: '',
          type: 'Repuesto',
          quantity: 1,
          price: 0,
          performed: false
        }
  )
  const [quantity, setQuantity] = useState(String(value.quantity)),
    [price, setPrice] = useState(String(value.price)),
    [error, setError] = useState('')
  const candidate = {
      ...value,
      quantity: quantity.trim() ? Number(quantity) : NaN,
      price: price.trim() ? Number(price) : NaN
    },
    problem = validateItem(candidate)
  function save(e: React.FormEvent) {
    e.preventDefault()
    if (problem) {
      setError(problem)
      return
    }
    try {
      onSave(candidate)
    } catch (e) {
      setError((e as Error).message)
    }
  }
  return (
    <form className="wt-item-form" onSubmit={save} noValidate>
      <label>
        Descripción
        <input
          autoFocus
          aria-label="Descripción del ítem"
          value={value.description}
          maxLength={160}
          onChange={(e) => setValue({ ...value, description: e.target.value })}
        />
      </label>
      <label>
        Tipo
        <select
          aria-label="Tipo de ítem"
          value={value.type}
          onChange={(e) => setValue({ ...value, type: e.target.value as WorkItem['type'] })}
        >
          {itemTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="wt-form-grid">
        <label>
          Cantidad
          <input
            aria-label="Cantidad del ítem"
            type="number"
            inputMode="decimal"
            min="0.01"
            max="10000"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>
        <label>
          Precio unitario CLP
          <input
            aria-label="Precio del ítem"
            type="number"
            inputMode="numeric"
            min="0"
            max="100000000"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>
      </div>
      <p className="wt-line-total">
        Total del ítem:{' '}
        {problem
          ? 'Revisa los valores'
          : currency(Math.round(candidate.quantity * candidate.price))}
      </p>
      {error && (
        <p className="rp-error" role="alert">
          {error}
        </p>
      )}
      <button className="rp-primary" type="submit">
        Guardar ítem DEMO
      </button>
    </form>
  )
}
