# Sprint Actual — Testing + Refactor + Docs + Pages Fix

**Fechas:** 2026-09-28 → 2026-10-04 (1 semana)
**Objetivo:** Base de testing sólida, docs vivas, deploy funcionando, README honesto
**Definición de Done:** Todos los checks CI verdes + cobertura ≥ 80% + Pages deploy OK

---

## 📋 Backlog del Sprint (Priorizado)

| # | Tarea | Tipo | Estimación | Estado | Dependencias |
|---|-------|------|------------|--------|--------------|
| 1 | Crear estructura `docs/` | Docs | 30 min | ✅ Done | — |
| 2 | Instalar testing stack | Setup | 15 min | 🔄 En progreso | — |
| 3 | Configurar `vitest.config.js` + `test/setup.js` | Config | 30 min | ⏳ Pendiente | 2 |
| 4 | Escribir tests: `Odontograma` (unitario puro) | Test | 45 min | ⏳ Pendiente | 3 |
| 5 | Escribir tests: `OrderFeed` (presentacional) | Test | 30 min | ⏳ Pendiente | 3 |
| 6 | Escribir tests: `LoginView` (form + async) | Test | 45 min | ⏳ Pendiente | 3 |
| 7 | Extraer `useNewOrderForm` hook + test | Refactor + Test | 90 min | ⏳ Pendiente | 3 |
| 8 | Escribir tests: `DashboardView` (integración ligera) | Test | 45 min | ⏳ Pendiente | 3, 7 |
| 9 | Fix GitHub Pages: `base` path en `vite.config.js` | Fix | 15 min | ⏳ Pendiente | — |
| 10 | Crear `.github/workflows/ci.yml` | CI | 45 min | ⏳ Pendiente | 3 |
| 11 | Actualizar `readme.md` principal | Docs | 30 min | ⏳ Pendiente | 1, 9 |
| 12 | Crear `docs/05-evidencia/metricas-objetivo.md` | Docs | 20 min | ⏳ Pendiente | — |
| 13 | Commit + Push + Verificar Pages | Deploy | 15 min | ⏳ Pendiente | 9-12 |

**Total estimado:** ~6.5 horas

---

## 🎯 Objetivos de Calidad (No Negociables)

| Métrica | Mínimo | Cómo Verificar |
|---------|--------|----------------|
| Cobertura statements | ≥ 80% | `npm run test:coverage` |
| Cobertura branches | ≥ 70% | `npm run test:coverage` |
| Cobertura functions | ≥ 80% | `npm run test:coverage` |
| Cobertura lines | ≥ 80% | `npm run test:coverage` |
| Build pasa | ✅ | `npm run build` |
| Lint pasa | ✅ | `npm run lint` (tras configurar) |
| JSDoc validation | ✅ | `npm run typecheck` (JSDoc en .js) |
| Pages deploy | ✅ | GitHub Actions green + URL accesible |

---

## 🧪 Matriz de Tests a Implementar

### `Odontograma` (Puro, sin dependencias externas)
- [ ] Renderiza 32 botones (16 sup + 16 inf)
- [ ] Click alterna selección (clase `odontograma-tooth--selected`)
- [ ] Botón "Limpiar Todo" deselecciona todo
- [ ] Contador muestra N piezas seleccionadas
- [ ] Accesibilidad: botones tienen `type="button"`, labels claros

### `OrderFeed` (Presentacional, props only)
- [ ] Empty state: muestra mensaje + icono cuando `orders=[]`
- [ ] Renderiza lista con datos mock
- [ ] Badge estado: Recibido (azul), En Proceso (ámbar), Completado (verde)
- [ ] Tags de piezas dentales renderizan correctamente
- [ ] Footer muestra fecha formateada

### `LoginView` (Form + Async + Side Effects)
- [ ] Renderiza campos email + password + botón
- [ ] Validación: email vacío → error
- [ ] Validación: password < 6 chars → error
- [ ] Submit exitoso: llama `onLoginSuccess` con user object tras 1500ms
- [ ] Loading state: deshabilita botón, muestra spinner + "Generando Firma JWT..."
- [ ] Error state: muestra mensaje si validación falla

### `useNewOrderForm` (Hook — lógica extraída)
- [ ] Estado inicial: paciente="", tipo="Prótesis Fija", material="Zirconio Monolítico", color="A2 VITA", selectedTeeth=[], attachments=[]
- [ ] Cambio de tipo actualiza materiales disponibles y resetea material
- [ ] Toggle pieza: añade/quita de `selectedTeeth`
- [ ] File upload: añade a attachments con id, name, size, type
- [ ] Remove attachment: filtra por id
- [ ] Submit sin paciente: no llama `onAddOrder`, no limpia form
- [ ] Submit válido: llama `onAddOrder` con orden completa, limpia form, llama `onCancel`

### `DashboardView` (Integración ligera)
- [ ] Renderiza perfil con stats (total, en curso, completadas)
- [ ] Filtros: Todos / Fija / Removible / Ortodoncia → actualizan `OrderFeed`
- [ ] Click FAB → muestra `NewOrderForm` (vista new-order)
- [ ] Submit en `NewOrderForm` → añade orden, vuelve a feed, stats actualizados
- [ ] Logout → navega a landing

---

## 📝 Archivos a Crear/Modificar (Checklist)

### Testing Setup
- [ ] `package.json` → + `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `msw`
- [ ] `vite.config.js` → + `test: { environment: 'jsdom', globals: true, setupFiles: './test/setup.js', coverage: { thresholds: {...} } }`
- [ ] `test/setup.js` → `@testing-library/jest-dom`, mock Font Awesome, `vi.useFakeTimers()`
- [ ] `test/mocks/handlers.js` → MSW handlers para `/api/auth/login`, `/api/orders`, `/api/quotes`
- [ ] `test/mocks/initialData.js` → movido desde `src/data/initialData.js`

### Tests
- [ ] `test/dashboard/Odontograma.test.jsx`
- [ ] `test/dashboard/OrderFeed.test.jsx`
- [ ] `test/auth/LoginView.test.jsx`
- [ ] `test/dashboard/useNewOrderForm.test.js`
- [ ] `test/dashboard/DashboardView.test.jsx`

### GitHub Pages Fix
- [ ] `vite.config.js` → `base: '/Proyecto_mec.dental/'`
- [ ] `.github/workflows/pages.yml` → workflow completo (build + deploy)

### CI Pipeline
- [ ] `.github/workflows/ci.yml` → lint + typecheck + test:coverage + build + bundle size check

### Docs
- [ ] `docs/05-evidencia/metricas-objetivo.md`
- [ ] `readme.md` (root) → sección Inicio Rápido, Estructura, Testing Stack, Estado Actual

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| MSW setup complejo | Media | Alto | Empezar con mocks manuales en `setup.js`, migrar a MSW en Fase 2 |
| `NewOrderForm` refactor rompe tests | Alta | Medio | Testear hook aislado ANTES de split componente |
| `base` path rompe assets local | Baja | Alto | Probar `npm run preview` tras cambio |
| Cobertura < 80% en primer pass | Media | Medio | Añadir tests de edge cases hasta pasar threshold |
| GitHub Actions timeout | Baja | Medio | Cache `node_modules`, jobs paralelos |

---

## 📅 Daily Log

| Día | Foco | Avance | Blockers |
|-----|------|--------|----------|
| 2026-09-28 (Lun) | Setup docs + testing install | Docs structure ✅, testing install 🔄 | — |
| 2026-09-29 (Mar) | Config Vitest + primeros tests | | |
| 2026-09-30 (Mié) | Tests core + hook extraction | | |
| 2026-10-01 (Jue) | CI + Pages fix + README | | |
| 2026-10-02 (Vie) | Cobertura + push + verify | | |
| 2026-10-03 (Sáb) | Buffer / pulido | | |
| 2026-10-04 (Dom) | Retrospectiva + docs aprendizaje | | |

---

## 🔗 Enlaces Relacionados

- [Estado Actual](./estado-actual.md)
- [Roadmap](../01-planificacion/roadmap.md)
- [Testing Stack ADR](../02-decisiones-tecnicas/001-testing-stack.md)
- [Testing Guide](../03-guias/testing-guide.md)
- [Métricas Objetivo](../05-evidencia/metricas-objetivo.md)