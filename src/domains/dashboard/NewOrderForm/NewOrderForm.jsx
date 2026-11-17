import { useState, useEffect } from 'react'
import Odontograma from '../Odontograma/Odontograma'
import { WORK_TYPES, getWorkType, colorsFor, defaultColorFor } from '../../../lib/workTypes'
import { createOrder } from '../../../services/orders'
import './NewOrderForm.css'

export default function NewOrderForm({ onAddOrder, onCancel, clinica }) {
  // Defaults del catálogo: Prótesis Fija · Zirconio Monolítico · A2
  const [paciente, setPaciente] = useState('')
  const [tipoTrabajo, setTipoTrabajo] = useState(WORK_TYPES[0].label)
  const [material, setMaterial] = useState(WORK_TYPES[0].materials[0])
  const [color, setColor] = useState(defaultColorFor(WORK_TYPES[0].label))
  const [selectedTeeth, setSelectedTeeth] = useState([])
  const [attachments, setAttachments] = useState([])
  const [files, setFiles] = useState([])
  const [indicaciones, setIndicaciones] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const materialOptions = getWorkType(tipoTrabajo).materials
  const colorOptions = colorsFor(tipoTrabajo)

  // Al cambiar el tipo, material/color se adaptan a las opciones válidas
  // del nuevo tipo (se conservan si siguen siendo válidos).
  useEffect(() => {
    const materials = getWorkType(tipoTrabajo).materials
    setMaterial((prev) => (materials.includes(prev) ? prev : materials[0]))
    setColor((prev) => (colorsFor(tipoTrabajo).includes(prev) ? prev : defaultColorFor(tipoTrabajo)))
  }, [tipoTrabajo])

  const toggleTooth = (tooth) => {
    setSelectedTeeth((prev) =>
      prev.includes(tooth) ? prev.filter((t) => t !== tooth) : [...prev, tooth]
    )
  }

  const handleFileUpload = (e) => {
    const incoming = Array.from(e.target.files)
    const newAttachments = incoming.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.name.split('.').pop().toUpperCase(),
    }))
    setAttachments([...attachments, ...newAttachments])
    setFiles([...files, ...incoming])
  }

  const removeAttachment = (id) => {
    const idx = attachments.findIndex((item) => item.id === id)
    setAttachments(attachments.filter((item) => item.id !== id))
    if (idx >= 0) setFiles(files.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!paciente) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const order = await createOrder(
        {
          paciente,
          tipo_trabajo: tipoTrabajo,
          material,
          color,
          piezas: selectedTeeth,
          indicaciones,
        },
        files,
        clinica
      )
      onAddOrder(order)
      setPaciente('')
      setSelectedTeeth([])
      setAttachments([])
      setFiles([])
      setIndicaciones('')
      onCancel()
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsSubmitting(false)
    }
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
              data-testid="select-tipo"
            >
              {WORK_TYPES.map((t) => (
                <option key={t.key} value={t.label}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">Material de Confección</label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="form-select"
              data-testid="select-material"
            >
              {materialOptions.map((m, idx) => (
                <option key={idx} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-field">
            <label className="form-label">{getWorkType(tipoTrabajo).colorGuide === 'metal' ? 'Metal Guía' : getWorkType(tipoTrabajo).colorGuide === 'na' ? 'Acabado' : 'Color Guía VITA'}</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="form-select"
              data-testid="select-color"
            >
              {colorOptions.map((sh, idx) => (
                <option key={idx} value={sh}>{sh}</option>
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
        {tipoTrabajo === 'Grillz' && (
          <p className="form-hint">
            Especifica aquí las gemas y detalles: diamantes naturales, moissanitas,
            circonitas cúbicas o esmalte dental de colores (indicando pieza y cantidad).
          </p>
        )}
        <textarea
          placeholder="Escriba aquí instrucciones específicas de oclusión, áreas de alivio, contactos o cualquier detalle clínico particular..."
          rows="3"
          className="form-textarea"
          value={indicaciones}
          onChange={(e) => setIndicaciones(e.target.value)}
        />
      </div>

      {submitError && (
        <div className="form-field" role="alert">
          <p className="form-label" style={{ color: '#ef4444' }}>
            <i className="fa-solid fa-circle-exclamation"></i> {submitError}
          </p>
        </div>
      )}

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
