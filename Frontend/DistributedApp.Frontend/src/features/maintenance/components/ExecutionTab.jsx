import { useEffect, useState, useMemo } from 'react';
import { 
  getActivities, getAssets, 
  createMaintenanceOrder, getMaintenanceHistory, updateMaintenanceOrder, deleteMaintenanceOrder 
} from '../api/maintenanceApi';
import { Save, Plus, Trash, Search, ArrowLeft, Pencil, FileText, Hash, Calendar, User, Eye } from 'lucide-react';

const ExecutionTab = () => {
  // ESTADOS PRINCIPALES
  const [view, setView] = useState('LIST'); // 'LIST' o 'FORM'
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(0);

  // ESTADOS DEL FORMULARIO
  const [activities, setActivities] = useState([]);
  const [assets, setAssets] = useState([]);
  const [header, setHeader] = useState({ numero: '', responsable: '', fecha: new Date().toISOString().split('T')[0] });
  const [details, setDetails] = useState([]);
  const [newLine, setNewLine] = useState({ id_activo: '', id_actividad: '', valor: '' });

  // CARGA INICIAL
  useEffect(() => {
    loadOrders();
    loadCatalogs();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await getMaintenanceHistory();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) { console.error("Error cargando historial", e); }
  };

  const loadCatalogs = async () => {
    try {
      const [act, ass] = await Promise.all([getActivities(), getAssets()]);
      setActivities(Array.isArray(act) ? act : []);
      setAssets(Array.isArray(ass) ? ass : []);
    } catch (e) { console.error("Error catalogos", e); }
  };

  // --- LÓGICA DE LISTA Y BÚSQUEDA ---
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      (o.responsable || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.numero || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [orders, search]);

  const handleDeleteOrder = async (id) => {
    if (!confirm("¿Eliminar esta orden y sus detalles?")) return;
    try {
      await deleteMaintenanceOrder(id);
      loadOrders();
    } catch (e) { alert("Error al eliminar"); }
  };

  const handleEditOrder = (order) => {
    setIsEditing(true);
    setCurrentId(order.iD_CABECERA);
    
    // Mapear datos al formulario
    // Ajustar fecha para input date (YYYY-MM-DD)
    const dateStr = order.fecha ? order.fecha.split('T')[0] : '';
    
    setHeader({
      numero: order.numero,
      responsable: order.responsable,
      fecha: dateStr
    });

    // Mapear detalles
    // Aseguramos nombres buscando en los catálogos para que se vea bonito en la tabla
    const mappedDetails = (order.detalles || []).map(d => ({
        iD_DETALLE: d.iD_DETALLE,
        id_activo: d.iD_ACTIVO,
        id_actividad: d.iD_ACTIVIDAD,
        valor: d.valor,
        assetName: d.nombreActivo || assets.find(a => a.iD_ACTIVO === d.iD_ACTIVO)?.nombre || "---",
        actName: d.nombreActividad || activities.find(a => a.iD_ACTIVIDAD === d.iD_ACTIVIDAD)?.nombre || "---"
    }));
    
    setDetails(mappedDetails);
    setView('FORM');
  };

  const handleNewOrder = () => {
    setIsEditing(false);
    setCurrentId(0);
    setHeader({ 
        numero: `ORD-${Math.floor(Math.random() * 100000)}`, 
        responsable: '', 
        fecha: new Date().toISOString().split('T')[0] 
    });
    setDetails([]);
    setView('FORM');
  };

  // --- LÓGICA DEL FORMULARIO ---
  const addDetail = () => {
    if (!newLine.id_activo || !newLine.id_actividad || !newLine.valor || parseFloat(newLine.valor) <= 0) {
      return alert("Complete los datos del detalle correctamente.");
    }
    const assetObj = assets.find(a => (a.iD_ACTIVO || a.ID_ACTIVO) == newLine.id_activo);
    const actObj = activities.find(a => (a.iD_ACTIVIDAD || a.ID_ACTIVIDAD) == newLine.id_actividad);

    setDetails([...details, { 
      id_activo: newLine.id_activo,
      id_actividad: newLine.id_actividad,
      valor: parseFloat(newLine.valor),
      assetName: assetObj ? (assetObj.nombre || assetObj.NOMBRE) : '---',
      actName: actObj ? (actObj.nombre || actObj.NOMBRE) : '---'
    }]);
    setNewLine({ id_activo: '', id_actividad: '', valor: '' }); 
  };

  const removeDetail = (index) => setDetails(details.filter((_, i) => i !== index));

  const saveOrder = async () => {
    if (!header.responsable.trim()) return alert("Falta Responsable.");
    if (details.length === 0) return alert("Faltan detalles.");

    try {
      if (isEditing) {
        await updateMaintenanceOrder(currentId, header, details);
        alert("Orden actualizada");
      } else {
        await createMaintenanceOrder(header, details);
        alert("Orden creada");
      }
      setView('LIST');
      loadOrders();
    } catch (error) {
      console.error(error);
      alert("Error al guardar. Revise consola.");
    }
  };

  const total = details.reduce((acc, curr) => acc + (curr.valor || 0), 0);

  // --- RENDERIZADO CONDICIONAL ---

  if (view === 'LIST') {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in duration-300">
        {/* BARRA SUPERIOR LISTA */}
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

        {/* TABLA DE ÓRDENES */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
              <tr>
                <th className="p-4 pl-6">Número</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Responsable</th>
                <th className="p-4 text-center">Detalles</th>
                <th className="p-4 text-right pr-6">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">No se encontraron órdenes.</td></tr>
                ) : (
                    filteredOrders.map(order => (
                        <tr key={order.iD_CABECERA} className="hover:bg-slate-50 transition">
                            <td className="p-4 pl-6 font-mono font-bold text-purple-600">{order.numero}</td>
                            <td className="p-4 text-slate-600">
                                {order.fecha ? new Date(order.fecha).toLocaleDateString() : '---'}
                            </td>
                            <td className="p-4 font-medium text-slate-800">{order.responsable}</td>
                            <td className="p-4 text-center">
                                <span className="bg-slate-100 px-2 py-1 rounded-lg text-xs font-bold text-slate-500">
                                    {(order.detalles || []).length} ítems
                                </span>
                            </td>
                            <td className="p-4 pr-6 text-right flex justify-end gap-2">
                                <button onClick={() => handleEditOrder(order)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition" title="Ver/Editar">
                                    <Eye size={18}/>
                                </button>
                                <button onClick={() => handleDeleteOrder(order.iD_CABECERA)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Eliminar">
                                    <Trash size={18}/>
                                </button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- VISTA DE FORMULARIO (CREAR / EDITAR) ---
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 animate-in fade-in slide-in-from-right-8 duration-300">
      
      {/* HEADER FORMULARIO */}
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
                    {isEditing ? `Editando registro #${header.numero}` : 'Ingrese los datos de cabecera y detalles.'}
                </p>
            </div>
        </div>
        {isEditing && (
            <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                MODO EDICIÓN
            </span>
        )}
      </div>

      {/* CAMPOS CABECERA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Número</label>
           <div className="relative">
             <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input value={header.numero} readOnly className="w-full pl-10 p-3 rounded-xl bg-slate-50 font-bold text-slate-600" />
           </div>
         </div>
         <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Fecha</label>
           <div className="relative">
             <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input type="date" value={header.fecha} onChange={e => setHeader({...header, fecha: e.target.value})} className="w-full pl-10 p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500" />
           </div>
         </div>
         <div className="space-y-1.5">
           <label className="text-xs font-bold text-slate-500 uppercase ml-1">Responsable</label>
           <div className="relative">
             <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
             <input value={header.responsable} onChange={e => setHeader({...header, responsable: e.target.value})} className="w-full pl-10 p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500" placeholder="Nombre..." />
           </div>
         </div>
      </div>

      {/* INPUTS DETALLE */}
      <div className="bg-slate-50 p-5 rounded-2xl mb-8 border border-slate-200">
        <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Plus size={16} className="text-purple-600"/> Agregar Línea
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-4">
                <select value={newLine.id_activo} onChange={e => setNewLine({...newLine, id_activo: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                    <option value="">-- Activo --</option>
                    {assets.map((a, i) => <option key={i} value={a.iD_ACTIVO || a.ID_ACTIVO}>{a.nombre || a.NOMBRE}</option>)}
                </select>
            </div>
            <div className="md:col-span-4">
                <select value={newLine.id_actividad} onChange={e => setNewLine({...newLine, id_actividad: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 outline-none">
                    <option value="">-- Actividad --</option>
                    {activities.map((a, i) => <option key={i} value={a.iD_ACTIVIDAD || a.ID_ACTIVIDAD}>{a.nombre || a.NOMBRE}</option>)}
                </select>
            </div>
            <div className="md:col-span-2">
                <input type="number" value={newLine.valor} onChange={e => setNewLine({...newLine, valor: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 outline-none" placeholder="Costo ($)" />
            </div>
            <div className="md:col-span-2">
                <button onClick={addDetail} className="w-full bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition">
                    <Plus size={18} />
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
                <td className="p-3 pl-5 font-medium">{d.assetName}</td>
                <td className="p-3">{d.actName}</td>
                <td className="p-3 text-right font-bold">${d.valor.toFixed(2)}</td>
                <td className="p-3 text-center">
                  <button onClick={() => removeDetail(i)} className="text-red-400 hover:text-red-600"><Trash size={16}/></button>
                </td>
              </tr>
            ))}
            {details.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-slate-400">Sin detalles.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* FOOTER ACCIONES */}
      <div className="flex justify-between items-center bg-purple-50 p-6 rounded-2xl border border-purple-100">
         <div className="text-right ml-auto flex items-center gap-6">
            <div>
               <p className="text-xs uppercase font-bold text-slate-400">Total</p>
               <p className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</p>
            </div>
            <button onClick={saveOrder} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg flex items-center gap-2">
               <Save size={20} /> {isEditing ? 'Actualizar' : 'Guardar'}
            </button>
         </div>
      </div>

    </div>
  );
};

export default ExecutionTab;