import { useState } from 'react'
import './Carousel.css'

export default function Carousel({ images }) {
  const [selectedCase, setSelectedCase] = useState(null)
  const display = images.slice(0, 4)

  if (images.length === 0) {
    return (
      <div className="carousel-empty">
        <div className="carousel-empty-icon">
          <i className="fa-solid fa-images"></i>
        </div>
        <p className="carousel-empty-text">No hay imágenes en la galería clínica en este momento.</p>
      </div>
    )
  }

  return (
    <div className="carousel-wrapper">
      <div className="carousel-stack">
        {display.map((image, i) => (
          <div
            key={image.id}
            className={`carousel-card s${i}`}
            onClick={() => setSelectedCase(image)}
          >
            <img src={image.url} alt={image.title} />
            <div className="carousel-glow"></div>
          </div>
        ))}
      </div>

      {selectedCase && (
        <div className="carousel-lightbox" onClick={() => setSelectedCase(null)}>
          <button
            onClick={() => setSelectedCase(null)}
            className="carousel-lightbox-close"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
          <img
            src={selectedCase.url}
            alt={selectedCase.title}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
