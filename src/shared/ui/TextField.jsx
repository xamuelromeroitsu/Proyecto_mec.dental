import { useId } from 'react'
import './form.css'

/**
 * TextField — primitiva de formulario accesible.
 * Label + input (con icono opcional) + hint + error (aria-live).
 *
 * Buenas prácticas: label asociado por id, `aria-invalid` y
 * `aria-describedby` cuando hay error o hint, autocomplete explícito.
 */
export default function TextField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error = '',
  hint = '',
  icon = null,
  required = false,
  autoComplete,
  placeholder,
  inputMode,
  maxLength,
  autoFocus = false,
  className = '',
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span className="field-required" aria-hidden="true"> *</span>}
      </label>

      {hint && (
        <span className="field-hint" id={hintId}>{hint}</span>
      )}

      <div className={`field-wrapper ${icon ? 'field-wrapper--icon' : ''}`}>
        {icon && <i className={`${icon} field-icon`} aria-hidden="true" />}
        <input
          id={id}
          name={name}
          type={type}
          className={`field-input ${error ? 'field-input--error' : ''}`}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={maxLength}
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      </div>

      {error && (
        <p className="field-error" id={errorId} role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
