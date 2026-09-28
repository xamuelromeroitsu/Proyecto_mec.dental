# Kamila Lab - Product Brief

## Visión General
Kamila Lab es una plataforma web fullstack B2B diseñada para digitalizar, optimizar y acelerar el flujo de trabajo entre clínicas odontológicas y laboratorios de mecánica dental. El sistema actúa como una landing page de alta conversión y un portal operativo que elimina la fricción en la solicitud, facturación y seguimiento de prótesis y dispositivos dentales.

## Propósito
El principal dolor de cabeza en el sector dental es la pérdida de tiempo en la comunicación manual y el seguimiento logístico de los casos. Esta plataforma resuelve ese problema centralizando todo el ciclo de vida de una orden de trabajo de forma automatizada y transparente.

## Características Clave (MVP)

### 1. Portal del Odontólogo
- Autenticación segura (JWT + hashing)
- Gestión de órdenes interactiva (tipo: Fija/Removible/Ortodoncia, piezas FDI, Guía VITA, materiales)
- Carga de archivos (prescripciones, fotos, STL/OBJ)

### 2. Motor de Cotización en Tiempo Real
- Calculadora dinámica por material + piezas
- Fecha estimada de entrega automática

### 3. Pipeline de Producción
- Estados: Recibido → En Diseño → En Fabricación → Control de Calidad → En Despacho
- Trazabilidad en tiempo real

### 4. Panel de Administración
- Inventario de materiales
- Facturación y reportes por clínica
- Gestión de estados con notificaciones

## Stack Tecnológico
- **Frontend:** React 18 + Vite 5 (JSX, CSS custom properties)
- **Backend:** Node.js (RESTful)
- **Base de Datos:** PostgreSQL / Supabase
- **Testing:** Vitest + React Testing Library + MSW
- **CI/CD:** GitHub Actions → GitHub Pages
- **Infra:** Docker, Git

## Estado Actual (2026-09-28)
- ✅ Landing page, Auth mock, Dashboard, NewOrderForm, Odontograma, OrderFeed
- ❌ Motor cotización, Pipeline, Panel Admin, Tests, CI/CD, Backend real
- 📊 Build: 1.78s, 54 KB JS gzip
- 🔗 Repo: github.com/xamuelromeroitsu/Proyecto_mec.dental