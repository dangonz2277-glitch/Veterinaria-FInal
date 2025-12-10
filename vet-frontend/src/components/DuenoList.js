// Archivo: /vet-frontend/src/components/DuenoList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DuenoFormModal from './DuenoFormModal'; // Necesario para la edición

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const DuenoList = () => {
    const [duenos, setDuenos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalDuenoId, setModalDuenoId] = useState(null); // ID del dueño a editar

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        fetchDuenos();
    }, [token]);

    const fetchDuenos = async () => {
        setLoading(true);
        try {
            // Llama a la ruta que configuramos en el Backend: GET /api/duenos
            const response = await axios.get(`${API_BASE_URL}/duenos`, { headers });
            setDuenos(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar la lista de dueños. Verifique la conexión y permisos de Admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (id) => {
        setModalDuenoId(id);
    };

    if (loading) return <p style={{ padding: '20px' }}>Cargando lista de dueños...</p>;
    if (error) return <p style={{ padding: '20px', color: 'red' }}>Error: {error}</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
            <h2>Gestión de Dueños ({duenos.length} Registros)</h2>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Teléfono</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Dirección</th>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {duenos.map((dueno) => (
                        <tr key={dueno.id} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ padding: '10px' }}>{dueno.id}</td>
                            <td style={{ padding: '10px' }}>{dueno.nombre}</td>
                            <td style={{ padding: '10px' }}>{dueno.telefono}</td>
                            <td style={{ padding: '10px' }}>{dueno.email}</td>
                            <td style={{ padding: '10px' }}>{dueno.direccion}</td>
                            <td style={{ padding: '10px' }}>
                                <button
                                    onClick={() => handleEditClick(dueno.id)}
                                    style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer' }}
                                >
                                    Editar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal de edición */}
            {modalDuenoId !== null && (
                <DuenoFormModal
                    duenoId={modalDuenoId}
                    onClose={() => setModalDuenoId(null)}
                    onSuccess={fetchDuenos}
                />
            )}
        </div>
    );
};

export default DuenoList;