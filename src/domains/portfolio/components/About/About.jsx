import { Link } from 'react-router-dom'
import { PATHS } from '../../../../app/routes'
import './About.css'

export default function About() {
  return (
    <section id="nosotros" className="about">
      <div className="container">
        <div className="about-card">
          <div className="about-content">
            <h3 className="about-title">¿Por qué Kamila Lab es el mejor aliado clínico?</h3>
            <p className="about-text">
              Ofrecemos una experiencia integral de manufactura. No somos solo un
              proveedor; trabajamos codo a codo con cada odontólogo para garantizar
              cero repeticiones de coronas y máxima comodidad para el paciente.
            </p>
            <div className="about-features">
              <div className="about-feature">
                <div className="about-feature-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <span className="about-feature-text">Materiales Biocompatibles Certificados</span>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">
                  <i className="fa-solid fa-microscope"></i>
                </div>
                <span className="about-feature-text">Inspección de Ajuste Bajo Microscopio</span>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">
                  <i className="fa-solid fa-clock"></i>
                </div>
                <span className="about-feature-text">Puntualidad en Logística Clínicas</span>
              </div>
              <div className="about-feature">
                <div className="about-feature-icon">
                  <i className="fa-solid fa-user-check"></i>
                </div>
                <span className="about-feature-text">Atención y Asesoría Técnica Directa</span>
              </div>
            </div>
          </div>
          <div className="about-cta-wrapper">
            {/* Sección orientada a USUARIOS (clínicas/odontólogos/pacientes):
                el alta va al registro, no al portal del técnico. */}
            <Link to={PATHS.REGISTER} className="about-cta" data-testid="about-cta-register">
              <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
              Crear una cuenta
            </Link>
            <div className="about-cta-aux">
              <span className="about-cta-subtext">
                Clínicas · Odontólogos · Pacientes
              </span>
              <Link to={PATHS.LOGIN} className="about-cta-secondary">
                ¿Del laboratorio? Portal técnico
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
