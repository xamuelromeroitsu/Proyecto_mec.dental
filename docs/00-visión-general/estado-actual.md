# Estado Actual del Proyecto — Snapshot Honesto

**Fecha:** 2026-09-28
**Rama:** `main`
**Último commit:** `3904237 perfil`

---

## ✅ Qué Funciona (Build Verde)

| Área | Estado | Detalle |
|------|--------|---------|
| **Build producción** | ✅ | `npm run build` → 1.73s, 172 KB JS gzip: 54 KB, 39 KB CSS gzip: 6 KB |
| **Dev server** | ✅ | `npm run dev` → HMR funcionando en localhost:5173 |
| **Landing page** | ✅ | Hero, Gallery (Carousel 16 imgs), Services, About, Contact |
| **Auth (mock)** | ✅ | LoginView con validación básica, mock JWT, redirect a Dashboard |
| **Dashboard** | ✅ | Perfil usuario, stats, filtros por tipo, OrderFeed, FAB → NewOrderForm |
| **NewOrderForm** | ✅ | Paciente, tipo/material/color dependientes, Odontograma FDI 32 piezas, file upload mock, submit mock |
| **OrderFeed** | ✅ | Cards con badges estado (Recibido/En Proceso/Completado), tags piezas, empty state |
| **Odontograma** | ✅ | 2 arcadas (sup/inf), toggle selección, contador, limpiar todo |
| **Base de datos** | ✅ | `base_de_datos.sql` — 3 tablas (clientes, trabajos, pagos) + índices |
| **GitHub Pages workflow** | ⚠️ | Build pasa local, **falla en Pages por `base` path** |

---

## ❌ Qué No Existe / Gaps Críticos

| Feature (README) | Estado Real | Gap |
|------------------|-------------|-----|
| **Motor de Cotización** | ❌ No implementado | `quotes.js` no existe, no hay lógica de precios |
| **Pipeline Producción** | ❌ No implementado | Estados hardcodeados, sin transiciones ni notificaciones |
| **Panel Admin Lab** | ❌ No implementado | Sin vista admin, inventario, facturación, reportes |
| **Tests** | ❌ 0 tests | Ni unitarios, ni integración, ni e2e |
| **TypeScript / JSDoc** | ❌ README dice TS, código es `.jsx` | Sin `tsconfig`, JSDoc parcial en hooks |
| **Tailwind CSS** | ❌ README dice Tailwind, usa CSS custom | `styles/variables.css` + CSS modules |
| **Services layer** | ❌ No existe | Mocks en `App.jsx` + `data/initialData.js` |
| **Custom hooks** | ❌ No existe | Lógica inline en componentes |
| **CI/CD** | ❌ No hay workflow | Solo Pages deploy (roto) |
| **ESLint / Prettier** | ❌ No configurado | Sin linting automático |

---

## 📊 Métricas Actuales

| Métrica | Valor | Objetivo |
|---------|-------|----------|
| Cobertura tests | 0% | ≥ 80% statements |
| Bundle JS (gzip) | 54 KB | ≤ 60 KB |
| Bundle CSS (gzip) | 6 KB | ≤ 10 KB |
| Build time | 1.73s | < 10s |
| Lighthouse Perf | — | ≥ 90 |
| JSDoc errors | N/A | 0 |
| ESLint errors | — | 0 |

---

## 🏗️ Arquitectura Actual vs Objetivo

### Actual (simplificada)
```
src/
├── App.jsx                    # Estado global + routing manual
├── domains/
│   ├── auth/LoginView.jsx     # UI + lógica + mock auth
│   ├── dashboard/
│   │   ├── DashboardView.jsx  # Contenedor + estado orders + 2 vistas
│   │   ├── NewOrderForm.jsx   # 239 líneas: UI + estado + validación + files + submit
│   │   ├── OrderFeed.jsx      # Presentacional puro ✅
│   │   └── Odontograma.jsx    # UI + estado selección
│   └── portfolio/components/  # Landing sections (Hero, Gallery, etc.)
├── shared/                    # Header, Carousel ✅
├── data/initialData.js        # Mocks (deberían ir a test/mocks)
└── styles/
```

### Objetivo (Clean Architecture)
```
src/
├── domains/
│   ├── auth/{components,hooks,views}
│   ├── dashboard/{components,hooks,views}
│   └── portfolio/components
├── services/{api,auth,orders,quotes}
├── shared/{Header,Carousel,Loader,utils}
├── test/{mocks,setup,auth,dashboard}
└── styles
```

---

## 🔴 Riesgos Identificados

1. **`NewOrderForm.jsx` (239 líneas)** — God component, difícil de testear, mezclar UI/lógica
2. **Estado en `App.jsx`** — `orders`, `authData`, `carouselImages` acoplados al root
3. **Mocks en `data/`** — No separados de código de producción
4. **Sin `base` en Vite** — GitHub Pages sirve assets en ruta incorrecta
5. **README desactualizado** — Promete TS/Tailwind, features que no existen
6. **Sin tests** — Cualquier refactor rompe sin feedback

---

## 🎯 Próximos Pasos Inmediatos (Sprint 1)

Ver [`../01-planificacion/sprint-actual.md`](../01-planificacion/sprint-actual.md)

1. Crear estructura `docs/` ✅ (este archivo)
2. Instalar testing stack (Vitest + RTL + MSW + JSDOM)
3. Configurar `vitest.config.js` + `test/setup.js` + thresholds
4. Escribir tests para: `LoginView`, `Odontograma`, `OrderFeed`, `DashboardView`, `NewOrderForm` (hooks)
5. Fix GitHub Pages: `vite.config.js` → `base: '/Proyecto_mec.dental/'`
6. Actualizar `readme.md` principal con comandos, estructura real, estado honesto
7. Commit: `feat(test): add Vitest + RTL suite + .gitignore + README docs + Pages fix`