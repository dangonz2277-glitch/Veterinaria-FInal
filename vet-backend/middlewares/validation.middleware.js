const { body, validationResult } = require('express-validator');

// Verificar los resultados de las validaciones
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // 400 Bad Request
        return res.status(400).json({
            message: 'Error de validación de datos.',
            errors: errors.array()
        });
    }
    next();
};

// Reglas de Validación

// 1. Reglas para el módulo de Mascotas (POST / PUT)
const validateMascota = [
    // El campo 'nombre' no debe estar vacío y debe ser alfanumérico
    body('nombre').trim().notEmpty().withMessage('El nombre de la mascota es obligatorio.')
        .isLength({ max: 100 }).withMessage('El nombre es demasiado largo.'),

    // El campo 'especie' es obligatorio
    body('especie').trim().notEmpty().withMessage('La especie es obligatoria.'),

    // El campo 'id_dueno' debe ser un número entero válido (FK)
    body('id_dueno').isInt({ min: 1 }).withMessage('El ID del dueño debe ser un número entero positivo.'),

    // La fecha de nacimiento debe tener un formato de fecha válido
    body('fecha_nacimiento').optional({ checkFalsy: true }).isDate().withMessage('El formato de la fecha de nacimiento es inválido (AAAA-MM-DD).'),

    // El peso inicial debe ser un número decimal válido
    body('peso_inicial').optional({ checkFalsy: true }).isDecimal().withMessage('El peso debe ser un valor numérico.'),

    // Pasar al manejador de errores
    handleValidationErrors
];


// 2. Reglas para el módulo de Autenticación (Login/Register)
const validateAuth = [
    body('email').isEmail().withMessage('El formato de correo electrónico es inválido.'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
    // Nota: La validación de fuerza avanzada de contraseña ya la tenemos en el controlador (auth.controller.js)

    // Pasar al manejador de errores
    handleValidationErrors
];

// 3. Reglas para el módulo de Dueños (POST / PUT)
const validateDueno = [
    // El campo 'nombre' no debe estar vacío
    body('nombre').trim().notEmpty().withMessage('El nombre del dueño es obligatorio.')
        .isLength({ max: 150 }).withMessage('El nombre es demasiado largo.'),

    // El campo 'email' debe ser un formato de correo válido y es obligatorio
    body('email').notEmpty().withMessage('El correo electrónico es obligatorio.')
        .isEmail().withMessage('El formato de correo electrónico es inválido.'),

    // El campo 'telefono' es opcional, pero si se envía, debe ser alfanumérico
    body('telefono').optional({ checkFalsy: true }).isAlphanumeric('es-ES', { ignore: ' +-()' }).withMessage('El teléfono contiene caracteres inválidos.'),

    // Pasar al manejador de errores
    handleValidationErrors
];

module.exports = {
    validateMascota,
    validateAuth,
    validateDueno
};