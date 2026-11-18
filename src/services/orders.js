import { supabase, isSupabaseConfigured } from './supabase'
import { INITIAL_ORDERS } from '../data/initialData'
import { cursorFilter, nextCursor, PAGE_SIZE, paginateList } from '../lib/pagination'
import { filterGroupOf, WORK_TYPES } from '../lib/workTypes'

/**
 * Servicio de órdenes de trabajo (tabla `trabajos` + `trabajo_piezas`).
 *
 * PAGINACIÓN (por qué): con la base creciendo, traer todas las órdenes en
 * cada login saturaría la memoria del navegador y la red. fetchOrders()
 * devuelve UNA página (PAGE_SIZE) y un cursor para pedir la siguiente bajo
 * demanda (botón "Cargar más" en OrderFeed). El filtro por chip también es
 * SERVER-SIDE (los grupos de lib/workTypes → lista de tipos), así que el
 * navegador nunca necesita "todo" para filtrar.
 *
 * RLS sigue decidiendo qué filas ve cada usuario:
 *   - odontólogo → las de su clínica (miembros_clinica)
 *   - técnico    → las de su laboratorio completo
 *   - paciente   → las de sus vínculos activos
 */

const BUCKET = 'trabajos-archivos'

/** Tipos de trabajo que pertenecen a un chip/grupo del dashboard. */
function tiposDelGrupo(grupo) {
  return WORK_TYPES.filter((t) => t.filterGroup === grupo).map((t) => t.label)
}

/* ---------- Mapeo DB → modelo de vista (lo que espera el UI) ---------- */

function mapTrabajo(row) {
  return {
    key: row.id,
    id: `ORD-${row.id.slice(0, 6).toUpperCase()}`,
    paciente: row.paciente?.nombre || '—',
    clinica: row.clinica?.nombre || '—',
    tipo: row.tipo_trabajo,
    material: row.material,
    color: row.color_vita || '—',
    piezas:
      row.trabajo_piezas?.length > 0
        ? row.trabajo_piezas.map((p) => String(p.pieza_dental))
        : ['Arcada Completa'],
    estado: row.estado,
    fecha: (row.fecha_ingreso || '').split('T')[0],
    precio: Number(row.precio || 0),
    indicaciones: row.notas || null,
  }
}

const SELECT_TRABAJOS = `
  id, tipo_trabajo, material, color_vita, estado, precio, notas,
  fecha_ingreso, fecha_entrega,
  clinica:clinicas(id, nombre, laboratorio_id),
  paciente:pacientes(id, nombre),
  trabajo_piezas(pieza_dental)
`

/**
 * Devuelve UNA página de órdenes visibles (RLS aplica) + cursor para la siguiente.
 *
 * @param {object} opts
 * @param {number} [opts.limit]      Tamaño de página (default PAGE_SIZE=8).
 * @param {{fecha,id}|null} [opts.cursor]  Cursor de la última fila recibida
 *        (nextCursor de la respuesta anterior). null = primera página.
 * @param {string} [opts.grupo]      Chip activo del dashboard ('all' | 'fija'
 *        | 'grillz' | …). Server-side vía .in('tipo_trabajo', …).
 * @returns {Promise<{orders: Array, nextCursor: object|null, hasMore: boolean}>}
 *
 * DEMO (sin .env): sirve INITIAL_ORDERS por páginas en memoria con el MISMO
 * contrato, para que la UI no sepa si hay backend o no.
 */
export async function fetchOrders({ limit = PAGE_SIZE, cursor = null, grupo = 'all' } = {}) {
  if (!isSupabaseConfigured) {
    // Modo demo: si hay chip activo, filtra igual que lo haría el server
    // (etiquetas del catálogo + legadas vía filterGroupOf).
    const visible = grupo === 'all'
      ? INITIAL_ORDERS
      : INITIAL_ORDERS.filter((o) => filterGroupOf(o.tipo) === grupo)
    const page = paginateList(visible, { cursor, limit })
    return page
  }

  let query = supabase
    .from('trabajos')
    .select(SELECT_TRABAJOS)
    .order('fecha_ingreso', { ascending: false })
    .order('id', { ascending: false }) // desempate estable del cursor

  // Filtro server-side del chip activo: nunca se descargan grupos enteros
  // para filtrar en el navegador.
  if (grupo !== 'all') {
    const tipos = tiposDelGrupo(grupo)
    // Etiquetas legadas que también pertenecen al grupo (compat. órdenes viejas)
    const legacy = { fija: ['Prótesis Fija'], removible: ['Prótesis Removible'], ortodoncia: ['Ortodoncia / Alineadores'] }[grupo] || []
    query = query.in('tipo_trabajo', [...tipos, ...legacy])
  }

  // Cursor keyset: (fecha, id) estrictamente anterior a la última fila
  const filter = cursorFilter(cursor)
  if (filter) query = query.or(filter)

  // Trae limit+1: la fila extra solo existe para saber hasMore sin
  // hacer un COUNT adicional (se descarta antes de mapear).
  query = query.limit(limit + 1)

  const { data, error } = await query
  if (error) throw error

  const hasMore = data.length > limit
  const rows = hasMore ? data.slice(0, limit) : data
  return {
    orders: rows.map(mapTrabajo),
    nextCursor: hasMore ? nextCursor(rows[rows.length - 1]) : null,
    hasMore,
  }
}

/**
 * Contadores del perfil (Órdenes / En curso / Completadas) SIN traer filas:
 * 3 queries `head:true, count:'exact'` — Postgres solo devuelve el número.
 * En demo se calculan sobre INITIAL_ORDERS.
 */
export async function fetchOrderStats() {
  if (!isSupabaseConfigured) {
    return {
      total: INITIAL_ORDERS.length,
      enCurso: INITIAL_ORDERS.filter((o) => ['En Diseño', 'En Fabricación', 'En Proceso'].includes(o.estado)).length,
      completadas: INITIAL_ORDERS.filter((o) => o.estado === 'Entregado' || o.estado === 'Completado').length,
    }
  }

  const count = async (filter) => {
    let q = supabase.from('trabajos').select('id', { count: 'exact', head: true })
    if (filter) q = q.in('estado', filter)
    const { count: n, error } = await q
    if (error) throw error
    return n ?? 0
  }

  const [total, enCurso, completadas] = await Promise.all([
    count(null),
    count(['En Diseño', 'En Fabricación']),
    count(['Entregado']),
  ])
  return { total, enCurso, completadas }
}

/* ------------------------- Crear una orden ---------------------------- */

function tipoArchivo(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (file.type.startsWith('image/')) return 'foto'
  if (file.type === 'application/pdf' || ext === 'pdf') return 'prescripcion'
  if (['stl', 'ply', 'dcm', 'obj'].includes(ext)) return 'escaneo_3d'
  return 'otro'
}

/** Busca el paciente por nombre en el laboratorio; si no existe, lo crea. */
async function ensurePaciente(nombre, clinica) {
  const { data: existentes, error: e1 } = await supabase
    .from('pacientes')
    .select('id')
    .eq('laboratorio_id', clinica.laboratorio_id)
    .ilike('nombre', nombre.trim())
    .limit(1)
  if (e1) throw e1
  if (existentes?.length > 0) return existentes[0].id

  const { data: nuevo, error: e2 } = await supabase
    .from('pacientes')
    .insert({
      laboratorio_id: clinica.laboratorio_id,
      nombre: nombre.trim(),
      creado_por: null,
    })
    .select('id')
    .single()
  if (e2) throw e2
  return nuevo.id
}

export async function createOrder(payload, files = [], clinica = null) {
  if (!isSupabaseConfigured) {
    // Modo mock (sin .env configurado): genera la orden en memoria
    return {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      paciente: payload.paciente,
      clinica: clinica?.nombre || 'Clínica Dental Esthetic',
      tipo: payload.tipo_trabajo,
      material: payload.material,
      color: payload.color,
      piezas: payload.piezas.length > 0 ? payload.piezas : ['Arcada Completa'],
      estado: 'Recibido',
      fecha: new Date().toISOString().split('T')[0],
    }
  }
  if (!clinica?.id || !clinica?.laboratorio_id) {
    throw new Error('El usuario no tiene clínica asignada (miembros_clinica).')
  }

  const pacienteId = await ensurePaciente(payload.paciente, clinica)

  const { data: trabajo, error: e1 } = await supabase
    .from('trabajos')
    .insert({
      laboratorio_id: clinica.laboratorio_id,
      clinica_id: clinica.id,
      paciente_id: pacienteId,
      tipo_trabajo: payload.tipo_trabajo,
      material: payload.material,
      color_vita: payload.color || null,
      notas: payload.indicaciones || null,
      estado: 'Recibido',
    })
    .select('id')
    .single()
  if (e1) throw e1

  if (payload.piezas?.length > 0) {
    const { error: e2 } = await supabase.from('trabajo_piezas').insert(
      payload.piezas.map((p) => ({ trabajo_id: trabajo.id, pieza_dental: Number(p) }))
    )
    if (e2) throw e2
  }

  for (const file of files) {
    const path = `${BUCKET}/${trabajo.id}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { upsert: false })
    if (upErr) throw upErr

    const { error: archErr } = await supabase.from('archivos').insert({
      trabajo_id: trabajo.id,
      nombre_archivo: file.name,
      storage_path: path,
      tipo_archivo: tipoArchivo(file),
    })
    if (archErr) throw archErr
  }

  const { data: full, error: e3 } = await supabase
    .from('trabajos')
    .select(SELECT_TRABAJOS)
    .eq('id', trabajo.id)
    .single()
  if (e3) throw e3
  return mapTrabajo(full)
}
