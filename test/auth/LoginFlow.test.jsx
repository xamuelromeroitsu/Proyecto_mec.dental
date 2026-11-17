import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SessionProvider } from '../../src/app/SessionContext'
import { PATHS } from '../../src/app/routes'
import LoginView from '../../src/domains/auth/LoginView/LoginView'

/**
 * Test de integración del flujo demo (regresión del bug onLoginSuccess):
 * LoginView debe MARCAR la sesión en el contexto y navegar a /dashboard
 * aunque no le pasen props de navegación (como en la ruta <LoginView />).
 *
 * En test no hay .env → modo mock (isSupabaseConfigured=false):
 * servicios reales con MOCK_USER + INITIAL_ORDERS.
 */
function mountApp() {
  return render(
    <SessionProvider>
      <MemoryRouter initialEntries={[PATHS.LOGIN]}>
        <Routes>
          <Route path={PATHS.LOGIN} element={<LoginView />} />
          <Route
            path={PATHS.DASHBOARD}
            element={<div data-testid="dashboard-marker">Dashboard</div>}
          />
        </Routes>
      </MemoryRouter>
    </SessionProvider>
  )
}

describe('LoginView — integración con rutas y sesión', () => {
  it('flujo demo: credenciales prellenadas → navega a /dashboard', async () => {
    const user = userEvent.setup()
    mountApp()

    // Modo demo: campos prellenados (isSupabaseConfigured=false)
    expect(screen.getByDisplayValue('demo@kamiladentys.com')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /autenticar acceso/i }))

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-marker')).toBeInTheDocument()
    })
    // Ya no está el formulario del login
    expect(screen.queryByTestId('login-form')).toBeNull()
  })

  it('con credenciales inválidas NO navega y muestra el error', async () => {
    const user = userEvent.setup()
    mountApp()

    await user.clear(screen.getByLabelText(/correo/i))
    await user.clear(screen.getByLabelText(/contraseña/i))
    await user.type(screen.getByLabelText(/correo/i), 'mal@correo.com')
    await user.type(screen.getByLabelText(/contraseña/i), '123') // < 6 caracteres
    await user.click(screen.getByRole('button', { name: /autenticar acceso/i }))

    expect(screen.getByTestId('login-error')).toBeInTheDocument()
    expect(screen.queryByTestId('dashboard-marker')).toBeNull()
  })
})
