import { useState } from 'react';
import { getMaintenanceReport } from '../api/maintenanceApi';
import { Search, FileBarChart, Calendar, TrendingUp, DollarSign, Printer } from 'lucide-react';

const ReportsTab = () => {
  const [dates, setDates] = useState({ start: '', end: '' });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const generate = async () => {
    if (!dates.start || !dates.end) {
        alert("Por favor seleccione ambas fechas (Desde y Hasta).");
        return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const result = await getMaintenanceReport(dates.start, dates.end);
      setData(Array.isArray(result) ? result : []);
    } catch (e) {
      console.error(e);
      alert("Error al generar el reporte.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalCost = data.reduce((acc, curr) => acc + (curr.valor || curr.VALOR || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ESTILOS DE IMPRESIÓN (Oculta filtros al imprimir) */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
          .shadow-sm { box-shadow: none !important; border: none !important; }
        }
      `}</style>

      {/* HEADER: FILTROS (Clase no-print para ocultar al imprimir) */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-6 items-end justify-between no-print">
        <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <Calendar size={14}/> Fecha Inicial
                </label>
                <input 
                    type="date" 
                    className="w-full p-3.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-medium text-slate-700" 
                    onChange={e => setDates({...dates, start: e.target.value})} 
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <Calendar size={14}/> Fecha Final
                </label>
                <input 
                    type="date" 
                    className="w-full p-3.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-slate-50 focus:bg-white font-medium text-slate-700" 
                    onChange={e => setDates({...dates, end: e.target.value})} 
                />
            </div>
        </div>
        <div className="flex gap-3 w-full lg:w-auto">
            <button 
                onClick={generate} 
                disabled={loading}
                className="flex-1 lg:flex-none bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-300 disabled:opacity-70"
            >
            {loading ? <span className="animate-spin">⌛</span> : <Search size={20} />} 
            <span className="hidden sm:inline">Generar</span>
            </button>
        </div>
      </div>

      {/* RESULTADOS */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 min-h-[400px]">
        
        {/* ENCABEZADO DE RESULTADOS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
             <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 no-print">
                <FileBarChart size={24}/>
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900">Matriz de Costos</h3>
                <p className="text-slate-500 text-sm">
                    {dates.start && dates.end ? `Periodo: ${dates.start} al ${dates.end}` : 'Desglose financiero por mantenimiento.'}
                </p>
             </div>
          </div>
          
          {/* BOTÓN IMPRIMIR (Solo aparece si hay datos) */}
          {data.length > 0 && (
             <div className="flex gap-4 items-center">
                 <button 
                    onClick={handlePrint}
                    className="no-print flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-bold hover:bg-purple-200 transition"
                 >
                    <Printer size={18} /> Imprimir
                 </button>

                 <div className="px-5 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-right">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total</p>
                    <p className="text-xl font-bold text-emerald-700">${totalCost.toFixed(2)}</p>
                 </div>
             </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
           <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-xl w-full"></div>)}
           </div>
        ) : data.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm print:border-0 print:shadow-none">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider print:bg-slate-100 print:text-black">
                <tr>
                  <th className="p-4 pl-6">Activo Mantenido</th>
                  <th className="p-4">Actividad Realizada</th>
                  <th className="p-4 text-right pr-6">Costo Imputado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-purple-50/30 transition-colors">
                    <td className="p-4 pl-6 font-medium text-slate-900">
                        {row.nombreActivo || row.NombreActivo || row.nombreACTIVO || "(Sin Nombre)"}
                    </td>
                    <td className="p-4 text-slate-600">
                        {row.nombreActividad || row.NombreActividad || row.nombreACTIVIDAD || "---"}
                    </td>
                    <td className="p-4 text-right pr-6 font-mono font-bold text-slate-800">
                        ${(row.valor || row.VALOR || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold text-sm print:bg-slate-200 print:text-black">
                <tr>
                  <td colSpan="2" className="p-4 pl-6 text-right uppercase tracking-wider opacity-80">Total del Periodo</td>
                  <td className="p-4 pr-6 text-right text-lg">${totalCost.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl no-print">
            {hasSearched ? (
                <>
                    <Search size={32} className="opacity-30 text-slate-400 mb-2"/>
                    <h4 className="font-bold text-slate-600">Sin resultados</h4>
                </>
            ) : (
                <>
                    <TrendingUp size={32} className="opacity-50 text-purple-500 mb-2"/>
                    <h4 className="font-bold text-slate-600">Reporte de Costos</h4>
                    <p className="text-sm text-slate-500">Seleccione las fechas para comenzar.</p>
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;