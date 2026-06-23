-- =========================================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS: DENTALCONNECT (MVP)
-- =========================================================================

-- 1. TABLA: CLIENTES (USUARIOS)
-- Almacena odontólogos y clínicas. El email es ÚNICO para permitir el puente con Google Auth.
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre_odontologo VARCHAR(255) NOT NULL,
    clinica VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL, -- NULL si el registro es estrictamente mediante Google Auth
    telefono VARCHAR(50) NOT NULL,
    direccion TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: TRABAJOS
-- Consolida la orden y la especificación técnica de la pieza en una sola fila.
CREATE TABLE trabajos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    paciente VARCHAR(100) NOT NULL,
    tipo_trabajo VARCHAR(100) NOT NULL,    -- Ej: 'Corona', 'Puente', 'Removible'
    material VARCHAR(100) NOT NULL,        -- Ej: 'Zirconio', 'Disilicato', 'Acrílico'
    pieza_dental INT NOT NULL,             -- Número de pieza según nomenclatura FDI (ej: 11, 24, 46)
    color_vita VARCHAR(10) NOT NULL,       -- Código de color (ej: 'A1', 'A2', 'B1')
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente', -- 'Pendiente', 'En proceso', 'Terminado', 'Entregado'
    precio DECIMAL(10, 2) NOT NULL,
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP NOT NULL,
    
    -- Relación con la tabla clientes
    CONSTRAINT fk_trabajos_cliente 
        FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id) 
        ON DELETE CASCADE
);

-- 3. TABLA: PAGOS
-- Registra el flujo financiero. Puede estar atado a un trabajo específico o quedar libre como abono de cuenta.
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    cliente_id INT NOT NULL,
    trabajo_id INT NULL, -- NULL si es un abono general a la cuenta corriente de la clínica
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(100) NOT NULL,    -- Ej: 'Transferencia', 'Efectivo', 'Pago Móvil', 'Zelle'
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Relaciones e Integridad
    CONSTRAINT fk_pagos_cliente 
        FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id) 
        ON DELETE CASCADE,
        
    CONSTRAINT fk_pagos_trabajo 
        FOREIGN KEY (trabajo_id) 
        REFERENCES trabajos(id) 
        ON DELETE SET NULL -- Si se borra un trabajo, no eliminamos el registro del dinero recibido
);

-- =========================================================================
-- OPTIMIZACIÓN (ÍNDICES)
-- Índices estratégicos para acelerar las consultas más comunes en ambos paneles.
-- =========================================================================

-- Optimiza la búsqueda del perfil cuando el odontólogo inicia sesión o se valida con Google
CREATE INDEX idx_clientes_email ON clientes(email);

-- Optimiza la carga del historial de trabajos en el portal del odontólogo
CREATE INDEX idx_trabajos_cliente ON trabajos(cliente_id);

-- Optimiza la cola de producción en el panel del administrador del laboratorio (Técnico)
CREATE INDEX idx_trabajos_estado ON trabajos(estado);
