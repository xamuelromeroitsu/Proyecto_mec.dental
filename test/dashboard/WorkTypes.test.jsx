import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react'
import NewOrderForm from '../../src/domains/dashboard/NewOrderForm/NewOrderForm'
import DashboardView from '../../src/domains/dashboard/DashboardView/DashboardView'
import { SessionProvider } from '../../src/app/SessionContext'

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
  // DashboardView consume el feed desde SessionContext (máquina paginada):
  // sin .env, fetchOrders sirve INITIAL_ORDERS en páginas (mismo contrato).
  const renderDash = () =>
    render(
      <SessionProvider>
        <DashboardView onAddOrder={vi.fn()} authData={{ user: { name: 'Kamila', rol: 'tecnico' } }} />
      </SessionProvider>
    )

  it('los 7 chips existen (fija, carillas, removible, grillz, ortodoncia, férulas)', () => {
    renderDash()
    for (const label of ['Todos', 'Fija', 'Carillas', 'Removible', 'Grillz', 'Ortodoncia', 'Férulas']) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('el chip Grillz aísla las órdenes de grillz (filtro server-side simulado)', async () => {
    renderDash()
    fireEvent.click(screen.getByRole('button', { name: 'Grillz' }))
    await waitFor(() => {
      // INITIAL_ORDERS no tiene grillz → feed vacío, no queda una orden fija
      expect(screen.getByText(/no hay órdenes/i)).toBeInTheDocument()
    })
  })

  it('el chip Removible incluye órdenes LEGADAS de Prótesis Removible', async () => {
    renderDash()
    fireEvent.click(screen.getByRole('button', { name: 'Removible' }))
    await waitFor(() => {
      // Las 3 órdenes demo son 'Prótesis Removible' legacy → visibles
      expect(screen.getAllByText(/Carlos Ernesto Gómez|Lucía Fernanda Reyes/).length).toBeGreaterThan(0)
    })
    // La orden de Prótesis Fija NO pertenece al grupo removible
    expect(screen.queryByText('María José Delgado')).toBeNull()
  })

  it('el chip Todos muestra la primera página del feed', async () => {
    renderDash()
    // En demo la carga inicial depende del login (getCurrentSession → null
    // sin .env); el clic en el chip dispara loadPage directamente.
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    await waitFor(() => {
      expect(screen.getByText('María José Delgado')).toBeInTheDocument()
    })
    // Encabezado por mes del feed agrupado
    expect(screen.getByText(/Junio 2026/)).toBeInTheDocument()
  })
})
