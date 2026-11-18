import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OrderFeed from '../../src/domains/dashboard/OrderFeed/OrderFeed'

/**
 * OrderFeed — clasificación por fecha + paginación explícita.
 * Comportamientos clave:
 *  - agrupa tarjetas bajo encabezados por mes ("Junio 2026")
 *  - botón "Cargar órdenes anteriores" SOLO si hasMore
 *  - estados de carga y feeds vacíos
 */

const orders = [
  { id: 'A', paciente: 'Paciente A', clinica: 'C1', tipo: 'Prótesis Fija', material: 'Zirconio', color: 'A2', piezas: ['11'], estado: 'Recibido', fecha: '2026-11-05' },
  { id: 'B', paciente: 'Paciente B', clinica: 'C1', tipo: 'Grillz', material: 'Oro 14k', color: 'Oro Amarillo', piezas: ['6'], estado: 'En Fabricación', fecha: '2026-11-01' },
  { id: 'C', paciente: 'Paciente C', clinica: 'C2', tipo: 'Prótesis Removible', material: 'Acrílico', color: 'A1', piezas: ['34'], estado: 'Entregado', fecha: '2026-06-20' },
]

describe('OrderFeed — agrupación por mes', () => {
  it('agrupa bajo encabezados "Mes YYYY" con contador por grupo', () => {
    render(<OrderFeed orders={orders} />)
    const headers = screen.getAllByTestId('feed-month')
    expect(headers).toHaveLength(2) // Noviembre 2026 (A,B) + Junio 2026 (C)
    expect(screen.getByText(/Noviembre 2026/)).toBeInTheDocument()
    expect(screen.getByText(/Junio 2026/)).toBeInTheDocument()
  })

  it('el orden de los grupos sigue el orden de llegada (DESC por fecha)', () => {
    render(<OrderFeed orders={orders} />)
    const labels = screen.getAllByTestId('feed-month').map((el) => el.textContent)
    expect(labels[0]).toMatch(/Noviembre/)
    expect(labels[1]).toMatch(/Junio/)
  })

  it('órdenes sin fecha válida caen en "Sin fecha" sin romper', () => {
    const conRara = [...orders, { id: 'X', paciente: 'Sin Fecha', clinica: 'C3', tipo: 'Grillz', material: 'Oro', color: 'Oro', piezas: [], estado: 'Recibido', fecha: null }]
    render(<OrderFeed orders={conRara} />)
    expect(screen.getByText(/Sin fecha/)).toBeInTheDocument()
    expect(screen.getByText('Sin Fecha')).toBeInTheDocument()
  })
})

describe('OrderFeed — botón "Cargar más" (paginación explícita)', () => {
  it('NO muestra el botón cuando hasMore es false', () => {
    render(<OrderFeed orders={orders} hasMore={false} />)
    expect(screen.queryByTestId('load-more-btn')).toBeNull()
  })

  it('SÍ muestra el botón cuando hasMore y llama onLoadMore al click', async () => {
    const onLoadMore = vi.fn()
    render(<OrderFeed orders={orders} hasMore onLoadMore={onLoadMore} />)

    const btn = screen.getByTestId('load-more-btn')
    expect(btn).toHaveTextContent(/cargar órdenes anteriores/i)

    fireEvent.click(btn)
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('durante la carga el botón se deshabilita y muestra "Cargando…"', () => {
    render(<OrderFeed orders={orders} hasMore loading onLoadMore={vi.fn()} />)
    const btn = screen.getByTestId('load-more-btn')
    expect(btn).toBeDisabled()
    expect(btn).toHaveTextContent(/cargando/i)
  })

  it('feed vacío: mensaje y sin botón', () => {
    render(<OrderFeed orders={[]} hasMore={false} />)
    expect(screen.getByText(/no hay órdenes/i)).toBeInTheDocument()
    expect(screen.queryByTestId('load-more-btn')).toBeNull()
  })
})
