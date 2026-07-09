import Carousel from '../../../../shared/Carousel/Carousel'
import './Gallery.css'

export default function Gallery({ images }) {
  return (
    <section id="casos" className="gallery">
      <div className="container">
        <div className="gallery-header">
          <div className="gallery-header-text">
            <span className="section-label">Casos de Éxito Reales</span>
            <h2 className="gallery-title">Galería de Trabajos Enviados</h2>
            <p className="gallery-subtitle">
              La precisión oclusal y la alta estética se unen en boca de los pacientes.
            </p>
          </div>
        </div>
        <Carousel images={images} />
      </div>
    </section>
  )
}
