import { useState } from 'react'
import { Stepper, TextField, PasswordField, Button } from '../../../../shared/ui'
import { useForm } from '../../../../shared/hooks/useForm'
import { odontologoStepSchema } from '../schemas'
import { registerOdontologo, friendlyRegisterError } from '../../../../services/register'
import RegisterSuccess from '../RegisterSuccess'
import '../register.css'

const STEPS = [
  { title: 'Tus datos' },
  { title: 'Tu clínica' },
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

/* --- Paso 1: datos personales + cuenta (tabla: usuarios) --------------- */
function DatosStep({ initial, onNext }) {
  const { values, errors, touched, setField, blur, handleSubmit } = useForm({
    initialValues: { ...initial },
    validators: odontologoStepSchema,
    onSubmit: ({ confirmar, ...rest }) => onNext(rest),
  })

  const bind = (field) => ({
    value: values[field] ?? '',
    onChange: (e) => setField(field, e.target.value),
    onBlur: () => blur(field),
    error: touched[field] ? errors[field] : '',
  })

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="odontologo-datos-step">
      <h2 className="register-title">Tus datos</h2>
      <p className="register-subtitle">
        Crea tu cuenta de odontólogo. Luego la conectarás con tu clínica.
      </p>

      <div className="form-grid">
        <TextField label="Nombre completo" name="nombre" icon="fa-solid fa-user-doctor"
          autoComplete="name" required placeholder="Dr. Juan Gómez" {...bind('nombre')} />
        <TextField label="Correo electrónico" name="email" type="email" icon="fa-solid fa-envelope"
          autoComplete="email" required placeholder="drjuan@correo.com" {...bind('email')} />
        <PasswordField label="Contraseña" name="password" autoComplete="new-password" required
          value={values.password ?? ''} onChange={(e) => setField('password', e.target.value)}
          onBlur={() => blur('password')} error={touched.password ? errors.password : ''} />
        <PasswordField label="Confirmar contraseña" name="confirmar" autoComplete="new-password" required
          showStrength={false}
          value={values.confirmar ?? ''} onChange={(e) => setField('confirmar', e.target.value)}
          onBlur={() => blur('confirmar')} error={touched.confirmar ? errors.confirmar : ''} />
        <div className="form-grid__span-2">
          <TextField label="Teléfono" name="telefono" type="tel" icon="fa-solid fa-phone"
            autoComplete="tel" inputMode="tel" placeholder="+58-412-1234567" {...bind('telefono')} />
        </div>
      </div>

      <WizardFooter />
    </form>
  )
}

/* --- Paso 2: clínica que lo invitó (tabla: miembros_clinica) ------------ */
function ClinicaStep({ initial, onNext, onBack }) {
  const { values, errors, touched, setField, blur, handleSubmit } = useForm({
    initialValues: { clinicaNombre: initial?.clinicaNombre ?? '' },
    validators: { clinicaNombre: odontologoStepSchema.clinicaNombre },
    onSubmit: onNext,
  })

  return (
    <form onSubmit={handleSubmit} noValidate data-testid="odontologo-clinica-step">
      <h2 className="register-title">Tu clínica</h2>
      <p className="register-subtitle">
        Indica la clínica que te invitó. El laboratorio confirmará tu membresía
        para que puedas enviarle trabajos.
      </p>

      <div className="form-grid">
        <div className="form-grid__span-2">
          <TextField label="Nombre de la clínica" name="clinicaNombre" icon="fa-solid fa-hospital"
            autoComplete="organization" required placeholder="Clínica Dental Sonrisa"
            value={values.clinicaNombre ?? ''}
            onChange={(e) => setField('clinicaNombre', e.target.value)}
            onBlur={() => blur('clinicaNombre')}
            error={touched.clinicaNombre ? errors.clinicaNombre : ''} />
        </div>
      </div>

      <WizardFooter onBack={onBack} nextLabel="Revisar" />
    </form>
  )
}

/* --- Paso 3: revisión ---------------------------------------------------- */
function ReviewStep({ data, onBack, onSubmit, loading }) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit() }} noValidate data-testid="odontologo-review-step">
      <h2 className="register-title">Revisa y confirma</h2>
      <p className="register-subtitle">Verifica tus datos antes de crear la cuenta.</p>

      <div className="review-list">
        <dl className="review-block">
          <dt className="review-block-title">Odontólogo</dt>
          <div className="review-row"><dt>Nombre</dt><dd>{data.usuario.nombre}</dd></div>
          <div className="review-row"><dt>Correo</dt><dd>{data.usuario.email}</dd></div>
          {data.usuario.telefono && <div className="review-row"><dt>Teléfono</dt><dd>{data.usuario.telefono}</dd></div>}
        </dl>

        <dl className="review-block">
          <dt className="review-block-title">Clínica</dt>
          <div className="review-row"><dt>Nombre</dt><dd>{data.clinica.nombre}</dd></div>
        </dl>
      </div>

      <WizardFooter onBack={onBack} nextLabel="Crear cuenta" nextLoading={loading} nextIcon="fa-solid fa-user-doctor" />
    </form>
  )
}

export default function OdontologoFlow() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    usuario: { nombre: '', email: '', telefono: '', password: '' },
    clinica: { nombre: '' },
    loading: false,
  })
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const submitFinal = async () => {
    setError('')
    setData((prev) => ({ ...prev, loading: true }))
    try {
      const outcome = await registerOdontologo({
        usuario: data.usuario,
        clinica: data.clinica,
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
        text="Te enviamos un correo de confirmación. Tras confirmarlo, el laboratorio validará tu membresía con la clínica para activar tu acceso."
        partial={result.partial}
      />
    )
  }

  return (
    <div data-testid="flow-odontologo">
      <Stepper steps={STEPS} current={step} />

      {error && (
        <div className="register-banner register-banner--error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {step === 0 && (
        <DatosStep
          initial={data.usuario}
          onNext={(usuario) => { setData((prev) => ({ ...prev, usuario })); setStep(1) }}
        />
      )}

      {step === 1 && (
        <ClinicaStep
          initial={data.clinica}
          onBack={() => setStep(0)}
          onNext={(payload) => { setData((prev) => ({ ...prev, clinica: { nombre: payload.clinicaNombre } })); setStep(2) }}
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
