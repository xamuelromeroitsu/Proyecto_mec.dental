# Documentación del Proyecto Kamila Lab

Índice navegable de toda la documentación técnica del proyecto.

---

## 📁 Estructura de Carpetas

| Carpeta | Propósito |
|---------|-----------|
| [`00-visión-general/`](./) | Contexto global: arquitectura, estado actual, decisiones macro |
| [`01-planificacion/`](../01-planificacion/) | Roadmap, sprints, backlog priorizado |
| [`02-decisiones-tecnicas/`](../02-decisiones-tecnicas/) | ADR (Architecture Decision Records) — cada decisión irrevocable |
| [`03-guias/`](../03-guias/) | Cómo hacer cosas: testing, componentes, git, deploy |
| [`04-especificaciones/`](../04-especificaciones/) | Specs funcionales detalladas de features pendientes |
| [`05-evidencia/`](../05-evidencia/) | Resultados medibles: cobertura, bundle size, deploys |
| [`06-aprendizajes/`](../06-aprendizajes/) | Retrospectivas, blockers resueltos, contactos laborales |

---

## 🚀 Inicio Rápido

| Si buscas... | Ve a... |
|--------------|---------|
| Entender el proyecto en 5 min | [`estado-actual.md`](./estado-actual.md) |
| Qué se hace esta semana | [`../01-planificacion/sprint-actual.md`](../01-planificacion/sprint-actual.md) |
| Por qué se usó Vitest + MSW | [`../02-decisiones-tecnicas/001-testing-stack.md`](../02-decisiones-tecnicas/001-testing-stack.md) |
| Cómo escribir un test | [`../03-guias/testing-guide.md`](../03-guias/testing-guide.md) |
| Spec del motor de cotización | [`../04-especificaciones/motor-cotizacion.md`](../04-especificaciones/motor-cotizacion.md) |
| Métricas objetivo del proyecto | [`../05-evidencia/metricas-objetivo.md`](../05-evidencia/metricas-objetivo.md) |
| Qué aprendimos en el sprint | [`../06-aprendizajes/retrospectivas.md`](../06-aprendizajes/retrospectivas.md) |

---

## 📋 Convenciones

- **Prefijo numérico** (`00-`, `01-`...) = orden de lectura
- **Kebab-case** = compatibilidad universal
- **Un archivo = un tema** = linkable en PRs/issues
- **ADR** = decisiones irrevocables (no se borran, se superseden)

---

## 🔗 Enlaces Externos

- **Repo:** https://github.com/xamuelromeroitsu/Proyecto_mec.dental
- **Deploy (GitHub Pages):** https://xamuelromeroitsu.github.io/Proyecto_mec.dental/ *(pendiente fix `base` path)*
- **Base de datos:** [`base_de_datos.sql`](../../base_de_datos.sql)
- **README principal:** [`../../readme.md`](../../readme.md)

---

*Última actualización: 2026-09-28 — Sprint 1: Testing + Refactor + Docs*