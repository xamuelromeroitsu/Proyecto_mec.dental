-- =========================================================================
-- DENTALCONNECT v2 — ESQUEMA MULTI-SITIO / MULTI-TECNICO (Supabase)
-- =========================================================================
-- Objetivo: UN solo backend (Supabase) que soporta N paginas de mecanica
-- dental (agencia de venta de paginas). Cada pagina = un `sitio` con su
-- tecnico. El front de cada pagina solo conecta con sus credenciales
-- (VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY) y la seguridad la decide
-- Row Level Security (RLS), no el codigo del front.
--
-- Jerarquia de tenancy:
--   laboratorios (raiz)
--     ├── sitios            (1 pagina = 1 fila, con tecnico por defecto)
--     ├── tecnicos          (perfil de usuario tipo tecnico)
--     ├── clinicas ── miembros_clinica ── usuarios (odontologos)
--     └── pacientes ── vinculos_paciente (paciente ↔ tecnico ↔ sitio)
--           └── trabajos → trabajo_piezas, pagos, archivos, historial
--
-- Reglas de negocio implementadas:
--   R1. Un tecnico tiene muchos pacientes y muchas clinicas (N:M via lab).
--   R2. Un paciente registrado en la pagina A queda vinculado SOLO al
--       tecnico de esa pagina (vinculos_paciente UNIQUE(usuario_id, tecnico_id)).
--   R3. Si el mismo usuario se registra en otra pagina, obtiene otro
--       vinculo con OTRO tecnico — sin acceso a los datos del primero.
--   R4. El tecnico puede crear/gestionar pacientes aunque el paciente
--       nunca se haya registrado (tabla pacientes independiente de auth).
--   R5. Clinicas y usuarios son entidades separadas; la union es
--       miembros_clinica (una clinica puede tener varios odontologos).
--
-- Migracion futura de Auth: SOLO `usuarios` referencia a `auth.users`.
-- Al migrar a otro proveedor de identidad se cambia esa FK (o se elimina)
-- y el resto del esquema queda intacto.
-- =========================================================================

-- =========================================================================
-- 0. TIPOS (ENUMS)
-- =========================================================================
CREATE TYPE public.rol_usuario AS ENUM (
    'tecnico_admin',  -- dueño del laboratorio
    'tecnico',        -- tecnico medio en mecanica dental
    'odontologo',     -- usuario de una clinica
    'paciente'        -- usuario comun (acceso limitado via vinculo)
);

CREATE TYPE public.estado_trabajo AS ENUM (
    'Recibido',
    'En Diseño',
    'En Fabricación',
    'Entregado',
    'Cancelado'
);

CREATE TYPE public.metodo_pago AS ENUM (
    'Transferencia', 'Efectivo', 'Pago Móvil', 'Zelle', 'Otro'
);

CREATE TYPE public.estado_vinculo AS ENUM ('activo', 'inactivo');

-- =========================================================================
-- 1. LABORATORIOS (raiz del tenancy)
-- =========================================================================
CREATE TABLE laboratorios (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre      TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,           -- identificador corto: 'kamila-lab'
    email       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 2. USUARIOS (perfil — identidad en auth.users, Supabase Auth)
-- =========================================================================
-- NOTA DE MIGRACION: esta es la UNICA tabla con FK a auth.users.
CREATE TABLE usuarios (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL UNIQUE,
    nombre      TEXT NOT NULL,
    telefono    VARCHAR(20),                -- formato libre: '+58-412-1234567'
    rol         public.rol_usuario NOT NULL DEFAULT 'paciente',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 3. TECNICOS (tabla global del tecnico: id, correo, cargo)
-- =========================================================================
-- id = usuarios.id (relacion 1:1). `nombre`/`email` se duplican a proposito
-- para que las landings publicas muestren el perfil sin joins contra auth.
CREATE TABLE tecnicos (
    id              UUID PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
    laboratorio_id  UUID NOT NULL REFERENCES laboratorios(id) ON DELETE RESTRICT,
    nombre          TEXT NOT NULL,
    email           TEXT NOT NULL,
    cargo           TEXT NOT NULL DEFAULT 'Técnico Medio en Mecánica Dental',
    especialidades  TEXT[] NOT NULL DEFAULT '{}',  -- {'Zirconio','Removibles'}
    activo          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 4. SITIOS (una fila por cada pagina vendida — el front de la agencia)
-- =========================================================================
CREATE TABLE sitios (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id  UUID NOT NULL REFERENCES laboratorios(id) ON DELETE RESTRICT,
    dominio         TEXT NOT NULL UNIQUE,       -- 'kamilalab.com' | 'drlopez.mecdental.app'
    nombre          TEXT NOT NULL,
    tecnico_id      UUID REFERENCES tecnicos(id) ON DELETE SET NULL,  -- tecnico por defecto de la pagina
    activo          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 5. CLINICAS (entidad separada del usuario — decision ADR 004)
-- =========================================================================
CREATE TABLE clinicas (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id  UUID NOT NULL REFERENCES laboratorios(id) ON DELETE RESTRICT,
    nombre          TEXT NOT NULL,
    rif             VARCHAR(25),                -- 'J-12345678-9' (letras+guiones: no NUMERIC)
    telefono        VARCHAR(20),                -- '+58-212-5550000'
    direccion       TEXT,
    email_contacto  TEXT,
    activo          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 6. MIEMBROS_CLINICA (N:M clinicas ↔ usuarios odontologos)
-- =========================================================================
CREATE TABLE miembros_clinica (
    clinica_id      UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
    usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol_en_clinica  TEXT NOT NULL DEFAULT 'odontologo',  -- 'dueño','recepcion','odontologo'
    activo          BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (clinica_id, usuario_id)
);

-- =========================================================================
-- 7. PACIENTES (entidad real del paciente — ya no un VARCHAR)
-- =========================================================================
-- Vive en el laboratorio (R4): el tecnico lo crea sin que el paciente
-- tenga cuenta. Si el paciente se registra luego, se le crea un VINCULO,
-- no una fila duplicada.
CREATE TABLE pacientes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id  UUID NOT NULL REFERENCES laboratorios(id) ON DELETE RESTRICT,
    nombre          TEXT NOT NULL,
    documento       VARCHAR(25),                -- cedula/pasaporte/RIF: 'V-12345678', 'P-9876543'
    telefono        VARCHAR(20),
    email           TEXT,
    notas           TEXT,                       -- informacion clinica guardada por el tecnico
    creado_por      UUID REFERENCES tecnicos(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 8. VINCULOS_PACIENTE (paciente registrado ↔ tecnico de su pagina)
-- =========================================================================
-- Implementa R2 y R3: UNIQUE(usuario_id, tecnico_id) permite varios
-- vinculos del MISMO usuario con DIFERENTES tecnicos (una por pagina),
-- pero nunca dos veces con el mismo tecnico. RLS limita al paciente a
-- los trabajos de los vinculos en estado 'activo'.
CREATE TABLE vinculos_paciente (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    usuario_id  UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tecnico_id  UUID NOT NULL REFERENCES tecnicos(id) ON DELETE RESTRICT,
    sitio_id    UUID REFERENCES sitios(id) ON DELETE SET NULL,  -- pagina donde se registro
    estado      public.estado_vinculo NOT NULL DEFAULT 'activo',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_vinculo_usuario_tecnico UNIQUE (usuario_id, tecnico_id)
);

-- =========================================================================
-- 9. TRABAJOS (orden de produccion)
-- =========================================================================
CREATE TABLE trabajos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id  UUID NOT NULL REFERENCES laboratorios(id) ON DELETE RESTRICT,
    clinica_id      UUID NOT NULL REFERENCES clinicas(id) ON DELETE RESTRICT,
    paciente_id     UUID NOT NULL REFERENCES pacientes(id) ON DELETE RESTRICT,
    tecnico_id      UUID REFERENCES tecnicos(id) ON DELETE SET NULL,   -- tecnico asignado
    sitio_id        UUID REFERENCES sitios(id) ON DELETE SET NULL,     -- pagina de origen
    tipo_trabajo    TEXT NOT NULL,              -- 'Corona','Puente','Removible','Ortodoncia'
    material        TEXT NOT NULL,              -- 'Zirconio','Disilicato','Acrílico'
    color_vita      TEXT,                       -- 'A1','B2','BL1'
    estado          public.estado_trabajo NOT NULL DEFAULT 'Recibido',
    precio          NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
    fecha_ingreso   TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_entrega   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 10. TRABAJO_PIEZAS (N piezas FDI por trabajo — antes era 1 columna)
-- =========================================================================
CREATE TABLE trabajo_piezas (
    trabajo_id     UUID NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
    pieza_dental   INT  NOT NULL CHECK (
                       pieza_dental BETWEEN 11 AND 48
                       AND (pieza_dental % 10) BETWEEN 1 AND 8
                   ),                           -- nomenclatura FDI: 11..48 sin d19/29/39/49
    PRIMARY KEY (trabajo_id, pieza_dental)
);

-- =========================================================================
-- 11. PAGOS
-- =========================================================================
CREATE TABLE pagos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    laboratorio_id  UUID NOT NULL REFERENCES laboratorios(id) ON DELETE RESTRICT,
    clinica_id      UUID NOT NULL REFERENCES clinicas(id) ON DELETE RESTRICT,
    trabajo_id      UUID REFERENCES trabajos(id) ON DELETE SET NULL,   -- NULL = abono a cuenta
    monto           NUMERIC(10,2) NOT NULL CHECK (monto > 0),
    metodo          public.metodo_pago NOT NULL,
    referencia      TEXT,
    fecha_pago      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- 12. ARCHIVOS (SOLO ENLACES — el binario NUNCA entra en la base de datos)
-- =========================================================================
-- Guarda imagenes, fotos, radiografias, escaneos 3D y prescripciones por
-- REFERENCIA, no como blob: el archivo pesado vive en Supabase Storage
-- (bucket privado 'trabajos-archivos') o en una plataforma externa
-- (Cloudinary, Google Drive, S3...) y aqui solo queda el enlace. Asi las
-- consultas a Postgres se mantienen rapidas.
--   storage_path → ruta dentro del bucket: 'trabajos-archivos/{trabajo_id}/{archivo}'
--   url_externa  → link publico de otra plataforma (el tecnico lo pega)
-- Debe existir al menos una de las dos (CHECK al final).
CREATE TABLE archivos (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trabajo_id      UUID NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
    subido_por      UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_archivo  TEXT NOT NULL,
    storage_path    TEXT,                       -- enlace a Supabase Storage
    url_externa     TEXT,                       -- enlace a plataforma externa (Cloudinary, Drive...)
    tipo_archivo    TEXT NOT NULL DEFAULT 'otro'
                    CHECK (tipo_archivo IN
                        ('prescripcion', 'foto', 'radiografia', 'escaneo_3d', 'otro')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_archivos_enlace
        CHECK (storage_path IS NOT NULL OR url_externa IS NOT NULL)
);

-- =========================================================================
-- 13. HISTORIAL_ESTADOS (auditoria del pipeline de produccion)
-- =========================================================================
CREATE TABLE historial_estados (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trabajo_id      UUID NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
    estado_anterior public.estado_trabajo,
    estado_nuevo    public.estado_trabajo NOT NULL,
    cambiado_por    UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================================
-- FUNCIONES HELPER (SECURITY DEFINER — evitan recursion en las policies)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.lab_id_del_tecnico()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT laboratorio_id FROM tecnicos WHERE id = auth.uid() AND activo;
$$;

CREATE OR REPLACE FUNCTION public.es_tecnico(p_lab UUID DEFAULT NULL)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM usuarios
        WHERE id = auth.uid() AND rol IN ('tecnico_admin', 'tecnico')
    ) THEN
        RETURN false;
    END IF;
    IF p_lab IS NULL THEN RETURN true; END IF;
    RETURN EXISTS (
        SELECT 1 FROM tecnicos
        WHERE id = auth.uid() AND laboratorio_id = p_lab AND activo
    );
END $$;

CREATE OR REPLACE FUNCTION public.es_odontologo_clinica(p_clinica UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM miembros_clinica
        WHERE clinica_id = p_clinica AND usuario_id = auth.uid() AND activo
    );
$$;

-- R2/R3: el paciente solo ve lo de vinculos ACTIVOS hacia su usuario
CREATE OR REPLACE FUNCTION public.tiene_vinculo_activo(p_paciente UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM vinculos_paciente
        WHERE paciente_id = p_paciente
          AND usuario_id  = auth.uid()
          AND estado      = 'activo'
    );
$$;

-- Reutilizable por trabajo_piezas, archivos e historial_estados
CREATE OR REPLACE FUNCTION public.es_trabajo_visible(p_trabajo UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
    SELECT EXISTS (
        SELECT 1 FROM trabajos t
        WHERE t.id = p_trabajo
          AND (
              public.es_tecnico(t.laboratorio_id)
              OR public.es_odontologo_clinica(t.clinica_id)
              OR public.tiene_vinculo_activo(t.paciente_id)
          )
    );
$$;

-- =========================================================================
-- TRIGGERS DE NEGOCIO
-- =========================================================================

-- 13a. updated_at automatico
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END $$;

CREATE TRIGGER trg_usuarios_updated   BEFORE UPDATE ON usuarios  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_pacientes_updated  BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_trabajos_updated   BEFORE UPDATE ON trabajos  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 13b. Perfil automatico: cada signup en auth.users crea su fila en usuarios.
--      rol por defecto 'paciente' (el tecnico/admin se asigna desde el panel).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nombre, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente')::public.rol_usuario
    );
    RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 13c. Pipeline: transiciones validas segun la especificacion funcional
--      Recibido → En Diseño → En Fabricación → Entregado.
--      Cualquier estado → Cancelado.
CREATE OR REPLACE FUNCTION public.valida_transicion_estado()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        IF NOT (
            (OLD.estado = 'Recibido'           AND NEW.estado IN ('En Diseño', 'Cancelado'))
            OR (OLD.estado = 'En Diseño'       AND NEW.estado IN ('En Fabricación', 'Cancelado'))
            OR (OLD.estado = 'En Fabricación'  AND NEW.estado IN ('Entregado', 'Cancelado'))
            OR (OLD.estado = 'Entregado'       AND NEW.estado = 'Cancelado')
        ) THEN
            RAISE EXCEPTION 'Transición de estado inválida: % → %', OLD.estado, NEW.estado;
        END IF;
    END IF;
    RETURN NEW;
END $$;

CREATE TRIGGER trg_trabajos_transicion
    BEFORE UPDATE ON trabajos
    FOR EACH ROW EXECUTE FUNCTION public.valida_transicion_estado();

-- 13d. Auditoria automatica de cambios de estado
CREATE OR REPLACE FUNCTION public.registra_cambio_estado()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF OLD.estado IS DISTINCT FROM NEW.estado THEN
        INSERT INTO historial_estados (trabajo_id, estado_anterior, estado_nuevo, cambiado_por)
        VALUES (NEW.id, OLD.estado, NEW.estado, auth.uid());
    END IF;
    RETURN NEW;
END $$;

CREATE TRIGGER trg_trabajos_historial
    AFTER UPDATE ON trabajos
    FOR EACH ROW EXECUTE FUNCTION public.registra_cambio_estado();

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
-- Principio: sin policy, DENEGADO. service_role (backend/edge functions)
-- bypasea RLS y puede todo. Cada pagina (front) usa la anon key y solo
-- ve lo que las policies permiten.

ALTER TABLE laboratorios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios            ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitios              ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinicas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE miembros_clinica    ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE vinculos_paciente   ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE trabajo_piezas      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos               ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estados   ENABLE ROW LEVEL SECURITY;

-- --- laboratorios: solo lectores miembros del lab; CRUD por service_role
CREATE POLICY lab_select_miembros ON laboratorios
    FOR SELECT TO authenticated
    USING (
        id = public.lab_id_del_tecnico()
        OR EXISTS (
            SELECT 1 FROM clinicas c
            WHERE c.laboratorio_id = laboratorios.id
              AND public.es_odontologo_clinica(c.id)
        )
    );

-- --- usuarios: tu perfil; tecnicos ven los usuarios vinculados a pacientes de su lab
CREATE POLICY usuarios_select_propio ON usuarios
    FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR EXISTS (
            SELECT 1
            FROM vinculos_paciente v
            JOIN pacientes p ON p.id = v.paciente_id
            WHERE v.usuario_id = usuarios.id
              AND p.laboratorio_id = public.lab_id_del_tecnico()
        )
    );

CREATE POLICY usuarios_insert_propio ON usuarios
    FOR INSERT TO authenticated
    WITH CHECK (id = auth.uid());

CREATE POLICY usuarios_update_propio ON usuarios
    FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- --- tecnicos: perfil publico de los tecnicos activos (landings de las paginas)
--     NOTA: expone nombre/cargo/especialidades al anon. Si no quieres eso,
--     cambia TO anon, authenticated por TO authenticated.
CREATE POLICY tecnicos_select_publico ON tecnicos
    FOR SELECT TO anon, authenticated
    USING (activo);

-- --- sitios: lookup de dominio en el registro; CRUD por service_role
CREATE POLICY sitios_select_auth ON sitios
    FOR SELECT TO authenticated
    USING (activo);

-- --- clinicas: tecnico del lab o odontologo miembro
CREATE POLICY clinicas_select ON clinicas
    FOR SELECT TO authenticated
    USING (
        public.es_tecnico(clinicas.laboratorio_id)
        OR public.es_odontologo_clinica(clinicas.id)
    );

CREATE POLICY clinicas_write_tecnico ON clinicas
    FOR ALL TO authenticated
    USING (public.es_tecnico(clinicas.laboratorio_id))
    WITH CHECK (public.es_tecnico(clinicas.laboratorio_id));

-- --- miembros_clinica
CREATE POLICY miembros_select ON miembros_clinica
    FOR SELECT TO authenticated
    USING (
        public.es_odontologo_clinica(miembros_clinica.clinica_id)
        OR EXISTS (
            SELECT 1 FROM clinicas c
            WHERE c.id = miembros_clinica.clinica_id
              AND public.es_tecnico(c.laboratorio_id)
        )
    );

CREATE POLICY miembros_write_tecnico ON miembros_clinica
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM clinicas c
            WHERE c.id = miembros_clinica.clinica_id
              AND public.es_tecnico(c.laboratorio_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinicas c
            WHERE c.id = miembros_clinica.clinica_id
              AND public.es_tecnico(c.laboratorio_id)
        )
    );

-- --- pacientes (R2/R4): tecnico del lab gestiona; paciente ve el suyo;
--     odontologo ve los pacientes con trabajos en su clinica
CREATE POLICY pacientes_select ON pacientes
    FOR SELECT TO authenticated
    USING (
        public.es_tecnico(pacientes.laboratorio_id)
        OR public.tiene_vinculo_activo(pacientes.id)
        OR EXISTS (
            SELECT 1 FROM trabajos t
            WHERE t.paciente_id = pacientes.id
              AND public.es_odontologo_clinica(t.clinica_id)
        )
    );

CREATE POLICY pacientes_write_tecnico ON pacientes
    FOR ALL TO authenticated
    USING (public.es_tecnico(pacientes.laboratorio_id))
    WITH CHECK (public.es_tecnico(pacientes.laboratorio_id));

-- El odontologo puede CREAR pacientes (al registrar una orden); solo
-- los tecnicos pueden editarlos o borrarlos (R4).
CREATE POLICY pacientes_insert_odontologo ON pacientes
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM clinicas c
            WHERE c.laboratorio_id = pacientes.laboratorio_id
              AND public.es_odontologo_clinica(c.id)
        )
    );

-- --- vinculos_paciente: paciente ve SU vinculo; tecnico los de su lab
CREATE POLICY vinculos_select ON vinculos_paciente
    FOR SELECT TO authenticated
    USING (
        vinculos_paciente.usuario_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM pacientes p
            WHERE p.id = vinculos_paciente.paciente_id
              AND public.es_tecnico(p.laboratorio_id)
        )
    );

CREATE POLICY vinculos_write_tecnico ON vinculos_paciente
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM pacientes p
            WHERE p.id = vinculos_paciente.paciente_id
              AND public.es_tecnico(p.laboratorio_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM pacientes p
            WHERE p.id = vinculos_paciente.paciente_id
              AND public.es_tecnico(p.laboratorio_id)
        )
    );

-- --- trabajos: tecnico (su lab) / odontologo (su clinica) / paciente (vinculo activo)
CREATE POLICY trabajos_select ON trabajos
    FOR SELECT TO authenticated
    USING (
        public.es_tecnico(trabajos.laboratorio_id)
        OR public.es_odontologo_clinica(trabajos.clinica_id)
        OR public.tiene_vinculo_activo(trabajos.paciente_id)
    );

CREATE POLICY trabajos_insert ON trabajos
    FOR INSERT TO authenticated
    WITH CHECK (
        public.es_tecnico(trabajos.laboratorio_id)
        OR public.es_odontologo_clinica(trabajos.clinica_id)
    );

CREATE POLICY trabajos_update_tecnico ON trabajos
    FOR UPDATE TO authenticated
    USING (public.es_tecnico(trabajos.laboratorio_id))
    WITH CHECK (public.es_tecnico(trabajos.laboratorio_id));
-- Sin policy DELETE: eliminar trabajos solo via service_role (auditoria).

-- --- trabajo_piezas: hereda la visibilidad del trabajo padre
CREATE POLICY piezas_select ON trabajo_piezas
    FOR SELECT TO authenticated
    USING (public.es_trabajo_visible(trabajo_piezas.trabajo_id));

CREATE POLICY piezas_write ON trabajo_piezas
    FOR ALL TO authenticated
    USING (public.es_trabajo_visible(trabajo_piezas.trabajo_id))
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trabajos t
            WHERE t.id = trabajo_piezas.trabajo_id
              AND (public.es_tecnico(t.laboratorio_id)
                   OR public.es_odontologo_clinica(t.clinica_id))
        )
    );

-- --- pagos
CREATE POLICY pagos_select ON pagos
    FOR SELECT TO authenticated
    USING (
        public.es_tecnico(pagos.laboratorio_id)
        OR public.es_odontologo_clinica(pagos.clinica_id)
    );

CREATE POLICY pagos_insert ON pagos
    FOR INSERT TO authenticated
    WITH CHECK (
        public.es_tecnico(pagos.laboratorio_id)
        OR public.es_odontologo_clinica(pagos.clinica_id)
    );
-- Sin UPDATE/DELETE: los pagos son inmutables (se anulan con nuevo registro).

-- --- archivos: hereda la visibilidad del trabajo
CREATE POLICY archivos_select ON archivos
    FOR SELECT TO authenticated
    USING (public.es_trabajo_visible(archivos.trabajo_id));

CREATE POLICY archivos_insert ON archivos
    FOR INSERT TO authenticated
    WITH CHECK (
        public.es_trabajo_visible(archivos.trabajo_id)
        AND archivos.subido_por = auth.uid()
    );

CREATE POLICY archivos_update_tecnico ON archivos
    FOR UPDATE TO authenticated
    USING (public.es_trabajo_visible(archivos.trabajo_id))
    WITH CHECK (public.es_trabajo_visible(archivos.trabajo_id));

-- --- historial_estados: solo lectura de trabajos visibles
CREATE POLICY historial_select ON historial_estados
    FOR SELECT TO authenticated
    USING (public.es_trabajo_visible(historial_estados.trabajo_id));

-- =========================================================================
-- STORAGE (bucket privado de archivos de trabajos — aqui vive el binario)
-- =========================================================================
-- Bucket 'trabajos-archivos': radiografias, escaneos 3D, fotos clinicas y
-- prescripciones. La tabla `archivos` solo guarda el ENLACE (storage_path),
-- nunca el archivo en si.
-- Convencion de rutas: trabajos-archivos/{trabajo_id}/{nombre_archivo}
-- Las policies de abajo validan, mediante la ruta del archivo, si el
-- usuario tiene permiso sobre ese trabajo especifico ANTES de permitir
-- subir o descargar.
INSERT INTO storage.buckets (id, name, public)
VALUES ('trabajos-archivos', 'trabajos-archivos', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY bucket_select ON storage.objects
    FOR SELECT TO authenticated
    USING (
        bucket_id = 'trabajos-archivos'
        AND public.es_trabajo_visible(((storage.foldername(name))[2])::uuid)
    );

CREATE POLICY bucket_insert ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'trabajos-archivos'
        AND public.es_trabajo_visible(((storage.foldername(name))[2])::uuid)
    );

CREATE POLICY bucket_delete ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'trabajos-archivos'
        AND public.es_trabajo_visible(((storage.foldername(name))[2])::uuid)
    );

-- =========================================================================
-- INDICES (PostgreSQL NO indexa FKs automaticamente)
-- =========================================================================
CREATE INDEX idx_laboratorios_slug      ON laboratorios(slug);
CREATE INDEX idx_usuarios_email         ON usuarios(email);
CREATE INDEX idx_usuarios_rol           ON usuarios(rol);
CREATE INDEX idx_tecnicos_lab           ON tecnicos(laboratorio_id);
CREATE INDEX idx_tecnicos_email         ON tecnicos(email);
CREATE INDEX idx_sitios_lab             ON sitios(laboratorio_id);
CREATE INDEX idx_sitios_tecnico         ON sitios(tecnico_id);
CREATE INDEX idx_clinicas_lab           ON clinicas(laboratorio_id);
CREATE INDEX idx_miembros_usuario       ON miembros_clinica(usuario_id);   -- PK cubre (clinica_id, usuario_id)
CREATE INDEX idx_pacientes_lab          ON pacientes(laboratorio_id);
CREATE INDEX idx_pacientes_creado_por   ON pacientes(creado_por);
CREATE INDEX idx_vinculos_usuario       ON vinculos_paciente(usuario_id);
CREATE INDEX idx_vinculos_paciente      ON vinculos_paciente(paciente_id);
CREATE INDEX idx_vinculos_tecnico       ON vinculos_paciente(tecnico_id);
CREATE INDEX idx_trabajos_lab_estado    ON trabajos(laboratorio_id, estado);  -- cola de produccion del tecnico
CREATE INDEX idx_trabajos_clinica       ON trabajos(clinica_id);
CREATE INDEX idx_trabajos_paciente      ON trabajos(paciente_id);
CREATE INDEX idx_trabajos_tecnico       ON trabajos(tecnico_id);
CREATE INDEX idx_trabajos_entrega       ON trabajos(fecha_entrega);

-- Paginacion keyset del feed (src/lib/pagination.js — ver ADR 006):
-- el cursor compuesto (fecha_ingreso, id) pide cada pagina con
--   WHERE (fecha_ingreso, id) < (cursor.fecha, cursor.id)
-- Este indice hace ese salto O(log n) en vez de un scan secuencial,
-- y es ESTABLE ante inserciones (no "corre" filas como OFFSET).
-- Sin el, la paginacion del front pierde su beneficio.
CREATE INDEX idx_trabajos_keyset        ON trabajos(fecha_ingreso DESC, id DESC);

CREATE INDEX idx_trabajo_piezas_pieza   ON trabajo_piezas(pieza_dental);      -- busqueda inversa por pieza
CREATE INDEX idx_pagos_lab_fecha        ON pagos(laboratorio_id, fecha_pago DESC);
CREATE INDEX idx_pagos_clinica          ON pagos(clinica_id);
CREATE INDEX idx_archivos_trabajo       ON archivos(trabajo_id);
CREATE INDEX idx_historial_trabajo      ON historial_estados(trabajo_id);

-- =========================================================================
-- DATOS DE EJEMPLO (opcional — descomentar para probar)
-- =========================================================================
-- INSERT INTO laboratorios (nombre, slug, email)
-- VALUES ('Kamila Lab', 'kamila-lab', 'hola@kamilalab.com');
--
-- -- 1) crear usuario en Supabase Auth, luego:
-- INSERT INTO tecnicos (id, laboratorio_id, nombre, email)
-- SELECT u.id, l.id, 'Kamila', 'kamila@kamilalab.com'
-- FROM usuarios u, laboratorios l
-- WHERE u.email = 'tecnico@kamilalab.com' AND l.slug = 'kamila-lab';
-- UPDATE usuarios SET rol = 'tecnico' WHERE email = 'tecnico@kamilalab.com';
--
-- INSERT INTO sitios (laboratorio_id, dominio, nombre, tecnico_id)
-- SELECT l.id, 'kamilalab.com', 'Kamila Lab Oficial', t.id
-- FROM laboratorios l, tecnicos t WHERE l.slug = 'kamila-lab' AND t.email = 'kamila@kamilalab.com';
--
-- INSERT INTO clinicas (laboratorio_id, nombre, telefono, direccion)
-- SELECT id, 'Clínica Dental Sonrisa', '+58-412-0000000', 'Av. Principal, Caracas'
-- FROM laboratorios WHERE slug = 'kamila-lab';
--
-- INSERT INTO pacientes (laboratorio_id, nombre, documento, creado_por)
-- SELECT l.id, 'Juan Pérez', 'V-12345678', t.id
-- FROM laboratorios l, tecnicos t
-- WHERE l.slug = 'kamila-lab' AND t.email = 'kamila@kamilalab.com';

-- =========================================================================
-- FIN DEL ESQUEMA — notas de operacion:
-- 1. Alta de un nuevo cliente de la agencia: INSERT laboratorio + sitio
--    (dominio de su pagina) + tecnico (usuario creado en Auth con rol
--    'tecnico'). Todo por service_role o desde un panel admin.
-- 2. El front de cada pagina conecta con Supabase y RLS aplica el aislamiento.
-- 3. Alta de odontologo: signup → UPDATE usuarios rol='odontologo' →
--    INSERT miembros_clinica (service_role o panel del tecnico).
-- 4. Registro de paciente desde una pagina: signup → edge function lee el
--    dominio → INSERT vinculos_paciente(paciente, usuario, tecnico, sitio).
-- =========================================================================
