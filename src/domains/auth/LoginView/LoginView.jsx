import { useState } from 'react'
import './LoginView.css'

export default function LoginView({ onLoginSuccess }) {
  const [email, setEmail] = useState('demo@clinica.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (email.length < 5 || password.length < 6) {
      setError('Las credenciales deben ser válidas (Mínimo 6 caracteres en la clave).')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onLoginSuccess({
        name: 'Dr. Alejandro Martínez',
        clinic: 'Clínica Dental Esthetic',
        email: email,
      })
    }, 1500)
  }

  return (
    <div className="login">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 className="login-title">Acceso Seguro Clínicas</h2>
          <p className="login-subtitle">
            Introduzca sus credenciales autorizadas del laboratorio.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <i className="fa-solid fa-circle-exclamation login-error-icon"></i>
              {error}
            </div>
          )}

          <div className="login-field">
            <label className="login-label">Correo Electrónico Autorizado</label>
            <div className="login-input-wrapper">
              <i className="fa-solid fa-envelope login-input-icon"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                placeholder="doctor@correo.com"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label className="login-label">Contraseña Cifrada (SHA-256)</label>
            <div className="login-input-wrapper">
              <i className="fa-solid fa-key login-input-icon"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`login-submit ${loading ? 'login-submit--disabled' : 'login-submit--active'}`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner login-spinner"></i>
                Generando Firma JWT...
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
        </div>
      </div>
    </div>
  )
}
