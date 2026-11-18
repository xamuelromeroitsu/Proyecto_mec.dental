# ADR 006: Paginación Keyset Server-Side para el Feed de Órdenes

**Fecha:** 2026-11-17
**Estado:** Aceptado
**Contexto:** El dashboard traía TODA la tabla `trabajos` en cada login (`fetchOrders()` sin límite) y filtraba los chips en el cliente (`orders.filter(...)`). Con el modelo de agencia (ADR 004: cada página vendida = un laboratorio más escribiendo en la misma BD), eso escala mal: miles de órdenes saturarían red, memoria del navegador y el tiempo hasta el primer render. Se necesitaba paginación ANTES de que la base crezca, no después.

## Decisión

### 1. Keyset/cursor compuesto `(fecha_ingreso, id)` — NO offset

El cursor es la posición de la última fila recibida; la página siguiente pide "todo lo estrictamente anterior a esa posición":

```
WHERE (fecha_ingreso, id) < (cursor.fecha, cursor.id)
  → fecha < c.fecha OR (fecha = c.fecha AND id < c.id)
```

- **Fecha ordena** (el feed se muestra DESC por fecha), **id desempata** filas con idéntica fecha (dos órdenes insertadas en el mismo instante).
- El `id` es OBLIGATORIO en el cursor: solo por fecha, al saltar de página se perderían/saltarían todas las filas que comparten esa fecha.

Para que sea O(log n) y no un scan secuencial, exige este índice (único paso pendiente en Supabase):

```sql
CREATE INDEX idx_trabajos_keyset ON trabajos (fecha_ingreso DESC, id DESC);
```

### 2. Arquitectura en capas (una responsabilidad por capa)

```
┌─ OrderFeed.jsx ──────────── PRESENTACIÓN ─┐  agrupa por mes, pinta el botón
│                                            │  No sabe de cursores ni de Supabase.
├─ DashboardView.jsx ───────── CONTROLADOR ─┤  chips → setGroup(); consume useSession()
│
├─ SessionContext.jsx ──── MÁQUINA DE ESTADOS ┤  { orders, hasMore, loading,
│                                              loadMore(), setGroup(), addOrder(),
│                                              stats } + guard anti-carrera
├─ services/orders.js ──── ACCESO A DATOS ────┤  ÚNICO que habla con Supabase:
│                                              construye la query, mapea filas
└─ lib/pagination.js ──── FUNCIONES PURAS ────┘  cursorFilter(), nextCursor(),
   paginateList(), PAGE_SIZE=8 — cero React, cero Supabase
```

**Por qué esta forma (y no otra):**

| Capa | Qué aísla | Consecuencia práctica |
|------|-----------|----------------------|
| `lib/` pura | La MATEMÁTICA del cursor | Se testa sin React ni BD (18 casos borde en `test/lib/pagination.test.js`); reutilizable si otra vista necesita paginar (ej. historial de pagos) |
| `services/` | Supabase vs modo demo | Sin `.env`, `paginateList()` sirve `INITIAL_ORDERS` en páginas con el MISMO contrato — la UI es idéntica con y sin backend; al conectar Supabase no se toca una línea de UI |
| `app/` contexto | La MÁQUINA DE ESTADOS | Ningún componente duplica lógica de "acumular páginas"; el guard `requestId` descarta respuestas viejas si el chip cambió en vuelo (condición de carrera invisible para las vistas) |
| `domains/` vista | La PRESENTACIÓN | Cambiar el diseño del feed no toca datos; cambiar la BD no toca el diseño |

### 3. Filtro de chips SERVER-SIDE

El chip activo se traduce a `.in('tipo_trabajo', [...tipos, ...legados])` en la query: el navegador nunca descarga un grupo entero para filtrarlo localmente. Las etiquetas legadas (`'Prótesis Removible'`, etc.) se mapean en el servicio, no en la vista.

### 4. Stats desacopladas del feed (`fetchOrderStats`)

Los contadores del perfil (Órdenes/En curso/Completadas) vienen de 3 `COUNT head:true, count:'exact'` — Postgres devuelve el número sin filas. Necesarios precisamente PORQUE hay paginación: con 8 filas en pantalla, `orders.length` ya no es "el total".

### 5. "Cargar más" explícito (no scroll infinito)

Botón al final del feed; el usuario decide si baja el histórico. Los headers por mes ("Junio 2026" + contador) actúan como anclas visuales.

## ¿Por qué keyset es la mejor forma aquí?

Comparación de las 4 formas de paginar un feed ordenado por fecha:

| Criterio | **Keyset compuesto (elegido)** | OFFSET | Cursor solo `id` | Cursor solo `fecha` |
|---|---|---|---|---|
| Costo página N | O(log n) con índice | O(n): Postgres recorre las N filas previas SIEMPRE | O(log n) | O(log n) |
| Estable ante inserciones | ✅ el cursor ancla a una fila real | ❌ se "corren" las filas → duplicados y saltos | ✅ | ⚠️ pierde filas con la misma fecha |
| Respeta el orden visible (fecha DESC) | ✅ | ✅ | ❌ tendría que ordenarse por id (el feed ya no es cronológico) | ✅ |
| Salto a página arbitraria (1,2,3…) | ❌ solo avanza | ✅ | ❌ | ❌ |
| Requiere índice específico | ✅ (1 índice) | no | PK existente | índice de fecha |

El trade-off aceptado es el de la última fila: **con keyset no hay "ir a página 7"**. Irrelevante para este feed — la interacción natural de un laboratorio es "ver lo reciente" y "bajar un poco más", no saltar al medio del histórico. Si algún día se necesita paginación por números (ej. panel de facturación), offset es aceptable ALLÍ porque ese listado se usa distinto.

## Alternativas Consideradas

| Opción | Pros | Contras |
|--------|------|---------|
| **Keyset compuesto + capas (elegido)** | Costo constante por página; estable ante inserciones; testeable sin React; demo y producción comparten contrato | Índice obligatorio; no hay salto a página arbitraria |
| Seguir trayendo todo + filtrar en cliente | Código actual sin cambios | O(n) en cada login; memoria del navegador; el filtro en cliente exige "todo"; insostenible con N laboratorios |
| OFFSET + LIMIT (paginación clásica) | Familiar; salto a página arbitraria; sin índice especial | O(n) por página profunda; inestable ante INSERTs concurrentes (duplicados/saltos entre páginas) |
| Scroll infinito (IntersectionObserver) | UX "moderna", sin clicks | Cargas accidentales al scrollear; memoria crece sin control; inaccesible para lectores de pantalla; difícil volver arriba con contexto; el usuario pierde la noción de cuánto histórico descargó |
| Cursor solo por `id` (seek por PK) | Sin índice nuevo (usa la PK) | El feed tendría que ordenarse por id para ser consistente — deja de ser cronológico |
| GraphQL Relay Connections / UTC-based cursor | Estándar industrial para cursores | Overkill: introduce GraphQL o una capa de serialización extra para un solo feed |
| Materialized view / tabla resumen por mes | Lecturas ultrarrápidas de conteos | Resuelve stats (que ya son baratos con COUNT); no resuelve el feed; añade refrescos |

## Consecuencias

- ✅ Cada página cuesta lo mismo (8 filas + 1 para detectar `hasMore` sin COUNT extra)
- ✅ Insertar una orden mientras alguien pagina NO corrompe el feed (cursor anclado a fila real)
- ✅ La orden nueva se inserta en cabeza en memoria (`addOrder`) y `stats.total` sube en 1 — sin re-descargar la página 1
- ✅ Modo demo (sin `.env`) Ejercita EXACTAMENTE el mismo contrato `{orders, nextCursor, hasMore}` — los tests de UI no saben si hay backend
- ✅ 106/106 tests: matemática del cursor (casos borde: cursor corrupto → null sin crash), máquina de estados, feed por meses, regresión de chips legados
- ✅ **Índice keyset incluido en `base_de_datos.sql`** (`idx_trabajos_keyset`): si la BD de Supabase ya existe, correr SOLO esa línea en el SQL Editor (no re-ejecutar el script completo)
- ⚠️ El guard anti-carrera descarta respuestas viejas silenciosamente (por diseño); si se agregan más fuentes de recarga, mantener el mismo patrón `requestId`
- ⚠️ Las etiquetas legadas de tipos están hardcoded en el servicio (mapa `legacy`); si el catálogo crece, mover a `lib/workTypes` para tener UNA sola fuente

## Referencias

- [`src/lib/pagination.js`](../../../src/lib/pagination.js) — matemática del cursor + nota del índice SQL
- [`src/services/orders.js`](../../../src/services/orders.js) — fetchOrders/fetchOrderStats
- [`src/app/SessionContext.jsx`](../../../src/app/SessionContext.jsx) — máquina de estados del feed
- [`src/domains/dashboard/OrderFeed/OrderFeed.jsx`](../../../src/domains/dashboard/OrderFeed/OrderFeed.jsx) — headers por mes + botón
- Tests: `test/lib/pagination.test.js`, `test/dashboard/OrderFeedPaginated.test.jsx`, `test/dashboard/WorkTypes.test.jsx`
- [ADR 002 — Services Layer](002-services-layer.md) — por qué las vistas no llaman a Supabase
- [ADR 004 — Esquema Multi-Sitio](004-schema-multisitio.md) — el contexto de escala que motivó esto
