import { supabase, isSupabaseConfigured } from './supabase'
import { INITIAL_ORDERS } from '../data/initialData'

/**
 * Servicio de órdenes de trabajo (tabla `trabajos` + `trabajo_piezas`).
 * RLS decide automáticamente qué órdenes ve cada usuario:
 *  - odontólogo → las de su clínica (miembros_clinica)
 *  - técnico    → las de su laboratorio completo
 *  - paciente   → las de sus vínculos activos
 */

const BUCKET = 'trabajos-archivos'

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

/** Lista de órdenes visibles para el usuario actual (RLS aplica). */
export async function fetchOrders() {
  if (!isSupabaseConfigured) return INITIAL_ORDERS

  const { data, error } = await supabase
    .from('trabajos')
    .select(SELECT_TRABAJOS)
    .order('fecha_ingreso', { ascending: false })

  if (error) throw error
  return data.map(mapTrabajo)
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
