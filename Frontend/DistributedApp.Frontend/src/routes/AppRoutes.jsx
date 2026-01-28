
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoutes.jsx";

import LoginPage from "../features/auth/pages/LoginPage.jsx";
import DashboardPage from "../features/dashboard/pages/dashboardpages.jsx";
import UsuariosPage from "../features/usuarios/pages/UsuarioPage.jsx";
import MaintenancePage from "../features/maintenance/pages/MaintenancePage.jsx"


// Placeholders
//const UsuariosPage = () => <div className="p-8">Usuarios</div>;

const ActivosPage = () => <div className="p-8">Activos</div>;
const ContabilidadPage = () => <div className="p-8">Contabilidad</div>;

const AppRoutes = () => (
  <AuthProvider>
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas para cualquier usuario logueado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/mantenimiento" element={<MaintenancePage />} />
        <Route path="/activos" element={<ActivosPage />} />
      </Route>

      {/* Solo admin */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/usuarios" element={<UsuariosPage />} />
      </Route>

      {/* Admin y Contador */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "contador"]} />}>
        <Route path="/contabilidad" element={<ContabilidadPage />} />
        <Route path="/activos" element={<ActivosPage />} />
      </Route>

      <Route path="*" element={<div className="p-8">404</div>} />
    </Routes>
  </AuthProvider>
);


export default AppRoutes;

