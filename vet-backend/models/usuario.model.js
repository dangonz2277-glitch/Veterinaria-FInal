const pool = require('../config/db.config');

// 1. Función para encontrar un usuario por email (Necesario para Login y Registro)
const findByEmail = async (email) => {
    const query = 'SELECT id, email, password_hash, rol, activo FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
};

// 2. Función para registrar un nuevo usuario en la DB
const registerUser = async (email, password_hash, rol = 'veterinario') => {
    // Nota: El campo 'activo' por defecto es TRUE en la DB
    const query = 'INSERT INTO usuarios (email, password_hash, rol) VALUES ($1, $2, $3) RETURNING id, email, rol, activo';
    const result = await pool.query(query, [email, password_hash, rol]);
    return result.rows[0];
};

// 3. Encontrar todos los usuarios
const findAll = async () => {
    const query = 'SELECT id, email, rol, activo FROM usuarios ORDER BY id ASC';
    const result = await pool.query(query);
    return result.rows;
};

// 4. Actualizar Rol y Estado Activo
const update = async (id, rol, activo) => {
    const query = `
        UPDATE usuarios SET 
        rol = COALESCE($1, rol), 
        activo = COALESCE($2, activo)
        WHERE id = $3
        RETURNING id, email, rol, activo
    `;
    // Nota: El Frontend solo envía rol O activo, no la contraseña
    const result = await pool.query(query, [rol, activo, id]);
    return result.rows[0];
};

module.exports = {
    findByEmail,
    registerUser,
    findAll,
    update
};