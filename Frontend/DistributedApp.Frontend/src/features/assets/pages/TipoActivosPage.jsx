import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiAssets } from "../../../core/api/axios";
import { Boxes, ArrowLeft, Search, Filter, RefreshCw, Plus, Save, X, Trash2, Pencil, Tag } from "lucide-react";

// --- UTILIDADES ---
const BackToHomeButton = ({ to = "/activos", className = "" }) => (
  <Link
    to={to}
    className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 border ${
      className
        ? className
        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
    }`}
  >
    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    <span>Regresar</span>
  </Link>
);

// --- MODAL (TipoActivoForm) ---
const TipoActivoForm = ({ open, onClose, onSubmit, initialValues, loading }) => {
  const [form, setForm] = useState({ idTipoActivo: null, nombre: "" });

  useEffect(() => {
    if (!open) return;
    if (initialValues) setForm({ idTipoActivo: initialValues.idTipoActivo, nombre: initialValues.nombre ?? "" });
    else setForm({ idTipoActivo: null, nombre: "" });
  }, [open, initialValues]);

  if (!open) return null;

  const isEdit = form.idTipoActivo !== null;

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Editar Tipo de Activo" : "Nuevo Tipo de Activo"}</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? "Actualiza el nombre del tipo." : "Crea un nuevo tipo para usar en Activos."}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
            {isEdit ? <Pencil size={20} /> : <Plus size={20} />}
          </div>
        </div>

        <form onSubmit={submit} className="p-8 grid gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nombre</label>
            <input
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              className="input-field"
              placeholder="Ej: Equipo de cómputo"
              disabled={loading}
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-70 inline-flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="animate-spin" /> : <>
                <Save size={18} />
                {isEdit ? "Guardar" : "Crear"}
              </>}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .input-field { 
          width: 100%; 
          border-radius: 0.75rem; 
          background-color: #F1F5F9; 
          border: 1px solid transparent; 
          padding: 0.75rem 1rem; 
          font-size: 0.875rem; 
          transition: all 0.2s; 
        } 
        .input-field:focus { 
          background-color: white; 
          border-color: #2563EB; 
          outline: none; 
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12); 
        }
      `}</style>
    </div>
  );
};

export default function TipoActivosPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [term, setTerm] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/TipoActivos");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar Tipos de Activo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/TipoActivos/search", {
        params: { term: term || "" },
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("No se pudo buscar.");
    } finally {
      setLoading(false);
    }
  };

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
    setError("");
  };

  const onEdit = (it) => {
    setEditing(it);
    setOpenForm(true);
    setError("");
  };

  const onDelete = async (id) => {
    if (!confirm("¿Eliminar este Tipo de Activo?")) return;
    setError("");
    try {
      await apiAssets.delete(`/TipoActivos/${id}`);
      await fetchAll();
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar.");
    }
  };

  const handleSubmit = async (form) => {
    setError("");

    const nombre = form.nombre?.trim();
    if (!nombre) return setError("El nombre es obligatorio.");

    setSaving(true);
    try {
      const payload = { nombre };

      if (form.idTipoActivo) await apiAssets.put(`/TipoActivos/${form.idTipoActivo}`, payload);
      else await apiAssets.post("/TipoActivos", payload);

      setOpenForm(false);
      setEditing(null);
      await fetchAll();
    } catch (e2) {
      console.error(e2);
      setError(e2?.response?.data?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => ({ total: items.length }), [items]);

  const cardBase =
    "bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300";

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px] space-y-6">

        {/* HEADER & STATS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className={`${cardBase} md:col-span-8 flex flex-col justify-between relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <BackToHomeButton to="/activos" />
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Boxes size={24} />
                </div>
              </div>
              <div className="mt-6">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tipos de Activo</h1>
                <p className="text-slate-500 mt-2 text-sm max-w-sm">
                  Catálogo de tipos para usar como combo en el registro de Activos.
                </p>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
          </div>

          <div className={`${cardBase} md:col-span-2 flex flex-col justify-center space-y-4`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                <Tag size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Registros</p>
                <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div
            className={`${cardBase} md:col-span-2 bg-blue-600 text-white border-transparent hover:bg-blue-700 flex flex-col items-center justify-center text-center cursor-pointer group`}
            onClick={onCreate}
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus size={28} className="text-black group-hover:text-white transition-colors" />
            </div>
            <p className="text-lg font-bold text-black group-hover:text-white transition-colors">
              Nuevo Tipo
            </p>
          </div>
        </div>

        {/* FILTROS */}
        <div className={`${cardBase} py-4 px-6 flex flex-col lg:flex-row items-center gap-4`}>
          <div className="flex items-center gap-2 text-slate-400 lg:pr-4 lg:border-r border-slate-100 w-full lg:w-auto">
            <Filter size={18} /> <span className="text-sm font-medium">Filtros</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
            <div className="relative group">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Buscar por nombre..."
                className="filter-input"
              />
            </div>

            <button
              onClick={onSearch}
              className="filter-input !p-0 flex items-center justify-center gap-2 bg-white hover:bg-slate-50"
              type="button"
            >
              <Search size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">Buscar</span>
            </button>

            <button
              onClick={() => {
                setTerm("");
                setRefreshing(true);
                fetchAll().finally(() => setRefreshing(false));
              }}
              className="filter-input !p-0 flex items-center justify-center gap-2 bg-white hover:bg-slate-50"
              type="button"
              title="Refrescar"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin text-blue-600" : "text-slate-400"} />
              <span className="text-sm font-semibold text-slate-600">Ver todos</span>
            </button>

            <button
              onClick={onCreate}
              className="filter-input !p-0 flex items-center justify-center gap-2 bg-white hover:bg-slate-50"
              type="button"
              title="Nuevo Tipo"
            >
              <Plus size={16} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-600">Nuevo</span>
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-600 text-sm font-medium text-center">{error}</div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-5">ID</th>
                  <th className="px-6 py-5">Nombre</th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                      Cargando datos...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400">
                      Sin registros.
                    </td>
                  </tr>
                ) : (
                  items.map((row) => (
                    <tr key={row.idTipoActivo} className="group hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-slate-500">#{row.idTipoActivo}</p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{row.nombre}</p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(row)}
                            className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200 transition-all"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
            <span className="text-xs text-slate-500 font-medium">
              Total Registros: {items.length}
            </span>
          </div>
        </div>
      </div>

      <TipoActivoForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editing}
        loading={saving}
      />

      <style>{`
        .filter-input { 
          width: 100%; 
          border-radius: 0.75rem; 
          background-color: #faf8fc; 
          border: 1px solid #E2E8F0; 
          padding: 0.6rem 1rem 0.6rem 2.5rem; 
          font-size: 0.875rem; 
          color: #334155; 
          transition: all 0.2s; 
        } 
        .filter-input:focus { 
          background-color: white; 
          border-color: #2563EB; 
          outline: none; 
        }
      `}</style>
    </div>
  );
}
