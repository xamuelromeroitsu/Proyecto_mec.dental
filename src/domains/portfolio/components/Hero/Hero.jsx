import './Hero.css'

export default function Hero({ onNavigateLogin }) {
  return (
    <section id="inicio" className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-badge">
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Odontología Digital Avanzada
          </div>

          <h1 className="hero-title">
            Precisión digital en cada <span className="hero-title-highlight">Prótesis</span>
          </h1>

          <p className="hero-description">
            Diseñamos el futuro de la mecánica dental. Aliados estratégicos de clínicas exigentes
            mediante tecnología CAD/CAM de máxima exactitud clínica.
          </p>

          <div className="hero-actions">
            <button onClick={onNavigateLogin} className="hero-btn-primary">
              <i className="fa-solid fa-calendar-check"></i>
              Agendar Cita
            </button>
          </div>

          <div className="hero-social">
            <span className="hero-social-label">Síguenos</span>
            <div className="hero-social-divider"></div>
            <a href="#" target="_blank" rel="noopener noreferrer"
              className="hero-social-btn hero-social-btn--whatsapp"
              style={{ animationDelay: '0s' }}>
              <i className="fa-brands fa-whatsapp"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer"
              className="hero-social-btn hero-social-btn--facebook"
              style={{ animationDelay: '0.15s' }}>
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://vt.tiktok.com/ZSCvbf3MY/" target="_blank" rel="noopener noreferrer"
              className="hero-social-btn hero-social-btn--tiktok"
              style={{ animationDelay: '0.3s' }}>
              <i className="fa-brands fa-tiktok"></i>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer"
              className="hero-social-btn hero-social-btn--instagram"
              style={{ animationDelay: '0.45s' }}>
              <i className="fa-brands fa-instagram"></i>
            </a>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <div className="hero-image-frame">
            <img src="/hero.jpeg" alt="Laboratorio Tecnológico Dental" />
          </div>
        </div>
      </div>
    </section>
  )
}
