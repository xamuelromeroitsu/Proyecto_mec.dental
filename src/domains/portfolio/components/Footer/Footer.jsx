import { Link } from 'react-router-dom'
import Logo from '../../../../shared/Logo/Logo'
import { PATHS } from '../../../../app/routes'
import './Footer.css'

/**
 * =========================================================================
 * FOOTER MODULAR del portfolio (capa domains/portfolio)
 * =========================================================================
 *
 * QUÉ HACE: cierra la landing con identidad profesional — logo, datos de
 * contacto del laboratorio, navegación por secciones y CTAs de alta.
 *
 * POR QUÉ ASÍ: la página terminaba abruptamente en Contacto; en móvil el
 * usuario llega al final deslizando y un footer con sello de marca +
 * datos legibles transmite seriedad ("laboratorio real, no página vacía").
 *
 * ESTRUCTURA MODULAR (cada bloque es un subcomponente independiente):
 *   <FooterBrand />     → logo + identidad + redes sociales
 *   <FooterContact />   → DATOS del laboratorio (WhatsApp, correo, ubica., horario)
 *   <FooterNav />       → navegación rápida (mismos anclas que el Header)
 *   <FooterCTA />       → alta de usuarios + acceso del técnico
 *   barra legal         → © copyright con año dinámico
 *
 * ⚠️ DATOS: los valores de contacto son PLACEHOLDERS evidentes — editar
 * el objeto FOOTER_DATOS con los reales del laboratorio (teléfono,
 * correo, ciudad). Nada más del componente necesita tocar.
 */

const FOOTER_DATOS = {
  nombre: 'Kamila Dentys',
  rubro: 'Laboratorio de Mecánica Dental',
  tagline:
    'Prótesis a la medida con precisión digital y acabado artesanal. Aliados de clínicas y odontólogos desde el diseño hasta la entrega.',
  contacto: [
    { icon: 'fa-brands fa-whatsapp', label: 'WhatsApp', value: '+58 XXX XXXXXXX', href: '#' },
    { icon: 'fa-solid fa-envelope', label: 'Correo', value: 'info@kamiladentys.com', href: 'mailto:info@kamiladentys.com' },
    { icon: 'fa-solid fa-location-dot', label: 'Ubicación', value: 'Venezuela — Envíos nacionales' },
    { icon: 'fa-solid fa-clock', label: 'Horario', value: 'Lun–Vie · 8:00 am – 5:00 pm' },
  ],
  sociales: [
    { icon: 'fa-whatsapp', href: '#', label: 'WhatsApp' },
    { icon: 'fa-facebook-f', href: '#', label: 'Facebook' },
    { icon: 'fa-tiktok', href: 'https://vt.tiktok.com/ZSCvbf3MY/', label: 'TikTok' },
    { icon: 'fa-instagram', href: '#', label: 'Instagram' },
  ],
  secciones: [
    { id: 'inicio', label: 'Inicio' },
    { id: 'casos', label: 'Casos Clínicos' },
    { id: 'servicios', label: 'Especialidades' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'contacto', label: 'Contacto' },
  ],
}

/** Desplaza a la sección por id (con HashRouter el ancla nativa no aplica). */
function scrollToSection(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* --- Módulo 1: marca ---------------------------------------------------- */
function FooterBrand() {
  return (
    <div className="footer-brand footer-mod">
      {/* Logo mono (dorado) — la variante 'full' lleva texto navy y sería
          invisible sobre el fondo navy del footer */}
      <Logo variant="mono" className="footer-logo" title={FOOTER_DATOS.nombre} />
      <div className="footer-brand-name">
        <p className="footer-brand-title">{FOOTER_DATOS.nombre}</p>
        <p className="footer-brand-sub">{FOOTER_DATOS.rubro}</p>
      </div>
      <p className="footer-tagline">{FOOTER_DATOS.tagline}</p>
      <div className="footer-social">
        {FOOTER_DATOS.sociales.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
            className="footer-social-btn" aria-label={s.label}>
            <i className={`fa-brands ${s.icon}`} aria-hidden="true"></i>
          </a>
        ))}
      </div>
    </div>
  )
}

/* --- Módulo 2: datos del laboratorio ------------------------------------ */
function FooterContact() {
  return (
    <div className="footer-contact footer-mod">
      <h4 className="footer-heading">El Laboratorio</h4>
      <ul className="footer-list footer-contact-list">
        {FOOTER_DATOS.contacto.map((item) => {
          const content = (
            <>
              <i className={`${item.icon} footer-contact-icon`} aria-hidden="true"></i>
              <span className="footer-contact-text">
                <span className="footer-contact-label">{item.label}</span>
                <span className="footer-contact-value">{item.value}</span>
              </span>
            </>
          )
          // Los items con enlace son <a>; los informativos (horario) solo texto
          return (
            <li key={item.label}>
              {item.href ? (
                <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel="noopener noreferrer" className="footer-contact-item footer-contact-item--link">
                  {content}
                </a>
              ) : (
                <div className="footer-contact-item">{content}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* --- Módulo 3: navegación por secciones --------------------------------- */
function FooterNav() {
  return (
    <nav className="footer-nav footer-mod" aria-label="Enlaces del sitio">
      <h4 className="footer-heading">Secciones</h4>
      <ul className="footer-list">
        {FOOTER_DATOS.secciones.map((s) => (
          <li key={s.id}>
            <button onClick={() => scrollToSection(s.id)} className="footer-link">
              <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
              {s.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* --- Módulo 4: CTAs finales ---------------------------------------------- */
function FooterCTA() {
  return (
    <div className="footer-cta footer-mod">
      <h4 className="footer-heading">Empieza hoy</h4>
      <p className="footer-cta-text">
        Registra tu clínica o consulta el estado de tus trabajos.
      </p>
      <Link to={PATHS.REGISTER} className="footer-cta-btn" data-testid="footer-cta-register">
        <i className="fa-solid fa-user-plus" aria-hidden="true"></i>
        Crear una cuenta
      </Link>
      <Link to={PATHS.LOGIN} className="footer-cta-secondary">
        ¿Del laboratorio? Portal técnico
      </Link>
    </div>
  )
}

/* --- Footer completo ------------------------------------------------------ */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <FooterBrand />
          <FooterContact />
          <FooterNav />
          <FooterCTA />
        </div>
      </div>

      {/* Barra legal: año dinámico — nunca se desactualiza */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p data-testid="footer-copy">
            © {new Date().getFullYear()} {FOOTER_DATOS.nombre} — {FOOTER_DATOS.rubro}
          </p>
          <p className="footer-bottom-note">Hecho con precisión para profesionales</p>
        </div>
      </div>
    </footer>
  )
}
