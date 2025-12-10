// Archivo: /vet-backend/controllers/dueno.controller.js
const duenoModel = require('../models/dueno.model');

// 1. Crear Dueño (POST)
const createDueno = async (req, res) => {
    try {
        const newDueno = await duenoModel.create(req.body);
        return res.status(201).json({ message: 'Dueño registrado.', dueno: newDueno });
    } catch (error) {
        console.error('Error al crear dueño:', error);
        // Manejar errores de unicidad (ej. email)
        return res.status(500).json({ message: 'Error interno del servidor al crear dueño.' });
    }
};

// 2. Listar Dueños (GET)
const getAllDuenos = async (req, res) => {
    try {
        const duenos = await duenoModel.findAll();
        return res.status(200).json(duenos);
    } catch (error) {
        return res.status(500).json({ message: 'Error interno del servidor al listar dueños.' });
    }
};

// Buscar dueños por nombre, teléfono o email
const searchDuenos = async (req, res) => {
    try {
        const { search } = req.query;

        if (!search || search.length < 3) {
            return duenoController.getAllDuenos(req, res);
        }

        const duenos = await duenoModel.search(search);
        res.status(200).json(duenos);

    } catch (error) {
        console.error('Error al buscar dueños:', error);
        res.status(500).json({ message: 'Error interno del servidor al buscar dueños.' });
    }
};

// [AÑADIDO] GET /api/duenos/:id - Obtener un solo dueño
const getDuenoById = async (req, res) => {
    const { id } = req.params;
    try {
        const dueno = await duenoModel.findById(id);
        if (!dueno) {
            return res.status(404).json({ message: 'Dueño no encontrado.' });
        }
        res.status(200).json(dueno);
    } catch (error) {
        console.error('Error al obtener dueño por ID:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// [AÑADIDO] PUT /api/duenos/:id - Actualizar datos del dueño
const updateDueno = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedDueno = await duenoModel.update(id, req.body);
        if (!updatedDueno) {
            return res.status(404).json({ message: 'Dueño no encontrado.' });
        }
        res.status(200).json({ message: 'Dueño actualizado con éxito', dueno: updatedDueno });
    } catch (error) {
        console.error('Error al actualizar dueño:', error);
        // Manejar error de unicidad (ej. email repetido)
        res.status(500).json({ message: error.constraint === 'duenos_email_key' ? 'El email ya está registrado.' : 'Error interno del servidor.' });
    }
};


module.exports = {
    createDueno,
    getAllDuenos,
    searchDuenos,
    getDuenoById,
    updateDueno,
};