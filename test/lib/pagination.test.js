import { describe, it, expect } from 'vitest'
import {
  PAGE_SIZE,
  nextCursor,
  encodeCursor,
  decodeCursor,
  cursorFilter,
  paginateList,
} from '../../src/lib/pagination'

/**
 * Contrato de la paginación keyset (capa lib — funciones puras).
 * El cursor (fecha, id) permite pedir páginas estables sin OFFSET.
 */
describe('pagination — nextCursor', () => {
  it('crea cursor con la fecha cruda de la BD (fecha_ingreso)', () => {
    expect(nextCursor({ fecha_ingreso: '2026-11-01T10:00:00Z', id: 'abc' }))
      .toEqual({ fecha: '2026-11-01T10:00:00Z', id: 'abc' })
  })

  it('acepta órdenes ya mapeadas (fecha) para el modo demo', () => {
    expect(nextCursor({ fecha: '2026-06-20', id: 'ORD-9842' }))
      .toEqual({ fecha: '2026-06-20', id: 'ORD-9842' })
  })

  it('null para fila vacía (no hay página siguiente)', () => {
    expect(nextCursor(null)).toBeNull()
    expect(nextCursor(undefined)).toBeNull()
  })
})

describe('pagination — encode/decode (roundtrip y tolerancia a fallos)', () => {
  it('roundtrip conserva fecha e id', () => {
    const cursor = { fecha: '2026-11-01T10:00:00Z', id: 'abc-123' }
    expect(decodeCursor(encodeCursor(cursor))).toEqual(cursor)
  })

  it('encode de null → null; decode de null/basura → null (sin crash)', () => {
    expect(encodeCursor(null)).toBeNull()
    expect(decodeCursor(null)).toBeNull()
    expect(decodeCursor('!!!no-base64!!!')).toBeNull()
    expect(decodeCursor(btoa('{"fecha":""}'))).toBeNull() // incompleto
  })
})

describe('pagination — cursorFilter (traducción a PostgREST)', () => {
  it('null → null (primera página no filtra)', () => {
    expect(cursorFilter(null)).toBeNull()
  })

  it('construye or(): fecha < c.fecha OR (fecha = c.fecha AND id < c.id)', () => {
    const filter = cursorFilter({ fecha: '2026-11-01T10:00:00Z', id: 'abc' })
    expect(filter).toBe(
      'or(fecha_ingreso.lt.2026-11-01T10:00:00Z,and(fecha_ingreso.eq.2026-11-01T10:00:00Z,id.lt.abc))'
    )
  })
})

describe('pagination — paginateList (modo demo, en memoria)', () => {
  // 10 filas ordenadas DESC; PAGE_SIZE de producción = 8
  const list = Array.from({ length: 10 }, (_, i) => ({
    id: `id-${10 - i}`,
    fecha: `2026-01-${String(10 - i).padStart(2, '0')}`,
  }))

  it('primera página: PAGE_SIZE filas + cursor + hasMore', () => {
    const page = paginateList(list)
    expect(page.orders).toHaveLength(PAGE_SIZE)
    expect(page.hasMore).toBe(true)
    expect(page.nextCursor).toEqual({ fecha: '2026-01-03', id: 'id-3' })
  })

  it('segunda página desde el cursor: solo el resto (2 filas), hasMore=false', () => {
    const first = paginateList(list)
    const second = paginateList(list, { cursor: first.nextCursor })
    expect(second.orders).toHaveLength(2)
    expect(second.hasMore).toBe(false)
    expect(second.nextCursor).toBeNull()
  })

  it('con límite menor que la lista completa funciona igual (offset interno)', () => {
    const page = paginateList(list, { limit: 3 })
    expect(page.orders.map((r) => r.id)).toEqual(['id-10', 'id-9', 'id-8'])
    expect(page.hasMore).toBe(true)
  })

  it('lista vacía → página vacía sin cursor', () => {
    const page = paginateList([])
    expect(page.orders).toEqual([])
    expect(page.hasMore).toBe(false)
    expect(page.nextCursor).toBeNull()
  })
})
