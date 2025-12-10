const usuarioModel = require('../models/usuario.model');
const bcrypt = require('bcrypt'); // Para encriptar y verificar contraseñas
const jwt = require('jsonwebtoken'); // Para crear los tokens de sesión
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;
const saltRounds = 10; // Nivel de seguridad de encriptación

//VALIDACIÓN DE FUERZA DE CONTRASEÑA ---
const checkPasswordStrength = (password) => {
    let strength = 0;
    const notes = [];

    if (password.length < 8) {
        notes.push("Mínimo 8 caracteres.");
    } else {
        strength += 1;
    }
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
        strength += 1;
    } else {
        notes.push("Debe incluir mayúsculas y minúsculas.");
    }
    if (password.match(/\d/)) {
        strength += 1;
    } else {
        notes.push("Debe incluir números.");
    }
    if (password.match(/[^a-zA-Z\d]/)) {
        strength += 1;
    } else {
        notes.push("Debe incluir símbolos o caracteres especiales.");
    }

    if (strength <= 2) return { level: 'Débil', notes };
    if (strength === 3) return { level: 'Intermedio', notes: ['Recomendable usar más símbolos.'] };
    return { level: 'Fuerte', notes: ['Contraseña robusta.'] };
};
// --------------------------------------------------------

// Lógica para REGISTRAR UN NUEVO USUARIO
const register = async (req, res) => {
    const { email, password, rol } = req.body;

    // 1. Validar fuerza de la contraseña (Requisito)
    const strength = checkPasswordStrength(password);
    if (strength.level === 'Débil') {
        return res.status(400).json({
            message: 'La contraseña es muy débil.',
            details: strength.notes,
            strength: strength.level
        });
    }

    try {
        // 2. Verificar si el usuario ya existe
        if (await usuarioModel.findByEmail(email)) {
            return res.status(409).json({ message: 'El email ya está registrado.' });
        }

        // 3. Encriptar la contraseña
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 4. Registrar en la DB
        const newUser = await usuarioModel.registerUser(email, password_hash, rol);

        // 5. Generar token para iniciar sesión automáticamente
        const token = jwt.sign({ id: newUser.id, rol: newUser.rol }, JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({
            message: 'Usuario registrado exitosamente.',
            token,
            user: { id: newUser.id, email: newUser.email, rol: newUser.rol }
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        return res.status(500).json({ message: 'Error interno del servidor al registrar.' });
    }
};

// Lógica para INICIAR SESIÓN
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Buscar usuario por email
        const user = await usuarioModel.findByEmail(email);

        if (!user || !user.activo) {
            return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
        }

        // 2. Comparar la contraseña ingresada con el hash guardado (Requisito)
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' });
        }

        // 3. Generar JWT (Requisito: Permisos)
        const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: { id: user.id, email: user.email, rol: user.rol }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ message: 'Error interno del servidor al iniciar sesión.' });
    }
};

module.exports = {
    register,
    login,
    checkPasswordStrength // Exportamos la utilidad para futuras validaciones
};