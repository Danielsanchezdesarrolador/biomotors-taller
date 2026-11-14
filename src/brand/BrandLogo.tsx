import './brand.css'

/** Approved artwork only. Horizontal artwork always keeps its own light support. */
export function BrandLogo({
  variant = 'horizontal',
  decorative = false
}: {
  variant?: 'horizontal' | 'icon'
  decorative?: boolean
}) {
  return (
    <span className={'bt-brand bt-brand-' + variant}>
      <img
        src={variant === 'horizontal' ? '/brand/logo-horizontal.webp' : '/brand/icon.webp'}
        alt={decorative ? '' : 'ByteTorque — Gestión de Talleres'}
        width={variant === 'horizontal' ? 1000 : 384}
        height={variant === 'horizontal' ? 251 : 384}
        decoding="async"
      />
    </span>
  )
}

/** Product attribution; never replaces the workshop's commercial identity. */
export function SoftwareAttribution() {
  return (
    <span className="bt-software">
      <img src="/favicon-48.png?v=bt-brand-01" width={12} height={12} alt="" />
      Software ByteTorque
    </span>
  )
}
