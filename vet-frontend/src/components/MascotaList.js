import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import MascotaCreateModal from './MascotaCreateModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const MascotaList = () => {
    const [mascotas, setMascotas] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // OBTENEMOS EL TOKEN UNA SOLA VEZ
    // (No lo definimos como estado, lo leemos de localStorage dentro de useCallback)

    // Función para obtener la lista (usamos useCallback para la optimización)
    const fetchMascotas = useCallback(async (searchQuery = '') => {
        setLoading(true);

        // 1. Obtener el token dentro de la función para mayor estabilidad
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            setError('Sesión no encontrada. Por favor, vuelva a iniciar sesión.');
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}` }; // Los headers se crean aquí

        try {
            // Llama a /api/mascotas o /api/mascotas?search=query
            const url = searchQuery ? `${API_BASE_URL}/mascotas?search=${searchQuery}` : `${API_BASE_URL}/mascotas`;

            const response = await axios.get(url, { headers });
            setMascotas(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar la lista de mascotas. Verifique la conexión o el JWT.');
            setMascotas([]);
        } finally {
            setLoading(false);
        }
    }, []); // <--- ¡DEPENDENCIA VACÍA! Esto es clave para evitar que fetchMascotas cambie en cada render

    // useEffect para la carga inicial y cuando cambia el término de búsqueda
    useEffect(() => {
        // La dependencia de `fetchMascotas` aquí está bien porque se definió con useCallback([]),
        // pero la dependencia principal que dispara la búsqueda es searchTerm.
        fetchMascotas(searchTerm);

    }, [searchTerm, fetchMascotas]); // <- Quitamos 'token' si no está en el scope, y dependemos de searchTerm

    // Función para manejar el cambio en la barra de búsqueda (sin enviar inmediatamente)
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Función para manejar el clic en "Mostrar Todas"
    const handleShowAll = () => {
        setSearchTerm(''); // Limpia el término de búsqueda
    };


    if (loading && mascotas.length === 0) return <p>Cargando listado de pacientes...</p>;
    // Mostrar el contenido anterior si está cargando, pero ya tenemos datos (suaviza el flicker)

    return (
        <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>

            <h2>Gestión de Pacientes Activos</h2>

            {/* --- CONTROLES SUPERIORES: Búsqueda y Creación --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>

                {/* Barra de Búsqueda Unificada */}
                <input
                    type="text"
                    placeholder="Buscar por Nombre de Mascota o Dueño..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ flexGrow: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />

                {/* Botón Mostrar Todas */}
                <button
                    onClick={handleShowAll}
                    style={{ padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Mostrar Todas
                </button>

                {/* Botón Registrar Nueva Mascota (Abre Modal) */}
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Registrar Nueva Mascota
                </button>
            </div>

            {error && <p style={{ color: 'red', fontWeight: 'bold', border: '1px solid red', padding: '10px' }}>{error}</p>}

            <h3>Resultados: {mascotas.length} pacientes</h3>

            {/* --- TABLA DE RESULTADOS --- */}
            {mascotas.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Especie</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Raza</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Dueño</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Teléfono Dueño</th>
                            <th style={{ padding: '10px', textAlign: 'left' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mascotas.map((mascota) => (
                            <tr key={mascota.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '10px' }}>{mascota.id}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold' }}>
                                    <Link to={`/mascotas/${mascota.id}`} style={{ color: '#007bff', textDecoration: 'none' }}>
                                        {mascota.nombre}
                                    </Link>
                                </td>
                                <td style={{ padding: '10px' }}>{mascota.especie}</td>
                                <td style={{ padding: '10px' }}>{mascota.raza}</td>
                                <td style={{ padding: '10px' }}>{mascota.dueno_nombre}</td>
                                <td style={{ padding: '10px' }}>{mascota.dueno_telefono}</td>
                                <td style={{ padding: '10px' }}>
                                    <Link to={`/mascotas/${mascota.id}`}>
                                        <button style={{ padding: '5px 10px', backgroundColor: '#ffc107', border: 'none', cursor: 'pointer' }}>
                                            Ver Detalle
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p style={{ marginTop: '20px' }}>No se encontraron pacientes con ese criterio de búsqueda.</p>
            )}

            {/* --- MODAL DE CREACIÓN --- */}
            <MascotaCreateModal
                isVisible={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onMascotaCreated={() => fetchMascotas(searchTerm)} // Refresca lista al crear
            />

        </div>
    );
};

export default MascotaList;