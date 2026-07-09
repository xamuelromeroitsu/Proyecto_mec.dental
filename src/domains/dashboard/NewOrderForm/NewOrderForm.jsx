import { useState, useEffect } from 'react'
import Odontograma from '../Odontograma/Odontograma'
import './NewOrderForm.css'

const VITA_SHADES = ['A1', 'A2', 'A3', 'A3.5', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'D2', 'D3', 'Transparente']

const MATERIAL_OPTIONS = {
  'Prótesis Fija': ['Zirconio Monolítico', 'Zirconio Translúcido', 'Disilicato de Litio (E-Max)', 'Metal-Porcelana', 'Provisional PMMA'],
  'Prótesis Removible': ['Acrílico Termocurable', 'Flexible Definitivo (Nylon)', 'Esquelético (Cromo-Cobalto)', 'Rebase Blando'],
  'Ortodoncia / Alineadores': ['Férula Essix (Retenedor)', 'Placa Hawley de Expansión', 'Placa de Ortodoncia Activa', 'Mantenedor de Espacio'],
}

export default function NewOrderForm({ onAddOrder, onCancel }) {
  const [paciente, setPaciente] = useState('')
  const [tipoTrabajo, setTipoTrabajo] = useState('Prótesis Fija')
  const [material, setMaterial] = useState('Zirconio Monolítico')
  const [color, setColor] = useState('A2 VITA')
  const [selectedTeeth, setSelectedTeeth] = useState([])
  const [attachments, setAttachments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const available = MATERIAL_OPTIONS[tipoTrabajo]
    if (available && !available.includes(material)) {
      setMaterial(available[0])
    }
  }, [tipoTrabajo])

  const toggleTooth = (tooth) => {
    setSelectedTeeth((prev) =>
      prev.includes(tooth) ? prev.filter((t) => t !== tooth) : [...prev, tooth]
    )
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.name.split('.').pop().toUpperCase(),
    }))
    setAttachments([...attachments, ...newAttachments])
  }

  const removeAttachment = (id) => {
    setAttachments(attachments.filter((item) => item.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!paciente) return

    setIsSubmitting(true)
    setTimeout(() => {
      onAddOrder({
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        paciente,
        clinica: 'Clínica Dental Esthetic',
        tipo: tipoTrabajo,
        material,
        color,
        piezas: selectedTeeth.length > 0 ? selectedTeeth : ['Arcada Completa'],
        estado: 'Recibido',
        fecha: new Date().toISOString().split('T')[0],
      })
      setPaciente('')
      setSelectedTeeth([])
      setAttachments([])
      setIsSubmitting(false)
      onCancel()
    }, 1200)
  }

  const getTypeClass = (type) =>
    type === 'STL' || type === 'OBJ' ? 'form-attachment-type--stl' : 'form-attachment-type--default'

  return (
    <form onSubmit={handleSubmit} className="new-order-form">
      <div className="form-header">
        <h3 className="form-header-title">
          <i className="fa-solid fa-notes-medical"></i>
          Registro de Prescripción Digital
        </h3>
        <p className="form-header-desc">
          Llene los datos clínicos de su paciente para iniciar la manufactura en laboratorio.
        </p>
      </div>

      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Nombre Completo del Paciente</label>
          <input
            type="text"
            placeholder="Ej. Juan de Dios Pérez"
            value={paciente}
            onChange={(e) => setPaciente(e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="form-material-grid">
          <div className="form-field">
            <label className="form-label">Tipo de Trabajo</label>
            <select
              value={tipoTrabajo}
              onChange={(e) => setTipoTrabajo(e.target.value)}
              className="form-select"
            >
              <option>Prótesis Fija</option>
              <option>Prótesis Removible</option>
              <option>Ortodoncia / Alineadores</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Material de Confección</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="form-select"
            >
              {MATERIAL_OPTIONS[tipoTrabajo]?.map((m, idx) => (
                <option key={idx}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Color Guía VITA</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="form-select"
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

      <div className="form-upload-grid">
        <div className="form-upload">
          <label className="form-label">Carga de Archivo Clínico / STL Escáner</label>
          <div className="form-upload-zone">
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="form-upload-input"
            />
            <div className="form-upload-content">
              <i className="fa-solid fa-cloud-arrow-up form-upload-icon"></i>
              <p className="form-upload-title">Arrastre archivos aquí o haga clic</p>
              <p className="form-upload-hint">
                Soporta prescripciones médicas en PDF, imágenes JPG y modelos digitales STL / OBJ (Max 50MB)
              </p>
            </div>
          </div>
        </div>

        <div className="form-attachments">
          <span className="form-attachments-label">
            Archivos Adjuntos a la Orden ({attachments.length})
          </span>
          {attachments.length === 0 ? (
            <div className="form-attachments-empty">
              No se han adjuntado archivos. La clínica puede enviar impresiones físicas.
            </div>
          ) : (
            <div className="form-attachments-list">
              {attachments.map((item) => (
                <div key={item.id} className="form-attachment-item">
                  <div className="form-attachment-info">
                    <div className={`form-attachment-type ${getTypeClass(item.type)}`}>
                      {item.type}
                    </div>
                    <div className="form-attachment-details">
                      <p className="form-attachment-name">{item.name}</p>
                      <p className="form-attachment-size">{item.size}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(item.id)}
                    className="form-attachment-remove"
                  >
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Indicaciones Técnicas Adicionales</label>
        <textarea
          placeholder="Escriba aquí instrucciones específicas de oclusión, áreas de alivio, contactos o cualquier detalle clínico particular..."
          rows="3"
          className="form-textarea"
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="form-btn-cancel">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`form-btn-submit ${isSubmitting ? 'form-btn-submit--disabled' : 'form-btn-submit--active'}`}
        >
          {isSubmitting ? (
            <>
              <i className="fa-solid fa-spinner" style={{ animation: 'spin 1s linear infinite' }}></i>
              Registrando Orden...
            </>
          ) : (
            <>
              <i className="fa-solid fa-folder-plus"></i>
              Guardar y Enviar a Laboratorio
            </>
          )}
        </button>
      </div>
    </form>
  )
}
