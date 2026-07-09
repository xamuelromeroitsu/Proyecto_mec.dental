import ServiceCard from '../ServiceCard/ServiceCard'
import './Services.css'

export default function Services() {
  return (
    <section id="servicios" className="services">
      <div className="container">
        <div className="services-header">
          <span className="section-label">Especialidades de Manufactura</span>
          <h2 className="section-title">Soluciones Protésicas Integrales</h2>
          <p className="section-subtitle">
            Combinamos destreza artesanal y automatización digital de punta para
            satisfacer las necesidades de su clínica.
          </p>
        </div>

        <div className="services-grid">
          <ServiceCard
            icon="fa-teeth"
            title="Prótesis Fija de Alta Estética"
            desc="Coronas, puentes y carillas premium confeccionadas en Zirconio, Disilicato de Litio (E-Max) y cerámicas feldespáticas con alta traslucidez."
          />
          <ServiceCard
            icon="fa-teeth-open"
            title="Prótesis Removible y Flexibles"
            desc="Estructuras de acrílico termocurado tradicionales, parciales metálicos (cromo-cobalto) y prótesis flexibles de nylon biocompatible de alta elasticidad."
          />
          <ServiceCard
            icon="fa-laptop-medical"
            title="Flujo Digital Completo CAD/CAM"
            desc="Recepción directa de archivos STL de escáner intraoral. Diseño digital (Exocad) e impresión 3D de alta precisión para modelos quirúrgicos."
          />
          <ServiceCard
            icon="fa-bezier-curve"
            title="Aparatología de Ortodoncia"
            desc="Placas de Hawley, expansores palatinos rápidos, mantenedores de espacio y férulas termoconformadas Essix de alta durabilidad."
          />
          <ServiceCard
            icon="fa-screws"
            title="Rehabilitación sobre Implantes"
            desc="Sistemas atornillados directos a implante, pilares personalizados de titanio/zirconio y barras híbridas fresadas con precisión micrométrica."
          />
          <ServiceCard
            icon="fa-truck-fast"
            title="Servicio de Logística Express"
            desc="Recogida y entrega de impresiones físicas directamente en su consultorio con tiempos de entrega de urgencia garantizados."
          />
        </div>
      </div>
    </section>
  )
}
