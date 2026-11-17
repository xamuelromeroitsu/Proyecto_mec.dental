/**
 * Validadores puros y componibles (capa lib — sin dependencias de React).
 *
 * Contrato: cada validador recibe el valor (y opcionalmente todos los valores
 * del formulario) y devuelve:
 *   - ''  → válido
 *   - msg → texto de error listo para mostrar
 *
 * Se combinan con `composeValidators`, que ejecuta cada uno en orden y
 * devuelve el PRIMER error encontrado.
 */

/** Requerido: Rechaza strings vacíos, solo espacios y valores nulos. */
export const required =
  (msg = 'Este campo es obligatorio') =>
  (value) => {
    const invalid =
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '')
    return invalid ? msg : ''
  }

/** Email con formato razonable (no exhaustivo: suficiente para UX). */
export const email =
  (msg = 'Ingresa un correo válido (ej. nombre@dominio.com)') =>
  (value) => {
    if (value === '' || value === null || value === undefined) return ''
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    return regex.test(String(value).trim()) ? '' : msg
  }

/** Longitud mínima (ignora espacios de los bordes). */
export const minLength =
  (limit, msg) =>
  (value) => {
    if (value === '' || value === null || value === undefined) return ''
    return String(value).trim().length < limit
      ? msg || `Debe tener al menos ${limit} caracteres`
      : ''
  }

/** Solo dígitos, espacios, +, -, (, ) — para teléfonos de formato libre. */
export const phone =
  (msg = 'Ingresa un teléfono válido (ej. +58-412-1234567)') =>
  (value) => {
    if (value === '' || value === null || value === undefined) return ''
    const regex = /^[+()\d][\d\s()+-]{6,19}$/
    return regex.test(String(value).trim()) ? '' : msg
  }

/** RIF venezolano: letra+guion+dígitos+guion+dígito (J-12345678-9). */
export const rif =
  (msg = 'Formato de RIF inválido (ej. J-12345678-9)') =>
  (value) => {
    if (value === '' || value === null || value === undefined) return ''
    const regex = /^[VJEGP]-\d{8}-\d$/
    return regex.test(String(value).trim().toUpperCase()) ? '' : msg
  }

/** Cédula/pasaporte venezolano: V-12345678 o P-9876543. */
export const documento =
  (msg = 'Formato inválido (ej. V-12345678)') =>
  (value) => {
    if (value === '' || value === null || value === undefined) return ''
    const regex = /^[VP]-\d{5,9}$/
    return regex.test(String(value).trim().toUpperCase()) ? '' : msg
  }

/** El valor debe coincidir con otro campo del formulario. */
export const matchesField =
  (otherField, msg = 'Las contraseñas no coinciden') =>
  (value, values = {}) =>
    value === values?.[otherField] ? '' : msg

/**
 * Puntuación de fuerza de contraseña (0–4) para el medidor de UX.
 * 0 = vacía · 1 = muy débil · 2 = débil · 3 = aceptable · 4 = fuerte
 */
export function passwordScore(value = '') {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  return Math.max(1, Math.min(4, score))
}

/**
 * Validador de contraseña en dos niveles:
 * - `minLength(8)` para longitud mínima aceptable.
 * - Reglas de complejidad informadas (no bloqueantes) en cada `PasswordField`.
 */
export const strongPassword =
  (msg = 'Mínimo 8 caracteres, con letras y números') =>
  (value) => {
    if (value === '' || value === null || value === undefined) return ''
    const hasLetter = /[a-zA-Z]/.test(value)
    const hasNumber = /\d/.test(value)
    return value.length >= 8 && hasLetter && hasNumber ? '' : msg
  }

/** Une varios validadores: devuelve el primer error que encuentre. */
export function composeValidators(...validators) {
  return (value, values) => {
    for (const validate of validators) {
      const error = validate ? validate(value, values) : ''
      if (error) return error
    }
    return ''
  }
}
