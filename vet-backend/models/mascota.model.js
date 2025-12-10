const pool = require('../config/db.config');

// Encontrar todas las mascotas activas y con JOIN al dueño
const findAll = async () => {
    const query = `
        SELECT 
            m.id, m.nombre, m.especie, m.raza, m.fecha_nacimiento, m.peso_inicial, m.foto_url, m.activo, m.id_dueno,
            d.nombre AS dueno_nombre, 
            d.telefono AS dueno_telefono,
            d.email AS dueno_email
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id  -- CRÍTICO: Usar LEFT JOIN
        WHERE m.activo = TRUE
        ORDER BY m.nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};


// 1. Listar todas las mascotas (solo activas y con datos del dueño)
const findAllActive = async () => {
    const query = `
        SELECT 
            m.id, m.nombre, m.especie, m.raza, m.fecha_nacimiento, m.foto_url, m.activo,
            d.nombre as dueno_nombre, d.telefono as dueno_telefono
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id
        WHERE m.activo = TRUE
    `;
    const result = await pool.query(query);
    return result.rows;
};

// 2. Crear nueva mascota (POST)
const create = async (data) => {

    const query = `
        INSERT INTO mascotas (id_dueno, nombre, especie, raza, fecha_nacimiento, peso_inicial, foto_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const values = [
        data.id_dueno, data.nombre, data.especie, data.raza,
        data.fecha_nacimiento, data.peso_inicial, data.foto_url
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// 3. Actualizar mascota (PUT)
const update = async (id, data) => {

    const query = `
        UPDATE mascotas SET 
        id_dueno = COALESCE($1, id_dueno), 
        nombre = COALESCE($2, nombre), 
        especie = COALESCE($3, especie), 
        raza = COALESCE($4, raza), 
        fecha_nacimiento = COALESCE($5, fecha_nacimiento), 
        peso_inicial = COALESCE($6, peso_inicial), 
        foto_url = COALESCE($7, foto_url), 
        activo = COALESCE($8, activo)
        WHERE id = $9
        RETURNING *
    `;
    const values = [
        data.id_dueno, data.nombre, data.especie, data.raza,
        data.fecha_nacimiento, data.peso_inicial, data.foto_url, data.activo, id
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
};

// 4. Eliminación Lógica (DELETE)
const logicalDelete = async (id) => {

    const query = 'UPDATE mascotas SET activo = FALSE WHERE id = $1 RETURNING id, nombre, activo';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// 5. Encontrar por ID
const findById = async (id) => {
    const query = `
        SELECT 
            m.*, 
            d.nombre AS dueno_nombre, 
            d.telefono AS dueno_telefono,
            d.email AS dueno_email
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id  -- ¡CRÍTICO: Cambiar a LEFT JOIN!
        WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// 6. Buscar por dueño
const findByDuenoId = async (idDueno) => {

    const query = `
        SELECT 
            m.*, 
            d.nombre AS dueno_nombre, 
            d.telefono AS dueno_telefono,
            d.email AS dueno_email
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id
        WHERE m.id_dueno = $1 AND m.activo = TRUE
        ORDER BY m.nombre ASC
    `;
    const result = await pool.query(query, [idDueno]);
    return result.rows;
};

// 7. Reactivación (Restore)
const restore = async (id) => {

    const query = 'UPDATE mascotas SET activo = TRUE WHERE id = $1 RETURNING id, nombre, activo';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// 8. Listar TODAS las mascotas (activas e inactivas)
const findAllIncludingInactive = async () => {

    const query = `
        SELECT 
            m.id, m.nombre, m.especie, m.raza, m.fecha_nacimiento, m.foto_url, m.activo,
            d.nombre as dueno_nombre, d.telefono as dueno_telefono
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id
    `;
    const result = await pool.query(query);
    return result.rows;
};

const searchMascotas = async (searchTerm) => {

    const query = `
        SELECT 
            m.*, 
            d.nombre AS dueno_nombre, 
            d.telefono AS dueno_telefono
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id
        WHERE 
            m.activo = TRUE AND (
                m.nombre ILIKE $1 OR 
                d.nombre ILIKE $1
            )
        ORDER BY m.nombre ASC
    `;
    const values = [`%${searchTerm}%`];
    const result = await pool.query(query, values);
    return result.rows;
};

// Función para actualizar el estado lógico (usada para Dar de Baja y Reactivar)
const updateStatus = async (id, activo) => {
    const query = 'UPDATE mascotas SET activo = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [activo, id]);
    return result.rows[0];
};

// Función para listar solo mascotas inactivas (Historial Pacientes)
const findInactive = async () => {
    const query = `
        SELECT m.*, d.nombre AS dueno_nombre
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id
        WHERE m.activo = FALSE
        ORDER BY m.nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

const searchAndList = async (searchTerm) => {
    // Si no hay término de búsqueda, devuelve la lista completa (usando findAll)
    if (!searchTerm) {
        return findAll();
    }

    // Si hay término de búsqueda, usamos la lógica existente
    const query = `
        SELECT 
            m.id, m.nombre, m.especie, m.raza, m.fecha_nacimiento, m.foto_url, m.activo, m.id_dueno,
            d.nombre AS dueno_nombre, 
            d.telefono AS dueno_telefono
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id
        WHERE 
            m.activo = TRUE AND (
                m.nombre ILIKE $1 OR 
                d.nombre ILIKE $1
            )
        ORDER BY m.nombre ASC
    `;
    const values = [`%${searchTerm}%`];
    const result = await pool.query(query, values);
    return result.rows;
};

module.exports = {
    findAllActive,
    create,
    update,
    logicalDelete,
    findById,
    findByDuenoId,
    restore,
    findAllIncludingInactive,
    findAll,
    searchMascotas,
    updateStatus,
    findInactive,
    searchAndList
};