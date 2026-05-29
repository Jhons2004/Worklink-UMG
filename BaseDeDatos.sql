CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id INT REFERENCES roles(id),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT,
    foto_perfil TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id INT REFERENCES roles(id),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT,
    foto_perfil TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE estudiantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    carnet VARCHAR(20) UNIQUE NOT NULL,
    carrera VARCHAR(100),
    semestre INT,
    telefono VARCHAR(20),
    habilidades TEXT,
    cv_url TEXT,
    
    -- PostGIS
    ubicacion GEOGRAPHY(POINT, 4326),

    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre_empresa VARCHAR(150) NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    telefono VARCHAR(20),
    sitio_web TEXT,

    -- Coordenadas GPS
    ubicacion GEOGRAPHY(POINT, 4326),

    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE vacantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,

    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    requisitos TEXT,
    salario NUMERIC(10,2),

    modalidad VARCHAR(50),
    tipo_contrato VARCHAR(50),

    estado VARCHAR(30) DEFAULT 'ACTIVA',

    ubicacion GEOGRAPHY(POINT, 4326),

    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre TIMESTAMP
);
CREATE TABLE postulaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    estudiante_id UUID REFERENCES estudiantes(id) ON DELETE CASCADE,
    vacante_id UUID REFERENCES vacantes(id) ON DELETE CASCADE,

    estado VARCHAR(30) DEFAULT 'PENDIENTE',

    mensaje TEXT,

    fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,

    titulo VARCHAR(150),
    mensaje TEXT,

    leida BOOLEAN DEFAULT FALSE,

    fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE historial_postulaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    postulacion_id UUID REFERENCES postulaciones(id) ON DELETE CASCADE,

    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30),

    comentario TEXT,

    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
