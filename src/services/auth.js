import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Servicio de autenticación (Supabase Auth).
 * El perfil/rol vive en la tabla `usuarios` (creada por el trigger
 * on_auth_user_created en el signup).
 *
 * Si Supabase no está configurado aún, devuelve un login mock para
 * no bloquear el desarrollo ni los tests.
 */

// Perfil demo del TÉCNICO de mecánica dental (sin .env configurado).
// Mantiene el flujo real: los trabajos llegan DE las clínicas clientes
// (INITIAL_ORDERS), no del odontólogo.
const MOCK_USER = {
  name: 'Kamila Dentys',
  clinic: 'Kamila Dentys · Laboratorio Dental',
  email: 'demo@kamiladentys.com',
  rol: 'tecnico',
}

async function fetchPerfil(userId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, nombre, rol')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

async function fetchClinicaDelUsuario(userId) {
  const { data, error } = await supabase
    .from('miembros_clinica')
    .select('clinica_id, clinica:clinicas(id, nombre, laboratorio_id)')
    .eq('usuario_id', userId)
    .eq('activo', true)
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data?.clinica || null
}

/** Devuelve la sesión activa (si la hay) con su perfil, o null. */
export async function getCurrentSession() {
  if (!isSupabaseConfigured) return null

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null
  return buildAuthData(session)
}

/** Suscribirse a cambios de sesión (login/logout en otra pestaña, refresh). */
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured) return () => {}

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => callback(session)
  )
  return () => subscription.unsubscribe()
}

export async function signInWithPassword(email, password) {
  if (!isSupabaseConfigured) {
    return { user: MOCK_USER, token: 'mock-jwt-token-93021948' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return buildAuthData(data.session)
}

export async function signOut() {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut()
  }
}

async function buildAuthData(session) {
  const perfil = await fetchPerfil(session.user.id)
  const clinica = perfil.rol === 'odontologo'
    ? await fetchClinicaDelUsuario(session.user.id)
    : null

  return {
    token: session.access_token,
    user: {
      id: session.user.id,
      email: perfil.email,
      name: perfil.nombre,
      rol: perfil.rol,
      clinic: clinica?.nombre || null,
    },
    clinica,
  }
}
