import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
import HomeDashboard from './components/HomeDashboard';
import UserList from './components/UserList';
import MascotaList from './components/MascotaList';
import MascotaDetail from './components/MascotaDetail';
import MascotaInactiveList from './components/MascotaInactiveList';
import DuenoList from './components/DuenoList.js';
import ReportesAdmin from './components/ReportesAdmin';

// 1. PrivateRoute: Verifica si está logueado
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// 2. AdminRoute: Verifica si el rol es Admin
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');

  if (!token || rol !== 'administrador') {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

// 3. PrivateLayout: MUESTRA EL NAV
const PrivateLayout = ({ children }) => {
  return (
    <>
      <Nav />
      <div style={{ padding: '20px' }}>
        {children}
      </div>
    </>
  );
};


function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />

        {/* 🛑 Redirigir la raíz (/) al login (si no hay rutas anidadas en /) */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Rutas Privadas que usan PrivateLayout para mostrar el menú: */}

        {/* 1. Dashboard Principal (Ruta de Login Exitosa) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PrivateLayout><Dashboard /></PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* 2. 🎯 NUEVA RUTA: Dashboard Seguro (Para el clic en VetApp) */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <PrivateLayout><HomeDashboard /></PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* 3. Gestión de Mascotas (Listado) */}
        <Route
          path="/mascotas"
          element={
            <PrivateRoute>
              <PrivateLayout><MascotaList /></PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* 4. Vista de Detalle de Mascota (Usando el parámetro dinámico ':id') */}
        <Route
          path="/mascotas/:id"
          element={
            <PrivateRoute>
              <PrivateLayout><MascotaDetail /></PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* 5. Gestión de Dueños (Solo Administrador) */}
        <Route
          path="/duenos"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <AdminRoute><DuenoList /></AdminRoute>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* 6. Gestión de Usuarios (Solo Administrador) */}
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <AdminRoute><UserList /></AdminRoute>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* 7. Historial de Pacientes (Solo Administrador) */}
        <Route
          path="/mascotas-baja"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <AdminRoute><MascotaInactiveList /></AdminRoute>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* 8. Reportes Globales (Solo Administrador) */}
        <Route
          path="/reportes-admin"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <AdminRoute><ReportesAdmin /></AdminRoute>
              </PrivateLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;