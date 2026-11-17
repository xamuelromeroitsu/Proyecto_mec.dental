import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Odontograma from '../../src/domains/dashboard/Odontograma/Odontograma'

describe('Odontograma', () => {
  const defaultProps = {
    selectedTeeth: [],
    onToggleTooth: vi.fn(),
    onClear: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza 32 botones (16 superiores + 16 inferiores)', () => {
    render(<Odontograma {...defaultProps} />)

    const buttons = screen.getAllByRole('button', { name: /^\d+$/ })
    expect(buttons).toHaveLength(32)
  })

  it('renderiza arcada superior (18-11, 21-28)', () => {
    render(<Odontograma {...defaultProps} />)

    const upperTeeth = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28']
    upperTeeth.forEach(tooth => {
      expect(screen.getByRole('button', { name: tooth })).toBeInTheDocument()
    })
  })

  it('renderiza arcada inferior (48-41, 31-38)', () => {
    render(<Odontograma {...defaultProps} />)

    const lowerTeeth = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38']
    lowerTeeth.forEach(tooth => {
      expect(screen.getByRole('button', { name: tooth })).toBeInTheDocument()
    })
  })

  it('llama onToggleTooth al hacer click en una pieza', () => {
    render(<Odontograma {...defaultProps} />)

    const tooth11 = screen.getByRole('button', { name: '11' })
    fireEvent.click(tooth11)

    expect(defaultProps.onToggleTooth).toHaveBeenCalledWith('11')
  })

  it('llama onClear al hacer click en "Limpiar Todo"', () => {
    render(<Odontograma {...defaultProps} />)

    const clearButton = screen.getByRole('button', { name: /Limpiar Todo/i })
    fireEvent.click(clearButton)

    expect(defaultProps.onClear).toHaveBeenCalled()
  })

  it('aplica clase de seleccionada cuando la pieza está en selectedTeeth', () => {
    render(<Odontograma selectedTeeth={['11', '21']} onToggleTooth={vi.fn()} onClear={vi.fn()} />)

    const tooth11 = screen.getByRole('button', { name: '11' })
    const tooth12 = screen.getByRole('button', { name: '12' })

    expect(tooth11).toHaveClass('odontograma-tooth--selected')
    expect(tooth12).not.toHaveClass('odontograma-tooth--selected')
  })

  it('muestra contador de piezas seleccionadas', () => {
    render(<Odontograma selectedTeeth={['11', '21', '36']} onToggleTooth={vi.fn()} onClear={vi.fn()} />)

    expect(screen.getByText((content) => content.includes('3') && content.includes('piezas') && content.includes('seleccionadas'))).toBeInTheDocument()
  })

  it('muestra mensaje singular cuando hay 1 pieza seleccionada', () => {
    render(<Odontograma selectedTeeth={['11']} onToggleTooth={vi.fn()} onClear={vi.fn()} />)

    expect(screen.getByText((content) => content.includes('1') && content.includes('pieza') && content.includes('seleccionada'))).toBeInTheDocument()
  })

  it('no muestra contador cuando no hay piezas seleccionadas', () => {
    render(<Odontograma {...defaultProps} />)

    expect(screen.queryByText(/piezas? seleccionadas?/i)).not.toBeInTheDocument()
  })

  it('los botones tienen type="button"', () => {
    render(<Odontograma {...defaultProps} />)

    const buttons = screen.getAllByRole('button')
    buttons.forEach(btn => {
      expect(btn).toHaveAttribute('type', 'button')
    })
  })

  it('cada botón contiene icono de diente y número', () => {
    render(<Odontograma {...defaultProps} />)

    const tooth11 = screen.getByRole('button', { name: '11' })
    expect(tooth11).toContainHTML('<span class="odontograma-tooth-number">11</span>')
    expect(tooth11.querySelector('i.fa-tooth')).toBeInTheDocument()
  })
})