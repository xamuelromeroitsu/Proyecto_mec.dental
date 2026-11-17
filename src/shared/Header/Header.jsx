import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Logo from '../Logo/Logo'
import { PATHS } from '../../app/routes'
import './Header.css'

/** Anclas de la landing (con HashRouter el scroll se hace por JS). */
const LANDING_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'casos', label: 'Casos Clínicos' },
  { id: 'servicios', label: 'Especialidades' },
  { id: 'nosotros', label: 'Nosotros' },
]

function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Vista derivada de la ruta — el header solo procesa location. */
function useCurrentArea(pathname) {
  if (pathname.startsWith(PATHS.REGISTER)) return 'register'
  if (pathname === PATHS.LOGIN) return 'login'
  if (pathname === PATHS.DASHBOARD) return 'dashboard'
  return 'landing'
}

/** Etiquetas legibles de los roles definidos en la BD (rol_usuario). */
const ROL_LABELS = {
  tecnico_admin: 'Dueño del Laboratorio',
  tecnico: 'Técnico Dental',
  odontologo: 'Odontólogo',
  paciente: 'Paciente',
}

export default function Header({ authData, onLogout }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const area = useCurrentArea(pathname)
  const sessionLabel = authData?.user?.clinic || ROL_LABELS[authData?.user?.rol] || authData?.user?.rol
  const [menuOpen, setMenuOpen] = useState(false)
  const firstMenuLinkRef = useRef(null)

  // Cierra el menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Escape cierra el menú; el foco va al primer link VISIBLE del panel móvil
  useEffect(() => {
    if (!menuOpen) return
    firstMenuLinkRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  const goHomeThenScroll = useCallback((id) => {
    if (area === 'landing') {
      scrollToSection(id)
    } else {
      navigate(PATHS.HOME)
      // Espera al montaje de la landing para desplazarse a la sección
      setTimeout(() => scrollToSection(id), 60)
    }
  }, [area, navigate])

  /** Links de la landing; `withRef` marca el primero (panel móvil visible). */
  const renderLinks = (withRef = false) =>
    LANDING_LINKS.map((link, index) => (
      <button
        key={link.id}
        ref={withRef && index === 0 ? firstMenuLinkRef : undefined}
        className="header-link"
        onClick={() => goHomeThenScroll(link.id)}
      >
        {link.label}
      </button>
    ))

  const links = renderLinks(false)

  const actionsLoggedOut = (
    <>
      <Link to={PATHS.REGISTER} className="header-cta header-cta--outline">
        Registrarme
      </Link>
      <Link to={PATHS.LOGIN} className="header-cta header-cta--primary">
        <i className="fa-solid fa-tooth" aria-hidden="true" />
        <span>Portal Técnico</span>
      </Link>
    </>
  )

  const actionsLoggedIn = (
    <>
      <div className="header-user" data-testid="header-user">
        <p className="header-user-name">{authData?.user?.name}</p>
        <p className="header-user-clinic">{sessionLabel}</p>
      </div>
      {/* Fuera del dashboard, el usuario logueado necesita volver a su panel */}
      {area !== 'dashboard' && (
        <Link to={PATHS.DASHBOARD} className="header-cta header-cta--primary" data-testid="header-goto-dashboard">
          <i className="fa-solid fa-table-columns" aria-hidden="true" />
          <span>Ir al Panel</span>
        </Link>
      )}
      <button onClick={onLogout} className="header-logout">
        <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
        <span className="header-logout-label">Cerrar Sesión</span>
        <span className="header-logout-short">Salir</span>
      </button>
    </>
  )

  return (
    <header className="header">
      <div className="header-inner">
        <Link to={PATHS.HOME} className="header-logo" aria-label="Kamila Dentys — Inicio">
          <Logo variant="mono" className="header-logo-svg" />
        </Link>

        {/* Navegación de escritorio */}
        <nav className="header-nav" aria-label="Navegación principal">
          {area === 'landing' && <span className="header-links">{links}</span>}

          {(area === 'login' || area === 'register') && (
            <Link to={PATHS.HOME} className="header-back">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" />
              <span>Volver al Inicio</span>
            </Link>
          )}

          {area === 'dashboard' && (
            <div className="header-actions">{authData ? actionsLoggedIn : null}</div>
          )}

          {area === 'landing' && (
            <div className="header-actions">{authData ? actionsLoggedIn : actionsLoggedOut}</div>
          )}

          {area === 'login' && !authData && (
            <div className="header-actions">{actionsLoggedOut}</div>
          )}
          {area === 'register' && !authData && (
            <div className="header-actions">{actionsLoggedOut}</div>
          )}
        </nav>

        {/* Botón hamburguesa (móvil) */}
        <button
          className="header-burger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="header-mobile-menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          data-testid="header-burger"
        >
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
        </button>
      </div>

      {/* Menú móvil desplegable */}
      {menuOpen && (
        <div className="header-menu" id="header-mobile-menu" data-testid="header-mobile-menu">
          {area === 'landing' && <div className="header-menu-group">{renderLinks(true)}</div>}
          {area !== 'landing' && (
            <Link to={PATHS.HOME} className="header-menu-link">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Volver al Inicio
            </Link>
          )}
          {area === 'dashboard' && authData && (
            <div className="header-menu-user">
              <p className="header-user-name">{authData.user.name}</p>
              <p className="header-user-clinic">{sessionLabel}</p>
            </div>
          )}

          <div className="header-menu-actions">
            {authData ? (
              <>
                {area !== 'dashboard' && (
                  <Link to={PATHS.DASHBOARD} className="header-cta header-cta--primary">
                    <i className="fa-solid fa-table-columns" aria-hidden="true" />
                    Ir al Panel
                  </Link>
                )}
                <button onClick={onLogout} className="header-logout">
                  <i className="fa-solid fa-right-from-bracket" aria-hidden="true" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to={PATHS.REGISTER} className="header-cta header-cta--outline">
                  Registrarme
                </Link>
                <Link to={PATHS.LOGIN} className="header-cta header-cta--primary">
                  <i className="fa-solid fa-tooth" aria-hidden="true" />
                  <span>Portal Técnico</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
