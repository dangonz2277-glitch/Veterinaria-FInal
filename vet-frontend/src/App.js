import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Nav from './components/Nav';
import Dashboard from './components/Dashboard';
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
        <Route path="/login" element={<Login />} />

        {/* Rutas Privadas que usan PrivateLayout para mostrar el menú: */}

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <PrivateLayout><Dashboard /></PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* Gestión de Usuarios (Ruta protegida por Token y Rol) - ¡USAR USERLIST! */}
        <Route
          path="/usuarios"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <AdminRoute>
                  <UserList />
                </AdminRoute>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* Gestión de Mascotas (Listado y Búsqueda) */}
        <Route
          path="/mascotas"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <MascotaList /> {/* <-- 2. REEMPLAZAMOS EL PLACEHOLDER */}
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* Vista de Detalle de Mascota (Próximo paso) */}

        <Route
          path="/mascotas"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <MascotaList />
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* 🔑 Vista de Detalle de Mascota (Ruta con ID) */}
        <Route
          path="/mascotas/:id" // <-- RUTA DINÁMICA
          element={
            <PrivateRoute>
              <PrivateLayout>
                <MascotaDetail /> {/* <-- COMPONENTE FINAL */}
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* Se usa el parámetro dinámico ':id' */}
        <Route
          path="/mascotas/:id"
          element={
            <PrivateRoute>
              <PrivateLayout>
                {/* <MascotaDetail />  */}
                <h1>Vista de Detalle de Mascota ID: (Aquí irá el componente MascotaDetail)</h1>
              </PrivateLayout>
            </PrivateRoute>
          }
        />

        {/* Redirigir raíz a login */}
        <Route path="/" element={<Navigate to="/login" />} />

        <Route
          path="/mascotas-baja" // <-- RUTA NUEVA
          element={
            <PrivateRoute>
              <PrivateLayout>
                <AdminRoute>
                  <MascotaInactiveList /> {/* <-- Componente de Inactivos */}
                </AdminRoute>
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/duenos" // <-- ¡LA RUTA FALTANTE!
          element={
            <PrivateRoute>
              <PrivateLayout>
                <AdminRoute>
                  <DuenoList /> {/* <-- Componente del listado */}
                </AdminRoute>
              </PrivateLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reportes-admin"
          element={
            <PrivateRoute>
              <PrivateLayout>
                <AdminRoute>
                  <ReportesAdmin />
                </AdminRoute>
              </PrivateLayout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;