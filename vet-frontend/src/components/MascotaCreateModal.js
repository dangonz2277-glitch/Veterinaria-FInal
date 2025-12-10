import React, { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// El modal recibe tres props: isVisible, onClose, onMascotaCreated
const MascotaCreateModal = ({ isVisible, onClose, onMascotaCreated }) => {

    // --- 1. DEFINICIÓN INCONDICIONAL DE HOOKS (DEBE IR PRIMERO) ---
    // Lógica del Dueño
    const [selectedDueno, setSelectedDueno] = useState(null);
    const [duenoSearchTerm, setDuenoSearchTerm] = useState('');
    const [duenoSearchResults, setDuenoSearchResults] = useState([]);
    const [isNewDuenoMode, setIsNewDuenoMode] = useState(false);
    const [newDuenoData, setNewDuenoData] = useState({ nombre: '', telefono: '', email: '', direccion: '' });

    // Lógica de la Mascota
    const [mascotaData, setMascotaData] = useState({ nombre: '', especie: '', raza: '', fecha_nacimiento: '', peso_inicial: '', foto_url: '' });
    // const [imageFile, setImageFile] = useState(null); // Desactivado por ahora

    // Feedback
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };

    // --- LÓGICA DE BÚSQUEDA DEL DUEÑO (useCallback) ---
    const searchDuenos = useCallback(async (term) => {
        if (term.length < 3) {
            setDuenoSearchResults([]);
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/duenos?search=${term}`, { headers });
            setDuenoSearchResults(response.data);
        } catch (err) {
            console.error('Error searching owners:', err);
            setDuenoSearchResults([]);
        }
    }, [headers]);

    const handleDuenoSearchChange = (e) => {
        const term = e.target.value;
        setDuenoSearchTerm(term);
        // Llamar a la búsqueda si el término es lo suficientemente largo
        if (term.length >= 3) {
            searchDuenos(term);
        } else {
            setDuenoSearchResults([]);
        }
    };

    // --- Lógica de Creación Principal (POST Mascota) ---
    const handleCreateMascota = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        let finalDuenoId = selectedDueno ? selectedDueno.id : null;

        try {
            // 1. Manejar el Dueño Nuevo (POST /api/duenos)
            if (isNewDuenoMode) {
                if (!newDuenoData.nombre || !newDuenoData.email) throw new Error('Complete los datos obligatorios del nuevo Dueño (Nombre y Email).');

                // Asegurarse de que el Backend retorna el objeto Dueño con el ID
                const duenoResponse = await axios.post(`${API_BASE_URL}/duenos`, newDuenoData, { headers });
                finalDuenoId = duenoResponse.data.dueno ? duenoResponse.data.dueno.id : duenoResponse.data.id;
                setMessage('Dueño registrado. Registrando Mascota...');
            } else if (!finalDuenoId) {
                throw new Error('Debe seleccionar o registrar un Dueño antes de continuar.');
            }

            // 2. Crear Mascota (POST /api/mascotas)
            const mascotaPayload = {
                ...mascotaData,
                id_dueno: finalDuenoId,
                // Si no se usa Cloudinary, foto_url se envía como texto vacío o la URL ingresada
                foto_url: mascotaData.foto_url || null,
            };

            await axios.post(`${API_BASE_URL}/mascotas`, mascotaPayload, { headers });

            setMessage('✅ Mascota y Dueño registrados exitosamente.');
            onMascotaCreated(); // Refresca la lista padre

            // Cerrar y limpiar
            setTimeout(() => {
                handleClose(); // Usar la función de limpieza
            }, 1500);

        } catch (err) {
            const errMsg = err.response?.data?.message || err.message || 'Error desconocido al registrar.';
            setError(errMsg);
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

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
        // setImageFile(null); // Limpieza de imagen
        onClose();
    };

    // Estilos básicos para el modal (Replicados del paso anterior)
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

    // --- 2. EL RETURN CONDICIONAL VA DESPUÉS DE LOS HOOKS Y LÓGICA ---
    if (!isVisible) return null; // <-- Ahora está en el lugar correcto

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <button
                    onClick={handleClose}
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
                                            onChange={handleDuenoSearchChange}
                                            placeholder="Buscar Dueño..."
                                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                            disabled={loading}
                                        />
                                        {duenoSearchResults.length > 0 && (
                                            <ul style={{ listStyleType: 'none', padding: 0, border: '1px solid #eee', maxHeight: '150px', overflowY: 'auto', margin: '5px 0 0 0' }}>
                                                {duenoSearchResults.map(dueno => (
                                                    <li key={dueno.id} onClick={() => setSelectedDueno(dueno)} style={{ padding: '8px', borderBottom: '1px solid #eee', cursor: 'pointer', backgroundColor: '#fff', ':hover': { backgroundColor: '#f0f0f0' } }}>
                                                        {dueno.nombre} ({dueno.email || dueno.telefono})
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
                        <input type="text" placeholder="Nombre de la Mascota" required value={mascotaData.nombre} onChange={(e) => setMascotaData({ ...mascotaData, nombre: e.target.value })} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input type="text" placeholder="Especie" required value={mascotaData.especie} onChange={(e) => setMascotaData({ ...mascotaData, especie: e.target.value })} style={{ flex: 1, padding: '8px' }} />
                            <input type="text" placeholder="Raza" required value={mascotaData.raza} onChange={(e) => setMascotaData({ ...mascotaData, raza: e.target.value })} style={{ flex: 1, padding: '8px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                            <label style={{ minWidth: '150px' }}>Fecha de Nacimiento:</label>
                            <input type="date" required value={mascotaData.fecha_nacimiento} onChange={(e) => setMascotaData({ ...mascotaData, fecha_nacimiento: e.target.value })} style={{ flex: 1, padding: '8px' }} />
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
                        // Habilitar solo si no está cargando Y el Dueño está definido Y el nombre de la Mascota está lleno
                        disabled={loading || (!selectedDueno && !isNewDuenoMode) || !mascotaData.nombre}
                    >
                        {loading ? 'Procesando Registro...' : 'Guardar Mascota y Dueño'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MascotaCreateModal;