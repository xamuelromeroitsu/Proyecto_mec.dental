import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginView from '../../src/domains/auth/LoginView/LoginView'

describe('LoginView', () => {
  const mockOnLoginSuccess = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza formulario con email, password y botón', () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    expect(screen.getByLabelText(/Correo Electrónico Autorizado/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Autenticar Acceso/i })).toBeInTheDocument()
  })

  it('muestra error si email está vacío al submit', () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    // Clear pre-filled values to trigger validation
    fireEvent.change(screen.getByLabelText(/Correo Electrónico Autorizado/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '' } })

    const form = screen.getByTestId('login-form')
    fireEvent.submit(form)

    expect(screen.getByTestId('login-error')).toBeInTheDocument()
    expect(screen.getByTestId('login-error')).toHaveTextContent(/Las credenciales deben ser válidas/i)
    expect(mockOnLoginSuccess).not.toHaveBeenCalled()
  })

  it('muestra error si password tiene menos de 6 caracteres', () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    fireEvent.change(screen.getByLabelText(/Correo Electrónico Autorizado/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '12345' } })

    const form = screen.getByTestId('login-form')
    fireEvent.submit(form)

    expect(screen.getByTestId('login-error')).toBeInTheDocument()
    expect(screen.getByTestId('login-error')).toHaveTextContent(/Las credenciales deben ser válidas/i)
    expect(mockOnLoginSuccess).not.toHaveBeenCalled()
  })

  it('llama onLoginSuccess con authData en credenciales válidas', async () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    fireEvent.change(screen.getByLabelText(/Correo Electrónico Autorizado/i), {
      target: { value: 'doctor@clinica.com' }
    })
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'password123' }
    })

    const form = screen.getByTestId('login-form')
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1)
    })

    const authData = mockOnLoginSuccess.mock.calls[0][0]
    expect(authData.user.email).toBe('demo@clinica.com')
    expect(authData.user.rol).toBe('odontologo')
    expect(authData.token).toBeTruthy()
  })

  it('muestra loading state durante autenticación', async () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    fireEvent.change(screen.getByLabelText(/Correo Electrónico Autorizado/i), {
      target: { value: 'doctor@clinica.com' }
    })
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'password123' }
    })

    const form = screen.getByTestId('login-form')
    fireEvent.submit(form)

    expect(screen.getByRole('button', { name: /Autenticando/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled()
    })
    expect(screen.getByRole('button', { name: /Autenticar Acceso/i })).not.toBeDisabled()
  })

  it('limpia error al escribir en campos', () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    // Clear fields to trigger error first
    fireEvent.change(screen.getByLabelText(/Correo Electrónico Autorizado/i), { target: { value: '' } })
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: '' } })

    const form = screen.getByTestId('login-form')
    fireEvent.submit(form)

    expect(screen.getByTestId('login-error')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/Correo Electrónico Autorizado/i), {
      target: { value: 'doctor@clinica.com' }
    })

    expect(screen.queryByTestId('login-error')).not.toBeInTheDocument()
  })

  it('input email tiene tipo email y required', () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    const emailInput = screen.getByLabelText(/Correo Electrónico Autorizado/i)
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(emailInput).toBeRequired()
  })

  it('input password tiene tipo password y required', () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    const passwordInput = screen.getByLabelText(/Contraseña/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    expect(passwordInput).toBeRequired()
  })

  it('muestra icono de seguridad en footer', () => {
    render(<LoginView onLoginSuccess={mockOnLoginSuccess} />)

    expect(screen.getByText(/Cifrado TLS 1.3 de extremo a extremo/i)).toBeInTheDocument()
  })
})
