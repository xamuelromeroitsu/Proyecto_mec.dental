import { Link } from 'react-router-dom'
import Button from '../../../shared/ui/Button'
import { PATHS } from '../../../app/routes'
import './register.css'

/**
 * RegisterSuccess — pantalla final común de los 3 flujos de registro.
 * `partial` = la cuenta se creó pero quedó pendiente de vincular
 * (clínica/miembros/vínculo) porque la Edge Function aún no está deployada.
 */
export default function RegisterSuccess({ title, text, partial = false }) {
  return (
    <div className="register-success" data-testid="register-success">
      <span className="register-success-icon">
        <i className={`fa-solid ${partial ? 'fa-circle-half-stroke' : 'fa-circle-check'}`} aria-hidden="true" />
      </span>

      <h2 className="register-success-title">{title}</h2>

      <p className="register-success-text">{text}</p>

      {partial && (
        <div className="register-banner register-banner--partial" role="status" data-testid="register-partial">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>
            Cuenta creada en modo parcial: el alta de clínica/miembros quedó
            pendiente porque el servicio de registro no está disponible en este
            entorno. Un administrador puede completarla desde el panel.
          </span>
        </div>
      )}

      <Link to={PATHS.LOGIN}>
        <Button variant="primary" icon="fa-solid fa-right-to-bracket">
          Ir a iniciar sesión
        </Button>
      </Link>
    </div>
  )
}
