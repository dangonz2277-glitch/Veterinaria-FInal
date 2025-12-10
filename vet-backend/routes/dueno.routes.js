const express = require('express');
const router = express.Router();
const duenoController = require('../controllers/dueno.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
// NOTA: duenoModel y validateDueno no son necesarios aquí si solo usamos el controlador

// Rutas protegidas por Token y Rol
router.post('/', verifyToken, isAdmin, duenoController.createDueno);

// 1. Listar TODOS los Dueños (GET /api/duenos) - Para la lista general
router.get('/', verifyToken, isAdmin, duenoController.getAllDuenos);

// 2. Obtener Dueño por ID (GET /api/duenos/:id) - Para cargar el formulario
router.get('/:id', verifyToken, isAdmin, duenoController.getDuenoById);

// 3. Actualizar Dueño (PUT /api/duenos/:id) - Para guardar la edición
router.put('/:id', verifyToken, isAdmin, duenoController.updateDueno);

module.exports = router;