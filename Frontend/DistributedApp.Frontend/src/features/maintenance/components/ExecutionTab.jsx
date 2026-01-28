import { useEffect, useState, useMemo } from 'react';
import { 
  getActivities, getAssets, 
  createMaintenanceOrder, getMaintenanceHistory, updateMaintenanceOrder, deleteMaintenanceOrder,
  getMaintenanceById 
} from '../api/maintenanceApi';
import { Save, Plus, Trash, Search, ArrowLeft, Hash, Calendar, User, Eye, Loader2 } from 'lucide-react';

const ExecutionTab = () => {
  // --- ESTADOS ---
  const [view, setView] = useState('LIST');
  const [isLoading, setIsLoading] = useState(false); // Estado de carga
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(0);

  // --- CATALOGOS Y FORMULARIO ---
  const [activities, setActivities] = useState([]);
  const [assets, setAssets] = useState([]);
  
  const [header, setHeader] = useState({ 
    numero: '', 
    responsable: '', 
    fecha: new Date().toISOString().split('T')[0] 
  });
  
  const [details, setDetails] = useState([]);
  const [newLine, setNewLine] = useState({ id_activo: '', id_actividad: '', valor: '' });

  // --- CARGA INICIAL ---
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([loadOrders(), loadCatalogs()]);
    setIsLoading(false);
  };

  const loadOrders = async () => {
    try {
      const data = await getMaintenanceHistory();
      // Aseguramos que sea un array pase lo que pase
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error("Error cargando historial", e); 
    }
  };

  const loadCatalogs = async () => {
    try {
      const [act, ass] = await Promise.all([getActivities(), getAssets()]);
      setActivities(Array.isArray(act) ? act : []);
      setAssets(Array.isArray(ass) ? ass : []);
    } catch (e) { console.error("Error catalogos", e); }
  };

  // --- FILTROS ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Helper para buscar propiedades sin importar mayúsculas/minúsculas
      const responsable = o.responsable || o.RESPONSABLE || "";
      const numero = o.numero || o.NUMERO || "";
      return responsable.toLowerCase().includes(search.toLowerCase()) ||
             numero.toLowerCase().includes(search.toLowerCase());
    });
  }, [orders, search]);

  // --- ACCIONES CRUD ---

  const handleDeleteOrder = async (id) => {
    if (!confirm("¿Seguro que desea eliminar esta orden?")) return;
    setIsLoading(true);
    try {
      await deleteMaintenanceOrder(id);
      await loadOrders();
    } catch (e) { 
      alert("Error al eliminar la orden."); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOrder = async (orderSummary) => {
    setIsLoading(true);
    // Buscamos el ID correcto (puede venir como ID_CABECERA o iD_CABECERA)
    const id = orderSummary.iD_CABECERA || orderSummary.ID_CABECERA;
    setCurrentId(id);
    setIsEditing(true);
    
    try {
      // 1. Pedir datos frescos al backend (JOINs incluidos)
      const fullOrder = await getMaintenanceById(id);
      
      // 2. Mapear Cabecera
      const fechaRaw = fullOrder.fecha || fullOrder.FECHA;
      const dateStr = fechaRaw ? fechaRaw.split('T')[0] : new Date().toISOString().split('T')[0];

      setHeader({
        numero: fullOrder.numero || fullOrder.NUMERO,
        responsable: fullOrder.responsable || fullOrder.RESPONSABLE,
        fecha: dateStr
      });

      // 3. Mapear Detalles (Blindado contra nombres de propiedades raros)
      const rawDetails = fullOrder.detalles || fullOrder.Detalles || [];
      
      const mappedDetails = rawDetails.map(d => {
        // IDs
        const idActivo = d.iD_ACTIVO || d.ID_ACTIVO || d.IdActivo;
        const idActividad = d.iD_ACTIVIDAD || d.ID_ACTIVIDAD || d.IdActividad;
        
        // Nombres (Backend JOIN o búsqueda local)
        const nombreActivoBackend = d.nombreActivo || d.NombreActivo;
        const nombreActividadBackend = d.nombreActividad || d.NombreActividad;

        // Fallback local si el backend no mandó nombres
        const assetLocal = assets.find(a => (a.iD_ACTIVO || a.ID_ACTIVO) == idActivo);
        const actLocal = activities.find(a => (a.iD_ACTIVIDAD || a.ID_ACTIVIDAD) == idActividad);

        return {
          id_activo: idActivo,
          id_actividad: idActividad,
          valor: d.valor || d.VALOR || 0,
          // Prioridad: Nombre del Backend > Nombre del Catálogo Local > "---"
          assetName: nombreActivoBackend || (assetLocal ? (assetLocal.nombre || assetLocal.NOMBRE) : "---"),
          actName: nombreActividadBackend || (actLocal ? (actLocal.nombre || actLocal.NOMBRE) : "---")
        };
      });

      setDetails(mappedDetails);
      setView('FORM');

    } catch (error) {
      console.error("Error al cargar detalles:", error);
      alert("No se pudieron cargar los datos de la orden.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewOrder = () => {
    setIsEditing(false);
    setCurrentId(0);
    setHeader({ 
        numero: `ORD-${Math.floor(Math.random() * 90000) + 10000}`, // Generar número aleatorio
        responsable: '', 
        fecha: new Date().toISOString().split('T')[0] 
    });
    setDetails([]);
    setView('FORM');
  };

  // --- GESTIÓN DETALLES (Formulario) ---
  const addDetail = () => {
    if (!newLine.id_activo || !newLine.id_actividad || !newLine.valor || parseFloat(newLine.valor) <= 0) {
      return alert("Complete los datos: Activo, Actividad y Costo mayor a 0.");
    }

    // Buscamos nombres para mostrar en la tabla visualmente
    const assetObj = assets.find(a => (a.iD_ACTIVO || a.ID_ACTIVO) == newLine.id_activo);
    const actObj = activities.find(a => (a.iD_ACTIVIDAD || a.ID_ACTIVIDAD) == newLine.id_actividad);

    setDetails([...details, { 
      id_activo: parseInt(newLine.id_activo),
      id_actividad: parseInt(newLine.id_actividad),
      valor: parseFloat(newLine.valor),
      assetName: assetObj ? (assetObj.nombre || assetObj.NOMBRE) : 'Desconocido',
      actName: actObj ? (actObj.nombre || actObj.NOMBRE) : 'Desconocido'
    }]);

    setNewLine({ id_activo: '', id_actividad: '', valor: '' }); // Limpiar inputs
  };

  const removeDetail = (index) => setDetails(details.filter((_, i) => i !== index));

  const saveOrder = async () => {
    if (!header.responsable.trim()) return alert("Ingrese el Responsable.");
    if (details.length === 0) return alert("Debe agregar al menos una línea de detalle.");

    setIsLoading(true);
    try {
      if (isEditing) {
        await updateMaintenanceOrder(currentId, header, details);
        alert("¡Orden actualizada correctamente!");
      } else {
        await createMaintenanceOrder(header, details);
        alert("¡Orden creada y enviada a Contabilidad!");
      }
      await loadOrders();
      setView('LIST');
    } catch (error) {
      console.error(error);
      alert("Error al guardar. Verifique que el servidor esté activo.");
    } finally {
      setIsLoading(false);
    }
  };

  const total = details.reduce((acc, curr) => acc + (curr.valor || 0), 0);

  // --- RENDERIZADO ---

  if (view === 'LIST') {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        {/* BARRA SUPERIOR */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por responsable o número..." 
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-transparent font-medium text-slate-700 outline-none"
            />
          </div>
          <button onClick={handleNewOrder} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg">
            <Plus size={18} /> Nueva Orden
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative min-h-[300px]">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-purple-600" size={40} />
            </div>
          )}
          
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
              <tr>
                <th className="p-4 pl-6">Número</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Responsable</th>
                <th className="p-4 text-center">Estado MQ</th>
                <th className="p-4 text-center">Detalles</th>
                <th className="p-4 text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 && !isLoading ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">No se encontraron órdenes.</td></tr>
                ) : (
                    filteredOrders.map(order => {
                      // Extracción segura de propiedades
                      const id = order.iD_CABECERA || order.ID_CABECERA;
                      const num = order.numero || order.NUMERO;
                      const fecha = order.fecha || order.FECHA;
                      const resp = order.responsable || order.RESPONSABLE;
                      const estadoMq = order.estadO_MQ || order.ESTADO_MQ || 'PENDIENTE';
                      const countDetalles = (order.detalles || order.Detalles || []).length;

                      return (
                        <tr key={id} className="hover:bg-slate-50 transition">
                            <td className="p-4 pl-6 font-mono font-bold text-purple-600">{num}</td>
                            <td className="p-4 text-slate-600">
                                {fecha ? new Date(fecha).toLocaleDateString() : '---'}
                            </td>
                            <td className="p-4 font-medium text-slate-800">{resp}</td>
                            <td className="p-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${estadoMq === 'ENVIADO' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-amber-100 text-amber-600 border-amber-200'}`}>
                                  {estadoMq}
                                </span>
                            </td>
                            <td className="p-4 text-center">
                                <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-500">
                                    {countDetalles} ítems
                                </span>
                            </td>
                            <td className="p-4 pr-6 text-right flex justify-end gap-2">
                                <button onClick={() => handleEditOrder(order)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition" title="Editar">
                                    <Eye size={18}/>
                                </button>
                                <button onClick={() => handleDeleteOrder(id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Eliminar">
                                    <Trash size={18}/>
                                </button>
                            </td>
                        </tr>
                      );
                    })
                )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- VISTA FORMULARIO ---
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-300 relative">
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 z-20 flex items-center justify-center rounded-[2rem]">
          <Loader2 className="animate-spin text-purple-600" size={48} />
        </div>
      )}

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
            <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-100 rounded-full transition">
                <ArrowLeft size={24} className="text-slate-500"/>
            </button>
            <div>
                <h3 className="text-xl font-bold text-slate-900">
                    {isEditing ? 'Modificar Orden' : 'Nueva Orden de Trabajo'}
                </h3>
                <p className="text-slate-500 text-sm">
                    {isEditing ? `Editando registro ${header.numero}` : 'Ingrese los datos para procesar la orden.'}
                </p>
            </div>
        </div>
        <div className="text-right">
             <span className="block text-xs font-bold text-slate-400 uppercase">Estado</span>
             <span className="text-purple-600 font-bold">
                {isEditing ? 'EDICIÓN' : 'CREACIÓN'}
             </span>
        </div>
      </div>

      {/* CABECERA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Número</label>
           <div className="relative">
             <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input value={header.numero} readOnly className="w-full pl-10 p-3 rounded-xl bg-slate-50 font-bold text-slate-600 border border-slate-200" />
           </div>
         </div>
         <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha</label>
           <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input type="date" value={header.fecha} onChange={e => setHeader({...header, fecha: e.target.value})} className="w-full pl-10 p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition" />
           </div>
         </div>
         <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Responsable</label>
           <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input value={header.responsable} onChange={e => setHeader({...header, responsable: e.target.value})} className="w-full pl-10 p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition" placeholder="Nombre del técnico..." />
           </div>
         </div>
      </div>

      {/* AGREGAR LINEA */}
      <div className="bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Plus size={16} className="text-purple-600"/> Agregar Detalle
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
                <select value={newLine.id_activo} onChange={e => setNewLine({...newLine, id_activo: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 outline-none bg-white">
                    <option value="">-- Seleccionar Activo --</option>
                    {assets.map((a, i) => (
                        // Usamos a.iD_ACTIVO || a.ID_ACTIVO para ser compatibles
                        <option key={i} value={a.iD_ACTIVO || a.ID_ACTIVO}>{a.nombre || a.NOMBRE}</option>
                    ))}
                </select>
            </div>
            <div className="md:col-span-4">
                <select value={newLine.id_actividad} onChange={e => setNewLine({...newLine, id_actividad: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 outline-none bg-white">
                    <option value="">-- Seleccionar Actividad --</option>
                    {activities.map((a, i) => (
                        <option key={i} value={a.iD_ACTIVIDAD || a.ID_ACTIVIDAD}>{a.nombre || a.NOMBRE}</option>
                    ))}
                </select>
            </div>
            <div className="md:col-span-2">
                <input type="number" value={newLine.valor} onChange={e => setNewLine({...newLine, valor: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 outline-none" placeholder="Costo ($)" />
            </div>
            <div className="md:col-span-2">
                <button onClick={addDetail} className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2">
                    <Plus size={18} /> Agregar
                </button>
            </div>
        </div>
      </div>

      {/* TABLA DETALLES */}
      <div className="overflow-hidden rounded-xl border border-slate-200 mb-8">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
            <tr>
              <th className="p-3 pl-5">Activo</th>
              <th className="p-3">Actividad</th>
              <th className="p-3 text-right">Costo</th>
              <th className="p-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {details.map((d, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="p-3 pl-5 font-medium text-slate-700">{d.assetName}</td>
                <td className="p-3 text-slate-600">{d.actName}</td>
                <td className="p-3 text-right font-bold text-slate-900">${d.valor.toFixed(2)}</td>
                <td className="p-3 text-center">
                  <button onClick={() => removeDetail(i)} className="text-rose-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-lg transition"><Trash size={16}/></button>
                </td>
              </tr>
            ))}
            {details.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-slate-400 italic">No hay detalles agregados.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="flex justify-end items-center bg-purple-50 p-6 rounded-2xl border border-purple-100 gap-8">
         <div>
            <p className="text-xs uppercase font-bold text-purple-400 text-right mb-1">Costo Total</p>
            <p className="text-4xl font-bold text-purple-900">${total.toFixed(2)}</p>
         </div>
         <button onClick={saveOrder} disabled={isLoading} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-95">
            {isLoading ? <Loader2 className="animate-spin"/> : <Save size={20} />} 
            {isEditing ? 'Actualizar Orden' : 'Guardar Orden'}
         </button>
      </div>

    </div>
  );
};

export default ExecutionTab;