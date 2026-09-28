# Plan de Implementación - Kamila Lab

## Visión General de Fases

| Fase | Nombre | Duración Estimada | Entregable Principal |
|------|--------|-------------------|----------------------|
| **0** | Fundación & Docs | 1 semana | Docs, testing stack, CI, Pages deploy |
| **1** | Refactor Core + Quotes | 2-3 semanas | Services layer, hooks, Motor Cotización |
| **2** | Pipeline Producción | 2 semanas | 5 estados, notificaciones, admin básico |
| **3** | Panel Admin Completo | 2-3 semanas | Inventario, facturación, usuarios |
| **4** | Hardening & Launch | 1-2 semanas | E2E tests, performance, seguridad, docs |

---

## Fase 0: Fundación & Docs (Sprint Actual - Semana 1)

### Objetivo
Base técnica sólida: tests, CI/CD, deploy funcionando, documentación viva.

### Tareas

| # | Tarea | Owner | Estimación | Done Criteria |
|---|-------|-------|------------|---------------|
| 0.1 | Estructura `docs/` + 5 specs | Dev | 2h | 5 archivos en `docs/04-especificaciones/` |
| 0.2 | Instalar testing stack | Dev | 15 min | `vitest`, `RTL`, `MSW`, `jsdom` en package.json |
| 0.3 | Configurar `vitest.config.js` + `test/setup.js` | Dev | 30 min | `npm run test` corre sin errores |
| 0.4 | Tests: `Odontograma`, `OrderFeed`, `LoginView` | Dev | 2h | Cobertura components > 80% |
| 0.5 | Extraer `useNewOrderForm` hook + tests | Dev | 1.5h | Hook testeado, componente < 100 líneas |
| 0.6 | Tests: `DashboardView` (integración) | Dev | 45 min | Flujo FAB → Form → Submit verificado |
| 0.7 | Fix GitHub Pages: `base` path | Dev | 15 min | `npm run preview` OK, deploy verde |
| 0.8 | Crear `.github/workflows/ci.yml` | Dev | 45 min | Lint + test:coverage + build + bundle check |
| 0.9 | Actualizar `readme.md` principal | Dev | 30 min | Inicio rápido, estructura, testing, estado honesto |
| 0.10 | Crear `docs/05-evidencia/metricas-objetivo.md` | Dev | 20 min | Métricas documentadas |
| 0.11 | Commit + Push + Verificar Pages | Dev | 15 min | Main verde, URL accesible |

**Total Fase 0:** ~6.5h

---

## Fase 1: Refactor Core + Motor Cotización (Semanas 2-4)

### Objetivo
Arquitectura limpia (services + hooks), feature estrella: cotización en tiempo real.

### Tareas

| # | Tarea | Owner | Estimación | Done Criteria |
|---|-------|-------|------------|---------------|
| 1.1 | Crear `services/api.js` (fetch wrapper + interceptors) | Dev | 2h | BaseURL, auth header, 401 handler, error typing |
| 1.2 | Crear `services/auth.js` (login, me, logout, refresh) | Dev | 1h | Tests unitarios + MSW handlers |
| 1.3 | Crear `services/orders.js` (CRUD órdenes + archivos) | Dev | 2h | Multipart upload, tipado respuesta |
| 1.4 | Crear `services/quotes.js` (motor cotización) | Dev | 3h | **Core feature** |
| 1.5 | Implementar pricing engine en `quotes.js` | Dev | 4h | Ver sección "Motor Cotización" abajo |
| 1.6 | Hook `useQuotes` + integración en `NewOrderForm` | Dev | 2h | Precio en vivo al cambiar material/piezas |
| 1.7 | Refactor `App.jsx`: migrar estado a hooks + Context | Dev | 2h | `useAuth`, `useOrders` providers |
| 1.8 | Migrar mocks `data/initialData.js` → `test/mocks/` | Dev | 30 min | Clean separation |
| 1.9 | Tests servicios + hooks (cobertura ≥ 80%) | Dev | 3h | CI verde |
| 1.10 | Documentar API en `docs/04-especificaciones/04-technical-spec.md` | Dev | 1h | Endpoints, schemas actualizados |

**Total Fase 1:** ~20.5h

### Motor Cotización - Detalle Técnico

#### Tabla Precios Base (ejemplo)
| Material | Precio Base (por pieza) | Días Base |
|----------|------------------------|-----------|
| Zirconio Monolítico | $120 USD | 3 |
| Zirconio Translúcido | $150 USD | 4 |
| Disilicato Litio (E-Max) | $180 USD | 5 |
| Metal-Porcelana | $100 USD | 4 |
| Provisional PMMA | $40 USD | 1 |
| Acrílico Termocurable | $60 USD | 3 |
| Flexible Definitivo (Nylon) | $90 USD | 4 |
| Esquelético (Cr-Co) | $140 USD | 5 |
| Férula Essix | $50 USD | 2 |
| Placa Hawley | $80 USD | 3 |

#### Fórmula
```
precio_total = Σ(piezas) * precio_base_material + complejidad_extra
fecha_entrega = hoy + dias_base_material + días_extra_por_complejidad
```

#### Complejidad Extra
- > 6 piezas: +1 día, +5% precio
- Sector anterior (piezas 11-23): +1 día, +10% precio (estética)
- Archivos STL adjuntos: -0.5 días (digital workflow)

---

## Fase 2: Pipeline Producción (Semanas 5-6)

### Objetivo
Trazabilidad real: 5 estados, transiciones válidas, notificaciones.

### Tareas

| # | Tarea | Owner | Estimación |
|---|-------|-------|------------|
| 2.1 | Extender modelo `trabajos`: nuevo enum estado (5 valores) | Dev | 1h |
| 2.2 | Backend: validar transiciones de estado (state machine) | Dev | 2h |
| 2.3 | Frontend: `OrderFeed` → badges 5 estados + colores | Dev | 1h |
| 2.4 | Vista detalle orden (`OrderDetailView`) | Dev | 3h |
| 2.5 | Panel técnico: `TechnicianDashboardView` (lista + cambio estado) | Dev | 4h |
| 2.6 | Notificaciones: email (Nodemailer/SendGrid) + in-app | Dev | 3h |
| 2.7 | Tests integración pipeline | Dev | 2h |
| 2.8 | Documentar en specs | Dev | 1h |

**Total Fase 2:** ~17h

### State Machine (Estados Válidos)
```
Recibido → En Diseño → En Fabricación → Control Calidad → En Despacho
    │           │              │                  │              │
    └───────────┴──────────────┴──────────────────┴──────────────┘
    (solo admin puede forzar salto, con justificación)
```

---

## Fase 3: Panel Admin Completo (Semanas 7-9)

### Objetivo
Gestión interna del laboratorio: inventario, facturación, usuarios.

### Tareas

| # | Tarea | Owner | Estimación |
|---|-------|-------|------------|
| 3.1 | Auth: roles (odontólogo vs admin) + RBAC | Dev | 2h |
| 3.2 | `AdminLayout` + navegación lateral | Dev | 2h |
| 3.3 | Inventario: CRUD materiales (tabla + modal) | Dev | 3h |
| 3.4 | Facturación: reporte por clínica + período + export CSV/PDF | Dev | 4h |
| 3.5 | Gestión usuarios: CRUD clínicas/odontólogos | Dev | 3h |
| 3.6 | Dashboard admin: KPIs (órdenes mes, ingresos, pendientes) | Dev | 2h |
| 3.7 | Tests admin + RBAC | Dev | 2h |

**Total Fase 3:** ~18h

---

## Fase 4: Hardening & Launch (Semanas 10-11)

### Objetivo
Calidad producción: E2E, performance, seguridad, docs finales.

### Tareas

| # | Tarea | Owner | Estimación |
|---|-------|-------|------------|
| 4.1 | E2E tests: Playwright (login → crear orden → ver feed) | Dev | 4h |
| 4.2 | Lighthouse CI en pipeline (≥ 90 perf, ≥ 95 a11y) | Dev | 2h |
| 4.3 | Auditoría seguridad: headers, CSP, rate limit, deps audit | Dev | 3h |
| 4.4 | Optimización bundle: code splitting, lazy loading views | Dev | 2h |
| 4.5 | Accesibilidad: axe-core en CI, focus management, ARIA | Dev | 2h |
| 4.6 | Docs finales: `readme.md` completo, `CONTRIBUTING.md`, `CHANGELOG.md` | Dev | 2h |
| 4.7 | Deploy staging → validación UAT con clínica piloto | Dev + Stakeholder | 4h |
| 4.8 | Deploy production + monitoreo (Sentry/LogRocket) | Dev | 2h |

**Total Fase 4:** ~21h

---

## Dependencias Críticas

```
Fase 0 ──┬──► Fase 1 (services, quotes)
         │
         └──► Fase 2 (pipeline) requiere Fase 1 (orders service)
              │
              └──► Fase 3 (admin) requiere Fase 2 (estados, usuarios)
                   │
                   └──► Fase 4 (hardening) requiere todo previo
```

---

## Estimación Total

| Fase | Horas | Semanas (20h/sem) |
|------|-------|-------------------|
| 0 | 6.5 | 0.3 |
| 1 | 20.5 | 1.0 |
| 2 | 17 | 0.9 |
| 3 | 18 | 0.9 |
| 4 | 21 | 1.1 |
| **Total** | **83h** | **~4.2 semanas** |

*Buffer 20%:* **~5 semanas** (1.5 meses)

---

## Hitos / Milestones

| Hito | Fecha Target | Criterio |
|------|--------------|----------|
| M0: Fundación lista | 2026-10-05 | CI verde, Pages deploy, docs base |
| M1: Cotización funcionando | 2026-10-26 | Quote engine + tests + integración UI |
| M2: Pipeline real | 2026-11-09 | 5 estados + notificaciones + tech dashboard |
| M3: Admin panel | 2026-11-30 | Inventario + facturación + usuarios |
| M4: Launch Ready | 2026-12-14 | E2E + Lighthouse ≥ 90 + seguridad + staging UAT |

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Backend no disponible a tiempo | Alta | Alto | Mock MSW completo, desarrollar frontend-first |
| Complejidad pricing engine subestimada | Media | Medio | Spike técnico 2h al inicio Fase 1 |
| Cambios requisitos clínica piloto | Media | Alto | Demos semanales, feedback temprano |
| Performance bundle > 60KB | Baja | Medio | Code splitting desde Fase 1, monitor en CI |
| Falta tiempo para E2E | Media | Medio | Priorizar tests unit/integración, E2E solo happy paths |

---

## Recursos Necesarios

| Recurso | Fase | Notas |
|---------|------|-------|
| 1 Dev Fullstack (React + Node) | 0-4 | Owner principal |
| 1 Dev Backend (Node/Postgres) | 1-3 | Puede ser mismo fullstack |
| 1 QA / UAT clínica | 4 | Validación real |
| Cuenta Supabase / PostgreSQL | 1 | DB gestionada |
| SendGrid / Resend | 2 | Emails notificaciones |
| GitHub Actions (incluido) | 0 | CI/CD |
| Sentry (free tier) | 4 | Error tracking |

---

## Próximos Pasos Inmediatos (Post-Fase 0)

1. **Spike técnico pricing engine** (2h) - validar fórmula con stakeholder
2. **Setup Supabase project** - schema + RLS policies
3. **Definir API contracts** - OpenAPI spec para services
4. **Diseñar state machine** - validar con técnico de lab