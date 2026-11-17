import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import NewOrderForm from '../../src/domains/dashboard/NewOrderForm/NewOrderForm'
import DashboardView from '../../src/domains/dashboard/DashboardView/DashboardView'

/**
 * Catálogo de trabajos integrado al formulario y a los filtros del dashboard.
 * Las órdenes legadas ('Prótesis Removible', 'Ortodoncia / Alineadores')
 * deben seguir filtrando con los chips nuevos.
 */

describe('NewOrderForm — selects del catálogo', () => {
  const renderForm = () =>
    render(<NewOrderForm onAddOrder={vi.fn()} onCancel={vi.fn()} clinica={null} />)

  /** Los selects: [0]=tipo, [1]=material, [2]=color — sin ids accesibles viejos. */
  const selects = (container) => container.querySelectorAll('select')

  it('el select de tipo ofrece los 11 tipos del catálogo (incluye Grillz)', () => {
    const { container } = renderForm()
    const labels = [...selects(container)[0].options].map((o) => o.value)
    expect(labels).toContain('Grillz')
    expect(labels).toContain('Carillas')
    expect(labels).toContain('Férula de Blanqueamiento')
    expect(labels).toContain('Protector Bucal Deportivo')
    expect(labels.length).toBeGreaterThanOrEqual(11)
  })

  it('al elegir Grillz el material pasa a metales y el color a Metal Guía', () => {
    const { container, getByText, getByTestId } = renderForm()
    fireEvent.change(selects(container)[0], { target: { value: 'Grillz' } })

    const materialSel = selects(container)[1]
    expect(within(materialSel).getByText('Oro Amarillo 14k')).toBeInTheDocument()
    expect(within(materialSel).getByText('Plata Esterlina 925')).toBeInTheDocument()
    // color por defecto del tipo metal
    expect(selects(container)[2]).toHaveDisplayValue('Oro Amarillo')
    // el hint de gemas aparece en indicaciones
    expect(getByText(/diamantes naturales, moissanitas/i)).toBeInTheDocument()
  })

  it('al elegir Férula de Bruxismo el acabado es Transparente y material PMMA rígida', () => {
    const { container, getByTestId } = renderForm()
    fireEvent.change(selects(container)[0], { target: { value: 'Férula de Bruxismo' } })

    expect(within(selects(container)[1]).getByText('PMMA Rígida')).toBeInTheDocument()
    expect(getByTestId('select-color')).toHaveDisplayValue('Transparente')
  })

  it('volver a Prótesis Fija restaura materiales zirconio y color VITA', () => {
    const { container } = renderForm()
    fireEvent.change(selects(container)[0], { target: { value: 'Grillz' } })
    fireEvent.change(selects(container)[0], { target: { value: 'Prótesis Fija' } })

    expect(within(selects(container)[1]).getByText('Zirconio Monolítico')).toBeInTheDocument()
    expect(selects(container)[2]).toHaveDisplayValue('A2')
  })
})

describe('DashboardView — filtros por grupo del catálogo', () => {
  const orders = [
    { id: 'A', paciente: 'Paciente Fija', clinica: 'C1', tipo: 'Prótesis Fija', material: 'Zirconio', color: 'A2', piezas: ['11'], estado: 'Recibido', fecha: '2026-01-01' },
    { id: 'B', paciente: 'Paciente Grillz', clinica: 'C1', tipo: 'Grillz', material: 'Oro Amarillo 14k', color: 'Oro Amarillo', piezas: ['6'], estado: 'Recibido', fecha: '2026-01-02' },
    { id: 'C', paciente: 'Paciente Legada', clinica: 'C1', tipo: 'Prótesis Removible', material: 'Acrílico', color: 'A1', piezas: ['34'], estado: 'Recibido', fecha: '2026-01-03' },
  ]

  const renderDash = () =>
    render(
      <DashboardView orders={orders} onAddOrder={vi.fn()} authData={{ user: { name: 'Kamila', rol: 'tecnico' } }} />
    )

  it('menos de 4 chips: ahora hay 7 (fija, carillas, removible, grillz, ortodoncia, férulas)', () => {
    renderDash()
    for (const label of ['Todos', 'Fija', 'Carillas', 'Removible', 'Grillz', 'Ortodoncia', 'Férulas']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('el chip Grillz aísla las órdenes de grillz', () => {
    renderDash()
    fireEvent.click(screen.getByRole('button', { name: 'Grillz' }))
    expect(screen.getByText('Paciente Grillz')).toBeInTheDocument()
    expect(screen.queryByText('Paciente Fija')).toBeNull()
  })

  it('el chip Removible incluye órdenes LEGADAS de Prótesis Removible', () => {
    renderDash()
    fireEvent.click(screen.getByRole('button', { name: 'Removible' }))
    expect(screen.getByText('Paciente Legada')).toBeInTheDocument()
    expect(screen.queryByText('Paciente Grillz')).toBeNull()
  })

  it('el chip Todos muestra el feed completo', () => {
    renderDash()
    fireEvent.click(screen.getByRole('button', { name: 'Férulas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(screen.getByText('Paciente Fija')).toBeInTheDocument()
    expect(screen.getByText('Paciente Grillz')).toBeInTheDocument()
  })
})
