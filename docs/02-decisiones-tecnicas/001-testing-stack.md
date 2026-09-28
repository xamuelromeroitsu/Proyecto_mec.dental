# ADR 001: Testing Stack — Vitest + React Testing Library + MSW + JSDOM

**Fecha:** 2026-09-28
**Estado:** Aceptado
**Contexto:** El proyecto no tenía tests. Se necesita una estrategia de testing moderna, rápida y compatible con Vite.

## Decisión
Usar **Vitest** como test runner nativo de Vite, **React Testing Library** para testing de componentes, **MSW (Mock Service Worker)** para interceptar requests HTTP, y **JSDOM** como entorno DOM.

## Alternativas Consideradas

| Opción | Pros | Contras |
|--------|------|---------|
| **Jest + RTL** | Maduro, gran comunidad | Config extra para Vite, transformaciones lentas |
| **Vitest + RTL** (elegido) | Nativo Vite, ESM, HMR en tests, misma config que dev | Más nuevo, menos plugins |
| **Cypress/Playwright** solo E2E | Tests reales en browser | Lento, flaky, no unitario |
| **Jest + Enzyme** | Legacy | Enzyme deprecated, no React 18 |

## Justificación
- **Vitest** comparte config con Vite (`vite.config.js`), cero config extra
- **RTL** fomenta testing desde la perspectiva del usuario (accesibilidad incluida)
- **MSW** intercepta `fetch`/`axios` a nivel red — tests de integración realistas sin backend
- **JSDOM** ligero, corre en Node, suficiente para unit/integration

## Consecuencias
- ✅ Tests rápidos (< 1s unit, < 5s integración)
- ✅ Misma config TypeScript/JSX que la app
- ✅ MSW handlers reutilizables en dev (mock API local)
- ⚠️ JSDOM no es browser real — algunos APIs faltan (layout, scroll, IntersectionObserver)
- ⚠️ MSW requiere setup en `test/setup.js` y service worker en `public/` para dev

## Implementación
```js
// vite.config.js
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: './test/setup.js',
  coverage: { thresholds: { statements: 80, branches: 70, functions: 80, lines: 80 } }
}
```

```js
// test/setup.js
import '@testing-library/jest-dom'
import { vi } from 'vitest'
vi.useFakeTimers()
// Mock Font Awesome, etc.
```

## Referencias
- [Vitest Guide](../03-guias/testing-guide.md)
- [Vitest Config](https://vitest.dev/config/)
- [MSW Docs](https://mswjs.io/docs/)