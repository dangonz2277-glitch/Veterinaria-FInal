import React from 'react';

const ReportesAdmin = () => {
    return (
        <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
            <h2>📊 Reportes Globales de la Clínica</h2>
            <p style={{ fontSize: '1.2em', color: '#007bff', borderLeft: '5px solid #007bff', paddingLeft: '15px' }}>
                Este módulo mostrará métricas clave como:
            </p>
            <ul>
                <li>Total de Pacientes Activos / Inactivos.</li>
                <li>Distribución de Especies (Perros vs. Gatos).</li>
                <li>Consultas por Veterinario (Rendimiento).</li>
                <li>Mascotas con mayor historial clínico.</li>
            </ul>
            <p style={{ marginTop: '30px', fontWeight: 'bold', color: '#dc3545' }}>
                Nota: La implementación de gráficos y generación avanzada de reportes queda pendiente como mejora futura del proyecto.
            </p>
        </div>
    );
};

export default ReportesAdmin;