import {
  composeValidators,
  required,
  email,
  minLength,
  phone,
  rif,
  documento,
  matchesField,
  strongPassword,
} from '../../../lib/validators'

/**
 * Esquemas de validación del registro (capa dominio).
 * Cada paso del wizard usa su propio esquema: 1 archivo central,
 * sin duplicar mensajes entre flujos.
 */

export const clinicaStepSchema = {
  nombre: required('Ingresa el nombre de la clínica'),
  rif: composeValidators(rif()),
  telefono: composeValidators(phone()),
  // direccion y email_contacto son opcionales: sin validador
}

export const cuentaStepSchema = {
  nombre: required('Ingresa tu nombre completo'),
  email: composeValidators(required('Ingresa tu correo'), email()),
  telefono: composeValidators(phone()),
  password: composeValidators(required('Ingresa una contraseña'), strongPassword()),
  confirmar: composeValidators(
    required('Confirma tu contraseña'),
    matchesField('password', 'Las contraseñas no coinciden')
  ),
}

export const odontologoStepSchema = {
  nombre: required('Ingresa tu nombre completo'),
  email: composeValidators(required('Ingresa tu correo'), email()),
  telefono: composeValidators(phone()),
  password: composeValidators(required('Ingresa una contraseña'), strongPassword()),
  confirmar: composeValidators(
    required('Confirma tu contraseña'),
    matchesField('password', 'Las contraseñas no coinciden')
  ),
  clinicaNombre: required('Ingresa el nombre de tu clínica'),
}

export const pacienteStep1Schema = {
  nombre: required('Ingresa tu nombre completo'),
  documento: composeValidators(documento()),
}

export const cuentaSimpleStepSchema = {
  email: composeValidators(required('Ingresa tu correo'), email()),
  telefono: composeValidators(phone()),
  password: composeValidators(required('Ingresa una contraseña'), strongPassword()),
  confirmar: composeValidators(
    required('Confirma tu contraseña'),
    matchesField('password', 'Las contraseñas no coinciden')
  ),
}

/** Doctor invitado (fila dinámica del flujo clínica). */
export const doctorSchema = {
  nombre: required('Nombre del doctor'),
  email: composeValidators(required('Correo del doctor'), email()),
}

/** Valida una fila de doctor; devuelve errores {nombre, email}. */
export function validateDoctor(doctor) {
  const errors = {}
  for (const [field, validate] of Object.entries(doctorSchema)) {
    errors[field] = validate(doctor[field], doctor) || ''
  }
  return errors
}

/** ¿La fila está vacía? → no se valida ni se envía. */
export function isDoctorEmpty(doctor) {
  return (doctor?.nombre ?? '').trim() === '' && (doctor?.email ?? '').trim() === ''
}
