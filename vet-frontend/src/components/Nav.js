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

    const handleDashboardClick = () => {
        navigate('/home');
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

    const titleStyle = {
        color: 'white',
        fontWeight: 'bold',
        marginRight: '20px',
        cursor: 'pointer',
        fontSize: '1.1em'
    };

    return (
        <nav style={navStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>

                {/* TÍTULO: Usa navigate para ir al Dashboard (Ruta raíz /) */}
                <span onClick={handleDashboardClick} style={titleStyle}>
                    🏥 VetApp ({rol ? rol.toUpperCase() : 'Invitado'})
                </span>

                {/* Opciones Comunes a Ambos Roles */}
                <Link to="/mascotas" style={linkStyle}>Gestión de Mascotas</Link>

                {/* Opciones Restringidas: Solo Administrador */}
                {rol === 'administrador' && (
                    <>
                        <Link to="/duenos" style={linkStyle}>Gestión de Dueños</Link>
                        <Link to="/usuarios" style={linkStyle}>Gestión de Usuarios</Link>
                        {/* Eliminadas Fichas Médicas e Historial Pacientes */}
                        <Link to="/reportes-admin" style={linkStyle}>Reportes Globales</Link>
                    </>
                )}
            </div>

            {/* ÚNICO BOTÓN DE CERRAR SESIÓN */}
            <button
                onClick={handleLogout}
                style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
            >
                Cerrar Sesión
            </button>
        </nav>
    );
};

export default Nav;