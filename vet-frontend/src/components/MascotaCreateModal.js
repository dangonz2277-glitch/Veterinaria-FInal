import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://veterinaria-final-1.onrender.com/api';

const MascotaCreateModal = ({ isVisible, onClose, onMascotaCreated }) => {

    // ----------------------------------------------------
    // --- ESTADOS ---
    // ----------------------------------------------------
    const [selectedDueno, setSelectedDueno] = useState(null);
    const [isNewDuenoMode, setIsNewDuenoMode] = useState(false);
    const [newDuenoData, setNewDuenoData] = useState({ nombre: '', email: '', telefono: '', direccion: '' });

    const [mascotaData, setMascotaData] = useState({ nombre: '', especie: '', raza: '', fecha_nacimiento: '', peso_inicial: '', foto_url: '' });

    const [duenoSearchTerm, setDuenoSearchTerm] = useState('');
    const [duenoSearchResults, setDuenoSearchResults] = useState([]);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Tokens y Headers (necesarios para todas las peticiones)
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // ----------------------------------------------------
    // --- LÓGICA DE BÚSQUEDA Y UTILIDADES ---
    // ----------------------------------------------------
    const searchDuenos = useCallback(async (term) => {
        if (term.length < 3) return;
        try {
            const response = await axios.get(`${API_BASE_URL}/duenos?search=${term}`, { headers });
            setDuenoSearchResults(response.data);
        } catch (err) {
            setDuenoSearchResults([]);
        }
    }, [headers]);

    // Función de reinicio de estados y cierre
    const handleClose = () => {
        setLoading(false);
        setError('');
        setMessage('');
        setSelectedDueno(null);
        setIsNewDuenoMode(false);
        setDuenoSearchTerm('');
        setDuenoSearchResults([]);
        setNewDuenoData({ nombre: '', telefono: '', email: '', direccion: '' });
        setMascotaData({ nombre: '', especie: '', raza: '', fecha_nacimiento: '', peso_inicial: '', foto_url: '' });
        onClose(); // Llama a la función del padre para ocultar el modal
    };

    // Efecto para debounce de búsqueda
    useEffect(() => {
        if (duenoSearchTerm.length >= 3) {
            const delayDebounceFn = setTimeout(() => {
                searchDuenos(duenoSearchTerm);
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setDuenoSearchResults([]);
        }
    }, [duenoSearchTerm, searchDuenos]);


    // Limpieza de Payload para SQL (Convierte "" a null y strings a number)
    const cleanPayload = (data) => {
        const peso = data.peso_inicial ? parseFloat(data.peso_inicial) : null;

        return {
            nombre: data.nombre,
            especie: data.especie,
            raza: data.raza || null,
            fecha_nacimiento: data.fecha_nacimiento || null,
            peso_inicial: peso,
            foto_url: data.foto_url || null,
        };
    };

    // ----------------------------------------------------
    // --- MANEJO DE ENVÍO PRINCIPAL ---
    // ----------------------------------------------------

    const handleCreateMascota = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        let finalDuenoId = null;

        try {
            // 1. MANEJAR DUEÑO: Obtener/Crear el ID
            if (isNewDuenoMode) {
                // Validación estricta para el nuevo dueño
                if (!newDuenoData.nombre || !newDuenoData.email) {
                    throw new Error('Complete Nombre y Email obligatorios del Dueño.');
                }

                // Limpieza del payload del nuevo dueño (para campos opcionales)
                const duenoPayload = {
                    nombre: newDuenoData.nombre,
                    email: newDuenoData.email,
                    telefono: newDuenoData.telefono || null,
                    direccion: newDuenoData.direccion || null,
                };

                const duenoResponse = await axios.post(`${API_BASE_URL}/duenos`, duenoPayload, { headers });

                // CRÍTICO: CAPTURAR EL ID. Captura el ID de la respuesta del Backend
                finalDuenoId = duenoResponse.data.id || duenoResponse.data.dueno?.id;

                if (!finalDuenoId) throw new Error('Error de captura: El Backend de Dueno no devolvió el ID.');
                setMessage('Dueño registrado. Registrando Mascota...');

            } else if (selectedDueno) {
                // Dueño existente: Leer el ID directamente del estado
                finalDuenoId = selectedDueno.id;
            } else {
                // No hay dueño seleccionado ni modo nuevo
                throw new Error('Debe seleccionar o registrar un Dueño.');
            }

            // 2. VERIFICACIÓN FINAL Y CREACIÓN DE MASCOTA
            if (!finalDuenoId) {
                // Esto debería ser imposible si las rutas de arriba funcionan.
                throw new Error('El ID del Dueño es nulo, no se puede crear la mascota.');
            }

            const mascotaPayload = {
                ...cleanPayload(mascotaData), // Campos limpios (peso, fecha, etc.)
                id_dueno: finalDuenoId,     // EL ID FORZADO Y LIMPIO
            };

            // console.log('Payload Mascota Final:', mascotaPayload); // Debug

            await axios.post(`${API_BASE_URL}/mascotas`, mascotaPayload, { headers }); // Línea de POST

            setMessage('✅ Mascota y Dueño registrados exitosamente.');
            onMascotaCreated();
            setTimeout(handleClose, 1500);

        } catch (err) {
            const msg = err.message.includes('ID del Dueño') ? err.message :
                (err.response?.data?.message || err.message || 'Error desconocido al registrar.');
            setError(msg);
        } finally {
            setLoading(false);
        }
    };


    // ----------------------------------------------------
    // --- RENDERIZADO DEL MODAL ---
    // ----------------------------------------------------

    // Estilos para el modal (CRÍTICO para que aparezca como popup)
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
        zIndex: 1000
    };

    const contentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '600px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        maxHeight: '90vh', overflowY: 'auto'
    };


    if (!isVisible) return null; // El modal solo se renderiza si isVisible es true

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <button
                    onClick={handleClose} // LLAMA A LA FUNCIÓN DE CIERRE
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '1.2em', cursor: 'pointer' }}
                    disabled={loading}
                >
                    &times;
                </button>

                <h3>Registro de Nueva Mascota</h3>

                {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

                <form onSubmit={handleCreateMascota}>

                    {/* --- 1. GESTIÓN DEL DUEÑO --- */}
                    <fieldset style={{ marginBottom: '20px', padding: '15px' }}>
                        <legend style={{ fontWeight: 'bold' }}>Información del Dueño</legend>

                        {/* Estado Actual del Dueño */}
                        {selectedDueno && (
                            <div style={{ backgroundColor: '#e9f7ef', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>
                                Dueño Seleccionado: <b>{selectedDueno.nombre}</b> ({selectedDueno.email})
                                <button type="button" onClick={() => setSelectedDueno(null)} style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>[Cambiar]</button>
                            </div>
                        )}

                        {!selectedDueno && (
                            <>
                                {/* Botones para Alternar Modo */}
                                <div style={{ marginBottom: '15px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewDuenoMode(false)}
                                        style={{ padding: '8px', backgroundColor: !isNewDuenoMode ? '#007bff' : '#ccc', color: 'white', border: 'none', marginRight: '10px' }}
                                        disabled={loading}
                                    >Buscar Dueño Existente</button>
                                    <button
                                        type="button"
                                        onClick={() => setIsNewDuenoMode(true)}
                                        style={{ padding: '8px', backgroundColor: isNewDuenoMode ? '#007bff' : '#ccc', color: 'white', border: 'none' }}
                                        disabled={loading}
                                    >Crear Nuevo Dueño</button>
                                </div>

                                {/* Modo: BUSCAR DUEÑO EXISTENTE */}
                                {!isNewDuenoMode && (
                                    <div style={{ border: '1px dashed #ccc', padding: '10px' }}>
                                        <label>Buscar por Email, Nombre o Teléfono (Mín. 3 caracteres):</label>
                                        <input
                                            type="text"
                                            value={duenoSearchTerm}
                                            onChange={(e) => setDuenoSearchTerm(e.target.value)}
                                            placeholder="Buscar Dueño..."
                                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                            disabled={loading}
                                        />
                                        {duenoSearchResults.length > 0 && (
                                            <ul style={{ listStyleType: 'none', padding: 0, border: '1px solid #eee', maxHeight: '150px', overflowY: 'auto', margin: '5px 0 0 0' }}>
                                                {duenoSearchResults.map(dueno => (
                                                    <li key={dueno.id} onClick={() => setSelectedDueno(dueno)} style={{ padding: '8px', borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: '#fff', ':hover': { backgroundColor: '#f0f0f0' } }}>
                                                        {dueno.nombre} (ID: {dueno.id})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}

                                {/* Modo: CREAR NUEVO DUEÑO */}
                                {isNewDuenoMode && (
                                    <div style={{ border: '1px dashed #007bff', padding: '10px' }}>
                                        <p style={{ color: '#007bff', fontWeight: 'bold' }}>Datos para nuevo registro:</p>
                                        <input type="text" placeholder="Nombre (Obligatorio)" required value={newDuenoData.nombre} onChange={(e) => setNewDuenoData({ ...newDuenoData, nombre: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} disabled={loading} />
                                        <input type="email" placeholder="Email (Obligatorio)" required value={newDuenoData.email} onChange={(e) => setNewDuenoData({ ...newDuenoData, email: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} disabled={loading} />
                                        <input type="tel" placeholder="Teléfono" value={newDuenoData.telefono} onChange={(e) => setNewDuenoData({ ...newDuenoData, telefono: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} disabled={loading} />
                                        <input type="text" placeholder="Dirección (Opcional)" value={newDuenoData.direccion} onChange={(e) => setNewDuenoData({ ...newDuenoData, direccion: e.target.value })} style={{ width: '100%', padding: '8px' }} disabled={loading} />
                                    </div>
                                )}
                            </>
                        )}
                    </fieldset>


                    {/* --- 2. DATOS DE LA MASCOTA --- */}
                    <fieldset style={{ marginBottom: '20px', padding: '15px' }}
                        // Deshabilitar si no se ha elegido un dueño
                        disabled={loading || (!selectedDueno && !isNewDuenoMode)}
                    >
                        <legend style={{ fontWeight: 'bold' }}>Datos del Paciente</legend>
                        <input type="text" placeholder="Nombre de la Mascota (Obligatorio)" required value={mascotaData.nombre} onChange={(e) => setMascotaData({ ...mascotaData, nombre: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input type="text" placeholder="Especie (Obligatorio)" required value={mascotaData.especie} onChange={(e) => setMascotaData({ ...mascotaData, especie: e.target.value })} style={{ flex: 1, padding: '8px' }} />
                            <input type="text" placeholder="Raza" value={mascotaData.raza} onChange={(e) => setMascotaData({ ...mascotaData, raza: e.target.value })} style={{ flex: 1, padding: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={{ minWidth: '150px' }}>Fecha de Nacimiento:</label>
                            <input type="date" value={mascotaData.fecha_nacimiento} onChange={(e) => setMascotaData({ ...mascotaData, fecha_nacimiento: e.target.value })} style={{ flex: 1, padding: '8px' }} />
                        </div>
                        <input type="number" placeholder="Peso Inicial (kg)" value={mascotaData.peso_inicial} onChange={(e) => setMascotaData({ ...mascotaData, peso_inicial: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />

                        {/* Campo para la URL de la Foto (Simplificado) */}
                        <label style={{ display: 'block', marginBottom: '5px' }}>Foto URL (Opcional):</label>
                        <input type="text" placeholder="URL de la Foto" value={mascotaData.foto_url} onChange={(e) => setMascotaData({ ...mascotaData, foto_url: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                    </fieldset>


                    {/* --- BOTÓN FINAL --- */}
                    <button
                        type="submit"
                        style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#6c757d' : '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}
                        // Habilitar solo si no está cargando Y el Dueño está definido Y el nombre/especie de la Mascota está lleno
                        disabled={loading || (!selectedDueno && !isNewDuenoMode) || !mascotaData.nombre || !mascotaData.especie}
                    >
                        {loading ? 'Procesando Registro...' : 'Guardar Mascota y Dueño'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MascotaCreateModal;