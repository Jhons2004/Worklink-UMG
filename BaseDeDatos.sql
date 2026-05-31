-- Crear tabla de Estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    carnet VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    biography TEXT,
    cv_url VARCHAR(255),
    location_geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    website VARCHAR(100),
    location_geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Vacantes
CREATE TABLE IF NOT EXISTS vacantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- Híbrido, Tiempo Completo, Medio Tiempo
    salary NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    location_name VARCHAR(100) NOT NULL, -- Municipio
    location_geom GEOMETRY(Point, 4326) NOT NULL,
    company_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'ACTIVA', -- ACTIVA, PAUSADA, FINALIZADA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de Postulaciones
CREATE TABLE IF NOT EXISTS postulaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    job_opening_id UUID NOT NULL REFERENCES vacantes(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ENVIADA', -- ENVIADA, EN_REVISION, ACEPTADA, RECHAZADA
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_job UNIQUE (student_id, job_opening_id)
);

-- Crear tabla de Bitácoras de Auditoría
CREATE TABLE IF NOT EXISTS bitacoras_auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices espaciales para optimizar las consultas de distancia
CREATE INDEX IF NOT EXISTS idx_estudiantes_location ON estudiantes USING gist(location_geom);
CREATE INDEX IF NOT EXISTS idx_empresas_location ON empresas USING gist(location_geom);
CREATE INDEX IF NOT EXISTS idx_vacantes_location ON vacantes USING gist(location_geom);
