import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import About from '../../src/domains/portfolio/components/About/About'
import { PATHS } from '../../src/app/routes'

/**
 * La sección "¿Por qué Kamila Lab…?" es el bloque comercial para USUARIOS:
 * su CTA principal debe llevar al registro (/register), NO al portal del
 * técnico (regresión del CTA "Acceder al Portal Privado").
 */
const renderAbout = () =>
  render(
    <MemoryRouter>
      <About />
    </MemoryRouter>
  )

describe('About — CTA orientado a usuarios', () => {
  it('el CTA principal lleva a /register con texto de alta', () => {
    renderAbout()
    const cta = screen.getByTestId('about-cta-register')
    expect(cta.getAttribute('href')).toBe(PATHS.REGISTER)
    expect(cta).toHaveTextContent(/crear una cuenta/i)
    expect(screen.queryByText(/acceder al portal privado/i)).toBeNull()
  })

  it('mantiene un acceso secundario discreto al portal técnico', () => {
    renderAbout()
    const secondary = screen.getByText(/portal técnico/i)
    expect(secondary.getAttribute('href')).toBe(PATHS.LOGIN)
  })
})
