import React from 'react';

const Dashboard = () => {
    const rol = localStorage.getItem('rol');

    return (
        <div style={{ padding: '20px' }}>
            <h1>Bienvenido al Sistema, {rol}!</h1>
            <p>Aquí irá el menú principal y la navegación.</p>
            {/* Lógica de Menú: Ver solo lo que corresponde a este rol */}
            {rol === 'administrador' && (
                <p style={{ color: 'green' }}>Acceso completo de Administrador.</p>
            )}
            <button onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
            }}>
                Cerrar Sesión
            </button>
        </div>
    );
};

export default Dashboard;