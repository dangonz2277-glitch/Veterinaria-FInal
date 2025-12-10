// Archivo: /vet-frontend/src/components/FichaMedicaModal.js

import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

const FichaMedicaModal = ({ isVisible, onClose, onFichaCreated, mascotaId }) => {

    const [fichaData, setFichaData] = useState({
        motivo_consulta: '',
        diagnostico: '',
        tratamiento: '',
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isVisible) return null;

    // Obtener ID del veterinario autenticado desde el token
    const getVeterinarioId = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Asume que el ID del usuario está en 'id' dentro del token
                return decoded.id;
            } catch (e) {
                console.error("Error decoding token:", e);
                return null;
            }
        }
        return null;
    };

    const idVeterinario = getVeterinarioId();

    const handleChange = (e) => {
        setFichaData({ ...fichaData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!idVeterinario) {
            setError('Error: No se pudo identificar al veterinario autenticado.');
            setLoading(false);
            return;
        }

        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const payload = {
            ...fichaData,
            id_mascota: mascotaId,
            id_veterinario: idVeterinario,
            fecha_consulta: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
        };

        try {
            // POST /api/fichas
            await axios.post(`${API_BASE_URL}/fichas`, payload, { headers });

            setMessage('✅ Ficha Médica registrada con éxito.');
            onFichaCreated(); // Refresca la lista de fichas en MascotaDetail

            // Limpiar y cerrar
            setTimeout(() => {
                setFichaData({ motivo_consulta: '', diagnostico: '', tratamiento: '' });
                onClose();
            }, 1500);

        } catch (err) {
            const errMsg = err.response?.data?.message || 'Error al registrar la ficha. Verifique el Backend.';
            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    // Estilos del Modal (simples)
    const modalStyle = { /* ... estilos para modal fixed ... */
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    const contentStyle = {
        backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '600px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)', position: 'relative'
    };


    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}
                    disabled={loading}
                >
                    &times;
                </button>

                <h3>Registro de Nueva Consulta (Mascota ID: {mascotaId})</h3>

                {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

                <form onSubmit={handleSubmit}>

                    <label style={{ display: 'block', margin: '10px 0 5px' }}>Motivo de Consulta:</label>
                    <textarea
                        name="motivo_consulta"
                        value={fichaData.motivo_consulta}
                        onChange={handleChange}
                        required
                        rows="3"
                        style={{ width: '100%', padding: '8px' }}
                        disabled={loading}
                    />

                    <label style={{ display: 'block', margin: '10px 0 5px' }}>Diagnóstico:</label>
                    <textarea
                        name="diagnostico"
                        value={fichaData.diagnostico}
                        onChange={handleChange}
                        required
                        rows="5"
                        style={{ width: '100%', padding: '8px' }}
                        disabled={loading}
                    />

                    <label style={{ display: 'block', margin: '10px 0 5px' }}>Tratamiento y Notas:</label>
                    <textarea
                        name="tratamiento"
                        value={fichaData.tratamiento}
                        onChange={handleChange}
                        required
                        rows="5"
                        style={{ width: '100%', padding: '8px' }}
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        style={{ width: '100%', padding: '10px', marginTop: '20px', backgroundColor: loading ? '#6c757d' : '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        disabled={loading}
                    >
                        {loading ? 'Guardando Ficha...' : 'Guardar Ficha Médica'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FichaMedicaModal;