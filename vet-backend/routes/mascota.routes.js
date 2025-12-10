// Archivo: /vet-backend/routes/mascota.routes.js (VERSIÓN FINAL CON TUS NOMBRES)

const express = require('express');
const router = express.Router();
const mascotaController = require('../controllers/mascota.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const { validateMascota } = require('../middlewares/validation.middleware');

// --- Rutas de Lectura (GET) ---

// 1. Listar y Buscar Mascotas Activas (Ruta raíz /api/mascotas)
// Usa la función de listado general y búsqueda que tienes implementada
router.get('/', verifyToken, mascotaController.searchAndListMascotas);

// 2. Obtener Detalle de una Mascota por ID
router.get('/:id', verifyToken, mascotaController.findById);

// 3. Obtener listado de mascotas de baja (Historial Pacientes - Admin)
router.get('/baja', verifyToken, isAdmin, mascotaController.getInactiveMascotas);
// 4. Listar TODOS (activos e inactivos) (Admin)
router.get('/admin/all', verifyToken, isAdmin, mascotaController.findAllIncludingInactive);

// --- Rutas de Escritura (POST, PUT) ---

// 5. Crear Mascota (POST)
router.post('/', verifyToken, validateMascota, mascotaController.create);

// 6. Actualización COMPLETA de datos
router.put('/:id', verifyToken, validateMascota, mascotaController.update);

// 7. Cambiar estado lógico (Dar de Baja y Reactivar)
router.put('/estado/:id', verifyToken, isAdmin, mascotaController.updateStatus);

module.exports = router;