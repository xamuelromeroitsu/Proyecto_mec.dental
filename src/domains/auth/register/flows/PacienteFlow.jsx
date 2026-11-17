import { useState } from 'react'
import { Stepper, TextField, PasswordField, Button } from '../../../../shared/ui'
import { useForm } from '../../../../shared/hooks/useForm'
import { pacienteStep1Schema, cuentaSimpleStepSchema } from '../schemas'
import { registerPaciente, friendlyRegisterError } from '../../../../services/register'
import RegisterSuccess from '../RegisterSuccess'
import '../register.css'

const STEPS = [
  { title: 'Tus datos' },
  { title: 'Tu cuenta' },
  { title: 'Revisión' },
]

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

/* --- Paso 1: datos del paciente (tabla: pacientes) ---------------------- */
function PacienteStep({ initial, onNext }) {
  const { values, errors, touched, setField, blur, handleSubmit } = useForm({
    initialValues: { ...initial },
    validators: pacienteStep1Schema,
    onSubmit: onNext,
  })

  const bind = (field) => ({
    value: values[field] ?? '',
    onChange: (e) => setField(field, e.target.value),
    onBlur: () => blur(field),
    error: touched[field] ? errors[field] : '',
  })

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="paciente-datos-step">
      <h2 className="register-title">Tus datos</h2>
      <p className="register-subtitle">
        Con tu cuenta podrás seguir el estado de tus trabajos con el técnico de
        esta página.
      </p>

      <div className="form-grid">
        <TextField label="Nombre completo" name="nombre" icon="fa-solid fa-user"
          autoComplete="name" required placeholder="María José Delgado" {...bind('nombre')} />
        <TextField label="Cédula o pasaporte" name="documento" hint="Formato: V-12345678 (opcional)"
          icon="fa-solid fa-id-card" placeholder="V-12345678" {...bind('documento')} />
      </div>

      <WizardFooter />
    </form>
  )
}

/* --- Paso 2: cuenta de acceso (tablas: usuarios + vinculos_paciente) ---- */
function CuentaStep({ initial, onNext, onBack }) {
  const { values, errors, touched, setField, blur, handleSubmit } = useForm({
    initialValues: { ...initial },
    validators: cuentaSimpleStepSchema,
    onSubmit: ({ confirmar, ...rest }) => onNext(rest),
  })

  const bind = (field) => ({
    value: values[field] ?? '',
    onChange: (e) => setField(field, e.target.value),
    onBlur: () => blur(field),
    error: touched[field] ? errors[field] : '',
  })

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="paciente-cuenta-step">
      <h2 className="register-title">Tu cuenta</h2>
      <p className="register-subtitle">
        Este correo quedará vinculado al técnico de esta página.
      </p>

      <div className="form-grid">
        <TextField label="Correo electrónico" name="email" type="email" icon="fa-solid fa-envelope"
          autoComplete="email" required placeholder="maria@correo.com" {...bind('email')} />
        <TextField label="Teléfono" name="telefono" type="tel" icon="fa-solid fa-phone"
          autoComplete="tel" inputMode="tel" placeholder="+58-412-1234567" {...bind('telefono')} />
        <PasswordField label="Contraseña" name="password" autoComplete="new-password" required
          value={values.password ?? ''} onChange={(e) => setField('password', e.target.value)}
          onBlur={() => blur('password')} error={touched.password ? errors.password : ''} />
        <PasswordField label="Confirmar contraseña" name="confirmar" autoComplete="new-password" required
          showStrength={false}
          value={values.confirmar ?? ''} onChange={(e) => setField('confirmar', e.target.value)}
          onBlur={() => blur('confirmar')} error={touched.confirmar ? errors.confirmar : ''} />
      </div>

      <WizardFooter onBack={onBack} nextLabel="Revisar" />
    </form>
  )
}

/* --- Paso 3: revisión ---------------------------------------------------- */
function ReviewStep({ data, onBack, onSubmit, loading }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} noValidate data-testid="paciente-review-step">
      <h2 className="register-title">Revisa y confirma</h2>
      <p className="register-subtitle">Verifica tus datos antes de crear la cuenta.</p>

      <div className="review-list">
        <dl className="review-block">
          <dt className="review-block-title">Paciente</dt>
          <div className="review-row"><dt>Nombre</dt><dd>{data.usuario.nombre}</dd></div>
          {data.paciente.documento && <div className="review-row"><dt>Documento</dt><dd>{data.paciente.documento}</dd></div>}
          <div className="review-row"><dt>Correo</dt><dd>{data.usuario.email}</dd></div>
          {data.usuario.telefono && <div className="review-row"><dt>Teléfono</dt><dd>{data.usuario.telefono}</dd></div>}
        </dl>
      </div>

      <WizardFooter onBack={onBack} nextLabel="Crear cuenta" nextLoading={loading} nextIcon="fa-solid fa-user" />
    </form>
  )
}

export default function PacienteFlow() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    usuario: { nombre: '', email: '', telefono: '', password: '' },
    paciente: { documento: '' },
    loading: false,
  })
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const submitFinal = async () => {
    setError('')
    setData((prev) => ({ ...prev, loading: true }))
    try {
      const outcome = await registerPaciente({
        usuario: data.usuario,
        paciente: data.paciente,
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
        title="¡Cuenta creada!"
        text="Te enviamos un correo de confirmación. Tras confirmarlo podrás iniciar sesión y ver el estado de tus trabajos."
        partial={result.partial}
      />
    )
  }

  return (
    <div data-testid="flow-paciente">
      <Stepper steps={STEPS} current={step} />

      {error && (
        <div className="register-banner register-banner--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {step === 0 && (
        <PacienteStep
          initial={{ nombre: data.usuario.nombre, documento: data.paciente.documento }}
          onNext={({ nombre, documento }) => {
            setData((prev) => ({
              ...prev,
              usuario: { ...prev.usuario, nombre },
              paciente: { ...prev.paciente, documento },
            }))
            setStep(1)
          }}
        />
      )}

      {step === 1 && (
        <CuentaStep
          initial={data.usuario}
          onBack={() => setStep(0)}
          onNext={(usuario) => { setData((prev) => ({ ...prev, usuario })); setStep(2) }}
        />
      )}

      {step === 2 && (
        <ReviewStep
          data={data}
          onBack={() => setStep(1)}
          onSubmit={submitFinal}
          loading={data.loading}
        />
      )}
    </div>
  )
}
