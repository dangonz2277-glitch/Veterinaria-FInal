// Archivo: /vet-frontend/src/components/DuenoFormModal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://veterinaria-final-1.onrender.com/api';

const DuenoFormModal = ({ duenoId, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        telefono: '',
        email: '',
        direccion: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    useEffect(() => {
        if (duenoId) {
            fetchDuenoData(duenoId);
        } else {
            setLoading(false);
        }
    }, [duenoId]);

    const fetchDuenoData = async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/duenos/${id}`, { headers });
            setFormData(response.data);
            setError('');
        } catch (err) {
            setError('Error al cargar los datos del dueño. Asegure que la ruta GET /api/duenos/:id existe.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Se asume que solo estamos en modo edición (duenoId debe existir)
            await axios.put(`${API_BASE_URL}/duenos/${duenoId}`, formData, { headers });

            alert('Dueño actualizado con éxito.');
            onSuccess();
            onClose();

        } catch (err) {
            const errMsg = err.response?.data?.message || 'Error al guardar los cambios.';
            setError(errMsg);
        } finally {
            setSaving(false);
        }
    };

    if (!duenoId && duenoId !== 0) return null;
    if (loading) return <p>Cargando datos del dueño...</p>;

    // Estilos para simular un modal
    const modalStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    const contentStyle = {
        backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '450px', position: 'relative'
    };


    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer' }}
                    disabled={saving}
                >
                    &times;
                </button>

                <h3>Editar Dueño ID: {duenoId}</h3>

                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Error: {error}</p>}

                <form onSubmit={handleSubmit}>
                    <label style={{ display: 'block', margin: '10px 0 5px' }}>Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} disabled={saving} />

                    <label style={{ display: 'block', margin: '10px 0 5px' }}>Teléfono:</label>
                    <input type="tel" name="telefono" value={formData.telefono || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }} disabled={saving} />

                    <label style={{ display: 'block', margin: '10px 0 5px' }}>Email:</label>
                    <input type="email" name="email" value={formData.email || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }} disabled={saving} />

                    <label style={{ display: 'block', margin: '10px 0 5px' }}>Dirección:</label>
                    <input type="text" name="direccion" value={formData.direccion || ''} onChange={handleChange} style={{ width: '100%', padding: '8px' }} disabled={saving} />

                    <button
                        type="submit"
                        style={{ width: '100%', padding: '10px', marginTop: '20px', backgroundColor: saving ? '#6c757d' : '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        disabled={saving}
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default DuenoFormModal;