import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../features/auth/context/AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoutes.jsx";

// Pages Generales (Auth, Dashboard, Usuarios)
import LoginPage from "../features/auth/pages/LoginPage.jsx";
import DashboardPage from "../features/dashboard/pages/dashboardpages.jsx";
import UsuariosPage from "../features/usuarios/pages/UsuarioPage.jsx";

// Pages MANTENIMIENTO
import MaintenancePage from "../features/maintenance/pages/MaintenancePage.jsx";

// Pages CONTABILIDAD
import ContabilidadDashboard from "../features/accounting/pages/ContabilidadDashboard.jsx";
import TipoCuentaPage from "../features/accounting/pages/TipoCuentaPage.jsx";
import CuentaPage from "../features/accounting/pages/CuentaPage.jsx";
import ComprobantePage from "../features/accounting/pages/ComprobantePage.jsx";
import ReportesPage from "../features/accounting/pages/ReportesPage.jsx";

// Pages ACTIVOS (Actualizado con nuevas páginas)
import ActivosPage from "../features/assets/pages/ActivosPage.jsx";
import ActivosReportPage from "../features/assets/pages/ActivosReportPage.jsx";
import TipoActivosPage from "../features/assets/pages/TipoActivosPage.jsx";
import ReporteActivosPorTipoPage from "../features/assets/pages/ReporteActivosPorTipoPage.jsx";
import DepreciacionPage from "../features/assets/pages/DepreciacionPage.jsx";

// Chat
import SupportChat from "../features/smartComponents/SupportChat.jsx";
import { ChatProvider } from "../context/ChatContext.jsx";

const AppRoutes = () => {
  return (
    <AuthProvider>
      {/* ChatProvider es hijo de AuthProvider para tener acceso al usuario */}
      <ChatProvider>
        
        {/* El chat flotante global visible en toda la app */}
        <SupportChat />

        <Routes>
          {/* --- Rutas Públicas --- */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* --- Rutas Protegidas (Cualquier usuario logueado) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Módulo Mantenimiento */}
            <Route path="/mantenimiento" element={<MaintenancePage />} />
            
            {/* Módulo Activos (Rutas Completas) */}
            <Route path="/activos" element={<ActivosPage />} />
            <Route path="/activos/reporte" element={<ActivosReportPage />} />
            <Route path="/activos/tipos" element={<TipoActivosPage />} />
            <Route path="/activos/reporte-tipos" element={<ReporteActivosPorTipoPage />} />
            <Route path="/activos/depreciacion" element={<DepreciacionPage />} />
          </Route>

          {/* --- Rutas Solo Admin --- */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
          </Route>

          {/* --- Módulo de Contabilidad (Admin y Contador) --- */}
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
      </ChatProvider>
    </AuthProvider>
  );
};

export default AppRoutes;