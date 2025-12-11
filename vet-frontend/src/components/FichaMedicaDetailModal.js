import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://veterinaria-final-1.onrender.com/api';

// Recibe fichaId, isVisible, onClose
const FichaMedicaDetailModal = ({ fichaId, isVisible, onClose }) => {
    const [ficha, setFicha] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    // Creamos los headers aquí, serán utilizados para la petición GET /api/fichas/:id
    const headers = { 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        if (isVisible && fichaId) {
            fetchFichaDetail(fichaId);
        } else if (!isVisible) {
            setFicha(null);
            setLoading(true);
            setError('');
        }
    }, [isVisible, fichaId]);

    const fetchFichaDetail = async (id) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_BASE_URL}/fichas/${id}`, { headers });
            setFicha(response.data);
        } catch (err) {
            setError('Error al cargar el detalle de la ficha. Asegure que la ruta /api/fichas/:id existe y el JWT es válido.');
        } finally {
            setLoading(false);
        }
    };

    // Función de descarga PDF
    const handleDownloadPDF = async () => {
        try {
            const url = `${API_BASE_URL}/fichas/reporte/${fichaId}`;
            const token = localStorage.getItem('token');
            const response = await axios.get(url, {
                responseType: 'blob',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // 1. Crear un URL temporal para el Blob
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);

            // 2. Crear un enlace oculto y forzar la descarga
            const link = document.createElement('a');
            link.href = downloadUrl;

            link.setAttribute('download', `Ficha_Medica_${fichaId}.pdf`);
            document.body.appendChild(link);
            link.click();

            // 3. Limpiar
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Error al descargar el PDF:', error);
            alert('No se pudo generar o descargar el PDF. Verifique el Backend.');
        }
    };


    if (!isVisible) return null;

    // Estilos del Modal
    const contentStyle = {
        backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '800px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)', position: 'relative', maxHeight: '90vh', overflowY: 'auto'
    };



    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
            <div style={contentStyle}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}
                >
                    &times;
                </button>

                {loading ? (
                    <p>Cargando ficha...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>Error: {error}</p>
                ) : ficha ? (
                    <>
                        <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
                            Ficha Médica #{fichaId} - {new Date(ficha.fecha_consulta).toLocaleDateString()}
                        </h3>

                        <p><strong>Veterinario ID:</strong> {ficha.id_veterinario}</p>

                        <h4 style={{ color: '#007bff' }}>Motivo de Consulta</h4>
                        <div style={{ border: '1px solid #ccc', padding: '10px', whiteSpace: 'pre-wrap' }}>{ficha.motivo_consulta}</div>

                        <h4 style={{ color: '#007bff', marginTop: '15px' }}>Diagnóstico</h4>
                        <div style={{ border: '1px solid #ccc', padding: '10px', whiteSpace: 'pre-wrap' }}>{ficha.diagnostico}</div>

                        <h4 style={{ color: '#007bff', marginTop: '15px' }}>Tratamiento</h4>
                        <div style={{ border: '1px solid #ccc', padding: '10px', whiteSpace: 'pre-wrap' }}>{ficha.tratamiento}</div>

                        {/* Botón de Descarga PDF */}
                        <button
                            onClick={handleDownloadPDF}
                            style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}
                        >
                            Descargar Reporte (PDF)
                        </button>
                    </>
                ) : (
                    <p>No se encontró la ficha.</p>
                )}
            </div>
        </div>

    );

};

export default FichaMedicaDetailModal;