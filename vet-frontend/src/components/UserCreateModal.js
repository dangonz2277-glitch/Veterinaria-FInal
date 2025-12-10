import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// El modal recibe tres props:
// 1. isVisible: booleano para mostrar/ocultar.
// 2. onClose: función para cerrar el modal.
// 3. onUserCreated: función para refrescar la lista padre.
const UserCreateModal = ({ isVisible, onClose, onUserCreated }) => {

    // Estados del formulario
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rol, setRol] = useState('veterinario');

    // Estados de feedback
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isVisible) return null;

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            await axios.post(`${API_BASE_URL}/auth/register`,
                { email, password, rol },
                { headers });

            setMessage(`✅ Usuario ${email} registrado exitosamente.`);

            // 1. Llamar a la función para refrescar la lista padre
            onUserCreated();

            // 2. Limpiar formulario y cerrar modal después de un breve retraso
            setTimeout(() => {
                setEmail('');
                setPassword('');
                setRol('veterinario');
                setLoading(false);
            }, 1500);

        } catch (err) {
            setLoading(false);
            const errorMessage = err.response?.data?.message || 'Error al registrar. Verifique los datos o si el email ya existe.';
            setError(errorMessage);
            setMessage('');
        }
    };

    // Estilos básicos para el modal
    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000 // Asegura que esté por encima de todo
    };

    const contentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '400px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
        position: 'relative'
    };

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer' }}
                    disabled={loading}
                >
                    &times;
                </button>

                <h3>Registrar Nuevo Usuario</h3>

                {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

                <form onSubmit={handleCreateUser}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo electrónico:</label>
                    <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        disabled={loading}
                    />

                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña:</label>
                    <input
                        type="password"
                        placeholder="Mín. 8 caracteres, Mayúsculas, Números, Símbolos"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                        disabled={loading}
                    />

                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Rol:</label>
                    <select
                        value={rol}
                        onChange={(e) => setRol(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '20px' }}
                        disabled={loading}
                    >
                        <option value="veterinario">Veterinario</option>
                        <option value="administrador">Administrador</option>
                    </select>

                    <button
                        type="submit"
                        style={{ width: '100%', padding: '10px', backgroundColor: loading ? '#6c757d' : '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrar Usuario'}
                    </button>

                    {/* Instrucciones de seguridad de la contraseña fijas (para referencia) */}
                    <div style={{ marginTop: '20px', fontSize: '0.85em', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>Requisitos de Contraseña:</p>
                        <ul style={{ paddingLeft: '20px', marginTop: '5px', marginBottom: 0 }}>
                            <li>Mínimo 8 caracteres</li>
                            <li>1 mayúscula, 1 número, 1 símbolo.</li>
                        </ul>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserCreateModal;