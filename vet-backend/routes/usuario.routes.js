const express = require('express');
const usuarioController = require('../controllers/usuario.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();

// 1. Listar todos los usuarios (GET) - SOLO ADMIN
router.get('/', verifyToken, isAdmin, usuarioController.getAllUsers);

// 2. Actualizar usuario (PUT) - SOLO ADMIN (usado para cambiar rol o estado activo)
router.put('/:id', verifyToken, isAdmin, usuarioController.updateUser);

module.exports = router;