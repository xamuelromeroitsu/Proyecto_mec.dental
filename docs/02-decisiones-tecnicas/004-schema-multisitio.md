# ADR 004: Esquema v2 Multi-Sitio con Supabase Auth + RLS

**Fecha:** 2026-11-15
**Estado:** Aceptado
**Contexto:** El proyecto evoluciona de "un laboratorio con su portal" a una **agencia que vende páginas de mecánica dental**: cada mecánico dental obtiene su propia página (landing + portal) conectada a un **único backend**. El esquema anterior (`clientes`, `trabajos`, `pagos`) mezclaba usuario+clínica en una tabla, el paciente era un `VARCHAR(100)` y no existían técnicos ni RLS.

## Decisión

1. **Supabase Auth como identidad** (migrable a futuro): solo la tabla `usuarios` tiene FK a `auth.users`. Al migrar a backend propio, se cambia esa FK y el resto del esquema queda intacto.
2. **Usuarios y clínicas separados**, unidos por `miembros_clinica` (N:M). Un usuario es una identidad; una clínica es una organización con varios odontólogos.
3. **Un sitio por página vendida**: tabla `sitios` con `dominio UNIQUE` y `tecnico_id` por defecto. El registro desde una página vincula al paciente con el técnico de esa página.
4. **`vinculos_paciente`** con `UNIQUE(usuario_id, tecnico_id)`: el paciente ve únicamente los trabajos del técnico donde se registró. Registrarse en otra página = otro vínculo con otro técnico, sin acceso cruzado.
5. **El técnico gestiona pacientes sin registro previo** (`pacientes.creado_por`): el paciente puede existir antes de tener cuenta; al registrarse se le crea un vínculo, no una fila duplicada.
6. **RLS en todas las tablas** con funciones helper `SECURITY DEFINER` (`es_tecnico()`, `es_odontologo_clinica()`, `tiene_vinculo_activo()`, `es_trabajo_visible()`) para evitar recursión. Sin policy = denegado; `service_role` bypasea.
7. **Índices explícitos en todas las FKs** (PostgreSQL no los crea automáticamente) + índices compuestos para las consultas calientes.

## Alternativas Consideradas

| Opción | Pros | Contras |
|--------|------|---------|
| **Esquema v2 multi-sitio + RLS (elegido)** | Aislamiento a nivel DB, cero lógica de seguridad en fronts, escala a N páginas sin tocar backend | Esquema más grande; curva de aprendizaje de policies |
| Tabla única `usuarios+clinicas` | Menos tablas | Datos sucios (pacientes con "nombre de clínica"), imposible N:M |
| Backend propio Node + JWT desde el día 1 | Control total | Duplica lo que Supabase ya da; RLS tendría que reimplementarse en middleware |
| Base de datos por página (multi-DB) | Aislamiento absoluto | Inmantenible para la agencia (N migraciones por cambio) |
| Filtrado de tenancy solo en código (sin RLS) | Simple | Un bug en el front expone datos de otros laboratorios |

## Consecuencias

- ✅ Dar de alta un cliente de la agencia = 3 INSERTs (`laboratorio`, `sitio`, `tecnico`) — el back queda listo, el front solo conecta con URL + anon key
- ✅ Los fronts de las páginas no contienen lógica de seguridad; el aislamiento es imposible de saltar desde el cliente
- ✅ Pipeline de estados validado por trigger (`Recibido → … → Entregado`) + auditoría automática en `historial_estados`
- ✅ Pagos inmutables (sin UPDATE/DELETE por RLS)
- ⚠️ `tecnicos` expone perfil activo al `anon` (nombre, cargo, especialidades) para las landings — revisar si debe restringirse
- ⚠️ Los registros de pacientes (crear vínculo) deben hacerse vía edge function con `service_role` leyendo el dominio de origen
- ⚠️ Si el rol enviado en el signup metadata es inválido, `handle_new_user` falla — validar en el front antes de `signUp`

## Referencias
- [`base_de_datos.sql`](../../../base_de_datos.sql) — esquema completo
- [Technical Spec — Modelo de Datos](../04-especificaciones/04-technical-spec.md#modelo-de-datos-postgresql--supabase-multi-sitio)
- [ADR 005 — Storage de Archivos](005-storage-archivos.md)
- [ADR 002 — Services Layer](002-services-layer.md)
