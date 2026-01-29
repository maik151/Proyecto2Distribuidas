import { useEffect, useMemo, useState } from "react";
import { apiAssets } from "../../../core/api/axios";
import {
  Boxes, Search, Filter, RefreshCw, Plus, Pencil, Trash2,
  DollarSign, Tag, Save // <--- Importante: Save agregado para evitar pantalla blanca
} from "lucide-react";
import { ActivosNavBar } from "./ActivosNavBar"; // Importación de la Navbar

// --- UTILIDADES ---
const money = (n) => Number(n ?? 0).toLocaleString("es-EC", { style: "currency", currency: "USD" });
const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime()) || d.getFullYear() <= 1) return "-"; 
  return d.toLocaleDateString("es-EC", { year: "numeric", month: "2-digit", day: "2-digit" });
};

// --- MODAL (ActivoForm) ---
const ActivoForm = ({ open, onClose, onSubmit, initialValues, tipos, loading }) => {
  const [form, setForm] = useState({ idActivo: null, nombre: "", periodosDepreciacionTotal: 12, valorCompra: 0, idTipoActivo: "" });

  useEffect(() => {
    if (!open) return;
    if (initialValues) {
      setForm({
        idActivo: initialValues.idActivo ?? null,
        nombre: initialValues.nombre ?? "",
        periodosDepreciacionTotal: initialValues.periodosDepreciacionTotal ?? 12,
        valorCompra: initialValues.valorCompra ?? 0,
        idTipoActivo: String(initialValues.idTipoActivo ?? ""),
      });
    } else {
      setForm({ idActivo: null, nombre: "", periodosDepreciacionTotal: 12, valorCompra: 0, idTipoActivo: tipos?.[0]?.idTipoActivo ? String(tipos[0].idTipoActivo) : "" });
    }
  }, [initialValues, open, tipos]);

  if (!open) return null;
  const isEdit = !!form.idActivo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Editar Activo" : "Nuevo Activo"}</h3>
            <p className="text-sm text-slate-500 mt-0.5">Ingresa la información del activo.</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            {isEdit ? <Pencil size={20} /> : <Plus size={20} />}
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="p-8 grid gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nombre</label>
            <input value={form.nombre} onChange={(e) => setForm(p => ({ ...p, nombre: e.target.value }))} className="input-field" required disabled={loading}/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Periodos</label>
              <input type="number" min={1} value={form.periodosDepreciacionTotal} onChange={(e) => setForm(p => ({ ...p, periodosDepreciacionTotal: e.target.value }))} className="input-field" required disabled={loading}/>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Valor compra</label>
              <input type="number" min={0} step={0.01} value={form.valorCompra} onChange={(e) => setForm(p => ({ ...p, valorCompra: e.target.value }))} className="input-field" required disabled={loading}/>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Tipo</label>
            <select value={form.idTipoActivo} onChange={(e) => setForm(p => ({ ...p, idTipoActivo: e.target.value }))} className="input-field" required disabled={loading}>
              <option value="">Seleccione...</option>
              {tipos.map(t => <option key={t.idTipoActivo} value={t.idTipoActivo}>{t.nombre}</option>)}
            </select>
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

export default function ActivosPage() {
  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [term, setTerm] = useState("");
  const [tipoQ, setTipoQ] = useState("all");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resTipos, resActivos] = await Promise.all([
        apiAssets.get("/TipoActivos"),
        apiAssets.get("/Activos")
      ]);
      setTipos(Array.isArray(resTipos.data) ? resTipos.data : []);
      setItems(Array.isArray(resActivos.data) ? resActivos.data : []);
    } catch (e) { setError("Error cargando datos."); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const filteredItems = useMemo(() => items.filter(it => {
    if (tipoQ !== "all" && String(it.idTipoActivo) !== String(tipoQ)) return false;
    return term ? it.nombre.toLowerCase().includes(term.toLowerCase()) : true;
  }), [items, tipoQ, term]);

  const summary = useMemo(() => ({
    total: filteredItems.length,
    totalValor: filteredItems.reduce((acc, it) => acc + Number(it.valorCompra ?? 0), 0)
  }), [filteredItems]);

  const handleSubmitForm = async (form) => {
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, periodosDepreciacionTotal: Number(form.periodosDepreciacionTotal), valorCompra: Number(form.valorCompra), idTipoActivo: Number(form.idTipoActivo) };
      if (form.idActivo) await apiAssets.put(`/Activos/${form.idActivo}`, payload);
      else await apiAssets.post("/Activos", payload);
      setOpenForm(false);
      fetchAll();
    } catch (e) { setError("No se pudo guardar."); } finally { setSaving(false); }
  };

  const onDelete = async (row) => {
    if(!confirm("¿Eliminar activo?")) return;
    try { await apiAssets.delete(`/Activos/${row.idActivo}`); fetchAll(); } catch(e) { alert("Error eliminando"); }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px]">
        
        {/* NAVEGACIÓN COMPARTIDA */}
        <ActivosNavBar />

        {/* HEADER & STATS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 md:col-span-8 flex flex-col justify-center">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Boxes size={32} /></div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventario de Activos</h1>
                    <p className="text-slate-500 text-sm">Gestión maestra de bienes.</p>
                  </div>
                </div>
            </div>
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 md:col-span-4 flex flex-col justify-center space-y-2">
               <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-semibold">Total Valor</span>
                  <span className="text-xl font-bold text-emerald-600">{money(summary.totalValor)}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 font-semibold">Registros</span>
                  <span className="text-xl font-bold text-slate-900">{summary.total}</span>
               </div>
            </div>
        </div>

        {/* FILTROS Y BOTONES */}
        <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-slate-400 w-full lg:w-auto"><Filter size={18} /> <span className="text-sm font-medium">Filtros</span></div>
            <div className="relative group flex-1 w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar activo..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <select value={tipoQ} onChange={(e) => setTipoQ(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-sm focus:outline-none focus:border-blue-500">
                <option value="all">Todos los Tipos</option>
                {tipos.map(t => <option key={t.idTipoActivo} value={t.idTipoActivo}>{t.nombre}</option>)}
            </select>
            <button onClick={fetchAll} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"><RefreshCw size={18} /></button>
            <button onClick={() => { setEditing(null); setOpenForm(true); }} className="py-2 px-6 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2"><Plus size={18} /> Nuevo</button>
        </div>

        {/* TABLA CRUD */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                    <th className="px-6 py-4">Activo</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4 text-right">Periodos</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {loading ? <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-400">Cargando...</td></tr> : 
                   filteredItems.map(row => (
                      <tr key={row.idActivo} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-4 font-semibold text-slate-900">{row.nombre}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">{row.tipoActivoNombre}</span></td>
                        <td className="px-6 py-4 text-right">{money(row.valorCompra)}</td>
                        <td className="px-6 py-4 text-right">{row.periodosDepreciacionTotal}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => { setEditing(row); setOpenForm(true); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16} /></button>
                            <button onClick={() => onDelete(row)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                   ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>
      <ActivoForm open={openForm} onClose={() => setOpenForm(false)} onSubmit={handleSubmitForm} initialValues={editing} tipos={tipos} loading={saving} />
    </div>
  );
}