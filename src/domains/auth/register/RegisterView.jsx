import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Logo from '../../../shared/Logo/Logo'
import { REGISTER_FLOWS, PATHS } from '../../../app/routes'
import ClinicaFlow from './flows/ClinicaFlow'
import OdontologoFlow from './flows/OdontologoFlow'
import PacienteFlow from './flows/PacienteFlow'
import './register.css'

/**
 * RegisterView — pantalla de registro (capa dominio).
 * Ruta índice: selector de tipo de cuenta. /registro/:flow → wizard propia.
 */

function FlowSelector() {
  return (
    <>
      <h1 className="register-title">Crea tu cuenta</h1>
      <p className="register-subtitle">
        Elige cómo usarás el laboratorio. Todos los datos que nos das quedan
        protegidos por las políticas de acceso de la clínica.
      </p>

      <div className="register-choose" data-testid="register-choose">
        {REGISTER_FLOWS.map((flow) => (
          <Link key={flow.key} to={flow.path} className="register-option" data-testid={`register-option-${flow.key}`}>
            <span className="register-option-icon">
              <i className={flow.icon} aria-hidden="true" />
            </span>
            <span>
              <span className="register-option-title">{flow.title}</span>
              <span className="register-option-desc" style={{ display: 'block' }}>
                {flow.description}
              </span>
            </span>
          </Link>
        ))}
      </div>

      <p className="register-login-hint">
        ¿Ya tienes cuenta?
        <Link to={PATHS.LOGIN} className="register-login-link">Inicia sesión</Link>
      </p>
    </>
  )
}

export default function RegisterView() {
  return (
    <div className="register">
      <div className="register-inner">
        <div className="register-card">
          <Logo variant="full" className="register-logo" />

          <Routes>
            <Route index element={<FlowSelector />} />
            <Route path="clinica" element={<ClinicaFlow />} />
            <Route path="odontologo" element={<OdontologoFlow />} />
            <Route path="paciente" element={<PacienteFlow />} />
            <Route path="*" element={<FlowSelector />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
