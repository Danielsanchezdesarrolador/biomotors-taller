import {
  categories,
  resultLabels,
  results,
  type InspectionItem,
  type Result
} from './multipuntoData'
type Change = (id: string, state: Result) => void
export function MultipuntoTable({
  items,
  onChange
}: {
  items: InspectionItem[]
  onChange?: Change
}) {
  return (
    <div className="mp-tables">
      {categories.map((category) => (
        <section
          className={'mp-category mp-category-' + category.id}
          id={'mp-' + category.id}
          key={category.id}
        >
          <h3>{category.name}</h3>
          <div className="mp-category-rows">
            {items
              .filter((i) => i.category === category.id)
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <MultipuntoRow key={item.id} item={item} onChange={onChange} />
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
export function MultipuntoRow({ item, onChange }: { item: InspectionItem; onChange?: Change }) {
  return (
    <div className="mp-row" data-item={item.id}>
      <MultipuntoStatusSelector item={item} onChange={onChange} />
      <span className="mp-item-name">
        {item.name}
        {item.note && <small>{item.note}</small>}
        {!onChange && item.state === 'unreviewed' && (
          <small className="mp-unreviewed">Sin revisar</small>
        )}
      </span>
    </div>
  )
}
export function MultipuntoStatusSelector({
  item,
  onChange
}: {
  item: InspectionItem
  onChange?: Change
}) {
  return (
    <div
      className="mp-status"
      role={onChange ? 'radiogroup' : undefined}
      aria-label={`${item.name}: ${resultLabels[item.state]}`}
    >
      {results.map((state) =>
        onChange ? (
          <label key={state} className={'mp-cell mp-' + state} title={resultLabels[state]}>
            <input
              type="radio"
              name={'result-' + item.id}
              aria-label={`${item.name} · ${resultLabels[state]}`}
              checked={item.state === state}
              onChange={() => onChange(item.id, state)}
            />
            <span aria-hidden="true">{item.state === state ? 'X' : ''}</span>
          </label>
        ) : (
          <span
            key={state}
            className={'mp-cell mp-' + state}
            aria-label={item.state === state ? resultLabels[state] : undefined}
          >
            {item.state === state ? 'X' : ''}
          </span>
        )
      )}
      {onChange && (
        <button
          className="mp-clear"
          aria-label={`Limpiar ${item.name}`}
          title="Volver a sin revisar"
          onClick={() => onChange(item.id, 'unreviewed')}
        >
          ↺
        </button>
      )}
    </div>
  )
}
