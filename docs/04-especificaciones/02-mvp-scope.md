# MVP Scope - Kamila Lab

## Features INCLUIDAS en MVP

### 1. Portal del Odontólogo (Core)
| Feature | Criterio de Aceptación |
|---------|------------------------|
| Login / Logout | JWT válido 24h, redirect a dashboard, logout limpia estado |
| Registro de orden | Formulario completo: paciente, tipo, material, color VITA, piezas FDI, archivos, notas |
| Odontograma FDI | 32 piezas clickeables, toggle selección, contador, limpiar todo |
| Carga de archivos | Drag & drop, múltiples, preview lista, eliminar, max 50MB c/u |
| Listado de órdenes | Cards con: ID, paciente, clínica, tipo, material, color, piezas, estado, fecha |
| Filtros | Por tipo: Todos / Fija / Removible / Ortodoncia |
| Estados visibles | Badges: Recibido (azul), En Proceso (ámbar), Completado (verde) |

### 2. Landing Page (Marketing)
- Hero con CTA a login
- Gallery/Carousel 16 casos clínicos
- 6 Service Cards (especialidades)
- About con 4 value props + CTA
- Contact con 4 redes sociales

---

## Features EXCLUIDAS del MVP (Fase 2+)

| Feature | Motivo | Prioridad |
|---------|--------|-----------|
| Motor de Cotización Real | Requiere backend + pricing engine | Alta |
| Pipeline Producción (5 estados) | Requiere backend + notificaciones | Alta |
| Panel Admin Lab | Requiere roles, permisos, vistas separadas | Media |
| Notificaciones Email/Push | Requiere servicio externo | Media |
| Facturación Automática | Requiere integración contable | Baja |
| Multi-idioma | No crítico para lanzamiento | Baja |
| PWA / Offline | Complejidad vs valor | Baja |
| Tests E2E (Cypress/Playwright) | Unit/Integration primero | Media |

---

## Criterios de Aceptación Globales (Definition of Done)

- [ ] `npm run build` → éxito, bundle JS ≤ 60 KB gzip
- [ ] `npm run test:coverage` → statements ≥ 80%, branches ≥ 70%
- [ ] `npm run lint` → 0 errors
- [ ] GitHub Pages deploy → URL accesible, assets cargan
- [ ] Lighthouse CI → Performance ≥ 90, A11y ≥ 95
- [ ] Responsive: mobile (375px), tablet (768px), desktop (1440px)
- [ ] Accesibilidad: WCAG 2.1 AA (contraste, focus, ARIA labels)
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge (últimas 2 versiones)