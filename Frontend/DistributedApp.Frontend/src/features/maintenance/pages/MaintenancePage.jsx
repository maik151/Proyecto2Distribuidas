import { useState } from 'react';
import { Layers, Box, PenTool, FileText, Activity } from 'lucide-react';
import ActivitiesTab from '../components/ActivitiesTab';
import AssetsTab from '../components/AssetsTab';
import ExecutionTab from '../components/ExecutionTab';
import ReportsTab from '../components/ReportsTab';
import BackToHomeButton from '../../dumbComponents/backToHomeButton.jsx';

const MaintenancePage = () => {
  const [activeTab, setActiveTab] = useState('activities');

  const tabs = [
    { id: 'activities', label: 'Catálogo Actividades', icon: <Activity size={18} /> },
    { id: 'assets', label: 'Catálogo Activos', icon: <Box size={18} /> },
    { id: 'execution', label: 'Nueva Orden', icon: <PenTool size={18} /> },
    { id: 'reports', label: 'Reportes', icon: <FileText size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3 mb-2">
               {/* Botón regresar con estilo explícito para evitar fallos */}
               <BackToHomeButton className="bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-200 shadow-sm" />
               <span className="text-[10px] font-extrabold text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase tracking-wider border border-purple-100">
                 Módulo Operativo
               </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Mantenimiento
            </h1>
            <p className="text-slate-500 mt-1 text-base font-medium">Gestión integral de activos y servicios.</p>
          </div>
        </div>

        {/* NAVEGACIÓN (CORREGIDA: ESTILOS DIRECTOS) */}
        <div className="flex p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-full md:w-fit overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 translate-y-[-1px]' // ACTIVO: Fondo Oscuro, Texto Blanco
                  : 'text-slate-500 hover:bg-slate-50 hover:text-purple-600' // INACTIVO: Fondo Transparente, Texto Gris
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENIDO */}
        <div className="animate-in fade-in zoom-in duration-300">
          {activeTab === 'activities' && <ActivitiesTab />}
          {activeTab === 'assets' && <AssetsTab />}
          {activeTab === 'execution' && <ExecutionTab />}
          {activeTab === 'reports' && <ReportsTab />}
        </div>

      </div>
    </div>
  );
};

export default MaintenancePage;