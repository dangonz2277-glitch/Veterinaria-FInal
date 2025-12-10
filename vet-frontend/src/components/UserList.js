import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserCreateModal from './UserCreateModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false); // <-- NUEVO ESTADO PARA EL MODAL

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
    }, [token]);

    // OBTENER LISTA DE USUARIOS (GET /api/usuarios)
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/usuarios`, { headers });
            setUsers(response.data);
            setError('');
        } catch (err) {
            // ... (lógica de manejo de errores de la API) ...
            let errorMessage = 'Error de conexión con el servidor.';
            if (err.response) {
                if (err.response.status === 403) {
                    errorMessage = 'Acceso denegado. Su usuario no tiene permisos de Administrador.';
                } else if (err.response.status === 401) {
                    errorMessage = 'Sesión expirada o no autorizada.';
                } else {
                    errorMessage = err.response.data.message || `Error del servidor: ${err.response.status}`;
                }
            }
            setUsers([]);
            setError(errorMessage);
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: 'auto', padding: '20px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Gestión de Cuentas de Personal</h2>

                {/* --- BOTÓN PARA ABRIR EL MODAL --- */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Nuevo Usuario
                </button>
            </div>

            {error && <p style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '10px' }}>{error}</p>}

            {/* ... (El resto de la tabla de usuarios) ... */}

            <h3>Personal Registrado ({users.length} cuentas)</h3>

            {/* ... (Tabla de usuarios) ... */}

            {users.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Rol</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{user.id}</td>
                                <td style={{ padding: '10px' }}>{user.email}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                                        {user.rol}
                                    </span>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{ color: user.activo ? 'green' : 'red', fontWeight: 'bold' }}>
                                        {user.activo ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ marginTop: '20px' }}>No hay usuarios registrados o no se pudo cargar la lista.</p>
            )}

            {/* --- INTEGRACIÓN DEL MODAL --- */}
            <UserCreateModal
                isVisible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUserCreated={fetchUsers} // <-- Función clave: refresca la lista al crear
            />

        </div>
    );
};

export default UserList;