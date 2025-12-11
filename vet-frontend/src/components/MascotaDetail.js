import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import FichaMedicaModal from './FichaMedicaModal';
import FichaMedicaDetailModal from './FichaMedicaDetailModal';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://veterinaria-final-1.onrender.com/api';

const MascotaDetail = () => {
    const { id: mascotaId } = useParams();
    const navigate = useNavigate();

    const [mascota, setMascota] = useState(null);
    const [fichas, setFichas] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [isFichaModalOpen, setIsFichaModalOpen] = useState(false); // Modal de CREACIÓN
    const [selectedFichaId, setSelectedFichaId] = useState(null); // ID para Modal de DETALLE
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // Usamos useCallback para que la función fetchData no cambie en cada render
    const fetchData = useCallback(async () => {
        setLoading(true);

        // --- 1. OBTENER DETALLE DE MASCOTA (CRÍTICO) ---
        try {
            const mascotaResponse = await axios.get(`${API_BASE_URL}/mascotas/${mascotaId}`, { headers });
            setMascota(mascotaResponse.data);
            setError('');
        } catch (err) {
            console.error("Error al obtener datos de la mascota (GET /api/mascotas/:id):", err);
            setError('Error al cargar la información detallada de la mascota. Verifique el Backend.');
            if (err.response && err.response.status === 404) {
                navigate('/mascotas');
            }
            setLoading(false);
            return; // Detener si la mascota no carga
        }

        // --- 2. OBTENER HISTORIAL CLÍNICO
        try {
            const fichasResponse = await axios.get(`${API_BASE_URL}/fichas/mascota/${mascotaId}`, { headers });
            setFichas(fichasResponse.data);
        } catch (err) {
            console.warn("Advertencia: No se pudo cargar el historial clínico. (Ruta /fichas/mascota/:id falló)", err);
            setFichas([]);
        } finally {
            setLoading(false);
        }
    }, [mascotaId, navigate]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEliminarLogico = async () => {
        if (!window.confirm("¿Está seguro de dar de baja a este paciente? Esto lo moverá al Historial Pacientes.")) return;

        try {

            await axios.put(`${API_BASE_URL}/mascotas/estado/${mascotaId}`, { activo: false }, { headers });
            alert("Paciente dado de baja exitosamente. Será redirigido al listado activo.");
            navigate('/mascotas');
        } catch (err) {
            setError('Error al dar de baja al paciente. Verifique permisos o el Backend.');
        }
    };


    if (loading) return <div style={{ padding: '20px' }}>Cargando información del paciente...</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;
    if (!mascota) return <div style={{ padding: '20px' }}>Paciente no encontrado.</div>;


    return (
        <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>

            {/* --- AVISO DE BAJA (SI ACTIVO = FALSE) --- */}
            {!mascota.activo && (
                <div style={{ padding: '15px', backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}>
                    🔴 PACIENTE DADO DE BAJA DEL SISTEMA.
                </div>
            )}

            {/* --- PANEL SUPERIOR: INFO ESTÁTICA Y ACCIONES --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '15px', marginBottom: '25px' }}>

                {/* Título y Nombre */}
                <div>
                    <h1>{mascota.nombre.toUpperCase()} <span style={{ fontSize: '0.8em', color: '#666' }}>({mascota.especie} - {mascota.raza})</span></h1>
                    <p style={{ margin: 0, color: '#333' }}>Fecha de Nacimiento: {new Date(mascota.fecha_nacimiento).toLocaleDateString()}</p>
                </div>

                {/* Botones de Acción */}
                <div>
                    <button
                        onClick={() => setIsFichaModalOpen(true)} // <-- Modal de CREACIÓN
                        style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                    >
                        + Registrar Nueva Consulta
                    </button>
                    {mascota.activo && ( // Solo mostrar el botón de baja si está activo
                        <button
                            onClick={handleEliminarLogico}
                            style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Dar de Baja (Eliminar Lógico)
                        </button>
                    )}
                </div>
            </div>

            {/* --- CUERPO PRINCIPAL: Mascota y Dueño --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>

                {/* COLUMNA 1: Datos de la Mascota */}
                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Detalles del Paciente</h3>
                    {mascota.foto_url && (
                        <img src={mascota.foto_url} alt={mascota.nombre} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%', float: 'right', marginLeft: '15px' }} />
                    )}
                    <p><strong>Especie:</strong> {mascota.especie}</p>
                    <p><strong>Raza:</strong> {mascota.raza}</p>
                    <p><strong>Peso Inicial:</strong> {mascota.peso_inicial} kg</p>
                    <p><strong>ID Mascota:</strong> {mascota.id}</p>
                </div>

                {/* COLUMNA 2: Datos del Dueño */}
                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                    <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Información del Dueño</h3>
                    <p><strong>Nombre:</strong> {mascota.dueno_nombre ?? 'N/A'}</p>
                    <p><strong>Teléfono:</strong> {mascota.dueno_telefono ?? 'N/A'}</p>
                    <p><strong>Email:</strong> {mascota.dueno_email ?? 'N/A'}</p>
                    <p><strong>ID Dueño:</strong> {mascota.id_dueno}</p>
                </div>
            </div>

            {/* --- HISTORIAL CLÍNICO (FICHA MÉDICA) --- */}
            <div style={{ marginTop: '40px' }}>
                <h3>Historial Clínico ({fichas.length} Registros)</h3>

                {fichas.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#e9f7ef' }}>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Fecha</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Motivo Consulta</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Veterinario</th>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fichas.map((ficha) => (
                                <tr key={ficha.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    {/* FECHA */}
                                    <td style={{ padding: '10px' }}>
                                        {ficha.fecha
                                            ? new Date(ficha.fecha.split('T')[0]).toLocaleDateString()
                                            : 'N/A'
                                        }
                                    </td>

                                    <td style={{ padding: '10px' }}>{ficha.motivo_consulta}</td>

                                    {/* VETERINARIO */}
                                    <td style={{ padding: '10px' }}>
                                        {/* Usar el email que trae el JOIN del Backend */}
                                        {ficha.veterinario_email || `ID: ${ficha.id_veterinario}`}
                                    </td>

                                    {/* ACCIÓN (EL BOTÓN) */}
                                    <td style={{ padding: '10px' }}>
                                        <button
                                            onClick={() => setSelectedFichaId(ficha.id)}
                                            style={{ padding: '5px 10px', backgroundColor: '#17a2b8', color: 'white', border: 'none', cursor: 'pointer' }}
                                        >
                                            Ver Ficha Completa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No hay registros clínicos para esta mascota.</p>
                )}
            </div>

            {/* --- INTEGRACIÓN DEL MODAL DE DETALLE DE FICHA --- */}
            <FichaMedicaDetailModal
                fichaId={selectedFichaId}
                isVisible={selectedFichaId !== null}
                onClose={() => setSelectedFichaId(null)}
            />

            {/* --- INTEGRACIÓN DEL MODAL DE CREACIÓN DE FICHA --- */}
            <FichaMedicaModal
                isVisible={isFichaModalOpen}
                onClose={() => setIsFichaModalOpen(false)}
                onFichaCreated={fetchData}
                mascotaId={mascotaId}
            />

        </div>
    );
};

export default MascotaDetail;