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
            desc="Coronas y puentes premium confeccionados en Zirconio, Disilicato de Litio (E-Max) y cerámicas feldespáticas con alta traslucidez."
          />
          <ServiceCard
            icon="fa-face-smile"
            title="Carillas Estéticas"
            desc="Carillas de porcelana feldespática, disilicato de litio, zirconio translúcido o resina compuesta para transformar sonrisas con mínima invasión."
          />
          <ServiceCard
            icon="fa-gem"
            title="Grillz de Autor"
            desc="Fundas estéticas removibles por encerado y colado tradicional: oro (amarillo, blanco o rosa de 10k, 14k y 18k), plata 925, platino o cromo-cobalto chapado. Personalizables con diamantes, moissanitas, circonitas o esmalte dental de colores."
          />
          <ServiceCard
            icon="fa-teeth-open"
            title="Prótesis Totales y Parciales"
            desc="Bases de resina acrílica (PMMA) termopolimerizable con dientes prefabricados de acrílico o porcelana. Parciales en acrílico con ganchos de alambre de acero inoxidable."
          />
          <ServiceCard
            icon="fa-feather"
            title="Prótesis Flexibles (Valplast)"
            desc="Prótesis inyectadas en poliamida o nylon termoplástico biocompatible, de alta elasticidad, ligereza y retención sin ganchos visibles."
          />
          <ServiceCard
            icon="fa-shield-halved"
            title="Férulas y Protectores"
            desc="Férulas de bruxismo en PMMA rígida, protectores bucales deportivos de lámina termoplástica blanda de etileno y férulas de blanqueamiento finas y transparentes."
          />
          <ServiceCard
            icon="fa-laptop-medical"
            title="Flujo Digital Completo"
            desc="Recepción directa de archivos STL de escáner intraoral. Diseño digital (Exocad) e impresión 3D de alta precisión para modelos quirúrgicos."
          />
          <ServiceCard
            icon="fa-bezier-curve"
            title="Ortodoncia y Ortopedia"
            desc="Retenedores Hawley con base de acrílico y arcos de acero inoxidable, placas activas, expansores y alineadores invisibles de lámina termoplástica."
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
