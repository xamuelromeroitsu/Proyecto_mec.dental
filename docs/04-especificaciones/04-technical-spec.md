# Especificación Técnica - Kamila Lab

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                       │
│  React 18 + Vite 5  │  CSS Custom Props  │  Vitest + RTL   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY / LOAD BALANCER            │
│                     (NGINX / Cloudflare)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  AUTH SVC   │ │ ORDER SVC   │ │ QUOTE SVC   │
    │  (Node.js)  │ │  (Node.js)  │ │  (Node.js)  │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                ┌─────────────────────┐
                │   POSTGRESQL DB     │
                │   (Supabase/Managed)│
                └─────────────────────┘
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

## Backend (Planeado - Node.js)

### API REST Endpoints

#### Auth
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Email + pass → JWT (24h) |
| POST | `/api/auth/refresh` | Refresh token → nuevo JWT |
| GET | `/api/auth/me` | Validar JWT → user profile |
| POST | `/api/auth/logout` | Invalidar refresh token |

#### Orders
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/orders` | Listar (query: clinic_id, status, type, page, limit) |
| POST | `/api/orders` | Crear orden (multipart/form-data para archivos) |
| GET | `/api/orders/:id` | Detalle orden + archivos |
| PATCH | `/api/orders/:id/status` | Cambiar estado (validar transiciones) |
| GET | `/api/orders/:id/files` | Descargar archivos adjuntos |

#### Quotes (Fase 2)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/quotes/calculate` | Body: {type, material, pieces[]} → {price, estimatedDate} |
| GET | `/api/quotes/materials` | Lista materiales con precios base |

#### Admin (Fase 3)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET/POST | `/api/admin/materials` | CRUD inventario |
| GET | `/api/admin/billing` | Reportes facturación (query: clinic, from, to) |
| GET/POST/PATCH | `/api/admin/users` | Gestión clínicas/odontólogos |

---

### Modelo de Datos (PostgreSQL)

```sql
-- Ver base_de_datos.sql para schema completo
-- Tablas principales:

clientes (
  id SERIAL PK,
  nombre_odontologo VARCHAR(255),
  clinica VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  created_at TIMESTAMP
);

trabajos (
  id SERIAL PK,
  cliente_id INT FK → clientes.id,
  paciente VARCHAR(100),
  tipo_trabajo VARCHAR(100),
  material VARCHAR(100),
  pieza_dental INT,           -- FDI notation
  color_vita VARCHAR(10),
  estado VARCHAR(50) DEFAULT 'Pendiente',
  precio DECIMAL(10,2),
  fecha_ingreso TIMESTAMP,
  fecha_entrega TIMESTAMP
);

pagos (
  id SERIAL PK,
  cliente_id INT FK,
  trabajo_id INT FK NULL,
  monto DECIMAL(10,2),
  metodo_pago VARCHAR(100),
  fecha_pago TIMESTAMP
);

-- Índices: idx_clientes_email, idx_trabajos_cliente, idx_trabajos_estado
```

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
| `VITE_API_BASE_URL` | Base URL del backend (ej. `https://api.kamilalab.com`) | Sí (prod) |
| `VITE_APP_NAME` | Nombre app para título/meta | No |

---

## Seguridad
- JWT en memoria (no localStorage) — MVP
- HTTPS obligatorio en prod
- CORS restringido a dominio frontend
- Rate limiting en auth endpoints
- Validación server-side de todos los inputs
- Sanitización de nombres de archivo subidos

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