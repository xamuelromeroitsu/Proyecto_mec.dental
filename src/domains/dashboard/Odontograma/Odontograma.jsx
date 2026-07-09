import './Odontograma.css'

export default function Odontograma({ selectedTeeth, onToggleTooth, onClear }) {
  const upperArcade = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
  const lowerArcade = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

  const toothButton = (tooth) => (
    <button
      key={tooth}
      type="button"
      onClick={() => onToggleTooth(tooth.toString())}
      className={`odontograma-tooth ${selectedTeeth.includes(tooth.toString()) ? 'odontograma-tooth--selected' : ''}`}
    >
      <span className="odontograma-tooth-number">{tooth}</span>
      <i className="fa-solid fa-tooth odontograma-tooth-icon"></i>
    </button>
  )

  const toothButtonLower = (tooth) => (
    <button
      key={tooth}
      type="button"
      onClick={() => onToggleTooth(tooth.toString())}
      className={`odontograma-tooth ${selectedTeeth.includes(tooth.toString()) ? 'odontograma-tooth--selected' : ''}`}
    >
      <i className="fa-solid fa-tooth odontograma-tooth-icon"></i>
      <span className="odontograma-tooth-number">{tooth}</span>
    </button>
  )

  return (
    <div className="odontograma">
      <div className="odontograma-header">
        <div>
          <span className="odontograma-label">Odontograma Interactivo (FDI)</span>
          <p className="odontograma-hint">
            Seleccione las piezas dentales a confeccionar o rehabilitar.
          </p>
        </div>
        <button type="button" onClick={onClear} className="odontograma-clear">
          <i className="fa-solid fa-trash-can"></i> Limpiar Todo
        </button>
      </div>

      <div className="odontograma-arcades">
        <div className="odontograma-arcade">
          {upperArcade.map(toothButton)}
        </div>
        <div className="odontograma-arcade">
          {lowerArcade.map(toothButtonLower)}
        </div>
      </div>

      <div className="odontograma-info">
        {selectedTeeth.length > 0 && (
          <p className="odontograma-hint">
            <strong>{selectedTeeth.length}</strong> pieza{selectedTeeth.length !== 1 ? 's' : ''} seleccionada{selectedTeeth.length !== 1 ? 's' : ''}:{' '}
            {selectedTeeth.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
