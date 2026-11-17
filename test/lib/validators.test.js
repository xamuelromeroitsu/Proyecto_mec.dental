import { describe, it, expect } from 'vitest'
import {
  required,
  email,
  minLength,
  phone,
  rif,
  documento,
  matchesField,
  strongPassword,
  passwordScore,
  composeValidators,
} from '../../src/lib/validators'

/**
 * Tests unitarios de la capa LIB (validadores puros).
 * Contrato: '' = válido, string = mensaje de error.
 */
describe('validators', () => {
  describe('required', () => {
    it('rechaza null, undefined, "" y solo espacios', () => {
      const validate = required('Obligatorio')
      expect(validate(null)).toBe('Obligatorio')
      expect(validate(undefined)).toBe('Obligatorio')
      expect(validate('')).toBe('Obligatorio')
      expect(validate('   ')).toBe('Obligatorio')
    })

    it('acepta texto real', () => {
      expect(required('Obligatorio')('hola')).toBe('')
    })
  })

  describe('email', () => {
    it('acepta correos válidos', () => {
      expect(email()('a@b.co')).toBe('')
      expect(email()('nombre.apellido@dominio.com.ve')).toBe('')
    })

    it('rechaza formatos inválidos', () => {
      expect(email()('sin-arroba')).not.toBe('')
      expect(email()('a@b')).not.toBe('')
      expect(email()('a b@c.com')).not.toBe('')
    })

    it('no valida cadena vacía (eso es papel de required)', () => {
      expect(email()('')).toBe('')
    })
  })

  describe('minLength', () => {
    it('rechaza por debajo del límite y acepta por encima', () => {
      const validate = minLength(6)
      expect(validate('12345')).not.toBe('')
      expect(validate('123456')).toBe('')
    })

    it('ignora vacío (composed con required)', () => {
      expect(minLength(6)('')).toBe('')
    })
  })

  describe('phone', () => {
    it('acepta teléfonos de formato libre con +, -, espacios', () => {
      expect(phone()('+58-412-1234567')).toBe('')
      expect(phone()('0212 555 0000')).toBe('')
    })

    it('rechaza letras o cadenas demasiado cortas', () => {
      expect(phone()('abc')).not.toBe('')
      expect(phone()('12')).not.toBe('')
    })
  })

  describe('rif', () => {
    it('acepta formato J-12345678-9 (case-insensitive)', () => {
      expect(rif()('J-12345678-9')).toBe('')
      expect(rif()('v-12345678-2')).toBe('')
    })

    it('rechaza RIF incompleto', () => {
      expect(rif()('J-12345678')).not.toBe('')
      expect(rif()('X-12345678-9')).not.toBe('')
    })
  })

  describe('documento', () => {
    it('acepta V-12345678 y P-9876543', () => {
      expect(documento()('V-12345678')).toBe('')
      expect(documento()('P-9876543')).toBe('')
    })

    it('rechaza formatos sin prefijo válido', () => {
      expect(documento()('12345678')).not.toBe('')
      expect(documento()('V-123')).not.toBe('')
    })
  })

  describe('matchesField', () => {
    const validate = matchesField('password', 'No coinciden')

    it('coincide con el otro campo', () => {
      expect(validate('abc123', { password: 'abc123' })).toBe('')
    })

    it('falla cuando difiere', () => {
      expect(validate('abc', { password: 'xyz' })).toBe('No coinciden')
    })
  })

  describe('strongPassword', () => {
    it('exige 8+ caracteres con letras y números', () => {
      expect(strongPassword()('abc12345')).toBe('')
      expect(strongPassword()('abc123')).not.toBe('')
      expect(strongPassword()('abcdefgh')).not.toBe('')
      expect(strongPassword()('12345678')).not.toBe('')
    })
  })

  describe('passwordScore', () => {
    it('0 para vacía; crece con longitud, mayúsculas, números y símbolos', () => {
      expect(passwordScore('')).toBe(0)
      expect(passwordScore('abc')).toBe(1)          // muy corta
      expect(passwordScore('abcdefgh')).toBe(1)     // solo longitud
      expect(passwordScore('Abcdefgh')).toBe(2)     // longitud + mixta
      expect(passwordScore('Abcdefgh12')).toBe(3)   // + dígitos
      expect(passwordScore('Abcdefgh12!')).toBe(4)  // + símbolo
    })
  })

  describe('composeValidators', () => {
    it('devuelve el PRIMER error en orden de composición', () => {
      const validate = composeValidators(
        required('Requerido'),
        email('Email inválido')
      )
      expect(validate('')).toBe('Requerido')
      expect(validate('no-es-email')).toBe('Email inválido')
      expect(validate('ok@mail.com')).toBe('')
    })

    it('tolera slots vacíos en la composición', () => {
      const validate = composeValidators(undefined, required('Requerido'))
      expect(validate('')).toBe('Requerido')
      expect(validate('x')).toBe('')
    })
  })
})
