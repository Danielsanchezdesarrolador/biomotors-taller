import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Paperclip, Trash2 } from 'lucide-react'
import { validatePhoto, type MultipuntoReport, type Photo } from './multipuntoData'
export function AdjuntosDemo({
  report,
  onChange,
  disabled
}: {
  report: MultipuntoReport
  onChange: (photos: Photo[]) => void
  disabled: boolean
}) {
  const [error, setError] = useState(''),
    [large, setLarge] = useState<Photo | null>(null),
    [busy, setBusy] = useState(false)
  const active = useRef(true),
    input = useRef<HTMLInputElement>(null)
  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])
  async function add(file?: File) {
    if (!file) return
    setError('')
    const problem = validatePhoto(file, report.photos.length)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      if (!active.current) {
        URL.revokeObjectURL(url)
        return
      }
      if (!img.naturalWidth || !img.naturalHeight) throw new Error()
      onChange([
        ...report.photos,
        { id: crypto.randomUUID(), name: file.name, size: file.size, url, itemId: '' }
      ])
    } catch {
      URL.revokeObjectURL(url)
      if (active.current) setError('La fotografía no se pudo abrir. Elige una imagen válida.')
    } finally {
      if (active.current) setBusy(false)
    }
  }
  return (
    <section className="dashboard-card mp-card">
      <h2>
        <Paperclip /> Archivos adjuntos ({report.photos.length})
      </h2>
      <p className="mp-help">
        Fotos DEMO locales. Máximo 6; JPG, PNG o WebP de hasta 5 MB. Se pierden al recargar.
      </p>
      <div className="mp-photos">
        {report.photos.map((p) => (
          <article key={p.id}>
            <button
              className="mp-photo-open"
              aria-label={`Ampliar ${p.name}`}
              onClick={() => setLarge(p)}
            >
              <img src={p.url} alt={p.name} />
            </button>
            <strong>{p.name}</strong>
            <small>{(p.size / 1024).toFixed(0)} KB · Temporal</small>
            <label>
              Componente
              <select
                aria-label={`Componente de ${p.name}`}
                disabled={disabled}
                value={p.itemId}
                onChange={(e) =>
                  onChange(
                    report.photos.map((photo) =>
                      photo.id === p.id ? { ...photo, itemId: e.target.value } : photo
                    )
                  )
                }
              >
                <option value="">Sin asociar</option>
                {report.items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="rp-inline"
              disabled={disabled}
              onClick={() => {
                URL.revokeObjectURL(p.url)
                onChange(report.photos.filter((photo) => photo.id !== p.id))
              }}
              aria-label={`Quitar ${p.name}`}
            >
              <Trash2 /> Quitar
            </button>
          </article>
        ))}
      </div>
      <input
        ref={input}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Elegir fotografía DEMO"
        disabled={disabled || busy || report.photos.length >= 6}
        onChange={(e) => {
          void add(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <button
        className="rp-secondary mp-attach"
        disabled={disabled || busy || report.photos.length >= 6}
        onClick={() => input.current?.click()}
      >
        <ImagePlus /> {busy ? 'Validando fotografía…' : 'Adjuntar fotografía'}
      </button>
      {error && (
        <p role="alert" className="rp-error">
          {error}
        </p>
      )}
      {large && (
        <dialog
          className="mp-dialog mp-image-dialog"
          ref={(node) => {
            if (node && !node.open) node.showModal()
          }}
          aria-label={`Fotografía ${large.name}`}
          onCancel={() => setLarge(null)}
          onClose={() => setLarge(null)}
        >
          <h2>{large.name}</h2>
          <img src={large.url} alt={large.name} />
          <button className="rp-secondary" onClick={() => setLarge(null)}>
            Cerrar imagen
          </button>
        </dialog>
      )}
    </section>
  )
}
