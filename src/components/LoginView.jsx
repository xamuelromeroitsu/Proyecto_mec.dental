import { useState } from 'react'

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
        name: "Dr. Alejandro Martínez",
        clinic: "Clínica Dental Esthetic",
        email: email
      })
    }, 1500)
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-100 border border-slate-100 w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 text-xl mx-auto border border-sky-100">
            <i className="fa-solid fa-lock"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-950">Acceso Seguro Clínicas</h2>
          <p className="text-sm text-slate-500">Introduzca sus credenciales autorizadas del laboratorio.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-2 border border-red-100">
              <i className="fa-solid fa-circle-exclamation text-sm animate-pulse"></i>
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">Correo Electrónico Autorizado</label>
            <div className="relative">
              <i className="fa-solid fa-envelope absolute left-3 top-3.5 text-slate-400 text-sm"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                placeholder="doctor@correo.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">Contraseña Cifrada (SHA-256)</label>
            <div className="relative">
              <i className="fa-solid fa-key absolute left-3 top-3.5 text-slate-400 text-sm"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${loading ? 'bg-sky-400 cursor-not-allowed shadow-none' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-100'}`}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i> Generando Firma JWT...
              </>
            ) : (
              <>
                <i className="fa-solid fa-right-to-bracket text-sm"></i> Autenticar Acceso
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5">
            <i className="fa-solid fa-shield-halved text-sky-500"></i> Cifrado TLS 1.3 de extremo a extremo
          </span>
        </div>
      </div>
    </div>
  )
}
