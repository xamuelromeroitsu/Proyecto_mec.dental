import './Header.css'

export default function Header({ currentView, authData, onNavigate, onLogout }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo" onClick={() => onNavigate('landing')}>
          <img src="/logo.png" alt="NovaDent LAB" />
        </div>

        <nav className="header-nav">
          {currentView === 'landing' && (
            <>
              <a href="#inicio" className="header-link">Inicio</a>
              <a href="#casos" className="header-link">Casos Clínicos</a>
              <a href="#servicios" className="header-link">Especialidades</a>
              <a href="#nosotros" className="header-link">Nosotros</a>
              <button
                onClick={() => onNavigate('login')}
                className="header-btn"
              >
                <i className="fa-solid fa-user-md header-btn-icon"></i>
                <span className="header-btn-label-desktop">Portal Odontólogo</span>
                <span className="header-btn-label-mobile">Portal</span>
              </button>
            </>
          )}

          {currentView === 'login' && (
            <button
              onClick={() => onNavigate('landing')}
              className="header-back"
            >
              <i className="fa-solid fa-arrow-left"></i> Volver al Inicio
            </button>
          )}

          {currentView === 'dashboard' && (
            <div className="header-actions">
              <div className="header-user">
                <p className="header-user-name">{authData?.user?.name}</p>
                <p className="header-user-clinic">{authData?.user?.clinic}</p>
              </div>
              <button onClick={onLogout} className="header-logout">
                <i className="fa-solid fa-right-from-bracket"></i>
                <span className="header-logout-label">Cerrar Sesión</span>
                <span className="header-logout-short">Salir</span>
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
