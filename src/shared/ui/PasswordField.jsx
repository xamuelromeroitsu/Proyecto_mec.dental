import { useId, useState } from 'react'
import { passwordScore } from '../../lib/validators'
import './form.css'

const STRENGTH_LABELS = [
  { label: '', color: '' },
  { label: 'Muy débil', color: 'strength-segment--on-1' },
  { label: 'Débil', color: 'strength-segment--on-2' },
  { label: 'Aceptable', color: 'strength-segment--on-3' },
  { label: 'Fuerte', color: 'strength-segment--on-4' },
]

/**
 * PasswordField — primitiva de contraseña con:
 * - Mostrar/ocultar (aria-pressed + label dinámico)
 * - Medidor de fuerza no bloqueante (solo informa)
 */
export default function PasswordField({
  label = 'Contraseña',
  name,
  value,
  onChange,
  onBlur,
  error = '',
  required = false,
  autoComplete = 'new-password',
  autoFocus = false,
  showStrength = true,
  className = '',
}) {
  const id = useId()
  const [visible, setVisible] = useState(false)
  const errorId = error ? `${id}-error` : undefined

  const score = passwordScore(value ?? '')
  const meta = STRENGTH_LABELS[score]

  return (
    <div className={`field ${className}`}>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span className="field-required" aria-hidden="true"> *</span>}
      </label>

      <div className={`field-wrapper field-wrapper--icon ${showStrength ? 'field-wrapper--toggle' : ''}`}>
        <i className="fa-solid fa-lock field-icon" aria-hidden="true" />
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          className={`field-input ${error ? 'field-input--error' : ''}`}
          value={value ?? ''}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          autoComplete={autoComplete}
          placeholder="••••••••"
          autoFocus={autoFocus}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
        />
        {showStrength && (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setVisible((v) => !v)}
            aria-pressed={visible}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <i className={`fa-solid ${visible ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
          </button>
        )}
      </div>

      {showStrength && (
        <div className="strength" aria-hidden="true">
          <div className="strength-bar">
            {[1, 2, 3, 4].map((step) => (
              <span
                key={step}
                className={`strength-segment ${score >= step ? meta.color : ''}`}
              />
            ))}
          </div>
          <span className="strength-label">{meta.label}</span>
        </div>
      )}

      {error && (
        <p className="field-error" id={errorId} role="alert">
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
