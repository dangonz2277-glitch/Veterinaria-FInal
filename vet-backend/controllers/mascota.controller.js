const pool = require('../config/db.config');
const mascotaModel = require('../models/mascota.model');
const fichaModel = require('../models/ficha.model');

// Encontrar todas las mascotas activas y con JOIN al dueño
const findAll = async () => {
    // ... (Tu código de findAll) ...
    const query = `
        SELECT 
            m.*, 
            d.nombre AS dueno_nombre, 
            d.telefono AS dueno_telefono,
            d.email AS dueno_email
        FROM mascotas m
        LEFT JOIN duenos d ON m.id_dueno = d.id
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
        JOIN duenos d ON m.id_dueno = d.id
        WHERE m.activo = TRUE
    `;
    const result = await pool.query(query);
    return result.rows;
};

// 2. Crear nueva mascota (POST)
const create = async (req, res) => {
    try {
        const { id_dueno, nombre, especie, raza, fecha_nacimiento, peso_inicial, foto_url } = req.body;

        if (!id_dueno) {
            return res.status(400).json({ message: 'Error: El ID del Dueño es obligatorio y falta.' });
        }

        const payload = {
            id_dueno,
            nombre,
            especie,
            raza,
            fecha_nacimiento,
            peso_inicial,
            foto_url
        };

        const nuevaMascota = await mascotaModel.create(payload); // Llama al modelo
        return res.status(201).json(nuevaMascota);

    } catch (error) {
        console.error('Error al crear mascota (FINAL):', error);
        // Devolver un mensaje más específico si es un error de DB
        if (error.code === '23502') { // Código de error PostgreSQL para NOT NULL violation
            return res.status(500).json({ message: 'Error de la Base de Datos: Falta un campo obligatorio (NOT NULL).', detail: error.detail });
        }
        return res.status(500).json({ message: 'Error interno del servidor al crear mascota.' });
    }
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
const findById = async (req, res) => {
    const { id } = req.params;
    try {
        const mascota = await mascotaModel.findById(id); // Llama al modelo corregido

        if (!mascota) {
            return res.status(404).json({ message: 'Mascota no encontrada.' });
        }
        const fichas = await fichaModel.findByMascotaId(id);
        mascota.fichas = fichas;


        return res.status(200).json(mascota);
    } catch (error) {
        console.error('Error al obtener detalle de mascota (findById):', error);
        // CRÍTICO: Devolver solo el mensaje de error, no el objeto de conexión
        return res.status(500).json({ message: 'Error interno del servidor al obtener detalle de mascota.' });
    }
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
        JOIN duenos d ON m.id_dueno = d.id
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
        JOIN duenos d ON m.id_dueno = d.id
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
        JOIN duenos d ON m.id_dueno = d.id
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

// 🔑 NUEVO: Función para actualizar el estado lógico (usada para Dar de Baja y Reactivar)
const updateStatus = async (id, activo) => {
    const query = 'UPDATE mascotas SET activo = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [activo, id]);
    return result.rows[0];
};

// 🔑 NUEVO: Función para listar solo mascotas inactivas (Historial Pacientes)
const findInactive = async () => {
    const query = `
        SELECT m.*, d.nombre AS dueno_nombre
        FROM mascotas m
        JOIN duenos d ON m.id_dueno = d.id
        WHERE m.activo = FALSE
        ORDER BY m.nombre ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};

// Obtener solo mascotas inactivas (Historial Pacientes)
const getInactiveMascotas = async (req, res) => {
    try {
        // Llama a la función del modelo que lista los inactivos
        const mascotas = await mascotaModel.findInactive();
        res.status(200).json(mascotas);
    } catch (error) {
        console.error('Error al obtener mascotas inactivas:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

const searchAndListMascotas = async (req, res) => {
    try {
        const { search } = req.query; // Obtiene el parámetro de búsqueda

        // Llama a la nueva función unificada del modelo
        const mascotas = await mascotaModel.searchAndList(search);

        return res.status(200).json(mascotas);
    } catch (error) {
        console.error('Error al listar/buscar mascotas:', error);
        return res.status(500).json({ message: 'Error interno del servidor al listar mascotas. Consulte la consola.' });
    }
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
    getInactiveMascotas,
    searchAndListMascotas
};