import { useState } from 'react';
import { getMaintenanceReport } from '../api/maintenanceApi';
import { Search, FileBarChart, Calendar, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';

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
      // Aseguramos que sea un array
      setData(Array.isArray(result) ? result : []);
    } catch (e) {
      console.error(e);
      alert("Error al generar el reporte. Verifique la conexión.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular total seguro
  const totalCost = data.reduce((acc, curr) => acc + (curr.valor || curr.VALOR || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER: FILTROS */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-6 items-end justify-between">
        <div className="w-full lg:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <Calendar size={14}/> Fecha Inicial
                </label>
                <input 
                    type="date" 
                    className="w-full p-3.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-slate-50 focus:bg-white font-medium text-slate-700" 
                    onChange={e => setDates({...dates, start: e.target.value})} 
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 flex items-center gap-1">
                    <Calendar size={14}/> Fecha Final
                </label>
                <input 
                    type="date" 
                    className="w-full p-3.5 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-slate-50 focus:bg-white font-medium text-slate-700" 
                    onChange={e => setDates({...dates, end: e.target.value})} 
                />
            </div>
        </div>
        <button 
            onClick={generate} 
            disabled={loading}
            className="w-full lg:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-300 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
        >
          {loading ? (
             <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Generando...
             </span>
          ) : (
             <>
               <Search size={20} /> Generar Reporte
             </>
          )}
        </button>
      </div>

      {/* RESULTADOS */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 min-h-[400px]">
        
        {/* ENCABEZADO DE RESULTADOS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-slate-50 pb-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileBarChart size={24}/>
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900">Matriz de Costos</h3>
                <p className="text-slate-500 text-sm">Desglose financiero por mantenimiento.</p>
             </div>
          </div>
          
          {/* TARJETAS DE RESUMEN (Solo si hay datos) */}
          {data.length > 0 && (
             <div className="flex gap-4">
                 <div className="px-5 py-2 bg-slate-50 rounded-2xl border border-slate-100 text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registros</p>
                    <p className="text-xl font-bold text-slate-900">{data.length}</p>
                 </div>
                 <div className="px-5 py-2 bg-emerald-50 rounded-2xl border border-emerald-100 text-right">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Gasto</p>
                    <p className="text-xl font-bold text-emerald-700">${totalCost.toFixed(2)}</p>
                 </div>
             </div>
          )}
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {loading ? (
           // SKELETON LOADING
           <div className="space-y-4 animate-pulse">
              {[1,2,3].map(i => (
                  <div key={i} className="h-16 bg-slate-50 rounded-xl w-full border border-slate-100"></div>
              ))}
           </div>
        ) : data.length > 0 ? (
          // TABLA DE DATOS
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Activo Mantenido</th>
                  <th className="p-4">Actividad Realizada</th>
                  <th className="p-4 text-right pr-6">Costo Imputado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-purple-50/30 transition-colors group">
                    <td className="p-4 pl-6 font-medium text-slate-900 group-hover:text-purple-700 flex items-center gap-2">
                        {/* Intentamos leer nombreActivo, NombreActivo o NOMBREACTIVO */}
                        {row.nombreActivo || row.NombreActivo || row.nombreACTIVO || "(Sin Nombre)"}
                    </td>
                    <td className="p-4 text-slate-600">
                        {row.nombreActividad || row.NombreActividad || row.nombreACTIVIDAD || "---"}
                    </td>
                    <td className="p-4 text-right pr-6 font-mono font-bold text-slate-800">
                        <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs mr-2 text-slate-500">$</span>
                        {(row.valor || row.VALOR || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold text-sm">
                <tr>
                  <td colSpan="2" className="p-4 pl-6 text-right uppercase tracking-wider opacity-80">Total del Periodo</td>
                  <td className="p-4 pr-6 text-right text-lg text-emerald-400 flex justify-end items-center gap-1">
                      <DollarSign size={16}/> {totalCost.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          // EMPTY STATE
          <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-2xl">
            {hasSearched ? (
                <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <Search size={32} className="opacity-30 text-slate-400"/>
                    </div>
                    <h4 className="font-bold text-slate-600 text-lg">No se encontraron resultados</h4>
                    <p className="text-sm text-slate-500">Prueba ampliando el rango de fechas.</p>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <TrendingUp size={32} className="opacity-50 text-purple-500"/>
                    </div>
                    <h4 className="font-bold text-slate-600 text-lg">Reporte de Costos</h4>
                    <p className="text-sm text-slate-500">Seleccione las fechas y presione "Generar Reporte".</p>
                </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;