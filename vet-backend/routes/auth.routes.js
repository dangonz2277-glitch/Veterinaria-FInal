const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateAuth } = require('../middlewares/validation.middleware');
const router = express.Router();

// Aplica la validación antes del controlador
router.post('/register', validateAuth, authController.register);
router.post('/login', validateAuth, authController.login);

module.exports = router;
