import { useEffect, useMemo, useState } from "react";
import { apiAssets } from "../../../core/api/axios";
// 1. Importamos Trash2 para el icono de borrar
import { Boxes, Search, Filter, RefreshCw, Plus, Save, Pencil, Tag, Trash2 } from "lucide-react"; 
import { ActivosNavBar } from "./ActivosNavBar";

// --- MODAL (TipoActivoForm) ---
// (Este componente queda igual, no necesita cambios)
const TipoActivoForm = ({ open, onClose, onSubmit, initialValues, loading }) => {
  const [form, setForm] = useState({ idTipoActivo: null, nombre: "" });

  useEffect(() => {
    if (!open) return;
    if (initialValues) setForm({ idTipoActivo: initialValues.idTipoActivo, nombre: initialValues.nombre ?? "" });
    else setForm({ idTipoActivo: null, nombre: "" });
  }, [open, initialValues]);

  if (!open) return null;
  const isEdit = form.idTipoActivo !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Editar Tipo" : "Nuevo Tipo"}</h3>
            <p className="text-sm text-slate-500 mt-0.5">Categoría para clasificación.</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            {isEdit ? <Pencil size={20} /> : <Plus size={20} />}
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-8 grid gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" required disabled={loading} placeholder="Ej: Muebles"/>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition" disabled={loading}>Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 flex justify-center gap-2 items-center">
              {loading ? <RefreshCw className="animate-spin" /> : <><Save size={18} /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
      <style>{`.input-field { width: 100%; border-radius: 0.75rem; background-color: #F1F5F9; padding: 0.75rem 1rem; font-size: 0.875rem; transition: all 0.2s; } .input-field:focus { background-color: white; outline: 2px solid #2563EB; }`}</style>
    </div>
  );
};

export default function TipoActivosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchAll = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await apiAssets.get("/TipoActivos");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) { setError("No se pudo cargar."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredItems = useMemo(() => items.filter(it => term ? it.nombre.toLowerCase().includes(term.toLowerCase()) : true), [items, term]);

  const handleSubmit = async (form) => {
    setError(""); setSaving(true);
    try {
      if (form.idTipoActivo) await apiAssets.put(`/TipoActivos/${form.idTipoActivo}`, { nombre: form.nombre });
      else await apiAssets.post("/TipoActivos", { nombre: form.nombre });
      setOpenForm(false); fetchAll();
    } catch (e) { setError("No se pudo guardar."); } finally { setSaving(false); }
  };

  // 2. Función para eliminar
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este Tipo de Activo?")) return;

    setError(""); 
    try {
      await apiAssets.delete(`/TipoActivos/${id}`);
      fetchAll(); // Recargar la lista
    } catch (e) { 
      console.error(e);
      // Es común que falle si hay activos usando este tipo (Integridad Referencial)
      setError("No se pudo eliminar. Verifique que no esté en uso por algún activo."); 
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px]">
        
        <ActivosNavBar />

        {/* HEADER & STATS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 md:col-span-9 flex flex-col justify-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Boxes size={32} /></div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Tipos de Activo</h1>
                <p className="text-slate-500 text-sm">Catálogo maestro de categorías.</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 md:col-span-3 flex flex-col justify-center items-center">
             <span className="text-sm text-slate-500 font-semibold uppercase">Total Tipos</span>
             <span className="text-3xl font-bold text-slate-900">{items.length}</span>
          </div>
        </div>

        {/* MENSAJE DE ERROR (Si existe) */}
        {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-semibold text-center">
                {error}
            </div>
        )}

        {/* FILTROS Y BOTÓN NUEVO */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-4 mb-6">
          <div className="relative group flex-1 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar tipo..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500" />
          </div>
          <button onClick={fetchAll} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"><RefreshCw size={18} /></button>
          
          <button onClick={() => { setEditing(null); setOpenForm(true); }} className="py-2 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2">
            <Plus size={18} /> Nuevo Tipo
          </button>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loading ? <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400">Cargando...</td></tr> : 
                 filteredItems.map(row => (
                  <tr key={row.idTipoActivo} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono text-slate-500">#{row.idTipoActivo}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{row.nombre}</td>
                    
                    {/* 3. Agregamos el botón de eliminar junto al de editar */}
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => { setEditing(row); setOpenForm(true); }} 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(row.idTipoActivo)} 
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <TipoActivoForm open={openForm} onClose={() => setOpenForm(false)} onSubmit={handleSubmit} initialValues={editing} loading={saving} />
    </div>
  );
}