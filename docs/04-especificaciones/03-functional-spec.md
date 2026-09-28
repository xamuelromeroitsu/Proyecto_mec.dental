# Especificación Funcional - Kamila Lab

## Actores
- **Odontólogo** (cliente): Registra órdenes, sube archivos, ve estado
- **Técnico/Administrador Lab** (interno): Gestiona pipeline, inventario, facturación

---

## User Stories

### Epic 1: Autenticación
| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-1.1 | Como odontólogo, quiero iniciar sesión con email/contraseña para acceder a mi portal | - Formulario valida email + pass ≥ 6 chars<br>- Error claro si credenciales inválidas<br>- Loading state durante auth<br>- JWT guardado en memory (no localStorage) |
| US-1.2 | Como odontólogo, quiero cerrar sesión para proteger mis datos | - Botón visible en header dashboard<br>- Limpia estado + redirect a landing |

### Epic 2: Gestión de Órdenes
| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-2.1 | Como odontólogo, quiero crear una orden completa para enviar al lab | - Paciente obligatorio<br>- Tipo: Fija / Removible / Ortodoncia (select)<br>- Material dinámico según tipo<br>- Color VITA (16 opciones + Transparente)<br>- Piezas: Odontograma FDI 32 dientes<br>- Archivos: PDF, JPG, STL, OBJ ≤ 50MB<br>- Notas técnicas opcionales<br>- Submit → estado "Recibido", ID generado (ORD-XXXX) |
| US-2.2 | Como odontólogo, quiero ver mis órdenes con filtros | - Lista cards con todos los datos<br>- Filtro por tipo (chips/stories)<br>- Empty state si no hay órdenes<br>- Stats: Total / En Proceso / Completadas |
| US-2.3 | Como odontólogo, quiero ver detalle de una orden | - Click card → modal o vista detalle (Fase 2) |

### Epic 3: Cotización (Fase 2)
| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-3.1 | Como odontólogo, quiero ver precio estimado al configurar orden | - Cálculo en tiempo real al cambiar material/piezas<br>- Tabla precios base por material + por pieza<br>- Fecha entrega estimada según complejidad |

### Epic 4: Pipeline Producción (Fase 2)
| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-4.1 | Como técnico, quiero cambiar estado de orden | - Transiciones válidas: Recibido → En Diseño → En Fabricación → QC → Despacho<br>- No saltar estados<br>- Timestamp automático por transición |
| US-4.2 | Como odontólogo, quiero recibir notificación de cambios | - Email / in-app al cambiar estado<br>- Link directo a orden |

### Epic 5: Panel Admin (Fase 3)
| ID | Historia | Criterios de Aceptación |
|----|----------|------------------------|
| US-5.1 | Como admin, quiero gestionar inventario | - CRUD materiales (nombre, stock, precio unitario, unidad) |
| US-5.2 | Como admin, quiero ver facturación por clínica | - Reporte: clínica, período, total, desglose por orden |
| US-5.3 | Como admin, quiero gestionar usuarios | - CRUD clínicas/odontólogos, reset password, roles |

---

## Flujos Principales

### Flujo: Crear Orden (Happy Path)
```
Landing → Login → Dashboard → FAB → NewOrderForm
  → Llenar paciente
  → Seleccionar tipo → materiales se actualizan
  → Seleccionar material
  → Seleccionar color VITA
  → Click piezas en odontograma (múltiples)
  → Arrastrar archivos (0-N)
  → Escribir notas técnicas
  → Submit → Loading 1.2s → Toast éxito
  → Redirect a Dashboard → Nueva orden en feed (estado: Recibido)
```

### Flujo: Login Inválido
```
Login → Email vacío / Pass < 6 → Error inline → Reintentar
```

### Flujo: Sin Órdenes
```
Dashboard → OrderFeed vacío → Mensaje "No hay órdenes" + icono
```

---

## Reglas de Negocio

### Odontograma FDI
- Notación FDI de 2 dígitos: cuadrante (1-4) + posición (1-8)
- Sup: 11-18, 21-28 | Inf: 41-48, 31-38
- Múltiples selecciones permitidas
- "Arcada Completa" si se seleccionan todas de una arcada

### Materiales por Tipo
| Tipo | Materiales Permitidos |
|------|----------------------|
| Prótesis Fija | Zirconio Monolítico, Zirconio Translúcido, Disilicato Litio (E-Max), Metal-Porcelana, Provisional PMMA |
| Prótesis Removible | Acrílico Termocurable, Flexible Definitivo (Nylon), Esquelético (Cr-Co), Rebase Blando |
| Ortodoncia / Alineadores | Férula Essix, Placa Hawley, Placa Activa, Mantenedor Espacio |

### Validaciones
- Paciente: requerido, 2-100 chars, solo letras/espacios/ácenos
- Email: formato RFC 5322
- Password: ≥ 6 chars (MVP), en producción ≥ 10 + complejidad
- Archivos: extensiones permitidas, size ≤ 50MB, max 10 archivos/orden

---

## Estados de Orden (MVP vs Futuro)

| Estado MVP | Descripción | Próximos (Pipeline) |
|------------|-------------|---------------------|
| **Recibido** | Orden creada, pendiente revisión | → En Diseño |
| **En Proceso** | Genérico (MVP agrupa diseño/fab/QC) | En Diseño, En Fabricación, Control Calidad |
| **Completado** | Lista para despacho/entrega | En Despacho → Entregado |

---

## Métricas de Éxito (KPIs)
- Tiempo creación orden < 3 min
- Tasa error validación < 5%
- Adopción: % odontólogos activos/semana > 60%
- Tiempo respuesta lab (Recibido → Completado) < 72h