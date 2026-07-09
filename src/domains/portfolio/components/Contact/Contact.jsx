import './Contact.css'

export default function Contact() {
  return (
    <section id="contacto" className="contact">
      <div className="container">
        <div className="contact-header">
          <span className="section-label">Contacto</span>
          <h2 className="contact-title">Contáctanos</h2>
          <p className="contact-description">
            Estamos listos para ser tu aliado en mecánica dental. Escríbenos por
            cualquiera de nuestros canales.
          </p>
        </div>

        <div className="contact-links">
          <a href="#" target="_blank" rel="noopener noreferrer"
            className="contact-link contact-link--whatsapp">
            <i className="fa-brands fa-whatsapp"></i>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer"
            className="contact-link contact-link--facebook">
            <i className="fa-brands fa-facebook-f"></i>
          </a>
          <a href="https://vt.tiktok.com/ZSCvbf3MY/" target="_blank" rel="noopener noreferrer"
            className="contact-link contact-link--tiktok">
            <i className="fa-brands fa-tiktok"></i>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer"
            className="contact-link contact-link--instagram">
            <i className="fa-brands fa-instagram"></i>
          </a>
        </div>

        <p className="contact-note">
          Haz clic en cualquier icono para contactarnos directamente
        </p>
      </div>
    </section>
  )
}
