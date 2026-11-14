import './brand.css'

/** Approved original artwork, with a text-only contrast derivative for dark surfaces. */
export function BrandLogo({
  variant = 'horizontal',
  decorative = false,
  surface = 'light'
}: {
  variant?: 'horizontal' | 'icon'
  decorative?: boolean
  surface?: 'dark' | 'light'
}) {
  return (
    <span className={'bt-brand bt-brand-' + variant + ' bt-brand-surface-' + surface}>
      <img
        src={
          variant === 'horizontal'
            ? surface === 'dark'
              ? '/brand/logo-horizontal-dark.webp'
              : '/brand/logo-horizontal.webp'
            : '/brand/icon.webp'
        }
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
