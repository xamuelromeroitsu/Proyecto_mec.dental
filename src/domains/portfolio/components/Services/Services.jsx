import ServiceCard from '../ServiceCard/ServiceCard'
import './Services.css'

export default function Services() {
  return (
    <section id="servicios" className="services">
      <div className="container">
        <div className="services-header">
          <span className="section-label">Nuestros Servicios</span>
          <h2 className="section-title">Soluciones Protésicas Integrales</h2>
          <p className="section-subtitle">
            Trabajo artesanal y digital para cubrir todas las necesidades de su clínica.
          </p>
        </div>

        <div className="services-grid">
          <ServiceCard
            icon="fa-teeth"
            title="Prótesis Fija de Alta Estética"
            desc="Coronas y puentes en zirconio, disilicato y porcelana con alta traslucidez."
          />
          <ServiceCard
            icon="fa-face-smile"
            title="Carillas Estéticas"
            desc="Carillas de porcelana o resina que transforman la sonrisa con mínima invasión."
          />
          <ServiceCard
            icon="fa-gem"
            title="Grillz de Autor"
            desc="Fundas removibles en oro, plata o platino, personalizables con diamantes, circonitas o esmalte de colores."
          />
          <ServiceCard
            icon="fa-teeth-open"
            title="Prótesis Totales y Parciales"
            desc="Prótesis removibles de acrílico; parciales con ganchos de acero inoxidable."
          />
          <ServiceCard
            icon="fa-feather"
            title="Prótesis Flexibles (Valplast)"
            desc="Prótesis de nylon flexible: ligeras, elásticas y sin ganchos visibles."
          />
          <ServiceCard
            icon="fa-shield-halved"
            title="Férulas y Protectores"
            desc="Férulas de bruxismo, protectores deportivos y férulas de blanqueamiento a medida."
          />
          <ServiceCard
            icon="fa-laptop-medical"
            title="Flujo Digital Completo"
            desc="Recibimos los archivos STL de su escáner intraoral y diseñamos en Exocad."
          />
          <ServiceCard
            icon="fa-bezier-curve"
            title="Ortodoncia y Ortopedia"
            desc="Retenedores Hawley, placas activas, expansores y alineadores invisibles."
          />
          <ServiceCard
            icon="fa-screws"
            title="Rehabilitación sobre Implantes"
            desc="Coronas y puentes sobre implantes, con pilares personalizados de titanio o zirconio."
          />
          <ServiceCard
            icon="fa-truck-fast"
            title="Servicio de Logística Express"
            desc="Recogida y entrega directa en su consultorio, con urgencias garantizadas."
          />
        </div>
      </div>
    </section>
  )
}
