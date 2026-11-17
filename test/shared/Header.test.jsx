import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Header from '../../src/shared/Header/Header'
import { PATHS } from '../../src/app/routes'

/**
 * Smoke tests del header responsivo (capa shared).
 * Tip: los CTAs y el menú móvil se prueban en ambas áreas (landing/dashboard).
 */
function renderHeader(ui, { route = PATHS.HOME } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

describe('Header', () => {
  it('muestra el logo SVG (no el PNG) con aria-label accesible', () => {
    renderHeader(<Header authData={null} onLogout={vi.fn()} />)
    const logo = screen.getByRole('img', { name: /kamila dentys/i })
    expect(logo.tagName).toBe('svg')
    expect(logo.dataset.testid).toBe('logo-mono')
    expect(document.querySelector('img[src="/logo.png"]')).toBeNull()
  })

  it('en landing muestra los dos CTAs: portal técnico y registro', () => {
    renderHeader(<Header authData={null} onLogout={vi.fn()} />)
    const portal = screen.getByRole('link', { name: /portal técnico/i })
    const registro = screen.getByRole('link', { name: /registrarme/i })
    expect(portal.getAttribute('href')).toBe(PATHS.LOGIN)
    expect(registro.getAttribute('href')).toBe(PATHS.REGISTER)
  })

  it('el botón hamburguesa existe con aria-expanded controlado', () => {
    renderHeader(<Header authData={null} onLogout={vi.fn()} />)
    const burger = screen.getByTestId('header-burger')
    expect(burger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByTestId('header-mobile-menu')).toBeNull()
  })

  it('en /registro muestra "Volver al Inicio" y mantiene los CTAs', () => {
    renderHeader(<Header authData={null} onLogout={vi.fn()} />, { route: PATHS.REGISTER })
    expect(screen.getByText(/volver al inicio/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /portal técnico/i })).toBeInTheDocument()
  })

  it('con sesión iniciada muestra usuario y botón salir (sin CTAs de alta)', () => {
    const authData = { user: { name: 'Dra. María Pérez', clinic: 'Clínica Sonrisa', rol: 'odontologo' } }
    renderHeader(<Header authData={authData} onLogout={vi.fn()} />, { route: PATHS.DASHBOARD })

    const userBlock = screen.getByTestId('header-user')
    expect(within(userBlock).getByText('Dra. María Pérez')).toBeInTheDocument()
    expect(within(userBlock).getByText('Clínica Sonrisa')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /registrarme/i })).toBeNull()
  })
})
