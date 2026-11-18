# Setup Supabase — Checklist de la Fase 1

**Objetivo:** dejar vivo el backend único (`base_de_datos.sql`) con el primer
laboratorio, su sitio (página) y su técnico de prueba.

---

## 1. Crear el proyecto (~5 min)

- [ ] Entrar a [supabase.com](https://supabase.com) → **New project**
- [ ] Nombre: `dentalconnect` (o el que prefieras)
- [ ] Contraseña de la DB: guárdala en tu gestor de claves
- [ ] Región: la más cercana a tus usuarios (p. ej. *South America (São Paulo)*)
- [ ] Esperar a que el proyecto esté en estado **Active**

## 2. Ejecutar el esquema (~2 min)

- [ ] Sidebar → **SQL Editor** → **New query**
- [ ] Copiar **TODO** el contenido de [`base_de_datos.sql`](../../base_de_datos.sql) y pegarlo
- [ ] **Run** (Ctrl+Enter)
- [ ] Verificación en **Table Editor** — deben existir las 13 tablas:
      `laboratorios`, `usuarios`, `tecnicos`, `sitios`, `clinicas`,
      `miembros_clinica`, `pacientes`, `vinculos_paciente`, `trabajos`,
      `trabajo_piezas`, `pagos`, `archivos`, `historial_estados`
- [ ] Verificación RLS: en cada tabla debe verse el escudo **RLS Enabled**
      (el SQL lo activa para las 13)
- [ ] Verificación Storage: **Storage** → bucket `trabajos-archivos` (privado)
      ya debe existir
- [ ] Si algo falla: el error aparece arriba del editor — cópiame el mensaje
      y lo corregimos

## 3. Cargar el primer laboratorio de prueba (~3 min)

- [ ] **SQL Editor** → nueva query → pegar la sección
      **"DATOS DE EJEMPLO"** del final de `base_de_datos.sql`
      (descomentada) y ejecutarla.
      Crea: laboratorio `kamila-lab`, sitio `kamilalab.com`,
      clínica `Clínica Dental Sonrisa`.
- [ ] El **técnico** se crea en el paso 4 (necesita una cuenta de Auth real)

## 4. Crear usuarios de prueba (~5 min)

1. **Técnico del laboratorio:**
   - [ ] **Authentication → Users → Add user** → crear
         `tecnico@kamilalab.com` con contraseña, email confirmado ✅
   - [ ] El trigger `on_auth_user_created` crea su fila en `usuarios` automáticamente
   - [ ] SQL Editor:
         ```sql
         UPDATE usuarios SET rol = 'tecnico' WHERE email = 'tecnico@kamilalab.com';

         INSERT INTO tecnicos (id, laboratorio_id, nombre, email)
         SELECT u.id, l.id, 'Kamila', u.email
         FROM usuarios u, laboratorios l
         WHERE u.email = 'tecnico@kamilalab.com' AND l.slug = 'kamila-lab';
         ```

2. **Odontólogo (cliente):**
   - [ ] Crear usuario `doctor@sonrisa.com` igual que arriba
   - [ ] SQL Editor:
         ```sql
         UPDATE usuarios SET rol = 'odontologo' WHERE email = 'doctor@sonrisa.com';

         INSERT INTO miembros_clinica (clinica_id, usuario_id)
         SELECT c.id, u.id
         FROM clinicas c, usuarios u
         WHERE c.nombre = 'Clínica Dental Sonrisa' AND u.email = 'doctor@sonrisa.com';
         ```

## 5. Copiar las claves de API (~1 min)

- [ ] **Settings → API** (o Project Settings → Data API)
- [ ] Copiar y completar el `.env` (usa [.env.example](../../.env.example) como plantilla):
  | Variable | Fuente | ¿Secreta? |
  |---|---|---|
  | `VITE_SUPABASE_URL` | Project URL | No |
  | `VITE_SUPABASE_ANON_KEY` | anon public | No (RLS protege) |
  | `SUPABASE_SERVICE_ROLE_KEY` | service_role | **SÍ — solo Edge Functions** |

```bash
# en la raíz del proyecto
cp .env.example .env   # y editar con tus claves
```

## 6. Proveedores de Auth (~2 min)

- [ ] **Authentication → Providers → Email**: activado por defecto ✅
- [ ] (Opcional) **Google**: activar y pegar Client ID/Secret de Google Cloud
- [ ] **Authentication → URL Configuration → Redirect URLs**: añadir los
      dominios de tus páginas (`http://localhost:5173/**`, y luego los
      dominios de producción de cada sitio vendido)

## 7. Probar que RLS funciona (~5 min)

- [ ] `npm run dev` → login con `doctor@sonrisa.com`
- [ ] El Dashboard debe cargar (feed vacío hasta crear la primera orden)
- [ ] Crear una orden de prueba → debe aparecer en el feed con estado `Recibido`
- [ ] Login con `tecnico@kamilalab.com` → ve las órdenes del laboratorio
      completo (todas las clínicas de su lab) — esto confirma que RLS separa
      los roles

---

## Problemas comunes

| Síntoma | Causa | Solución |
|---|---|---|
| `relation "auth.users" does not exist` | El SQL se corrió fuera de Supabase (p. ej. Postgres local sin auth) | Ejecutarlo **solo** en el SQL Editor de Supabase |
| Error al crear usuario (rol inválido) | El front envía `raw_user_meta_data.rol` no válido | Validar en el front: solo `tecnico_admin|tecnico|odontologo|paciente` |
| `0 rows` en el feed con usuario válido | Faltó asignar `rol` en `usuarios`, o el odontólogo no está en `miembros_clinica` | Revisar pasos 4.1/4.2 |
| No puedo subir archivos | El path no respeta `trabajos-archivos/{trabajo_id}/...` | Ver [ADR 005](../02-decisiones-tecnicas/005-storage-archivos.md) |

**Siguiente fase:** [Fase 2 — conectar el front](../../src/services/)
