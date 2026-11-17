/**
 * Rutas centralizadas de la SPA (capa app).
 * Un solo lugar para renombrar/mover URLs.
 */
export const PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_CLINICA: '/register/clinic',
  REGISTER_ODONTOLOGO: '/register/dentist',
  REGISTER_PACIENTE: '/register/patient',
  DASHBOARD: '/dashboard',
}

/** Flujos de registro disponibles — mapea 1:1 con los roles de la BD. */
export const REGISTER_FLOWS = [
  {
    key: 'paciente',
    path: PATHS.REGISTER_PACIENTE,
    rol: 'paciente',
    title: 'Paciente',
    icon: 'fa-solid fa-user',
    description: 'Particípate de tus tratamientos y sigue tus trabajos en curso con el técnico de esta página.',
  },
  {
    key: 'clinica',
    path: PATHS.REGISTER_CLINICA,
    rol: 'odontologo',
    title: 'Clínica + Doctores',
    icon: 'fa-solid fa-hospital',
    description: 'Registra tu clínica con varios doctores. Ideal para consultorios con equipo odontológico.',
  },
  {
    key: 'odontologo',
    path: PATHS.REGISTER_ODONTOLOGO,
    rol: 'odontologo',
    title: 'Odontólogo',
    icon: 'fa-solid fa-user-doctor',
    description: 'Me invitaron de una clínica y quiero registrarme con ella para enviar trabajos.',
  },
]
