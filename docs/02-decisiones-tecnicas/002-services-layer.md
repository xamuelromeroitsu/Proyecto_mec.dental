# ADR 002: Services Layer — Capa API Centralizada

**Fecha:** 2026-09-28
**Estado:** Aceptado
**Contexto:** Los mocks y llamadas a API están dispersos en `App.jsx` y componentes. Se necesita una capa única para: baseURL, auth headers, manejo de errores, interceptores, tipado.

## Decisión
Crear `src/services/` con:
- `api.js` — Cliente HTTP base (fetch wrapper + interceptors)
- `auth.js` — login, me, refresh, logout
- `orders.js` — CRUD órdenes + archivos
- `quotes.js` — Motor de cotización

## Alternativas Consideradas

| Opción | Pros | Contras |
|--------|------|---------|
| **Services layer** (elegido) | Separación concerns, testeable, reutilizable, tipado central | Un poco más de boilerplate |
| **Llamadas directas en hooks/componentes** | Simple al inicio | Acoplamiento, duplicación, difícil testear |
| **React Query / TanStack Query** | Cache, dedup, retry, devtools | Dependencia extra, overkill para MVP sin backend real |
| **Axios instance global** | Interceptores built-in | Bundle extra, fetch nativo suficiente |

## Justificación
- **Fetch nativo** + wrapper ligero = 0 dependencias extra
- **Interceptores manuales** para: auth header, 401→refresh→retry, logging, error normalization
- **Separación por dominio** (auth, orders, quotes) = SRP
- **Fácil mockear** en tests (MSW intercepta a nivel red, o mock del módulo)

## Consecuencias
- ✅ Un solo lugar para cambiar baseURL, headers, error handling
- ✅ Tests unitarios de servicios sin renderizar componentes
- ✅ Migración a React Query trivial si se necesita cache después
- ⚠️ Boilerplate inicial (~100 líneas en `api.js`)
- ⚠️ Debe mantenerse sincronizado con OpenAPI spec del backend

## Estructura `api.js`
```js
// src/services/api.js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  // Auth interceptor
  const token = getAccessToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })

  // 401 → refresh token → retry once
  if (res.status === 401 && !options._retry) {
    await refreshToken()
    return request(endpoint, { ...options, _retry: true })
  }

  if (!res.ok) throw new ApiError(res.status, await res.json())
  return res.json()
}

export const api = { get, post, patch, del: del }
```

## Referencias
- [Technical Spec](../04-especificaciones/04-technical-spec.md#backend-planeado---nodejs)
- [Implementation Plan](../04-especificaciones/05-implementation-plan.md#fase-1-refactor-core--motor-cotización)