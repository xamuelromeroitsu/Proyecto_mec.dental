import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { signInWithPassword } from '../../../services/auth'
import { isSupabaseConfigured } from '../../../services/supabase'
import { useSession } from '../../../app/SessionContext'
import { PATHS } from '../../../app/routes'
import Logo from '../../../shared/Logo/Logo'
import './LoginView.css'

export default function LoginView({ onLoginSuccess }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logIn } = useSession()
  // RequireAuth guarda la página de origen en state.from: tras el login
  // volvemos allí en vez de forzar siempre /dashboard.
  const redirectTo = location.state?.from || PATHS.DASHBOARD
  // En modo demo (sin .env) prellenamos credenciales mock; con Supabase real,
  // los campos empiezan vacíos.
  const [email, setEmail] = useState(isSupabaseConfigured ? '' : 'demo@kamiladentys.com')
  const [password, setPassword] = useState(isSupabaseConfigured ? '' : 'password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (email.length < 5 || password.length < 6) {
      setError('Las credenciales deben ser válidas (Mínimo 6 caracteres en la clave).')
      return
    }

    setLoading(true)
    try {
      const authData = await signInWithPassword(email, password)
      // Integración con el router: el contexto marca la sesión y RequireAuth
      // permite el acceso a /dashboard.
      await logIn(authData)
      onLoginSuccess?.(authData)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Credenciales inválidas. Verifique su correo y contraseña.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-header">
          <Logo variant="full" className="login-logo" />
          <h2 className="login-title">Portal del Técnico Dental</h2>
          <p className="login-subtitle">
            Credenciales autorizadas del laboratorio Kamila Dentys.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" data-testid="login-form">
          {error && (
            <div className="login-error" role="alert" data-testid="login-error">
              <i className="fa-solid fa-circle-exclamation login-error-icon" aria-hidden="true"></i>
              {error}
            </div>
          )}

          <div className="login-field">
            <label className="login-label" htmlFor="login-email">Correo Electrónico Autorizado</label>
            <div className="login-input-wrapper">
              <i className="fa-solid fa-envelope login-input-icon"></i>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                className="login-input"
                placeholder="doctor@correo.com"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="login-password">Contraseña</label>
            <div className="login-input-wrapper">
              <i className="fa-solid fa-key login-input-icon"></i>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                className="login-input"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            data-testid="login-submit"
            className={`login-submit ${loading ? 'login-submit--disabled' : 'login-submit--active'}`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner login-spinner"></i>
                Autenticando...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket"></i>
                Autenticar Acceso
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <span className="login-security">
            <i className="fa-solid fa-shield-halved login-security-icon"></i>
            Cifrado TLS 1.3 de extremo a extremo
          </span>

          <div className="login-register" data-testid="login-register">
            <p className="login-register-text">¿Primera vez aquí?</p>
            <div className="login-register-actions">
              <Link to={PATHS.REGISTER} className="login-register-btn" data-testid="login-register-link">
                <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
                Crear una cuenta
              </Link>
            </div>
            <p className="login-register-hint">
              Clínicas con varios doctores, odontólogos invitados y pacientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
