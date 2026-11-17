import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import OrderFeed from '../../src/domains/dashboard/OrderFeed/OrderFeed'

const mockOrders = [
  {
    id: 'ORD-9842',
    paciente: 'María José Delgado',
    clinica: 'Clínica Dental Esthetic',
    tipo: 'Prótesis Fija',
    material: 'Zirconio Monolítico',
    color: 'A2 VITA',
    piezas: ['11', '21'],
    estado: 'En Fabricación',
    fecha: '2026-06-20',
  },
  {
    id: 'ORD-9811',
    paciente: 'Carlos Ernesto Gómez',
    clinica: 'Clínica Dental Esthetic',
    tipo: 'Prótesis Removible',
    material: 'Flexible Definitivo',
    color: 'A3 VITA',
    piezas: ['34', '35', '36'],
    estado: 'Recibido',
    fecha: '2026-06-22',
  },
  {
    id: 'ORD-9750',
    paciente: 'Lucía Fernanda Reyes',
    clinica: 'Clínica Dental Esthetic',
    tipo: 'Ortodoncia / Alineadores',
    material: 'Férula Essix (Retenedor)',
    color: 'Transparente',
    piezas: ['Arcada Superior'],
    estado: 'Entregado',
    fecha: '2026-06-15',
  },
]

describe('OrderFeed', () => {
  it('renderiza estado vacío cuando no hay órdenes', () => {
    render(<OrderFeed orders={[]} />)

    expect(screen.getByText(/No hay órdenes que mostrar/i)).toBeInTheDocument()
    expect(screen.getByTestId('feed-empty-icon')).toBeInTheDocument()
  })

  it('renderiza lista de órdenes con datos', () => {
    render(<OrderFeed orders={mockOrders} />)

    expect(screen.getByText('ORD-9842')).toBeInTheDocument()
    expect(screen.getByText('ORD-9811')).toBeInTheDocument()
    expect(screen.getByText('ORD-9750')).toBeInTheDocument()
  })

  it('muestra datos del paciente y clínica', () => {
    render(<OrderFeed orders={mockOrders} />)

    expect(screen.getByText('María José Delgado')).toBeInTheDocument()
    expect(screen.getAllByText('Clínica Dental Esthetic')).toHaveLength(3)
    expect(screen.getByText('Carlos Ernesto Gómez')).toBeInTheDocument()
  })

  it('renderiza badges de estado con clases correctas', () => {
    render(<OrderFeed orders={mockOrders} />)

    const enFabricacionBadge = screen.getByText(/En Fabricación/i)
    const recibidoBadge = screen.getByText(/Recibido/i)
    const entregadoBadge = screen.getByText(/Entregado/i)

    expect(enFabricacionBadge.closest('.feed-status')).toHaveClass('card-status--progress')
    expect(recibidoBadge.closest('.feed-status')).toHaveClass('card-status--received')
    expect(entregadoBadge.closest('.feed-status')).toHaveClass('card-status--completed')
  })

  it('muestra tipo, material y color en cada orden', () => {
    render(<OrderFeed orders={mockOrders} />)

    expect(screen.getByText('Prótesis Fija')).toBeInTheDocument()
    expect(screen.getByText('Zirconio Monolítico')).toBeInTheDocument()
    expect(screen.getByText('A2 VITA')).toBeInTheDocument()
    expect(screen.getByText('Prótesis Removible')).toBeInTheDocument()
    expect(screen.getByText('Flexible Definitivo')).toBeInTheDocument()
    expect(screen.getByText('A3 VITA')).toBeInTheDocument()
    expect(screen.getByText('Ortodoncia / Alineadores')).toBeInTheDocument()
    expect(screen.getByText('Férula Essix (Retenedor)')).toBeInTheDocument()
    expect(screen.getByText('Transparente')).toBeInTheDocument()
  })

  it('renderiza tags de piezas dentales', () => {
    render(<OrderFeed orders={mockOrders} />)

    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('21')).toBeInTheDocument()
    expect(screen.getByText('34')).toBeInTheDocument()
    expect(screen.getByText('35')).toBeInTheDocument()
    expect(screen.getByText('36')).toBeInTheDocument()
    expect(screen.getByText('Arcada Superior')).toBeInTheDocument()
  })

  it('muestra fecha en footer de cada card', () => {
    render(<OrderFeed orders={mockOrders} />)

    expect(screen.getByText('2026-06-20')).toBeInTheDocument()
    expect(screen.getByText('2026-06-22')).toBeInTheDocument()
    expect(screen.getByText('2026-06-15')).toBeInTheDocument()
  })

  it('cada card tiene estructura completa: header, body, footer', () => {
    render(<OrderFeed orders={mockOrders} />)

    const cards = screen.getAllByRole('article')
    expect(cards).toHaveLength(3)

    cards.forEach(card => {
      expect(card.querySelector('.feed-card-header')).toBeInTheDocument()
      expect(card.querySelector('.feed-card-body')).toBeInTheDocument()
      expect(card.querySelector('.feed-card-footer')).toBeInTheDocument()
    })
  })

  it('iconos de estado son correctos', () => {
    render(<OrderFeed orders={mockOrders} />)

    const enFabricacionIcon = screen.getByText(/En Fabricación/i).closest('.feed-status').querySelector('i')
    const recibidoIcon = screen.getByText(/Recibido/i).closest('.feed-status').querySelector('i')
    const entregadoIcon = screen.getByText(/Entregado/i).closest('.feed-status').querySelector('i')

    expect(enFabricacionIcon).toHaveClass('fa-spinner')
    expect(recibidoIcon).toHaveClass('fa-inbox')
    expect(entregadoIcon).toHaveClass('fa-circle-check')
  })
})