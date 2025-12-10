const pool = require('../config/db.config'); // Conexión a Render

// 1. Crear una nueva ficha médica (POST)
const create = async (data) => {
    // data contiene: id_mascota, id_veterinario, fecha_consulta, diagnostico, tratamiento, motivo_consulta
    const { id_mascota, id_veterinario, fecha_consulta, diagnostico, tratamiento, motivo_consulta } = data; // <-- AÑADIDO motivo_consulta

    // IMPORTANTE: Si quitaste 'peso_actual' en un paso anterior, déjalo fuera del INSERT.
    const query = `
        INSERT INTO fichas_medicas (
            id_mascota, 
            id_veterinario,  
            fecha,           
            diagnostico, 
            tratamiento,
            motivo_consulta  -- ✅ NUEVA COLUMNA INCLUIDA
        )
        VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *;
    `;
    const values = [
        id_mascota,
        id_veterinario,
        fecha_consulta,
        diagnostico,
        tratamiento,
        motivo_consulta
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

// 2. Listar fichas médicas por ID de Mascota (GET)
const findByMascotaId = async (idMascota) => {
    const query = `
        SELECT 
            f.*, 
            u.email AS veterinario_email
        FROM fichas_medicas f
        LEFT JOIN usuarios u ON f.id_veterinario = u.id
        WHERE f.id_mascota = $1
        ORDER BY f.fecha DESC
    `;
    const result = await pool.query(query, [idMascota]);
    return result.rows;
};


// 3. Encontrar una ficha médica por su propio ID (Necesario para el PDF)
const findById = async (id) => {
    const query = `
        SELECT 
            f.*, 
            u.email AS veterinario_email 
        FROM fichas_medicas f
        LEFT JOIN usuarios u ON f.id_veterinario = u.id
        WHERE f.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    create,
    findByMascotaId,
    findById,
};