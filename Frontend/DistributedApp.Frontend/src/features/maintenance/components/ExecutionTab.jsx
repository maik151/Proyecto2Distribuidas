import { useEffect, useState } from 'react';
import { getActivities, getAssets, createMaintenanceOrder } from '../api/maintenanceApi';
import { Save, Plus, Trash, AlertCircle, Calendar, User, Hash } from 'lucide-react';

const ExecutionTab = () => {
  const [activities, setActivities] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [header, setHeader] = useState({ numero: '', responsable: '', fecha: new Date().toISOString().split('T')[0] });
  const [details, setDetails] = useState([]);
  const [newLine, setNewLine] = useState({ id_activo: '', id_actividad: '', valor: '' }); // Valor vacío string para mejor UX

  useEffect(() => {
    // Generar número de orden aleatorio
    setHeader(prev => ({ ...prev, numero: `ORD-${Math.floor(Math.random() * 100000)}` }));

    // Cargar catálogos
    const loadCatalogs = async () => {
      try {
        const actData = await getActivities();
        const assData = await getAssets();
        setActivities(Array.isArray(actData) ? actData : []);
        setAssets(Array.isArray(assData) ? assData : []);
      } catch (error) {
        console.error("Error cargando catálogos", error);
      }
    };
    loadCatalogs();
  }, []);

  const addDetail = () => {
    // Validación más amigable
    if (!newLine.id_activo || !newLine.id_actividad || !newLine.valor || parseFloat(newLine.valor) <= 0) {
      alert("Por favor seleccione un activo, una actividad e ingrese un costo válido mayor a 0.");
      return;
    }

    // Búsqueda robusta (soporta mayúsculas/minúsculas en propiedades ID)
    const assetObj = assets.find(a => (a.iD_ACTIVO || a.ID_ACTIVO) == newLine.id_activo);
    const actObj = activities.find(a => (a.iD_ACTIVIDAD || a.ID_ACTIVIDAD) == newLine.id_actividad);

    setDetails([...details, { 
      id_activo: newLine.id_activo,
      id_actividad: newLine.id_actividad,
      valor: parseFloat(newLine.valor),
      assetName: assetObj ? (assetObj.nombre || assetObj.NOMBRE || "---") : '?',
      actName: actObj ? (actObj.nombre || actObj.NOMBRE || "---") : '?'
    }]);
    
    // Limpiar inputs
    setNewLine({ id_activo: '', id_actividad: '', valor: '' }); 
  };

  const removeDetail = (index) => setDetails(details.filter((_, i) => i !== index));

  const saveOrder = async () => {
    if (!header.responsable.trim()) return alert("El campo Responsable Técnico es obligatorio.");
    if (details.length === 0) return alert("Debe agregar al menos un detalle a la orden.");

    try {
      await createMaintenanceOrder(header, details);
      alert("¡Orden procesada exitosamente!");
      setDetails([]);
      setHeader({ ...header, responsable: '', numero: `ORD-${Math.floor(Math.random() * 100000)}` });
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar la orden. Verifique la conexión.");
    }
  };

  const total = details.reduce((acc, curr) => acc + (curr.valor || 0), 0);

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Hash size={24} />
        </div>
        <div>
            <h3 className="text-xl font-bold text-slate-900">Nueva Orden de Trabajo</h3>
            <p className="text-slate-500 text-sm">Registre los servicios realizados a los activos.</p>
        </div>
      </div>

      {/* CABECERA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Número Orden</label>
           <div className="relative">
             <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input value={header.numero} readOnly className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold border-transparent focus:ring-0 cursor-default" />
           </div>
        </div>
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Fecha</label>
           <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input type="date" value={header.fecha} onChange={e => setHeader({...header, fecha: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-white" />
           </div>
        </div>
        <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Responsable Técnico</label>
           <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input value={header.responsable} onChange={e => setHeader({...header, responsable: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all bg-white" placeholder="Ej. Juan Pérez" />
           </div>
        </div>
      </div>

      {/* INPUTS DETALLE */}
      <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-200/60 shadow-inner">
        <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Plus size={16} className="text-purple-600"/> Agregar Detalle
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">Activo</label>
            <select 
                value={newLine.id_activo} 
                onChange={e => setNewLine({...newLine, id_activo: e.target.value})} 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
            >
                <option value="">-- Seleccionar Activo --</option>
                {assets.map((a, i) => (
                    <option key={a.iD_ACTIVO || a.ID_ACTIVO || i} value={a.iD_ACTIVO || a.ID_ACTIVO}>
                        {a.nombre || a.NOMBRE || "---"}
                    </option>
                ))}
            </select>
            </div>
            <div className="md:col-span-4 space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">Actividad</label>
            <select 
                value={newLine.id_actividad} 
                onChange={e => setNewLine({...newLine, id_actividad: e.target.value})} 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white"
            >
                <option value="">-- Seleccionar Servicio --</option>
                {activities.map((a, i) => (
                    <option key={a.iD_ACTIVIDAD || a.ID_ACTIVIDAD || i} value={a.iD_ACTIVIDAD || a.ID_ACTIVIDAD}>
                        {a.nombre || a.NOMBRE || "---"}
                    </option>
                ))}
            </select>
            </div>
            <div className="md:col-span-2 space-y-1">
            <label className="text-xs font-semibold text-slate-500 ml-1">Costo ($)</label>
            <input 
                type="number" 
                value={newLine.valor} 
                onChange={e => setNewLine({...newLine, valor: e.target.value})} 
                className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 bg-white" 
                placeholder="0.00"
            />
            </div>
            <div className="md:col-span-2">
            <button 
                onClick={addDetail} 
                className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-300 flex justify-center items-center gap-2"
            >
                <Plus size={18} /> Añadir
            </button>
            </div>
        </div>
      </div>

      {/* TABLA DETALLES */}
      <div className="overflow-hidden rounded-xl border border-slate-200 mb-8">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4">Activo</th>
              <th className="p-4">Actividad Realizada</th>
              <th className="p-4 text-right">Costo</th>
              <th className="p-4 text-center w-20">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {details.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4 font-medium text-slate-700">{d.assetName}</td>
                <td className="p-4 text-slate-600">{d.actName}</td>
                <td className="p-4 text-right font-mono font-bold text-slate-800">${d.valor.toFixed(2)}</td>
                <td className="p-4 text-center">
                  <button onClick={() => removeDetail(i)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash size={18}/>
                  </button>
                </td>
              </tr>
            ))}
            {details.length === 0 && (
                <tr>
                    <td colSpan="4" className="p-8 text-center text-slate-400 bg-slate-50/30 border-dashed border-t border-slate-200">
                        <div className="flex flex-col items-center gap-2">
                            <AlertCircle size={24} className="opacity-50"/>
                            <span>No hay servicios agregados a esta orden.</span>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER TOTAL */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-2xl shadow-xl shadow-purple-200 text-white">
        <div className="mb-4 md:mb-0">
            <h4 className="font-bold text-lg opacity-90">Resumen de Orden</h4>
            <p className="text-purple-100 text-sm">{details.length} servicios registrados</p>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-xs uppercase font-bold text-purple-200 tracking-wider">Total a Pagar</p>
            <p className="text-4xl font-extrabold tracking-tight">${total.toFixed(2)}</p>
          </div>
          <button 
            onClick={saveOrder} 
            className="bg-white text-purple-700 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-purple-50 transition-all transform active:scale-95 flex items-center gap-2"
          >
            <Save size={20} /> Procesar Orden
          </button>
        </div>
      </div>

    </div>
  );
};

export default ExecutionTab;