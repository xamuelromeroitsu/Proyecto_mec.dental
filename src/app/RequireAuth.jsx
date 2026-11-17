import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PATHS } from './routes'
import { useSession } from './SessionContext'

/**
 * RequireAuth — guard de rutas protegidas (capa app).
 * Sin sesión → redirige a /login conservando el origen para volver después.
 */
export default function RequireAuth() {
  const { authData, restoring } = useSession()
  const location = useLocation()

  if (restoring) return null // evita flash de redirect durante la restauración
  if (!authData) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location.pathname }} replace />
  }
  return <Outlet />
}
