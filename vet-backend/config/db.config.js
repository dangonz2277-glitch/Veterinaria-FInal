// Carga variables de entorno
require('dotenv').config();

// Importa el cliente de PostgreSQL
const { Pool } = require('pg');

// Configuración de la conexión con variables del .env
const poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    // Configuración esencial para la conexión SSL externa (Render)
    ssl: {
        rejectUnauthorized: false
        // Pruebas con render
    },
    max: 20, // Máximo de 20 clientes/conexiones a la vez
    idleTimeoutMillis: 30000, // Los clientes inactivos se cierran después de 30 segundos
    connectionTimeoutMillis: 2000, // Error si no se conecta en 2 segundos
};

// Crear el Pool de conexiones
const pool = new Pool(poolConfig);

// Verificar la conexión (opcional, pero buena práctica)
pool.connect((err, client, release) => {
    if (err) {
        return console.error('--- ❌ ERROR AL CONECTAR LA BASE DE DATOS DE RENDER ---', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('--- ❌ ERROR EN LA CONSULTA DE PRUEBA ---', err.stack);
        }
        console.log('✅ Conexión exitosa a PostgreSQL (Render) establecida:', result.rows[0].now);
    });
});

// Exportar el pool para ser usado por los Modelos
module.exports = pool;