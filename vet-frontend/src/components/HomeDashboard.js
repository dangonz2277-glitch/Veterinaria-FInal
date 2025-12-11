import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeDashboard = () => {
    const navigate = useNavigate();
    const rol = localStorage.getItem('rol');

    // --- ESTADO Y LÓGICA DE NOTICIAS ---
    const [news, setNews] = useState([]);
    const [newsLoading, setNewsLoading] = useState(true);

    useEffect(() => {
        setNewsLoading(true);
        // Simulación de noticias
        setTimeout(() => {
            const mockNews = [
                { id: 1, title: 'Avance en vacunas felinas contra el FIV.', source: 'VetScience Today', date: '2025-12-10' },
                { id: 2, title: 'El rol de la telemedicina en clínicas rurales.', source: 'RuralVet Hub', date: '2025-12-08' },
                { id: 3, title: 'Nueva legislación sobre bienestar animal en Europa.', source: 'LegalVet Update', date: '2025-12-07' },
            ];
            setNews(mockNews);
            setNewsLoading(false);
        }, 1000);
    }, []);

    // --- SECCIONES DE NAVEGACIÓN (Modificadas) ---
    const navigationSections = {
        administrador: [
            { name: 'Mascotas Activas', path: '/mascotas', description: 'Ver y gestionar todos los pacientes activos.' },
            { name: 'Gestión de Dueños', path: '/duenos', description: 'Crear, buscar y gestionar la información de los dueños.' },
            { name: 'Gestión de Usuarios', path: '/usuarios', description: 'Gestionar cuentas de administradores y veterinarios.' },
            { name: 'Reportes Globales', path: '/reportes-admin', description: 'Visualizar reportes estadísticos y globales.' },
        ],
        veterinario: [
            { name: 'Mascotas Activas', path: '/mascotas', description: 'Acceso a la lista principal de pacientes para registro de consultas.' },
            { name: 'Buscar Dueños', path: '/duenos', description: 'Buscar información de contacto de dueños.' },
        ]
    };

    const currentSections = navigationSections[rol] || [];

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>

            {/* --- SECCIÓN SUPERIOR: Bienvenida --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '15px', marginBottom: '25px' }}>
                <h1 style={{ color: '#007bff' }}>Veterinaria 🐾 Panel Principal</h1>
                {/* 🛑 Eliminamos el botón de Cerrar Sesión */}
            </div>

            <h2 style={{ fontSize: '1.5em', marginBottom: '20px' }}>Bienvenido/a, {rol.charAt(0).toUpperCase() + rol.slice(1)}!</h2>

            {/* --- CUERPO PRINCIPAL (Noticias y Navegación) --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '30px' }}>

                {/* COLUMNA 1: NAVEGACIÓN RÁPIDA */}
                <div>
                    <div style={{ backgroundColor: '#e9f7ef', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #c3e6cb' }}>
                        <h3 style={{ borderBottom: '1px dashed #c3e6cb', paddingBottom: '10px', marginBottom: '15px' }}>Acceso Rápido y Funciones</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                            {currentSections.map(section => (
                                <div key={section.path} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '6px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                                    onClick={() => navigate(section.path)}
                                >
                                    <h4 style={{ color: '#007bff', margin: '0 0 5px 0' }}>{section.name}</h4>
                                    <p style={{ fontSize: '0.9em', color: '#555', margin: 0 }}>{section.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {rol === 'administrador' && (
                        <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <p style={{ color: '#28a745', fontWeight: 'bold' }}>🔑 Nivel de Acceso: Completo. Puede modificar usuarios y permisos.</p>
                        </div>
                    )}
                </div>

                {/* COLUMNA 2: NOTICIAS */}
                <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ color: '#ff69b4', borderBottom: '1px solid #ff69b4', paddingBottom: '10px', marginBottom: '15px' }}>Noticias del Mundo Veterinario 🌎</h3>
                    {newsLoading ? (
                        <p>Cargando noticias...</p>
                    ) : (
                        news.map(item => (
                            <div key={item.id} style={{ marginBottom: '15px', borderBottom: '1px dotted #ddd', paddingBottom: '10px' }}>
                                <p style={{ fontWeight: 'bold', margin: 0 }}>{item.title}</p>
                                <p style={{ fontSize: '0.8em', color: '#888', margin: '5px 0 0 0' }}>Fuente: {item.source} ({new Date(item.date).toLocaleDateString()})</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeDashboard;