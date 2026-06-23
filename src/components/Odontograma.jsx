export default function Odontograma({ selectedTeeth, onToggleTooth, onClear }) {
  const upperArcade = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28]
  const lowerArcade = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38]

  return (
    <div className="space-y-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase">Odontograma Interactivo (FDI)</label>
          <p className="text-xs text-slate-400 mt-1">Seleccione las piezas dentales a confeccionar o rehabilitar.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
        >
          <i className="fa-solid fa-trash-can"></i> Limpiar Todo
        </button>
      </div>

      <div className="space-y-4 pt-4 overflow-x-auto">
        <div className="flex justify-center gap-1.5 md:gap-3 min-w-[500px]">
          {upperArcade.map((tooth) => (
            <button
              key={tooth}
              type="button"
              onClick={() => onToggleTooth(tooth.toString())}
              className={`w-9 h-11 rounded-lg border font-mono font-bold text-xs flex flex-col items-center justify-between py-1.5 transition-all ${
                selectedTeeth.includes(tooth.toString())
                  ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-100 scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
              }`}
            >
              <span className="text-[9px]">{tooth}</span>
              <i className="fa-solid fa-tooth text-[10px]"></i>
            </button>
          ))}
        </div>
        <div className="flex justify-center gap-1.5 md:gap-3 min-w-[500px]">
          {lowerArcade.map((tooth) => (
            <button
              key={tooth}
              type="button"
              onClick={() => onToggleTooth(tooth.toString())}
              className={`w-9 h-11 rounded-lg border font-mono font-bold text-xs flex flex-col items-center justify-between py-1.5 transition-all ${
                selectedTeeth.includes(tooth.toString())
                  ? 'bg-sky-500 text-white border-sky-600 shadow-md shadow-sky-100 scale-105'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300'
              }`}
            >
              <i className="fa-solid fa-tooth text-[10px]"></i>
              <span className="text-[9px]">{tooth}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 text-xs flex items-center gap-2">
        <span className="font-bold text-slate-500">Piezas Seleccionadas:</span>
        {selectedTeeth.length === 0 ? (
          <span className="text-slate-400 italic">Ninguna seleccionada (Se considerará Arcada Completa)</span>
        ) : (
          <div className="flex gap-1.5 flex-wrap">
            {selectedTeeth.map((tooth) => (
              <span key={tooth} className="bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                Pieza {tooth}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
