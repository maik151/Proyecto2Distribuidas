import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiAssets } from "../../../core/api/axios";
import {
  Boxes,
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Save,
  DollarSign,
  Tag,
  Printer,
  Layers,
  Calendar,
} from "lucide-react";

// --- UTILIDADES ---
const money = (n) => {
  const v = Number(n ?? 0);
  return v.toLocaleString("es-EC", { style: "currency", currency: "USD" });
};

const isoDate = (d) => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
const todayISO = () => isoDate(new Date());
const minusDaysISO = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return isoDate(d);
};

const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  if (d.getFullYear() <= 1) return "-"; // evita 0001-01-01
  return d.toLocaleDateString("es-EC", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const BackToHomeButton = ({ to = "/dashboard", className = "" }) => (
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

// --- MODAL (ActivoForm) ---
const ActivoForm = ({ open, onClose, onSubmit, initialValues, tipos, loading }) => {
  const [form, setForm] = useState({
    idActivo: null,
    nombre: "",
    periodosDepreciacionTotal: 12,
    valorCompra: 0,
    idTipoActivo: "",
  });

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
      setForm({
        idActivo: null,
        nombre: "",
        periodosDepreciacionTotal: 12,
        valorCompra: 0,
        idTipoActivo: tipos?.[0]?.idTipoActivo ? String(tipos[0].idTipoActivo) : "",
      });
    }
  }, [initialValues, open, tipos]);

  if (!open) return null;

  const isEdit = !!form.idActivo;

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl ring-1 ring-black/5 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {isEdit ? "Editar Activo" : "Nuevo Activo"}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEdit ? "Actualiza los datos del activo." : "Ingresa la información del activo."}
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
              placeholder='Ej: Laptop Dell 14"'
              disabled={loading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Periodos</label>
              <input
                type="number"
                min={1}
                value={form.periodosDepreciacionTotal}
                onChange={(e) => setForm((p) => ({ ...p, periodosDepreciacionTotal: e.target.value }))}
                className="input-field"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Valor compra</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.valorCompra}
                onChange={(e) => setForm((p) => ({ ...p, valorCompra: e.target.value }))}
                className="input-field"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Tipo de activo</label>
            <select
              value={form.idTipoActivo}
              onChange={(e) => setForm((p) => ({ ...p, idTipoActivo: e.target.value }))}
              className="input-field appearance-none"
              disabled={loading}
              required
            >
              <option value="">Seleccione...</option>
              {tipos.map((t) => (
                <option key={t.idTipoActivo} value={t.idTipoActivo}>
                  {t.nombre}
                </option>
              ))}
            </select>
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
              {loading ? (
                <RefreshCw className="animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  {isEdit ? "Guardar" : "Crear"}
                </>
              )}
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

export default function ActivosPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [tipos, setTipos] = useState([]);

  const [term, setTerm] = useState("");
  const [tipoQ, setTipoQ] = useState("all");

  // === REPORTE (igual ActivosReportPage) ===
  const [reportFrom, setReportFrom] = useState(minusDaysISO(30));
  const [reportTo, setReportTo] = useState(todayISO());
  const [reportRows, setReportRows] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportRefreshing, setReportRefreshing] = useState(false);
  const [reportError, setReportError] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchTipos = async () => {
    const { data } = await apiAssets.get("/TipoActivos");
    setTipos(Array.isArray(data) ? data : []);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/Activos");
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar Activos.");
    } finally {
      setLoading(false);
    }
  };

  const onSearchServer = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/Activos/search", {
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

  const fetchReport = async () => {
    setReportLoading(true);
    setReportError("");
    try {
      const { data } = await apiAssets.get("/Activos/report", {
        params: { from: reportFrom, to: reportTo },
      });
      setReportRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setReportError("No se pudo cargar el reporte. Verifica el rango de fechas o el backend.");
      setReportRows([]);
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([fetchTipos(), fetchAll()]);
        // opcional: cargar reporte inicial como el reportpage
        await fetchReport();
      } catch (e) {
        console.error(e);
        setError("No se pudo inicializar el módulo de Activos.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (tipoQ !== "all" && String(it.idTipoActivo) !== String(tipoQ)) return false;
      return true;
    });
  }, [items, tipoQ]);

  const summary = useMemo(() => {
    const totalValor = filteredItems.reduce((acc, it) => acc + Number(it.valorCompra ?? 0), 0);
    return { total: filteredItems.length, totalValor };
  }, [filteredItems]);

  const reportSummary = useMemo(() => {
    const total = reportRows.length;
    const totalValor = reportRows.reduce((acc, it) => acc + Number(it.valorCompra ?? 0), 0);
    return { total, totalValor };
  }, [reportRows]);

  const onCreate = () => {
    setEditing(null);
    setOpenForm(true);
    setError("");
  };

  const onEdit = (row) => {
    setEditing(row);
    setOpenForm(true);
    setError("");
  };

  const onDelete = async (row) => {
    if (!confirm(`¿Eliminar el activo "${row.nombre}"?`)) return;
    setDeletingId(row.idActivo);
    setError("");
    try {
      await apiAssets.delete(`/Activos/${row.idActivo}`);
      await fetchAll();
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmitForm = async (form) => {
    setError("");

    const nombre = form.nombre?.trim();
    const periodos = Number(form.periodosDepreciacionTotal);
    const valor = Number(form.valorCompra);
    const idTipoActivo = Number(form.idTipoActivo);

    if (!nombre) return setError("El nombre es obligatorio.");
    if (!Number.isFinite(periodos) || periodos <= 0) return setError("Los periodos deben ser mayores a 0.");
    if (!Number.isFinite(valor) || valor <= 0) return setError("El valor de compra debe ser mayor a 0.");
    if (!Number.isFinite(idTipoActivo) || idTipoActivo <= 0) return setError("Seleccione un Tipo de Activo.");

    const payload = { nombre, periodosDepreciacionTotal: periodos, valorCompra: valor, idTipoActivo };

    setSaving(true);
    try {
      if (form.idActivo) await apiAssets.put(`/Activos/${form.idActivo}`, payload);
      else await apiAssets.post("/Activos", payload);

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

  const printReportLikePage = async () => {
    // asegura datos actualizados antes de imprimir
    await fetchReport();
    // deja que React pinte el DOM y luego imprime
    setTimeout(() => window.print(), 50);
  };

  const cardBase =
    "bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300";

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* ====== TODO lo de CRUD se marca no-print para que al imprimir salga SOLO el reporte ====== */}
        <div className="no-print space-y-6">
          {/* HEADER & STATS */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* HEADER */}
            <div className={`${cardBase} md:col-span-6 flex flex-col justify-between relative overflow-hidden`}>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <BackToHomeButton />
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Boxes size={24} />
                  </div>
                </div>
                <div className="mt-6">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Activos</h1>
                  <p className="text-slate-500 mt-2 text-sm max-w-sm">
                    Registro de activos con tipo, valor de compra y periodos de depreciación.
                  </p>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
            </div>

            {/* STATS */}
            <div className={`${cardBase} md:col-span-3 flex flex-col justify-center space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Tag size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Registros</p>
                  <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
                </div>
              </div>
              <div className="h-px bg-slate-100 w-full"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Total valor</p>
                  <p className="text-2xl font-bold text-slate-900">{money(summary.totalValor)}</p>
                </div>
              </div>
            </div>

            {/* TARJETA: TIPOS DE ACTIVO */}
            <div
              className={`${cardBase} md:col-span-3 flex flex-col justify-center cursor-pointer group`}
              onClick={() => navigate("/activos/tipos")}
              role="button"
              tabIndex={0}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Layers size={22} />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                  Administrar
                </span>
              </div>

              <div className="mt-4">
                <p className="text-lg font-bold text-slate-900">Tipos de Activo</p>
                <p className="text-sm text-slate-500 mt-1">Crear y gestionar tipos.</p>
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm group-hover:bg-indigo-600 group-hover:text-white transition">
                  Ir a Tipos
                </span>
              </div>
            </div>

            {/* CTA: Nuevo Activo */}
            <div
              className={`${cardBase} md:col-span-3 bg-blue-600 text-white border-transparent hover:bg-blue-700 flex flex-col items-center justify-center text-center cursor-pointer group`}
              onClick={onCreate}
            >
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus size={28} className="text-black group-hover:text-white transition-colors" />
              </div>
              <p className="text-lg font-bold text-black group-hover:text-white transition-colors">Nuevo Activo</p>
            </div>
          </div>

          {/* FILTROS (listado) */}
          <div className={`${cardBase} py-4 px-6 flex flex-col lg:flex-row items-center gap-4`}>
            <div className="flex items-center gap-2 text-slate-400 lg:pr-4 lg:border-r border-slate-100 w-full lg:w-auto">
              <Filter size={18} /> <span className="text-sm font-medium">Filtros</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
              <div className="relative group">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
                />
                <input
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="Buscar por activo o tipo..."
                  className="filter-input"
                />
              </div>

              <select value={tipoQ} onChange={(e) => setTipoQ(e.target.value)} className="filter-input">
                <option value="all">Todos los Tipos</option>
                {tipos.map((t) => (
                  <option key={t.idTipoActivo} value={t.idTipoActivo}>
                    {t.nombre}
                  </option>
                ))}
              </select>

              <button
                onClick={onSearchServer}
                className="filter-input !p-0 flex items-center justify-center gap-2 bg-white hover:bg-slate-50"
                type="button"
              >
                <Search size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">Buscar</span>
              </button>

              <button
                onClick={() => {
                  setRefreshing(true);
                  fetchAll().finally(() => setRefreshing(false));
                }}
                className="filter-input !p-0 flex items-center justify-center gap-2 bg-white hover:bg-slate-50"
                type="button"
                title="Refrescar"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin text-blue-600" : "text-slate-400"}
                />
                <span className="text-sm font-semibold text-slate-600">Refrescar</span>
              </button>

              {/* Imprime usando el mismo estilo del reporte */}
              <button
                onClick={printReportLikePage}
                className="filter-input !p-0 flex items-center justify-center gap-2 bg-white hover:bg-slate-50"
                type="button"
                title="Imprimir reporte"
              >
                <Printer size={16} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">Imprimir reporte</span>
              </button>
            </div>
          </div>

          {/* TABLA CRUD */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-sm font-medium text-center">{error}</div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="px-6 py-5">ID</th>
                    <th className="px-6 py-5">Activo</th>
                    <th className="px-6 py-5">Tipo</th>
                    <th className="px-6 py-5">Creación</th>
                    <th className="px-6 py-5 text-right">Valor</th>
                    <th className="px-6 py-5 text-right">Periodos</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                        Cargando datos...
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                        No se encontraron activos.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((row) => (
                      <tr key={row.idActivo} className="group hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs text-slate-500">#{row.idActivo}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{row.nombre}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                            {row.tipoActivoNombre ?? "-"}
                          </span>
                        </td>
                        {/* si fechaCreacion viene mala, intenta mostrar fechaRegistro */}
                        <td className="px-6 py-4">{fmtDate(row.fechaCreacion) !== "-" ? fmtDate(row.fechaCreacion) : fmtDate(row.fechaRegistro)}</td>

                        <td className="px-6 py-4 text-right font-semibold">{money(row.valorCompra)}</td>
                        <td className="px-6 py-4 text-right">{row.periodosDepreciacionTotal}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEdit(row)}
                              className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-blue-600 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200 transition-all"
                              title="Editar"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => onDelete(row)}
                              disabled={deletingId === row.idActivo}
                              className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-rose-600 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200 transition-all disabled:opacity-60"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
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
              <span className="text-xs text-slate-500 font-medium">Total Registros: {filteredItems.length}</span>
            </div>
          </div>
        </div>

        {/* ====== REPORTE (SE IMPRIME CON ESTE BLOQUE) ====== */}
        <div className={`${cardBase} relative overflow-hidden print-card`}>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reporte de Activos</h2>
                <p className="text-slate-500 mt-2 text-sm">
                  Rango: <span className="font-semibold text-slate-700">{reportFrom}</span> a{" "}
                  <span className="font-semibold text-slate-700">{reportTo}</span>
                </p>
              </div>

              <div className="no-print flex items-center gap-2">
                <button
                  onClick={() => {
                    setReportRefreshing(true);
                    fetchReport().finally(() => setReportRefreshing(false));
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                  title="Refrescar"
                  type="button"
                >
                  <RefreshCw
                    size={16}
                    className={reportRefreshing ? "animate-spin text-blue-600" : "text-slate-400"}
                  />
                  Refrescar
                </button>

                <button
                  onClick={printReportLikePage}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                  type="button"
                >
                  <Printer size={16} />
                  Imprimir
                </button>

                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Boxes size={24} />
                </div>
              </div>
            </div>

            {/* FILTROS REPORTE */}
            <div className="no-print grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="text-xs font-semibold text-slate-500 uppercase">Desde</label>
                <div className="relative mt-1">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={reportFrom}
                    onChange={(e) => setReportFrom(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="text-xs font-semibold text-slate-500 uppercase">Hasta</label>
                <div className="relative mt-1">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={reportTo}
                    onChange={(e) => setReportTo(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>

              <div className="md:col-span-4 flex gap-2">
                <button
                  onClick={fetchReport}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-sm"
                  type="button"
                  disabled={reportLoading}
                >
                  {reportLoading ? "Cargando..." : "Generar reporte"}
                </button>
              </div>
            </div>

            {/* RESUMEN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase">Total registros</p>
                <p className="text-2xl font-bold text-slate-900">{reportSummary.total}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase">Total valor</p>
                <p className="text-2xl font-bold text-slate-900">{money(reportSummary.totalValor)}</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        </div>

        {/* TABLA REPORTE */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden print-card">
          {reportError && (
            <div className="p-4 bg-rose-50 text-rose-600 text-sm font-medium text-center">{reportError}</div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-5">Fecha</th>
                  <th className="px-6 py-5">ID</th>
                  <th className="px-6 py-5">Activo</th>
                  <th className="px-6 py-5">Tipo</th>
                  <th className="px-6 py-5 text-right">Valor</th>
                  <th className="px-6 py-5 text-right">Periodos</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50 text-sm">
                {reportLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      Cargando datos...
                    </td>
                  </tr>
                ) : reportRows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No hay datos para el rango seleccionado.
                    </td>
                  </tr>
                ) : (
                  reportRows.map((r) => (
                    <tr key={r.idActivo} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-slate-500">{String(r.fechaRegistro ?? "").slice(0, 10)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-slate-500">#{r.idActivo}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{r.nombre}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-slate-50 text-slate-600 border-slate-200">
                          {r.tipoActivoNombre ?? "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold">{money(r.valorCompra)}</td>
                      <td className="px-6 py-4 text-right">{r.periodosDepreciacionTotal}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
            <span className="text-xs text-slate-500 font-medium">Generado: {todayISO()}</span>
          </div>
        </div>
      </div>

      <ActivoForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setEditing(null);
        }}
        onSubmit={handleSubmitForm}
        initialValues={editing}
        tipos={tipos}
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

        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { box-shadow: none !important; border: 1px solid #E2E8F0 !important; }
        }
      `}</style>
    </div>
  );
}
