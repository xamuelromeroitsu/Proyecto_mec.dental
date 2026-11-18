# Especificación Técnica - Kamila Lab

## Arquitectura General (v2 — Backend Único Multi-Sitio)

```
┌─────────────────────────────────────────────────────────────────┐
│  N PÁGINAS (agencia) — cada una su propio front React/Vite      │
│  Landing + Portal Odontólogo + Portal Técnico + Vista Paciente  │
│  (solo cambian VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)      │
└──────────────────────────┬──────────────────────────────────────┘
                           │ supabase-js (HTTPS / PostgREST)
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE (backend único)                     │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  ┌──────────────────┐  │
│  │   Auth   │  │PostgREST │  │ Storage │  │ Edge Functions   │  │
│  │(JWT/OAuth)│ │(auto API)│  │(archivos)│  │(signup paciente, │  │
│  └──────────┘  └──────────┘  └─────────┘  │ pagos, emails)   │  │
│                           │               └──────────────────┘  │
│                           ▼                                     │
│  ┌───────────────────────────────────────────────┐              │
│  │   PostgreSQL + ROW LEVEL SECURITY (aislamiento │              │
│  │   por laboratorio/sitio — 13 tablas, esquema v2)│             │
│  └───────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend (Actual - Sprint 1)

### Stack
| Tech | Versión | Propósito |
|------|---------|-----------|
| React | 18.2 | UI library |
| Vite | 5.4 | Build tool, dev server, test runner |
| Vitest | 2.1 | Unit/Integration testing |
| React Testing Library | 16.3 | Component testing |
| MSW | 2.15 | API mocking for tests |
| JSDOM | 30.1 | DOM environment for tests |

### Estructura de Carpetas (`src/`)
```
src/
├── main.jsx                    # Entry point
├── App.jsx                     # Root: routing manual + estado global
├── domains/
│   ├── auth/
│   │   ├── components/LoginForm.jsx
│   │   ├── hooks/useAuth.js
│   │   └── views/LoginView.jsx
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── NewOrderForm/ (FormFields, FileUpload, FormActions, index)
│   │   │   ├── OrderFeed/
│   │   │   └── Odontograma/
│   │   ├── hooks/
│   │   │   ├── useOrders.js
│   │   │   ├── useNewOrderForm.js
│   │   │   └── useOdontograma.js
│   │   └── views/DashboardView.jsx
│   └── portfolio/
│       └── components/ (Hero, Gallery, Services, About, Contact)
├── services/ (planeado)
│   ├── api.js
│   ├── auth.js
│   ├── orders.js
│   └── quotes.js
├── shared/
│   ├── Header/
│   ├── Carousel/
│   ├── Loader/
│   └── utils/
├── styles/
│   ├── variables.css    # Design tokens (colores, spacing, typography)
│   └── base.css         # Reset, globals, utilities
└── test/
    ├── setup.js
    ├── mocks/handlers.js
    └── {auth,dashboard}/*.test.jsx
```

### Patrones de Componentes
| Tipo | Ubicación | Responsabilidad |
|------|-----------|-----------------|
| **Presentacional** | `domains/*/components/` | Recibe props, retorna JSX, sin lógica de negocio |
| **Hook (lógica)** | `domains/*/hooks/use*.js` | Estado, efectos, validaciones, llamadas API |
| **View / Container** | `domains/*/views/*.jsx` | Orquesta hooks + componentes, routing interno |

### Estado Global (MVP)
- `App.jsx`: `currentView`, `authData`, `orders`, `carouselImages`
- Futuro: React Context + useReducer o Zustand para orders/auth

### Estilos
- **CSS Custom Properties** en `styles/variables.css` (design tokens)
- **BEM modificado** para clases: `.block__element--modifier`
- **Mobile-first** con breakpoints: 640px, 1024px, 1280px
- Sin Tailwind (README actualizado)

---

## Backend (Supabase — reemplaza al backend Node planeado)

No hay servidor propio: PostgREST expone la API automáticamente sobre las
tablas y **RLS decide qué ve cada rol**. Lo que antes eran endpoints REST es
ahora:

#### Auth (Supabase Auth)
| Antes (endpoint) | Ahora (Supabase) |
|--------|----------|
| POST `/api/auth/login` | `supabase.auth.signInWithPassword()` |
| POST `/api/auth/refresh` | Automático (supabase-js renueva el JWT) |
| GET `/api/auth/me` | `supabase.auth.getUser()` + fila de `usuarios` |
| POST `/api/auth/logout` | `supabase.auth.signOut()` |
| Google Auth | `supabase.auth.signInWithOAuth({ provider: 'google' })` |

#### Datos (PostgREST — auto-generado sobre el esquema v2)
| Antes (endpoint) | Ahora (tabla + RLS) |
|--------|----------|
| GET/POST `/api/orders` | `trabajos` — SELECT/INSERT con policies (tecnico/odontologo/paciente) |
| GET `/api/orders/:id` | `trabajos` + `trabajo_piezas` + `archivos` (policies heredadas) |
| PATCH `/api/orders/:id/status` | UPDATE `trabajos.estado` — trigger valida transición + audita |
| GET `/api/orders/:id/files` | `archivos` + bucket `trabajos-archivos` |
| GET `/api/quotes/materials` | Fase 2: tabla `materiales` (precios base por lab) |
| Admin users/billing | Panel del técnico: `clinicas`, `miembros_clinica`, `pagos` (RLS por lab) |

#### Edge Functions (lógica que NO va en el front)
- `registro-paciente`: lee el dominio de origen (`sitios`) → busca/crea
  `paciente` → INSERT `vinculos_paciente` con el técnico de esa página (R2/R3)
- `alta-cliente-agencia`: INSERT `laboratorios` + `sitios` + `tecnico` en un paso (usa `service_role`)
- `notificaciones`: emails/webhooks al cambiar `trabajos.estado`

---

### Modelo de Datos (PostgreSQL — Supabase, multi-sitio)

> **Esquema v2 (multi-tenant):** soporta N laboratorios, N técnicos, N páginas
> (sitios) con UN solo backend. Detalle completo en `base_de_datos.sql` y en el
> [ADR 004](../02-decisiones-tecnicas/004-schema-multisitio.md).

**Jerarquía de tenancy:**
```
laboratorios (raíz)
 ├── sitios            (1 página vendida = 1 fila, dominio + técnico por defecto)
 ├── tecnicos          (id, correo, cargo "Técnico Medio en Mecánica Dental")
 ├── clinicas ── miembros_clinica ── usuarios (odontólogos)
 └── pacientes ── vinculos_paciente (paciente ↔ técnico ↔ sitio)
       └── trabajos → trabajo_piezas, pagos, archivos, historial_estados
```

**Tablas principales (todas UUID PK + FK indexadas):**

| Tabla | PK / FK | Rol |
|---|---|---|
| `laboratorios` | UUID PK, `slug` UNIQUE | Raíz de tenancy (1 backend, N labs) |
| `usuarios` | UUID PK FK→auth.users | Perfil de identidad (única FK a Auth) |
| `tecnicos` | UUID PK FK→usuarios | Tabla global del técnico (email, cargo) |
| `sitios` | UUID PK, `dominio` UNIQUE | Una fila por cada página de la agencia |
| `clinicas` | UUID PK FK→laboratorios | Entidad separada del usuario |
| `miembros_clinica` | PK compuesta (clinica, usuario) | N:M odontólogos↔clínicas |
| `pacientes` | UUID PK FK→laboratorios | Entidad real del paciente (antes era VARCHAR) |
| `vinculos_paciente` | UUID PK, `UNIQUE(usuario_id, tecnico_id)` | Registro del paciente en una página = acceso solo a ese técnico |
| `trabajos` | UUID PK + 5 FKs | Orden de producción, ENUM `estado_trabajo` con transiciones válidas |
| `trabajo_piezas` | PK compuesta (trabajo, pieza FDI) | N piezas por trabajo |
| `pagos` | UUID PK | Inmutable (sin UPDATE/DELETE) |
| `archivos` | UUID PK FK→trabajos | **Solo enlaces** (nunca el binario): `storage_path` → bucket `trabajos-archivos`, `url_externa` → plataforma externa (Cloudinary/Drive) |
| `historial_estados` | UUID PK FK→trabajos | Auditoría automática vía trigger |

**Reglas de negocio:**
- Un técnico tiene muchos pacientes y clínicas (aisladas por `laboratorio_id`).
- Un paciente registrado en la página A solo accede al técnico de esa página;
  registrarse en la página B crea otro vínculo con otro técnico.
- El técnico crea/gestiona pacientes aunque nunca se hayan registrado.

**Seguridad — Row Level Security (RLS):** todas las tablas tienen RLS activo.
Helper functions `SECURITY DEFINER` (`es_tecnico()`, `es_odontologo_clinica()`,
`tiene_vinculo_activo()`, `es_trabajo_visible()`) evitan recursión en policies.
Triggers: perfil automático al signup (`handle_new_user`), validación de
transiciones de estado, `updated_at`, e historial automático.

**Índices:** todos los FKs indexados + compuestos clave:
`trabajos(laboratorio_id, estado)`, `pagos(laboratorio_id, fecha_pago DESC)`,
`vinculos_paciente(usuario_id)`, `miembros_clinica(usuario_id)`,
UNIQUE en `laboratorios.slug`, `sitios.dominio`, `usuarios.email`, `tecnicos.email`.

---

## Testing Strategy

### Pirámide de Tests
```
           ┌─────────────┐
           │   E2E (0)   │  ← Fase 3: Playwright
          ┌─────────────┐
         │ Integration │  ← MSW + RTL: flujos completos
        ┌───────────────┐
       │    Unit       │  ← Vitest: hooks, utils, componentes puros
      ┌─────────────────┐
```

### Cobertura Objetivo
| Tipo | Threshold |
|------|-----------|
| Statements | ≥ 80% |
| Branches | ≥ 70% |
| Functions | ≥ 80% |
| Lines | ≥ 80% |

### Convenciones
- Archivos: `*.test.jsx` (componentes), `*.test.js` (hooks/utils)
- Ubicación: `test/` mirror de `src/` + `mocks/`
- Nombrado: `describe('ComponentName', () => { it('should...', () => {...}) })`
- AAA: Arrange, Act, Assert
- Mocks en `test/setup.js` + MSW handlers

---

## CI/CD Pipeline (GitHub Actions)

### Workflow: CI (`.github/workflows/ci.yml`)
```yaml
jobs:
  lint:
    runs: npm run lint
  typecheck:
    runs: npm run typecheck  # JSDoc validation
  test:
    runs: npm run test:coverage
    needs: [lint, typecheck]
  build:
    runs: npm run build
    needs: test
  bundle-size:
    runs: check dist/assets/*.js < 60KB gzip
    needs: build
```

### Workflow: Deploy Pages (`.github/workflows/pages.yml`)
```yaml
jobs:
  build:
    runs: npm ci && npm run build
  deploy:
    uses: actions/deploy-pages@v4
    needs: build
    permissions: pages:write, id-token:write
```

---

## Configuración Vite (`vite.config.js`)

```js
export default defineConfig({
  plugins: [react()],
  base: '/Proyecto_mec.dental/',  // GitHub Pages subpath
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.js',
    coverage: {
      provider: 'v8',
      thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 }
    }
  }
})
```

---

## Variables de Entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (backend único de la agencia) | Sí |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anon — RLS define qué datos ve cada página | Sí |
| `SUPABASE_SERVICE_ROLE_KEY` | Solo backend/edge functions — bypasea RLS. **Nunca en el front** | Sí (server) |
| `VITE_APP_NAME` | Nombre app para título/meta | No |

---

## Seguridad
- **Supabase Auth + RLS** — el aislamiento entre laboratorios/sitios lo aplica la base de datos, no el front
- JWT de Supabase en memoria (no localStorage) — MVP
- HTTPS obligatorio en prod
- Validación server-side: CHECK constraints + triggers en todas las tablas (transiciones de estado, montos, piezas FDI)
- Sin políticas DELETE en trabajos/pagos: borrado solo vía `service_role` (auditoría)
- Sanitización de nombres de archivo subidos (bucket privado `trabajos-archivos`)

---

## Performance Targets
| Métrica | Target |
|---------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Bundle JS (gzip) | ≤ 60 KB |
| Bundle CSS (gzip) | ≤ 10 KB |
| Build time | < 10s |
| Test suite | < 30s |