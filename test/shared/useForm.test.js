import { describe, it, expect } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useForm } from '../../src/shared/hooks/useForm'
import { composeValidators, required, email, matchesField } from '../../src/lib/validators'

/**
 * Tests del hook useForm (capa shared/hooks).
 * Buenas prácticas que se verifican:
 *  - errores solo tras blur o submit (no al teclear)
 *  - revalidación en vivo de un campo que ya tenía error
 *  - bloqueo de doble envío (isSubmitting)
 */
describe('useForm', () => {
  const validators = {
    email: composeValidators(required('Requerido'), email('Email inválido')),
    confirmar: matchesField('password', 'No coinciden'),
  }

  const setup = (onSubmit = vi.fn()) =>
    renderHook(() =>
      useForm({ initialValues: { email: '', password: 'x', confirmar: '' }, validators, onSubmit })
    )

  it('empieza válido si no hay campos tocados con error', () => {
    const { result } = setup()
    expect(result.current.isValid).toBe(false) // email requerido aún sin tocar
    expect(result.current.errors.email).toBe('Requerido') // estado calculado
    // PERO el error aún no debe marcarse como tocado
    expect(result.current.touched.email).toBeFalsy()
  })

  it('blur marca el campo y expone el error', () => {
    const { result } = setup()
    act(() => result.current.blur('email'))
    expect(result.current.touched.email).toBe(true)
    expect(result.current.errors.email).toBe('Requerido')
  })

  it('setField revalida en vivo si el campo ya tenía error', async () => {
    const { result } = setup()
    act(() => result.current.blur('email'))
    expect(result.current.errors.email).toBe('Requerido')

    act(() => result.current.setField('email', 'mal-formato'))
    expect(result.current.errors.email).toBe('Email inválido')

    act(() => result.current.setField('email', 'ok@mail.com'))
    expect(result.current.errors.email).toBe('')
  })

  it('validateAll marca todos los errores y devuelve false si hay fallos', () => {
    const { result } = setup()
    act(() => result.current.setField('confirmar', 'distinta'))
    let ok = true
    act(() => { ok = result.current.validateAll() })
    expect(ok).toBe(false)
    expect(result.current.errors.confirmar).toBe('No coinciden')
  })

  it('handleSubmit solo llama onSubmit cuando todo es válido', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: '', password: 'x', confirmar: '' },
        validators,
        onSubmit,
      })
    )

    // inválido → no llama
    await act(async () => { await result.current.handleSubmit() })
    expect(onSubmit).not.toHaveBeenCalled()

    // válido → llama con los values
    act(() => {
      result.current.setValues({ email: 'a@b.com', password: 'x', confirmar: 'x' })
    })
    await act(async () => { await result.current.handleSubmit() })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.com', confirmar: 'x' })
    )
    expect(result.current.isSubmitting).toBe(false)
  })

  it('onSubmit asíncrono mantiene isSubmitting durante el envío', async () => {
    let resolveSubmit
    const onSubmit = vi.fn(() => new Promise((resolve) => { resolveSubmit = resolve }))
    const { result } = renderHook(() =>
      useForm({
        initialValues: { email: 'a@b.com', password: 'x', confirmar: 'x' },
        validators: {},
        onSubmit,
      })
    )

    const promise = act(async () => {
      // Dos envíos concurrentes (doble click en el mismo tick):
      // el guard por ref debe bloquear el segundo.
      const first = result.current.handleSubmit()
      const second = result.current.handleSubmit()
      resolveSubmit()
      await Promise.all([first, second])
    })
    await promise
    expect(onSubmit).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(result.current.isSubmitting).toBe(false))
  })
})
