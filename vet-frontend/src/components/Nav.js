import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Nav = () => {
    // 1. Obtener el rol del usuario actual
    const rol = localStorage.getItem('rol');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    // Estilos muy básicos, solo para funcionalidad
    const linkStyle = {
        padding: '10px',
        textDecoration: 'none',
        color: 'white',
        marginRight: '15px'
    };
    const navStyle = {
        backgroundColor: '#333',
        padding: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    };

    return (
        <nav style={navStyle}>
            <div>
                <span style={{ color: 'white', fontWeight: 'bold', marginRight: '20px' }}>
                    🏥 VetApp ({rol.toUpperCase()})
                </span>

                {/* Opciones Comunes a Ambos Roles */}
                <Link to="/mascotas" style={linkStyle}>Gestión de Mascotas</Link>

                {/* 🔑 Opciones Restringidas: Solo Administrador */}
                {rol === 'administrador' && (
                    <>
                        <Link to="/duenos" style={linkStyle}>Gestión de Dueños</Link>
                        <Link to="/usuarios" style={linkStyle}>Gestión de Usuarios</Link>
                        <Link to="/mascotas-baja" style={linkStyle}>Historial Pacientes</Link>
                        <Link to="/reportes-admin" style={linkStyle}>Reportes Globales</Link>
                    </>
                )}
            </div>

            <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer' }}>
                Cerrar Sesión
            </button>
        </nav>
    );
};

export default Nav;