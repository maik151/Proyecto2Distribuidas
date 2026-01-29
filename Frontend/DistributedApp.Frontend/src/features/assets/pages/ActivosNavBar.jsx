import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Layers, FileText, PieChart, Calculator, ArrowLeft } from "lucide-react";

export const ActivosNavBar = () => {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { label: "Inventario", path: "/activos", icon: <LayoutGrid size={18} /> },
    { label: "Tipos de Activo", path: "/activos/tipos", icon: <Layers size={18} /> },
    { label: "Reporte Detalle", path: "/activos/reporte", icon: <FileText size={18} /> },
    { label: "Reporte Agrupado", path: "/activos/reporte-tipos", icon: <PieChart size={18} /> },
    { label: "Depreciación", path: "/activos/depreciacion", icon: <Calculator size={18} /> },
  ];

  return (
    <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex flex-wrap items-center gap-1 mb-6 no-print">
      
      {/* --- BOTÓN DE REGRESO AL DASHBOARD --- */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 group"
        title="Volver al menú principal"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
        <span className="hidden sm:inline">Dashboard</span>
      </Link>

      {/* SEPARADOR VERTICAL */}
      <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>

      {/* --- TABS DEL MÓDULO ACTIVOS --- */}
      {navItems.map((item) => {
        const isActive = path === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};