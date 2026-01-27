import { useEffect, useState, useMemo } from 'react';
import { getActivities, createActivity, updateActivity, deleteActivity } from '../api/maintenanceApi';
import { Search, Plus, Pencil, Trash2, X, Save, Zap, Archive } from 'lucide-react';

const ActivitiesTab = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: 0, codigo: '', nombre: '', estado: true });

  const loadData = async () => {
    setLoading(true);
    try {
      // Simular un mini delay para que veas el skeleton (puedes quitarlo)
      // await new Promise(r => setTimeout(r, 800)); 
      const data = await getActivities();
      setList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return list.filter(item => {
      const nombre = (item.nombre || "").toLowerCase();
      const codigo = (item.codigo || "").toLowerCase();
      const termino = search.toLowerCase();
      return nombre.includes(termino) || codigo.includes(termino);
    });
  }, [list, search]);

  const openModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setForm({ id: item.iD_ACTIVIDAD, codigo: item.codigo || "", nombre: item.nombre || "", estado: item.estado });
    } else {
      setIsEditing(false);
      setForm({ id: 0, codigo: '', nombre: '', estado: true });
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await updateActivity(form.id, form);
      else await createActivity(form);
      setIsOpen(false);
      loadData();
    } catch (error) { alert("Error al guardar."); }
  };

  const handleDelete = async (id) => {
    if(!id || !confirm("¿Eliminar?")) return;
    try { await deleteActivity(id); loadData(); } catch(e) { alert("Error"); }
  };

  // --- SKELETON COMPONENT (Para carga) ---
  const TableSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-100 rounded"></div>
              <div className="h-3 w-16 bg-slate-100 rounded"></div>
            </div>
          </div>
          <div className="h-8 w-20 bg-slate-100 rounded-full"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* BARRA DE HERRAMIENTAS FLOTANTE */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
          <input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar actividad..." 
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-transparent font-medium text-slate-700 placeholder:text-slate-400 outline-none"
          />
        </div>
        <button onClick={() => openModal()} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition shadow-lg shadow-slate-200 transform hover:-translate-y-0.5 active:translate-y-0">
          <Plus size={18} strokeWidth={2.5} /> <span className="hidden sm:inline">Nueva Actividad</span>
        </button>
      </div>

      {/* CONTENIDO LISTA */}
      {loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        // EMPTY STATE MEJORADO
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <Archive size={40} />
          </div>
          <h3 className="text-slate-900 font-bold text-lg">Sin resultados</h3>
          <p className="text-slate-500 text-sm">No encontramos actividades con ese nombre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((item, index) => (
            <div key={item.iD_ACTIVIDAD || index} className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-100 transition-all duration-200">
              
              <div className="flex items-center gap-4">
                {/* ICONO CON INICIALES */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 text-purple-600 flex items-center justify-center font-bold text-lg shadow-inner">
                  {item.nombre ? item.nombre.substring(0,2).toUpperCase() : <Zap size={20}/>}
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.nombre || "Sin Nombre"}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-mono font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      {item.codigo || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* BADGE DE ESTADO */}
                <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                  item.estado 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${item.estado ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                  {item.estado ? 'Activo' : 'Inactivo'}
                </div>

                {/* ACCIONES (Ocultas hasta hover para limpiar visualmente) */}
                <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors" title="Editar">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(item.iD_ACTIVIDAD)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors" title="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL REDISEÑADO */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                 <h3 className="font-bold text-xl text-slate-900">{isEditing ? 'Editar Actividad' : 'Nueva Actividad'}</h3>
                 <p className="text-slate-500 text-sm mt-0.5">Completa los detalles del servicio.</p>
               </div>
               <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-500 transition"><X size={18}/></button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-8 space-y-5">
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Código</label>
                 <input 
                    value={form.codigo} 
                    onChange={e=>setForm({...form, codigo:e.target.value})} 
                    placeholder="Ej. SRV-001" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" 
                    required
                  />
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre</label>
                 <input 
                    value={form.nombre} 
                    onChange={e=>setForm({...form, nombre:e.target.value})} 
                    placeholder="Ej. Mantenimiento Preventivo" 
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all" 
                    required
                  />
               </div>

               {isEditing && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <input 
                    type="checkbox" 
                    id="status"
                    checked={form.estado} 
                    onChange={e => setForm({...form, estado: e.target.checked})} 
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer"
                   />
                   <label htmlFor="status" className="text-sm font-medium text-slate-700 cursor-pointer select-none">Actividad disponible para órdenes</label>
                </div>
               )}

               <div className="pt-2">
                 <button className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold text-lg hover:bg-slate-800 shadow-lg shadow-slate-300 transition-transform active:scale-95 flex items-center justify-center gap-2">
                   <Save size={20} /> Guardar Cambios
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default ActivitiesTab;