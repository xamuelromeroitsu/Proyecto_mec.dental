import { describe, it, expect } from 'vitest'
import {
  WORK_TYPES,
  COLOR_GUIDES,
  getWorkType,
  colorsFor,
  filterGroupOf,
} from '../../src/lib/workTypes'

/**
 * Contrato del catálogo de tipos de trabajo (capa lib).
 * Es la fuente única de verdad para landing, dashboard y formulario.
 */
describe('workTypes — integridad del catálogo', () => {
  it('cada tipo tiene label, icono, grupo, guía de color y materiales', () => {
    const guides = Object.keys(COLOR_GUIDES)
    for (const t of WORK_TYPES) {
      expect(t.label, `label de ${t.key}`).toBeTruthy()
      expect(t.label.trim(), `label sin espacios de ${t.key}`).toBe(t.label)
      expect(t.icon, `icono de ${t.key}`).toMatch(/^fa-/)
      expect(guides, `colorGuide de ${t.key} debe existir en COLOR_GUIDES`).toContain(t.colorGuide)
      expect(t.materials.length, `materiales de ${t.key}`).toBeGreaterThan(0)
      if (t.materials.some((m) => !m.trim())) {
        throw new Error(`materiales vacíos en ${t.key}`)
      }
    }
  })

  it('las etiquetas son únicas (se persisten como tipo_trabajo)', () => {
    const labels = WORK_TYPES.map((t) => t.label)
    expect(new Set(labels).size).toBe(labels.length)
  })

  it('incluye los 10 tipos solicitados del taller', () => {
    const labels = WORK_TYPES.map((t) => t.label)
    for (const expected of [
      'Carillas',
      'Grillz',
      'Prótesis Total',
      'Prótesis Parcial (Acrílico)',
      'Prótesis Flexible',
      'Férula de Bruxismo',
      'Retenedor Hawley',
      'Alineador Invisible',
      'Protector Bucal Deportivo',
      'Férula de Blanqueamiento',
    ]) {
      expect(labels, `falta ${expected}`).toContain(expected)
    }
  })
})

describe('workTypes — materiales según lo que confecciona el taller', () => {
  it('grillz: metales preciosos y aleaciones biocompatibles', () => {
    const materials = getWorkType('Grillz').materials
    expect(materials.some((m) => m.startsWith('Oro Amarillo 18k'))).toBe(true)
    expect(materials).toContain('Plata Esterlina 925')
    expect(materials).toContain('Platino')
  })

  it('prótesis total: PMMA termopolimerizable con dientes prefabricados', () => {
    const materials = getWorkType('Prótesis Total').materials
    expect(materials.every((m) => m.startsWith('PMMA'))).toBe(true)
    expect(materials.some((m) => m.includes('Dientes de Porcelana'))).toBe(true)
  })

  it('bruxismo: PMMA rígida', () => {
    expect(getWorkType('Férula de Bruxismo').materials).toEqual(['PMMA Rígida'])
  })

  it('alineadores: lámina termoplástica transparente', () => {
    expect(getWorkType('Alineador Invisible').materials).toContain('Lámina Termoplástica Transparente')
  })
})

describe('workTypes — guías de color por tipo', () => {
  it('grillz usa guía de metales; protecciones usan Transparente', () => {
    expect(colorsFor('Grillz')).toContain('Oro Amarillo')
    expect(colorsFor('Férula de Bruxismo')).toContain('Transparente')
    expect(colorsFor('Prótesis Fija')).toContain('A2')
  })

  it('getWorkType usa fallback seguro para etiquetas desconocidas', () => {
    expect(getWorkType('Tipo Inexistente').label).toBe(WORK_TYPES[0].label)
  })
})

describe('workTypes — grupos de filtro (dashboard)', () => {
  it('mapea las etiquetas del catálogo a su grupo', () => {
    expect(filterGroupOf('Grillz')).toBe('grillz')
    expect(filterGroupOf('Carillas')).toBe('fija')
    expect(filterGroupOf('Férula de Bruxismo')).toBe('proteccion')
    expect(filterGroupOf('Protector Bucal Deportivo')).toBe('proteccion')
    expect(filterGroupOf('Alineador Invisible')).toBe('ortodoncia')
    expect(filterGroupOf('Prótesis Total')).toBe('removible')
  })

  it('mapea las etiquetas LEGADAS de órdenes previas sin corromperlas', () => {
    expect(filterGroupOf('Prótesis Fija')).toBe('fija')
    expect(filterGroupOf('Prótesis Removible')).toBe('removible')
    expect(filterGroupOf('Ortodoncia / Alineadores')).toBe('ortodoncia')
  })

  it('devuelve null para etiquetas totalmente desconocidas (sin crash)', () => {
    expect(filterGroupOf('Cosa Rara')).toBeNull()
  })
})
