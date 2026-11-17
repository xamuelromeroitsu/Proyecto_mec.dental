import { useCallback, useMemo, useRef, useState } from 'react'

/**
 * Formularios propios sin dependencias externas (buenas prácticas):
 *
 * - `values`            estado del formulario
 * - `setField`/`setValues` actualizar campo(s)
 * - `errors`            errores SOLO de campos tocados (UX)
 * - `blur`/`touched`    los errores aparecen al salir del campo, no al teclear
 * - `validateAll()`     valida todo (usado en submit / avanzar de paso)
 * - `handleSubmit`      valida → si es válido llama `onSubmit(values)`
 * - `isSubmitting`      bloquea doble envío
 *
 * `validators` es un mapa: campo → (valor, todosLosValores) => error|''
 */
export function useForm({ initialValues = {}, validators = {}, onSubmit }) {
  const [values, setValues] = useState(initialValues)
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const validatorsRef = useRef(validators)
  validatorsRef.current = validators

  const validateFields = useCallback(
    (nextValues, fieldsToValidate) => {
      const map = validatorsRef.current
      const fields = fieldsToValidate || Object.keys(map)
      const errors = {}
      for (const field of fields) {
        const validate = map[field]
        if (validate) errors[field] = validate(nextValues?.[field], nextValues) || ''
        if (!map[field] && fieldsToValidate) errors[field] = errors[field] || ''
      }
      return errors
    },
    []
  )

  const [errors, setErrors] = useState(() => validateFields(initialValues))

  const setField = useCallback((field, value) => {
    setValues((prev) => {
      const next = { ...prev, [field]: value }
      setErrors((prevErrors) => {
        const validate = validatorsRef.current[field]
        const fieldError = validate ? validate(value, next) : ''
        const hasOldError = (prevErrors[field] || '').length > 0
        // Revalidación en vivo SOLO si el campo ya tenía error (se corrige al instante)
        if (hasOldError || fieldError) {
          return { ...prevErrors, [field]: fieldError }
        }
        return prevErrors
      })
      return next
    })
  }, [])

  const setFields = useCallback((patch) => {
    setValues((prev) => ({ ...prev, ...patch }))
  }, [])

  const blur = useCallback(
    (field) => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      setValues((current) => {
        const validate = validatorsRef.current[field]
        const fieldError = validate ? validate(current[field], current) : ''
        setErrors((prev) => ({ ...prev, [field]: fieldError }))
        return current
      })
    },
    []
  )

  const resetForm = useCallback(
    (nextInitial = initialValues) => {
      setValues(nextInitial)
      setTouched({})
      setErrors(validateFields(nextInitial))
    },
    [initialValues, validateFields]
  )

  /** Valida todo y devuelve si el formulario es válido. */
  const validateAll = useCallback(() => {
    const nextErrors = validateFields(values)
    setErrors(nextErrors)
    setTouched(Object.keys(nextErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}))
    return Object.values(nextErrors).every((error) => !error)
  }, [values, validateFields])

  const handleSubmit = useCallback(
    async (event) => {
      if (event?.preventDefault) event.preventDefault()
      // Guard síncrono por ref: bloquea doble envío aunque el estado
      // aún no se haya re-renderizado (doble click en el mismo tick).
      if (isSubmittingRef.current) return false
      if (!validateAll()) return false
      isSubmittingRef.current = true
      setIsSubmitting(true)
      try {
        await onSubmit?.(values)
        return true
      } finally {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [values, validateAll, onSubmit]
  )

  const isValid = useMemo(
    () => Object.values(errors).every((error) => !error),
    [errors]
  )

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setField,
    setValues: setFields,
    blur,
    validateAll,
    handleSubmit,
    resetForm,
  }
}
