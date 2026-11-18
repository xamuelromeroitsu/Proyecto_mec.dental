import ServiceCard from '../ServiceCard/ServiceCard'
import './Services.css'

/**
 * MÓDULOS DE SERVICIO (solo 4, a propósito):
 * el visitante debe entender EN 10 SEGUNDOS qué hace el laboratorio.
 * Cada módulo agrupa varias especialidades reales del catálogo
 * (lib/workTypes) en lenguaje de cliente, no de fabricación.
 */
const MODULOS = [
  {
    icon: 'fa-teeth',
    title: 'Prótesis a la Medida',
    desc: 'Coronas, puentes y prótesis removibles fabricadas una por una para cada paciente, con materiales certificados.',
  },
  {
    icon: 'fa-face-smile',
    title: 'Estética Dental',
    desc: 'Carillas y grillz personalizados que transforman sonrisas con acabados naturales de alta estética.',
  },
  {
    icon: 'fa-shield-halved',
    title: 'Ortodoncia y Protección',
    desc: 'Retenedores, alineadores, férulas de bruxismo y protectores deportivos hechos a la medida.',
  },
  {
    icon: 'fa-laptop-medical',
    title: 'Digital y a Tiempo',
    desc: 'Recibimos los archivos de su escáner, diseñamos con Exocad y entregamos en su consultorio en la fecha acordada.',
  },
]

export default function Services() {
  return (
    <section id="servicios" className="services">
      <div className="container">
        <div className="services-header">
          <span className="section-label">¿Qué hacemos?</span>
          <h2 className="section-title">Soluciones Protésicas Integrales</h2>
          <p className="section-subtitle">
            Cada pieza se fabrica a la medida de su paciente y llega a su
            consultorio en la fecha acordada.
          </p>
        </div>

        <div className="services-grid">
          {MODULOS.map((m) => (
            <ServiceCard key={m.title} icon={m.icon} title={m.title} desc={m.desc} />
          ))}
        </div>
      </div>
    </section>
  )
}
