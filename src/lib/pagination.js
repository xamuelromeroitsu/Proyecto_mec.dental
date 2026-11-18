/**
 * =========================================================================
 * PAGINACIÓN KEYSET/CURSOR (capa lib — funciones puras, sin React/Supabase)
 * =========================================================================
 *
 * QUÉ HACE: divide listas grandes (órdenes) en páginas que se piden bajo
 * demanda ("Cargar más"), sin traer la tabla completa al navegador.
 *
 * POR QUÉ CURSOR Y NO OFFSET:
 *   - `OFFSET 5000` en Postgres IGUALMENTE recorre las 5000 filas (O(n)):
 *     cada página profunda cuesta lo mismo que traer todo lo anterior.
 *   - Si alguien inserta una orden mientras paginas, con offset las filas
 *     "se corren" → ves duplicados o te saltas registros.
 *   - El cursor salta directo a la posición (O(log n) con índice) y es
 *     estable ante inserciones nuevas.
 *
 * CÓMO: cursor compuesto (fecha_ingreso, id). La fecha ordena y el id
 * desempata filas con idéntica fecha (mismo milisegundo). Equivale a:
 *     WHERE (fecha, id) < (cursor.fecha, cursor.id)
 * Para que sea O(log n) conviene el índice (ver NOTA ÍNDICE al final).
 */

export const PAGE_SIZE = 8

/**
 * Construye el cursor a partir de la ÚLTIMA fila de una página entregada.
 * Acepta tanto filas crudas de la BD (fecha_ingreso) como órdenes ya
 * mapeadas para la vista (fecha) — el modo demo usa el mapeado.
 * @returns {{fecha: string, id: string} | null}
 */
export function nextCursor(lastRow) {
  if (!lastRow) return null
  return { fecha: lastRow.fecha_ingreso ?? lastRow.fecha, id: lastRow.id }
}

/** Serializa el cursor para guardarlo en estado/URL (base64 de JSON). */
export function encodeCursor(cursor) {
  return cursor ? btoa(JSON.stringify(cursor)) : null
}

/** Inverso de encodeCursor. Un cursor corrupto NO debe romper la app: → null. */
export function decodeCursor(encoded) {
  if (!encoded) return null
  try {
    const { fecha, id } = JSON.parse(atob(encoded))
    return fecha && id ? { fecha, id } : null
  } catch {
    return null
  }
}

/**
 * Traduce el cursor a un filtro PostgREST (lo que entiende Supabase):
 *   fecha < c.fecha OR (fecha = c.fecha AND id < c.id)
 * Se encadena sobre la query: `.or(cursorFilter(cursor))`.
 * @returns {string|null} null = primera página, sin filtro.
 */
export function cursorFilter(cursor) {
  if (!cursor) return null
  return `or(fecha_ingreso.lt.${cursor.fecha},and(fecha_ingreso.eq.${cursor.fecha},id.lt.${cursor.id}))`
}

/**
 * PAGINACIÓN EN MEMORIA para el MODO DEMO (sin .env configurado): simula
 * el mismo contrato que la BD real (página + cursor + hasMore) para que el
 * flujo "Cargar más" sea idéntico con y sin backend.
 *
 * `list` llega ordenado DESC por fecha; localiza el cursor por id y corta.
 */
export function paginateList(list, { cursor = null, limit = PAGE_SIZE } = {}) {
  const startIndex = cursor ? list.findIndex((row) => row.id === cursor.id) : -1
  const rest = startIndex >= 0 ? list.slice(startIndex + 1) : list
  const page = rest.slice(0, limit)
  const hasMore = rest.length > limit
  return {
    orders: page,
    nextCursor: hasMore && page.length > 0 ? nextCursor(page[page.length - 1]) : null,
    hasMore,
  }
}

/* =========================================================================
 * NOTA ÍNDICE: el índice que requiere este cursor YA ESTÁ en
 * base_de_datos.sql (sección INDICES):
 *   CREATE INDEX idx_trabajos_keyset ON trabajos (fecha_ingreso DESC, id DESC);
 * Si la BD de Supabase ya existe, aplica SOLO esa línea en el SQL Editor
 * (no re-ejecutes el script completo). Sin él, el filtro del cursor hace
 * scan secuencial y pierde el beneficio. Detalles: docs/02-decisiones-tecnicas/
 * 006-paginacion-keyset.md
 * ========================================================================= */
