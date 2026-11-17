import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { SessionProvider, useSession } from './SessionContext'
import RequireAuth from './RequireAuth'
import { PATHS } from './routes'
import Header from '../shared/Header/Header'
import Presentation from '../domains/portfolio/components/Presentation/Presentation'
import LoginView from '../domains/auth/LoginView/LoginView'
import RegisterView from '../domains/auth/register/RegisterView'
import DashboardView from '../domains/dashboard/DashboardView/DashboardView'
import { INITIAL_CAROUSEL_IMAGES } from '../data/initialData'
import '../App.css'
import '../styles/base.css'

/** Restaura el scroll al cambiar de ruta (UX de SPA). */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function Shell({ children }) {
  const { authData, logOut } = useSession()
  return (
    <div className="app">
      <Header authData={authData} onLogout={logOut} />
      <main className="main-content">{children}</main>
    </div>
  )
}

/** Ruta protegida: monta el dashboard con los datos de la sesión. */
function DashboardRoute() {
  const { authData, orders, addOrder } = useSession()
  if (!authData) return null
  return (
    <DashboardView
      orders={orders}
      onAddOrder={addOrder}
      authData={authData}
    />
  )
}

/** Landing: conserva la misma firma que usa el portfolio. */
function LandingRoute({ carouselImages }) {
  return <Presentation carouselImages={carouselImages} />
}

export default function App() {
  return (
    <SessionProvider>
      <AppInner />
    </SessionProvider>
  )
}

function AppInner() {
  const [carouselImages] = useState(INITIAL_CAROUSEL_IMAGES)
  const { restoring } = useSession()

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    document.head.appendChild(link)
  }, [])

  if (restoring) return null

  return (
    <SessionProvider>
      <HashRouter>
        <ScrollToTop />
        <Shell>
          <Routes>
            <Route path={PATHS.HOME} element={<LandingRoute carouselImages={carouselImages} />} />
            <Route path={PATHS.LOGIN} element={<LoginView />} />
            <Route path={`${PATHS.REGISTER}/*`} element={<RegisterView />} />
            <Route element={<RequireAuth />}>
              <Route path={PATHS.DASHBOARD} element={<DashboardRoute />} />
            </Route>
            <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
          </Routes>
        </Shell>
      </HashRouter>
    </SessionProvider>
  )
}
