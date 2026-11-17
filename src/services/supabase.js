import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Cliente único de Supabase para toda la app.
 * Si las env vars no están configuradas (antes de ejecutar la Fase 1),
 * `isSupabaseConfigured` permite a la app seguir con datos mock.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey)
  : null
