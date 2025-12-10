const usuarioModel = require('../models/usuario.model'); // Reutilizamos el modelo existente

// 1. Obtener todos los usuarios (GET)
const getAllUsers = async (req, res) => {
    try {
        const users = await usuarioModel.findAll();
        // Nota: Nunca enviar el password_hash al frontend
        const safeUsers = users.map(user => {
            const { password_hash, ...rest } = user;
            return rest;
        });
        return res.status(200).json(safeUsers);
    } catch (error) {
        return res.status(500).json({ message: 'Error al obtener la lista de usuarios.' });
    }
};

// 2. Actualizar usuario (PUT)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { rol, activo } = req.body; // Solo permitimos actualizar rol y activo

    try {
        // La función del modelo usará COALESCE para actualizar solo los campos enviados
        const updatedUser = await usuarioModel.update(id, rol, activo);

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const { password_hash, ...safeUser } = updatedUser; // Ocultar hash
        return res.status(200).json({ message: 'Usuario actualizado con éxito.', user: safeUser });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        return res.status(500).json({ message: 'Error interno del servidor al actualizar usuario.' });
    }
};

module.exports = {
    getAllUsers,
    updateUser,
};