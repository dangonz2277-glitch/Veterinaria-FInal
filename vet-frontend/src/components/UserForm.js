// Archivo: /vet-frontend/src/components/UserForm.js
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth/register';

const UserForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('veterinario'); // Valor por defecto
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('No autorizado. Por favor, inicie sesión.');
            return;
        }

        try {
            // Se envía el rol, email y password al Backend (POST /api/auth/register)
            await axios.post(API_URL, { email, password, rol }, {
                headers: {
                    'Authorization': `Bearer ${token}` // 🔑 Requiere el JWT para la seguridad
                }
            });

            setMessage(`✅ Usuario ${email} registrado exitosamente como ${rol}.`);
            setEmail('');
            setPassword('');

        } catch (err) {
            console.error(err);
            // Capturar errores de validación (ej. email ya existe)
            const errorMessage = err.response?.data?.message || 'Error al registrar el usuario. Verifique los datos.';
            setError(errorMessage);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px', border: '1px solid #ccc' }}>
            <h2>Registro de Nuevos Usuarios (Admin)</h2>
            <form onSubmit={handleSubmit}>
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }}
                />

                <label>Contraseña:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }}
                />

                <label>Rol:</label>
                <select
                    value={rol}
                    onChange={(e) => setRol(e.target.value)}
                    style={{ display: 'block', width: '100%', padding: '10px', margin: '10px 0' }}
                >
                    <option value="veterinario">Veterinario</option>
                    <option value="administrador">Administrador</option>
                </select>

                <button
                    type="submit"
                    style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none' }}
                >
                    Registrar Usuario
                </button>
            </form>
            {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
    );
};

export default UserForm;