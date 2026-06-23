import { useState, useEffect } from 'react'
import Odontograma from './Odontograma'

const VITA_SHADES = ['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'D2', 'D3', 'Transparente']

const MATERIAL_OPTIONS = {
  'Prótesis Fija': ['Zirconio Monolítico', 'Zirconio Translúcido', 'Disilicato de Litio (E-Max)', 'Metal-Porcelana', 'Provisional PMMA'],
  'Prótesis Removible': ['Acrílico Termocurable', 'Flexible Definitivo (Nylon)', 'Esquelético (Cromo-Cobalto)', 'Rebase Blando'],
  'Ortodoncia / Alineadores': ['Férula Essix (Retenedor)', 'Placa Hawley de Expansión', 'Placa de Ortodoncia Activa', 'Mantenedor de Espacio']
}

function OrderList({ orders }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <span className="font-bold text-slate-900 text-base">Trabajos Registrados</span>
        <span className="bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1 rounded-full">{orders.length} Órdenes Activas</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase bg-slate-50/30">
              <th className="px-6 py-4">Código</th>
              <th className="px-6 py-4">Paciente</th>
              <th className="px-6 py-4">Tipo de Prótesis</th>
              <th className="px-6 py-4">Material / Guía VITA</th>
              <th className="px-6 py-4">Dientes</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {orders.map((ord) => (
              <tr key={ord.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-sky-600">{ord.id}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-950">{ord.paciente}</p>
                  <p className="text-xs text-slate-400">{ord.clinica}</p>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">{ord.tipo}</td>
                <td className="px-6 py-4">
                  <p className="text-slate-800">{ord.material}</p>
                  <p className="text-xs text-slate-400 font-semibold">{ord.color}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap">
                    {ord.piezas.map((tooth, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-mono font-bold">
                        {tooth}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    ord.estado === 'Completado' ? 'bg-green-100 text-green-700' :
                    ord.estado === 'En Proceso' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                    'bg-sky-100 text-sky-700'
                  }`}>
                    <i className={`fa-solid ${
                      ord.estado === 'Completado' ? 'fa-circle-check' :
                      ord.estado === 'En Proceso' ? 'fa-spinner' :
                      'fa-inbox'
                    }`}></i>
                    {ord.estado}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400 font-mono text-xs">{ord.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function NewOrderForm({ onAddOrder, onCancel }) {
  const [paciente, setPaciente] = useState('')
  const [tipoTrabajo, setTipoTrabajo] = useState('Prótesis Fija')
  const [material, setMaterial] = useState('Zirconio Monolítico')
  const [color, setColor] = useState('A2 VITA')
  const [selectedTeeth, setSelectedTeeth] = useState([])
  const [attachments, setAttachments] = useState([])
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const available = MATERIAL_OPTIONS[tipoTrabajo]
    if (available && !available.includes(material)) {
      setMaterial(available[0])
    }
  }, [tipoTrabajo])

  const toggleTooth = (tooth) => {
    setSelectedTeeth(prev =>
      prev.includes(tooth) ? prev.filter(t => t !== tooth) : [...prev, tooth]
    )
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: file.name.split('.').pop().toUpperCase()
    }))
    setAttachments([...attachments, ...newAttachments])
  }

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(item => item.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!paciente) return

    setIsSubmitting(true)
    setTimeout(() => {
      onAddOrder({
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        paciente,
        clinica: "Clínica Dental Esthetic",
        tipo: tipoTrabajo,
        material,
        color,
        piezas: selectedTeeth.length > 0 ? selectedTeeth : ["Arcada Completa"],
        estado: "Recibido",
        fecha: new Date().toISOString().split('T')[0]
      })

      setPaciente('')
      setSelectedTeeth([])
      setAttachments([])
      setNotes('')
      setIsSubmitting(false)
      onCancel()
    }, 1200)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
          <i className="fa-solid fa-notes-medical text-sky-500"></i> Registro de Prescripción Digital
        </h3>
        <p className="text-xs text-slate-400 mt-1">Llene los datos clínicos de su paciente para iniciar la manufactura en laboratorio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700 uppercase">Nombre Completo del Paciente</label>
          <input
            type="text"
            placeholder="Ej. Juan de Dios Pérez"
            value={paciente}
            onChange={(e) => setPaciente(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-slate-50/30"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">Tipo de Trabajo</label>
            <select
              value={tipoTrabajo}
              onChange={(e) => setTipoTrabajo(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option>Prótesis Fija</option>
              <option>Prótesis Removible</option>
              <option>Ortodoncia / Alineadores</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">Material de Confección</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {MATERIAL_OPTIONS[tipoTrabajo]?.map((m, idx) => (
                <option key={idx}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase">Color Guía VITA</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {VITA_SHADES.map((sh, idx) => (
                <option key={idx} value={`${sh} VITA`}>{sh}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Odontograma
        selectedTeeth={selectedTeeth}
        onToggleTooth={toggleTooth}
        onClear={() => setSelectedTeeth([])}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase">Carga de Archivo Clínico / STL Escáner</label>
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2 pointer-events-none">
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-sky-400"></i>
              <p className="text-sm font-bold text-slate-700">Arrastre archivos aquí o haga clic</p>
              <p className="text-xs text-slate-400">Soporta prescripciones médicas en PDF, imágenes JPG y modelos digitales STL / OBJ (Max 50MB)</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase">Archivos Adjuntos a la Orden ({attachments.length})</label>
          {attachments.length === 0 ? (
            <div className="border border-slate-100 rounded-2xl p-6 text-center text-slate-400 text-xs italic bg-slate-50/50 h-28 flex items-center justify-center">
              No se han adjuntado archivos. La clínica puede enviar impresiones físicas.
            </div>
          ) : (
            <div className="space-y-2 max-h-[145px] overflow-y-auto">
              {attachments.map((item) => (
                <div key={item.id} className="border border-slate-100 rounded-xl px-4 py-2.5 flex items-center justify-between bg-white shadow-sm text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[9px] ${
                      item.type === 'STL' || item.type === 'OBJ' ? 'bg-sky-50 text-sky-600 border border-sky-100' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {item.type}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(item.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-colors"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 uppercase">Indicaciones Técnicas Adicionales</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Escriba aquí instrucciones específicas de oclusión, áreas de alivio, contactos o cualquier detalle clínico particular..."
          rows="3"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none bg-slate-50/30"
        />
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100 gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${isSubmitting ? 'bg-sky-400 cursor-not-allowed shadow-none' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-100'}`}
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner animate-spin"></i> Registrando Orden...
            </>
          ) : (
            <>
              <i className="fa-solid fa-folder-plus"></i> Guardar y Enviar a Laboratorio
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default function DashboardView({ orders, onAddOrder }) {
  const [view, setView] = useState('list')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Área Privada de Clínicas</h2>
          <p className="text-sm text-slate-500">Gestione solicitudes de trabajo, envíe archivos STL digitales y rastree el estado en tiempo real.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView('list')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${view === 'list' ? 'bg-sky-500 text-white shadow-md shadow-sky-100' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-clipboard-list"></i> Historial de Órdenes
          </button>
          <button
            onClick={() => setView('new-order')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${view === 'new-order' ? 'bg-sky-500 text-white shadow-md shadow-sky-100' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
          >
            <i className="fa-solid fa-file-invoice text-sm"></i> Nueva Orden
          </button>
        </div>
      </div>

      {view === 'list' && <OrderList orders={orders} />}
      {view === 'new-order' && (
        <NewOrderForm
          onAddOrder={onAddOrder}
          onCancel={() => setView('list')}
        />
      )}
    </div>
  )
}
