const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Función que verifica el token y adjunta los datos del usuario (id, rol) al request
const verifyToken = (req, res, next) => {
    // 1. Obtiene el token de la solicitud
    const token = req.header('Authorization');

    // 2. Verificar si el token existe
    if (!token) {
        // 401 Unauthorized
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        // El token viene como "Bearer <token>", necesitamos solo el <token>
        const tokenValue = token.split(' ')[1];

        // 3. Verificar el token usando la clave secreta
        const decoded = jwt.verify(tokenValue, JWT_SECRET);

        // 4. Adjuntar los datos del usuario decodificado (id, rol) al objeto 'req'
        req.user = decoded;

        next();

    } catch (error) {
        // El token es inválido o ha expirado
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

// Middleware para verificar si el usuario tiene rol 'administrador'
const isAdmin = (req, res, next) => {
    // Revisa si la solicitud pasó primero por verifyToken y si tiene el rol correcto
    if (req.user && req.user.rol === 'administrador') {
        next(); // Es administrador
    } else {
        // 403 Forbidden
        return res.status(403).json({ message: 'Acceso prohibido. Requiere rol de administrador.' });
    }
};

module.exports = {
    verifyToken,
    isAdmin
};