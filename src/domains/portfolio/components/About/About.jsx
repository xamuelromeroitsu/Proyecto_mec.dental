import './About.css'

export default function About({ onNavigateLogin }) {
  return (
    <section id="nosotros" className="about">
      <div className="container">
        <div className="about-card">
          <div className="about-content">
            <h3 className="about-title">¿Por qué NovaDent es el mejor aliado clínico?</h3>
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
            <button onClick={onNavigateLogin} className="about-cta">
              <i className="fa-solid fa-sign-in-alt"></i>
              Acceder al Portal Privado
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
