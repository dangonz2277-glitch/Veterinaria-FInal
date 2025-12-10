const pool = require('./config/db.config');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar Rutas de Autenticación
const authRoutes = require('./routes/auth.routes');
const mascotaRoutes = require('./routes/mascota.routes');
const fichaRoutes = require('./routes/ficha.routes');
const duenoRoutes = require('./routes/dueno.routes')
const usuarioRoutes = require('./routes/usuario.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares esenciales
app.use(cors());
app.use(express.json());

// Definición de Rutas
app.get('/', (req, res) => {
    res.send('API de Veterinaria funcionando! Conectado a Render.');
});

// Usar las rutas de autenticación con el prefijo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/mascotas', mascotaRoutes);
app.use('/api/fichas', fichaRoutes);
app.use('/api/duenos', duenoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});