# ADR 005: Storage de Archivos — Binarios fuera de la Base de Datos

**Fecha:** 2026-11-15
**Estado:** Aceptado
**Contexto:** Los trabajos necesitan adjuntar imágenes, fotos clínicas, radiografías, escaneos 3D y prescripciones. Guardar esos binarios en PostgreSQL (columna `BYTEA`) inflaría la base de datos, ralentizaría backups y consultas. La tabla `archivos` debe quedar liviana.

## Decisión

La tabla `archivos` **nunca guarda el archivo en sí** — solo guarda **enlaces**:

```
┌───────────────────────┐         ┌─────────────────────────────────┐
│  PostgreSQL (liviana) │  enlaza │  DÓNDE VIVE EL BINARIO          │
│  archivos             │ ──────► │  Opción A: Supabase Storage     │
│  ├─ storage_path      │         │    bucket 'trabajos-archivos'   │
│  ├─ url_externa       │         │  Opción B: plataforma externa   │
│  └─ tipo_archivo      │         │    (Cloudinary, Drive, S3...)   │
└───────────────────────┘         └─────────────────────────────────┘
CHECK: storage_path IS NOT NULL OR url_externa IS NOT NULL
```

- **`storage_path`** — ruta dentro del bucket privado `trabajos-archivos`.
- **`url_externa`** — link público de otra plataforma; el técnico pega el link y no se sube nada (útil para archivos muy pesados o ya alojados).
- **`tipo_archivo`** — `CHECK` restringido a: `prescripcion` | `foto` | `radiografia` | `escaneo_3d` | `otro`.

## Opción A — Supabase Storage (recomendada)

### Configuración (ya incluida en `base_de_datos.sql`)
- Bucket **privado** (`public = false`): `trabajos-archivos`
- Convención de rutas: **`trabajos-archivos/{trabajo_id}/{nombre_archivo}`**
- Las policies `bucket_select` / `bucket_insert` / `bucket_delete` validan, mediante la ruta del archivo (`storage.foldername(name)[2]`), si el usuario tiene permiso sobre **ese trabajo específico** antes de permitir subir o descargar. Sin permiso sobre el trabajo → sin acceso al archivo, aunque conozca la ruta.

### Subir desde el front
```js
// 1. Subir el binario al bucket (nunca a la tabla)
const path = `trabajos-archivos/${trabajoId}/${file.name}`
const { error } = await supabase.storage
  .from('trabajos-archivos')
  .upload(path, file, { upsert: false })

// 2. Registrar SOLO el enlace en la tabla
await supabase.from('archivos').insert({
  trabajo_id: trabajoId,
  nombre_archivo: file.name,
  storage_path: path,
  tipo_archivo: 'foto',            // prescripcion|foto|radiografia|escaneo_3d|otro
})
```

### Descargar (URL firmada — el bucket es privado)
```js
const { data } = await supabase.storage
  .from('trabajos-archivos')
  .createSignedUrl(archivo.storage_path, 60 * 10)  // expira en 10 min
// data.signedUrl → link temporal para <img> o descarga
```

## Opción B — Plataforma externa (Cloudinary, Google Drive, S3…)

1. El técnico sube el archivo fuera de la app (o el front lo sube a la API de la plataforma).
2. Se registra únicamente el link:
```js
await supabase.from('archivos').insert({
  trabajo_id: trabajoId,
  nombre_archivo: 'radiografia-panoramica.jpg',
  url_externa: 'https://res.cloudinary.com/.../radiografia-panoramica.jpg',
  tipo_archivo: 'radiografia',
})
```
⚠️ Los enlaces externos **no están cubiertos por RLS** — quien tenga el URL ve el archivo. Usar solo con URLs firmadas/privadas de la plataforma.

## Validaciones

| Regla | Implementación |
|---|---|
| Al menos un enlace | `CHECK ck_archivos_enlace` en la tabla |
| Tipos permitidos | `CHECK` sobre `tipo_archivo` (5 valores) |
| MIME permitidos (front, antes de subir) | `image/jpeg`, `image/png`, `image/webp` (fotos) · `application/pdf` (prescripciones) · `.stl`, `.ply`, `.dcm` (escaneos 3D / radiografías) |
| Tamaño máximo | 50 MB por archivo (validar en el front + configurar límite en el bucket) |
| Permiso de acceso | Policies de storage vía ruta `{trabajo_id}` |

## Consecuencias
- ✅ PostgreSQL liviana: backups rápidos, consultas siempre rápidas
- ✅ Flexibilidad: Supabase Storage o cualquier plataforma externa, sin cambiar el esquema
- ✅ Acceso a archivos controlado por las mismas policies de trabajos (RLS)
- ⚠️ La tabla es solo un índice: si se borra el archivo del bucket sin borrar la fila, queda un enlace roto (borrar en cascada siempre vía `archivos.trabajo_id`)
- ⚠️ Enlaces externos sin firma quedan accesibles para quien tenga el URL

## Referencias
- [`base_de_datos.sql`](../../../base_de_datos.sql) — tabla `archivos` + sección STORAGE con las policies
- [ADR 004 — Esquema v2 Multi-Sitio](004-schema-multisitio.md)
