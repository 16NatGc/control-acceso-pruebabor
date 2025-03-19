import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import ResidentPanel from './components/resident/ResidentPanel';
import MaintenancePanel from './components/maintenance/MaintenancePanel';
import GuardPanel from './components/guard/GuardPanel';
import VisitorPanel from './components/visitor/VisitorPanel';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas según el rol */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resident"
          element={
            <ProtectedRoute allowedRoles={['Residente']}>
              <ResidentPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/maintenance"
          element={
            <ProtectedRoute allowedRoles={['Mantenimiento']}>
              <MaintenancePanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guard"
          element={
            <ProtectedRoute allowedRoles={['Vigilante']}>
              <GuardPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/visitor"
          element={
            <ProtectedRoute allowedRoles={['Visitante']}>
              <VisitorPanel />
            </ProtectedRoute>
          }
        />

        {/* Ruta para manejar 404 */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </Router>
  );
}

export default App;