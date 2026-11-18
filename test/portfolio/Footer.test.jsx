import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../../src/domains/portfolio/components/Footer/Footer'

/**
 * Footer modular del portfolio.
 * La página terminaba en Contacto sin cierre de marca; el footer añade
 * identidad, datos del laboratorio, navegación y copyright.
 */
const renderFooter = () =>
  render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>
  )

describe('Footer — módulos', () => {
  it('muestra la marca: nombre y rubro del laboratorio', () => {
    renderFooter()
    expect(screen.getByText('Kamila Dentys')).toBeInTheDocument()
    // El rubro aparece en la marca Y en el copyright (≥1 basta)
    expect(screen.getAllByText(/Laboratorio de Mecánica Dental/i).length).toBeGreaterThanOrEqual(1)
  })

  it('el bloque de datos incluye WhatsApp, correo, ubicación y horario', () => {
    renderFooter()
    for (const label of ['WhatsApp', 'Correo', 'Ubicación', 'Horario']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('las 5 secciones son navegables (botones con las anclas de la landing)', () => {
    renderFooter()
    for (const label of ['Inicio', 'Casos Clínicos', 'Especialidades', 'Nosotros', 'Contacto']) {
      expect(screen.getByRole('button', { name: new RegExp(label) })).toBeInTheDocument()
    }
  })

  it('el scroll de secciones llama scrollIntoView al hacer clic', () => {
    // jsdom NO implementa scrollIntoView → se agrega como mock al prototipo
    const spy = vi.fn()
    Element.prototype.scrollIntoView = spy
    // El footer necesita la sección destino (solo se renderiza el footer aquí)
    render(
      <MemoryRouter>
        <div id="servicios" />
        <Footer />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByRole('button', { name: /Especialidades/ }))
    expect(spy).toHaveBeenCalledTimes(1)
    delete Element.prototype.scrollIntoView
  })

  it('CTA de registro y enlace al portal técnico existen', () => {
    renderFooter()
    expect(screen.getByTestId('footer-cta-register')).toHaveTextContent(/crear una cuenta/i)
    expect(screen.getByText(/portal técnico/i)).toBeInTheDocument()
  })

  it('el copyright muestra el año actual dinámicamente', () => {
    renderFooter()
    expect(screen.getByTestId('footer-copy')).toHaveTextContent(
      `© ${new Date().getFullYear()} Kamila Dentys`
    )
  })

  it('las 4 redes sociales tienen aria-label accesible', () => {
    renderFooter()
    for (const red of ['WhatsApp', 'Facebook', 'TikTok', 'Instagram']) {
      expect(screen.getByLabelText(red)).toBeInTheDocument()
    }
  })
})
