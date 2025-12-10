const pool = require('../config/db.config');

const create = async (data) => {
    const query = 'INSERT INTO duenos (nombre, telefono, email, direccion) VALUES ($1, $2, $3, $4) RETURNING id, nombre';
    const values = [data.nombre, data.telefono, data.email, data.direccion];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const findAll = async () => {
    const query = 'SELECT * FROM duenos ORDER BY nombre ASC';
    const result = await pool.query(query);
    return result.rows;
};

// [AÑADIDO] Función para buscar por ID
const findById = async (id) => {
    const query = 'SELECT * FROM duenos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

// [AÑADIDO] Función para actualizar
const update = async (id, data) => {
    const { nombre, telefono, email, direccion } = data;
    const query = `
        UPDATE duenos 
        SET nombre = $1, telefono = $2, email = $3, direccion = $4
        WHERE id = $5 
        RETURNING *;
    `;
    const values = [nombre, telefono, email, direccion, id];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const search = async (searchTerm) => {
    // ... (Tu código de búsqueda) ...
    const query = `
        SELECT id, nombre, telefono, email, direccion 
        FROM duenos 
        WHERE nombre ILIKE $1 OR telefono ILIKE $1 OR email ILIKE $1
        LIMIT 10
    `;
    const values = [`%${searchTerm}%`];
    const result = await pool.query(query, values);
    return result.rows;
};


module.exports = {
    create,
    findAll,
    findById,
    update,
    search,
};