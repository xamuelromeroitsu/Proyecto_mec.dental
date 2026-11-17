import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Servicio de REGISTRO (capa services).
 *
 * Jerarquía de la BD (base_de_datos.sql):
 *   usuarios (rol: tecnico_admin|tecnico|odontologo|paciente)
 *     └ clinicas ← miembros_clinica → usuarios (N odontólogos)
 *     └ pacientes ← vinculos_paciente (paciente ↔ técnico del sitio)
 *
 * Las políticas RLS actuales NO permiten a un usuario anónimo crear
 * clínicas/miembros/vínculos desde el front, así que el registro pasa por
 * la Edge Function `register` (service_role). Si la función no está
 * deployada aún, caemos a un fallback parcial: creamos el usuario en Auth
 * con { rol } en los metadatos (el trigger `on_auth_user_created` crea el
 * perfil en `usuarios`); la clínica/miembros/vínculo queda pendiente de
 * alta manual y la UI lo avisa.
 */

const ERROR_FUNCTION_MISSING = /function not found|not_found|FunctionsHttpError|404/i

async function invokeRegister(payload) {
  const { data, error } = await supabase.functions.invoke('register', { body: payload })
  if (error) throw error
  return data
}

/** Fallback: signup directo. Devuelve { partial: true } si quedó sin vincular. */
async function fallbackSignUp({ email, password, fullName, rol, metadata }) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre: fullName, rol, ...metadata },
      emailRedirectTo: `${window.location.origin}/#/login`,
    },
  })
  if (error) throw error
  return { ok: true, partial: true }
}

/**
 * Registro de CLÍNICA con equipo de doctores.
 * payload: { clinica: {nombre, rif, telefono, direccion, email_contacto},
 *            dueno:   {nombre, email, password, telefono},
 *            doctores: [{nombre, email}] }
 */
export async function registerClinica({ clinica, dueno, doctores = [] }) {
  if (!isSupabaseConfigured) {
    return { ok: true, partial: true, message: 'Modo demo: no hay Supabase configurado.' }
  }
  try {
    return await invokeRegister({
      tipo: 'clinica',
      clinica,
      dueno: { ...dueno, rol: 'odontologo' },
      doctores: doctores.map((doc) => ({ ...doc, rol: 'odontologo' })),
    })
  } catch (error) {
    if (ERROR_FUNCTION_MISSING.test(error?.message || '')) {
      return fallbackSignUp({
        email: dueno.email,
        password: dueno.password,
        fullName: dueno.nombre,
        rol: 'odontologo',
        metadata: { clinica_nombre: clinica.nombre, pendiente: 'clinica' },
      })
    }
    throw error
  }
}

/**
 * Registro de ODONTÓLOGO invitado por una clínica.
 * payload: { usuario: {nombre, email, password, telefono}, clinica: {nombre} }
 */
export async function registerOdontologo({ usuario, clinica }) {
  if (!isSupabaseConfigured) {
    return { ok: true, partial: true, message: 'Modo demo: no hay Supabase configurado.' }
  }
  try {
    return await invokeRegister({
      tipo: 'odontologo',
      usuario: { ...usuario, rol: 'odontologo' },
      clinica,
    })
  } catch (error) {
    if (ERROR_FUNCTION_MISSING.test(error?.message || '')) {
      return fallbackSignUp({
        email: usuario.email,
        password: usuario.password,
        fullName: usuario.nombre,
        rol: 'odontologo',
        metadata: { clinica_nombre: clinica?.nombre ?? '', pendiente: 'miembros_clinica' },
      })
    }
    throw error
  }
}

/**
 * Registro de PACIENTE — crea el vínculo con el técnico de esta página
 * (vinculos_paciente.aparece en el sitio vía dominio, R2/R3).
 * payload: { usuario: {nombre, email, password, telefono}, paciente: {documento} }
 */
export async function registerPaciente({ usuario, paciente }) {
  if (!isSupabaseConfigured) {
    return { ok: true, partial: true, message: 'Modo demo: no hay Supabase configurado.' }
  }
  try {
    return await invokeRegister({
      tipo: 'paciente',
      usuario: { ...usuario, rol: 'paciente' },
      paciente,
      sitio_dominio: window.location.host,
    })
  } catch (error) {
    if (ERROR_FUNCTION_MISSING.test(error?.message || '')) {
      return fallbackSignUp({
        email: usuario.email,
        password: usuario.password,
        fullName: usuario.nombre,
        rol: 'paciente',
        metadata: { documento: paciente.documento, pendiente: 'vinculo_paciente' },
      })
    }
    throw error
  }
}

/** Traduce errores de Supabase/Edge a mensajes claros para la UI. */
export function friendlyRegisterError(error) {
  const message = error?.message || String(error || '')
  if (/user already registered|already been registered/i.test(message)) {
    return 'Ese correo ya tiene una cuenta. Inicia sesión o recupera tu contraseña.'
  }
  if (/password/i.test(message) && /weak|short|min/i.test(message)) {
    return 'La contraseña es muy débil. Usa al menos 8 caracteres con letras y números.'
  }
  if (/rate limit|too many/i.test(message)) {
    return 'Demasiados intentos seguidos. Espera un momento y prueba de nuevo.'
  }
  if (/invalid email|email invalid|format/i.test(message)) {
    return 'El correo no tiene un formato válido.'
  }
  return message
}
