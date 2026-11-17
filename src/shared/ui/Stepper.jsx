import './form.css'

/**
 * Stepper — indicador de progreso del wizard.
 * Accesible: `aria-current="step"` en el paso activo.
 *
 * steps: [{ title: 'Datos de la clínica' }, ...]
 * current: índice del paso activo (0-based)
 */
export default function Stepper({ steps, current }) {
  return (
    <ol className="stepper" aria-label="Progreso del registro">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'active' : ''
        return (
          <li
            key={step.title}
            className={[
              'stepper-step',
              state === 'active' && 'stepper-step--active',
              state === 'done' && 'stepper-step--done',
            ].filter(Boolean).join(' ')}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <span className={`stepper-dot ${state === 'active' ? 'stepper-dot--active' : ''} ${state === 'done' ? 'stepper-dot--done' : ''}`}>
              {state === 'done' ? <i className="fa-solid fa-check" aria-hidden="true" /> : index + 1}
            </span>
            <span className="stepper-title">{step.title}</span>
            {index < steps.length - 1 && (
              <span className={`stepper-line ${index < current ? 'stepper-line--done' : ''}`} aria-hidden="true" />
            )}
          </li>
        )
      })}
    </ol>
  )
}
