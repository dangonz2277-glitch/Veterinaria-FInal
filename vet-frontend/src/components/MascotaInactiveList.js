import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const MascotaInactiveList = () => {
    const [inactivos, setInactivos] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        fetchInactivos();
    }, [token]);

    const fetchInactivos = async () => {
        setLoading(true);
        try {
            // Llama a la ruta que trae TODOS los registros (activos e inactivos)
            const response = await axios.get(`${API_BASE_URL}/mascotas/admin/all`, { headers });

            // Filtramos solo los inactivos para esta vista
            const filtered = response.data.filter(m => m.activo === false);
            setInactivos(filtered);
            setError('');
        } catch (err) {
            setError('Error al cargar el historial. ¿Tiene permisos de Administrador?');
        } finally {
            setLoading(false);
        }
    };

    // Función para restaurar la mascota (PUT /api/mascotas/estado/:id con activo: true)
    const handleRestore = async (id) => {
        if (!window.confirm("¿Desea restaurar a este paciente y que aparezca en el listado activo?")) return;

        try {
            await axios.put(`${API_BASE_URL}/mascotas/estado/${id}`, { activo: true }, { headers });
            alert("Paciente restaurado con éxito.");
            fetchInactivos(); // Refrescar la lista de inactivos
            navigate(`/mascotas/${id}`); // Ir al detalle
        } catch (err) {
            setError('Error al restaurar al paciente.');
        }
    };


    if (loading) return <p>Cargando historial de pacientes inactivos...</p>;

    return (
        <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
            <h2>Historial de Pacientes Dados de Baja</h2>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}

            <h3>Total Inactivos: {inactivos.length}</h3>

            {inactivos.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        {/* ... (Encabezados de la tabla) ... */}
                        <tr style={{ backgroundColor: '#ffcccc' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Dueño</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Estado</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inactivos.map((mascota) => (
                            <tr key={mascota.id} style={{ borderBottom: '1px solid #ddd', backgroundColor: '#f9f9f9' }}>
                                <td style={{ padding: '10px' }}>{mascota.id}</td>
                                <td style={{ padding: '10px' }}>
                                    <Link to={`/mascotas/${mascota.id}`} style={{ color: '#dc3545', textDecoration: 'underline' }}>
                                        {mascota.nombre}
                                    </Link>
                                </td>
                                <td style={{ padding: '10px' }}>{mascota.dueno_nombre}</td>
                                <td style={{ padding: '10px' }}>🔴 DADO DE BAJA</td>
                                <td style={{ padding: '10px' }}>
                                    <button
                                        onClick={() => handleRestore(mascota.id)}
                                        style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                                    >
                                        Reactivar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ marginTop: '20px' }}>No hay pacientes inactivos en el historial.</p>
            )}
        </div>
    );
};

export default MascotaInactiveList;