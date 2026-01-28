import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoutes.jsx";

// Pages Generales
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import DashboardPage from "../features/dashboard/pages/dashboardpages.jsx";
import UsuariosPage from "../features/usuarios/pages/UsuarioPage.jsx";
import MaintenancePage from "../features/maintenance/pages/MaintenancePage.jsx";

// Pages CONTABILIDAD
import ContabilidadDashboard from "../features/accounting/pages/ContabilidadDashboard.jsx";
import TipoCuentaPage from "../features/accounting/pages/TipoCuentaPage.jsx";
import CuentaPage from "../features/accounting/pages/CuentaPage.jsx";
import ComprobantePage from "../features/accounting/pages/ComprobantePage.jsx";
import ReportesPage from "../features/accounting/pages/ReportesPage.jsx";

// Placeholders
const ActivosPage = () => <div className="p-8">Activos (En construcción)</div>;

const AppRoutes = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />

        {/* --- Rutas Protegidas (Cualquier usuario logueado) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mantenimiento" element={<MaintenancePage />} />
          <Route path="/activos" element={<ActivosPage />} />
        </Route>

        {/* --- Rutas Solo Admin --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>

        {/* --- Módulo de Contabilidad (Admin y Contador) --- */}
        {/* He unificado tus dos bloques en uno solo para que sea más limpio */}
        <Route element={<ProtectedRoute allowedRoles={["admin", "contador"]} />}>
          <Route path="/contabilidad" element={<ContabilidadDashboard />} />
          <Route path="/contabilidad/tipos-cuenta" element={<TipoCuentaPage />} />
          <Route path="/contabilidad/cuentas" element={<CuentaPage />} />
          <Route path="/contabilidad/comprobantes" element={<ComprobantePage />} />
          <Route path="/contabilidad/reportes" element={<ReportesPage />} />
        </Route>

        {/* --- 404 Not Found --- */}
        <Route path="*" element={<div className="p-8 text-center text-2xl font-bold text-gray-500">404 - Página no encontrada</div>} />
      </Routes>
    </AuthProvider>
  );
};

export default AppRoutes;