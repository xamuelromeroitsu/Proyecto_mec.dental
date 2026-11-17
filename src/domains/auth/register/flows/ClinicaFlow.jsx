import { useRef, useState } from 'react'
import { Stepper, TextField, PasswordField, Button } from '../../../../shared/ui'
import { useForm } from '../../../../shared/hooks/useForm'
import { clinicaStepSchema, cuentaStepSchema, validateDoctor, isDoctorEmpty } from '../schemas'
import { registerClinica, friendlyRegisterError } from '../../../../services/register'
import RegisterSuccess from '../RegisterSuccess'
import '../register.css'

const STEPS = [
  { title: 'Clínica' },
  { title: 'Tu cuenta' },
  { title: 'Doctores' },
  { title: 'Revisión' },
]

/* Pie del wizard: Atrás … Siguiente/Enviar */
function WizardFooter({ onBack, nextLabel = 'Siguiente', nextLoading = false, nextIcon }) {
  return (
    <div className="wizard-footer">
      {onBack ? (
        <Button variant="outline" onClick={onBack} icon="fa-solid fa-arrow-left">
          Atrás
        </Button>
      ) : <span />}

      <Button type="submit" variant="accent" loading={nextLoading} icon={nextIcon}>
        {nextLabel}
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Paso 1 — Datos de la clínica (tabla: clinicas)                       */
/* ------------------------------------------------------------------ */
function ClinicaStep({ initial, onNext }) {
  const { values, errors, touched, setField, blur, handleSubmit } = useForm({
    initialValues: { ...initial },
    validators: clinicaStepSchema,
    onSubmit: onNext,
  })

  const bind = (field) => ({
    value: values[field] ?? '',
    onChange: (e) => setField(field, e.target.value),
    onBlur: () => blur(field),
    error: touched[field] ? errors[field] : '',
  })

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="clinica-step">
      <h2 className="register-title">Datos de tu clínica</h2>
      <p className="register-subtitle">
        Así aparecerá tu consultorio al enviar trabajos al laboratorio.
      </p>

      <div className="form-grid">
        <TextField label="Nombre de la clínica" name="nombre" icon="fa-solid fa-hospital"
          autoComplete="organization" required placeholder="Clínica Dental Sonrisa" {...bind('nombre')} />
        <TextField label="RIF" name="rif" hint="Formato: J-12345678-9 (opcional)" icon="fa-solid fa-building-flag"
          placeholder="J-12345678-9" {...bind('rif')} />
        <TextField label="Teléfono" name="telefono" type="tel" icon="fa-solid fa-phone"
          autoComplete="tel" inputMode="tel" placeholder="+58-212-5550000" {...bind('telefono')} />
        <TextField label="Correo de contacto" name="email_contacto" type="email" icon="fa-solid fa-envelope"
          autoComplete="email" placeholder="contacto@clinica.com" {...bind('email_contacto')} />
        <div className="form-grid__span-2">
          <TextField label="Dirección" name="direccion" icon="fa-solid fa-location-dot"
            autoComplete="street-address" placeholder="Av. Principal, Caracas" {...bind('direccion')} />
        </div>
      </div>

      <WizardFooter />
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Paso 2 — Cuenta del dueño (tabla: usuarios, rol odontologo)          */
/* ------------------------------------------------------------------ */
function DuenoStep({ initial, onNext, onBack }) {
  const { values, errors, touched, setField, blur, handleSubmit } = useForm({
    initialValues: { ...initial },
    validators: cuentaStepSchema,
    onSubmit: onNext,
  })

  const bind = (field) => ({
    value: values[field] ?? '',
    onChange: (e) => setField(field, e.target.value),
    onBlur: () => blur(field),
    error: touched[field] ? errors[field] : '',
  })

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="dueno-step">
      <h2 className="register-title">Tu cuenta (dueño)</h2>
      <p className="register-subtitle">
        Con este correo entrarás al portal para enviar y seguir los trabajos.
      </p>

      <div className="form-grid">
        <TextField label="Nombre completo" name="nombre" icon="fa-solid fa-user-doctor"
          autoComplete="name" required placeholder="Dra. María Pérez" {...bind('nombre')} />
        <TextField label="Correo electrónico" name="email" type="email" icon="fa-solid fa-envelope"
          autoComplete="email" required placeholder="maria@clinica.com" {...bind('email')} />
        <div className="form-grid__span-2">
          <TextField label="Teléfono" name="telefono" type="tel" icon="fa-solid fa-phone"
            autoComplete="tel" inputMode="tel" placeholder="+58-412-1234567" {...bind('telefono')} />
        </div>
        <PasswordField label="Contraseña" name="password" autoComplete="new-password" required
          value={values.password ?? ''} onChange={(e) => setField('password', e.target.value)}
          onBlur={() => blur('password')} error={touched.password ? errors.password : ''} />
        <PasswordField label="Confirmar contraseña" name="confirmar" autoComplete="new-password" required
          showStrength={false}
          value={values.confirmar ?? ''} onChange={(e) => setField('confirmar', e.target.value)}
          onBlur={() => blur('confirmar')} error={touched.confirmar ? errors.confirmar : ''} />
      </div>

      <WizardFooter onBack={onBack} />
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Paso 3 — Doctores invitados (tabla: miembros_clinica)                */
/* ------------------------------------------------------------------ */
function TeamStep({ initial, onNext, onBack }) {
  const nextId = useRef(1)
  const newRow = () => ({ id: nextId.current++, nombre: '', email: '' })
  const [doctores, setDoctores] = useState(initial.length > 0 ? initial : [newRow()])
  const [errorsByRow, setErrorsByRow] = useState({})

  const updateRow = (id, field, value) => {
    setDoctores((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)))
    setErrorsByRow((all) => ({ ...all, [id]: { ...all[id], [field]: '' } }))
  }

  const addRow = () => setDoctores((rows) => [...rows, newRow()])

  const removeRow = (id) =>
    setDoctores((rows) => {
      const rest = rows.filter((row) => row.id !== id)
      return rest.length > 0 ? rest : [newRow()]
    })

  const submit = () => {
    const nextErrors = {}
    for (const row of doctores) {
      if (isDoctorEmpty(row)) continue // filas vacías se ignoran
      const rowErrors = validateDoctor(row)
      if (rowErrors.nombre || rowErrors.email) nextErrors[row.id] = rowErrors
    }
    setErrorsByRow(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onNext(doctores.filter((row) => !isDoctorEmpty(row)))
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit() }} noValidate data-testid="doctores-step">
      <h2 className="register-title">Doctores de la clínica</h2>
      <p className="register-subtitle">
        Agrega a los odontólogos que enviarán trabajos. Puedes dejarlo vacío y
        añadirlos luego desde el panel del laboratorio.
      </p>

      <div className="form-grid">
        {doctores.map((row, index) => (
          <div className="doctor-row" key={row.id}>
            <TextField
              label={`Doctor ${index + 1} — nombre`}
              icon="fa-solid fa-user-doctor"
              autoComplete="name"
              placeholder="Dr. Juan Gómez"
              value={row.nombre}
              onChange={(e) => updateRow(row.id, 'nombre', e.target.value)}
              error={errorsByRow[row.id]?.nombre || ''}
            />
            <TextField
              label="Correo"
              type="email"
              icon="fa-solid fa-envelope"
              autoComplete="email"
              placeholder="drjuan@clinica.com"
              value={row.email}
              onChange={(e) => updateRow(row.id, 'email', e.target.value)}
              error={errorsByRow[row.id]?.email || ''}
            />
            <button
              type="button"
              className="doctor-row-remove"
              onClick={() => removeRow(row.id)}
              aria-label={`Quitar doctor ${index + 1}`}
            >
              <i className="fa-solid fa-trash-can" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="doctor-row-add"
        onClick={addRow}
        data-testid="add-doctor"
        style={{
          color: 'var(--color-accent-dark)',
          fontWeight: 'var(--font-semibold)',
          fontSize: 'var(--text-sm)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: 'var(--space-3)',
        }}
      >
        <i className="fa-solid fa-circle-plus" aria-hidden="true" /> Agregar otro doctor
      </button>

      <WizardFooter onBack={onBack} nextLabel="Revisar" />
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Paso 4 — Revisión y envío                                            */
/* ------------------------------------------------------------------ */
function ReviewStep({ data, onBack, onSubmit }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      noValidate
      data-testid="review-step"
    >
      <h2 className="register-title">Revisa y confirma</h2>
      <p className="register-subtitle">
        Verifica que todo esté correcto antes de crear la cuenta.
      </p>

      <div className="review-list">
        <dl className="review-block">
          <dt className="review-block-title">Clínica</dt>
          <div className="review-row"><dt>Nombre</dt><dd>{data.clinica.nombre}</dd></div>
          {data.clinica.rif && <div className="review-row"><dt>RIF</dt><dd>{data.clinica.rif}</dd></div>}
          {data.clinica.telefono && <div className="review-row"><dt>Teléfono</dt><dd>{data.clinica.telefono}</dd></div>}
          {data.clinica.email_contacto && <div className="review-row"><dt>Correo</dt><dd>{data.clinica.email_contacto}</dd></div>}
        </dl>

        <dl className="review-block">
          <dt className="review-block-title">Dueño</dt>
          <div className="review-row"><dt>Nombre</dt><dd>{data.dueno.nombre}</dd></div>
          <div className="review-row"><dt>Correo</dt><dd>{data.dueno.email}</dd></div>
        </dl>

        {data.doctores.length > 0 && (
          <dl className="review-block">
            <dt className="review-block-title">Doctores ({data.doctores.length})</dt>
            {data.doctores.map((doc) => (
              <div className="review-row" key={doc.id}>
                <dt>{doc.nombre}</dt>
                <dd>{doc.email}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <WizardFooter onBack={onBack} nextLabel="Crear cuenta de clínica" nextLoading={data.loading} nextIcon="fa-solid fa-hospital-user" />
    </form>
  )
}

/* ================================================================== */
/* Flujo completo (wizard de 4 pasos)                                   */
/* ================================================================== */
export default function ClinicaFlow() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    clinica: { nombre: '', rif: '', telefono: '', direccion: '', email_contacto: '' },
    dueno: { nombre: '', email: '', telefono: '', password: '', confirmar: '' },
    doctores: [],
    loading: false,
  })
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const mergeStepData = (section, payload) =>
    setData((prev) => ({ ...prev, [section]: payload }))

  const submitFinal = async () => {
    setError('')
    setData((prev) => ({ ...prev, loading: true }))
    try {
      const { confirmar, ...dueno } = data.dueno
      const outcome = await registerClinica({
        clinica: data.clinica,
        dueno,
        doctores: data.doctores.map(({ nombre, email }) => ({ nombre, email })),
      })
      setResult(outcome)
    } catch (err) {
      setError(friendlyRegisterError(err))
    } finally {
      setData((prev) => ({ ...prev, loading: false }))
    }
  }

  if (result) {
    return (
      <RegisterSuccess
        title="¡Clínica registrada!"
        text="Enviamos un correo de confirmación a la cuenta del dueño. Tras confirmarlo podrá iniciar sesión y gestionar a su equipo."
        partial={result.partial}
      />
    )
  }

  return (
    <div data-testid="flow-clinica">
      <Stepper steps={STEPS} current={step} />

      {error && (
        <div className="register-banner register-banner--error" role="alert" data-testid="register-error" style={{ marginBottom: 'var(--space-4)' }}>
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {step === 0 && (
        <ClinicaStep
          initial={data.clinica}
          onNext={(payload) => { mergeStepData('clinica', payload); setStep(1) }}
        />
      )}

      {step === 1 && (
        <DuenoStep
          initial={data.dueno}
          onBack={() => setStep(0)}
          onNext={(payload) => { mergeStepData('dueno', payload); setStep(2) }}
        />
      )}

      {step === 2 && (
        <TeamStep
          initial={data.doctores}
          onBack={() => setStep(1)}
          onNext={(payload) => { mergeStepData('doctores', payload); setStep(3) }}
        />
      )}

      {step === 3 && (
        <ReviewStep data={data} onBack={() => setStep(2)} onSubmit={submitFinal} />
      )}
    </div>
  )
}
