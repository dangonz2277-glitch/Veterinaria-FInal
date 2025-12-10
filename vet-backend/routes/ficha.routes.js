const express = require('express');
const fichaController = require('../controllers/ficha.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const router = express.Router();

// 1. Crear ficha (POST)
router.post('/', verifyToken, fichaController.createFicha);

// 2. Obtener historial por ID de Mascota (GET /api/fichas/mascota/:idMascota)
router.get('/mascota/:idMascota', verifyToken, fichaController.getFichasByMascota);

// 3. Generar Reporte PDF (GET /api/fichas/reporte/:id)
router.get('/reporte/:id', verifyToken, fichaController.generateFichaPdf);

// 4. Obtener Detalle de Ficha por ID (GET /api/fichas/:id)
router.get('/:id', verifyToken, fichaController.getFichaById);


module.exports = router;