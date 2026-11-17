import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RegisterView from '../../src/domains/auth/register/RegisterView'
import PacienteFlow from '../../src/domains/auth/register/flows/PacienteFlow'
import ClinicaFlow from '../../src/domains/auth/register/flows/ClinicaFlow'

/**
 * Smoke tests de los flujos de registro (capa domains/auth/register).
 * Se mockea el servicio para no depender de Supabase.
 */
vi.mock('../../../src/services/register', async (importOriginal) => ({
  ...(await importOriginal()),
  registerPaciente: vi.fn().mockResolvedValue({ ok: true, partial: false }),
  registerClinica: vi.fn().mockResolvedValue({ ok: true, partial: false }),
  friendlyRegisterError: (e) => String(e),
}))

const withRouter = (ui, { route = '/register' } = {}) =>
  render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)

describe('RegisterView — selector de flujos', () => {
  it('ofrece las 3 opciones mapeadas a los roles de la BD', () => {
    withRouter(<RegisterView />, { route: '/register' })
    expect(screen.getByTestId('register-option-clinica')).toHaveAttribute('href', '/register/clinic')
    expect(screen.getByTestId('register-option-odontologo')).toHaveAttribute('href', '/register/dentist')
    expect(screen.getByTestId('register-option-paciente')).toHaveAttribute('href', '/register/patient')
    expect(screen.getByText(/¿ya tienes cuenta\?/i)).toBeInTheDocument()
  })
})

describe('PacienteFlow — wizard de 3 pasos', () => {
  it('paso 1 valida nombre requerido antes de avanzar', () => {
    withRouter(<PacienteFlow />)
    const step = screen.getByTestId('paciente-datos-step')
    fireEvent.submit(step)
    expect(screen.getByText(/ingresa tu nombre completo/i)).toBeInTheDocument()
    expect(screen.queryByTestId('paciente-cuenta-step')).toBeNull()
  })

  it('avanza al paso 2 con datos válidos', () => {
    withRouter(<PacienteFlow />)
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'María Delgado' } })
    fireEvent.submit(screen.getByTestId('paciente-datos-step'))
    expect(screen.getByTestId('paciente-cuenta-step')).toBeInTheDocument()
  })
})

describe('ClinicaFlow — wizard de 4 pasos con equipo', () => {
  it('paso clínica exige nombre; con datos pasa al paso del dueño', () => {
    withRouter(<ClinicaFlow />)
    fireEvent.submit(screen.getByTestId('clinica-step'))
    expect(screen.getByText(/ingresa el nombre de la clínica/i)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), { target: { value: 'Clínica Sonrisa' } })
    fireEvent.submit(screen.getByTestId('clinica-step'))
    expect(screen.getByTestId('dueno-step')).toBeInTheDocument()
  })

  it('paso doctores: agrega filas dinámicas y valida email incompleto', () => {
    withRouter(<ClinicaFlow />)
    // avanzar: clínica → dueño → doctores
    fireEvent.change(screen.getByLabelText(/nombre de la clínica/i), { target: { value: 'Clínica Sonrisa' } })
    fireEvent.submit(screen.getByTestId('clinica-step'))
    fireEvent.change(screen.getByLabelText(/nombre completo/i), { target: { value: 'Dra. María' } })
    fireEvent.change(screen.getByLabelText(/^correo electrónico( \*)?$/i), { target: { value: 'maria@clinica.com' } })
    fireEvent.change(screen.getByLabelText(/^contraseña( \*)?$/i), { target: { value: 'abc12345' } })
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'abc12345' } })
    fireEvent.submit(screen.getByTestId('dueno-step'))

    const doctoresStep = screen.getByTestId('doctores-step')
    expect(doctoresStep).toBeInTheDocument()

    // agregar segunda fila
    fireEvent.click(screen.getByTestId('add-doctor'))

    // fila 2 a medias → error al avanzar
    const names = screen.getAllByLabelText(/doctor \d — nombre/i)
    fireEvent.change(names[1], { target: { value: 'Dr. Juan' } })
    // email vacío
    fireEvent.submit(doctoresStep)
    expect(screen.getAllByText(/correo del doctor/i).length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText(/^correo( \*)?$/i).length).toBe(2)
  })
})
