import './form.css'

/**
 * Button — botón semántico con variantes (primary navy / accent dorado /
 * outline), tamaño block y estado de carga opcional.
 */
export default function Button({
  children,
  variant = 'primary',
  block = false,
  size,
  loading = false,
  icon = null,
  type = 'button',
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    block && 'btn--block',
    size === 'sm' && 'btn--sm',
  ].filter(Boolean).join(' ')

  return (
    <button type={type} className={classes} disabled={loading || rest.disabled} {...rest}>
      {loading
        ? <i className="fa-solid fa-spinner btn-spinner" aria-hidden="true" />
        : icon && <i className={icon} aria-hidden="true" />}
      <span>{children}</span>
    </button>
  )
}
