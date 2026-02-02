import { useEffect, useState, useMemo } from 'react';
import { getAssets, createAsset, updateAsset, deleteAsset } from '../api/maintenanceApi';
import { Search, Plus, Pencil, Trash2, X, Laptop, Save } from 'lucide-react';

const AssetsTab = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ id: 0, codigo: '', nombre: '', fecha_compra: '', estado: true });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAssets();
      setList(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return list.filter(item => {
      // CORRECCIÓN MINÚSCULAS
      const nom = (item.nombre || "").toLowerCase();
      const cod = (item.codigo || "").toLowerCase();
      const term = search.toLowerCase();
      return nom.includes(term) || cod.includes(term);
    });
  }, [list, search]);

  const openModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      const fechaRaw = item.fechA_COMPRA || item.fecha_Compra || item.FECHA_COMPRA;
      const dateStr = fechaRaw ? fechaRaw.split('T')[0] : '';
      
      setForm({ 
        id: item.iD_ACTIVO, 
        codigo: item.codigo, 
        nombre: item.nombre, 
        fecha_compra: dateStr, 
        estado: item.estado 
      });
    } else {
      setIsEditing(false);
      setForm({ id: 0, codigo: '', nombre: '', fecha_compra: new Date().toISOString().split('T')[0], estado: true });
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, fecha_compra: new Date(form.fecha_compra).toISOString() };
      if (isEditing) await updateAsset(form.id, payload);
      else await createAsset(payload);
      setIsOpen(false);
      loadData();
    } catch (error) { alert("Error al guardar."); }
  };

  const handleDelete = async (id) => {
    if(!id || !confirm("¿Eliminar?")) return;
    try { await deleteAsset(id); loadData(); } catch(e) { alert("Error"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar activo..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white outline-none" />
        </div>
        <button onClick={() => openModal()} className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 shadow-lg">
          <Plus size={20} /> Nuevo Activo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, index) => (
          // KEY CORREGIDA: iD_ACTIVO
          <div key={item.iD_ACTIVO || index} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Laptop size={24} />
                </div>
                <div>
                  {/* PROPIEDADES MINÚSCULAS */}
                  <h4 className="font-bold text-slate-800">{item.nombre || "Sin Nombre"}</h4>
                  <p className="text-xs font-mono text-slate-400">{item.codigo || "---"}</p>
                </div>
              </div>
              <span className={`w-3 h-3 rounded-full ${item.estado ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {/* Intentamos leer la fecha de varias formas por si acaso */}
                {(item.fechA_COMPRA || item.FECHA_COMPRA) ? new Date(item.fechA_COMPRA || item.FECHA_COMPRA).toLocaleDateString() : "Sin fecha"}
              </span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => openModal(item)} className="p-2 text-slate-400 hover:text-purple-600 bg-slate-50 hover:bg-white rounded-lg"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(item.iD_ACTIVO)} className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-white rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 shadow-2xl animate-in zoom-in">
             <div className="flex justify-between mb-4">
               <h3 className="font-bold text-lg">{isEditing ? 'Editar' : 'Crear'}</h3>
               <button onClick={() => setIsOpen(false)}><X/></button>
             </div>
             <form onSubmit={handleSubmit} className="space-y-4">
               <input value={form.codigo} onChange={e=>setForm({...form, codigo:e.target.value})} placeholder="Código" className="w-full p-3 border rounded-xl" required/>
               <input value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})} placeholder="Nombre" className="w-full p-3 border rounded-xl" required/>
               <input type="date" value={form.fecha_compra} onChange={e=>setForm({...form, fecha_compra:e.target.value})} className="w-full p-3 border rounded-xl" required/>
               <button className="w-full bg-purple-600 text-white p-3 rounded-xl font-bold">Guardar</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AssetsTab;