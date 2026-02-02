import { useEffect, useMemo, useState } from "react";
import { apiAssets } from "../../../core/api/axios";
import { 
  Boxes, Calendar, Printer, RefreshCw, Settings, Save, X 
} from "lucide-react"; // <--- Importamos Settings
import { ActivosNavBar } from "./ActivosNavBar"; 

// --- UTILIDADES ---
const money = (n) => Number(n ?? 0).toLocaleString("es-EC", { style: "currency", currency: "USD" });
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

// --- MODAL PARA EDITAR EMPRESA ---
const EmpresaForm = ({ open, onClose, currentData, onSave }) => {
    const [form, setForm] = useState({ nombre: "", departamento: "", ruc: "", ciudad: "", direccion: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if(currentData) setForm(currentData);
    }, [currentData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Guardamos en Base de Datos
            await apiAssets.put("/Empresa", form);
            onSave(); // Recargar datos padre
            onClose();
        } catch (error) {
            alert("Error guardando configuración");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 no-print">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Settings size={18} className="text-blue-600"/> Editar Cabecera
                    </h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 grid gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Nombre Empresa</label>
                        <input className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 outline-none" 
                            value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Departamento</label>
                        <input className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 outline-none" 
                            value={form.departamento} onChange={e => setForm({...form, departamento: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">RUC</label>
                            <input className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 outline-none" 
                                value={form.ruc} onChange={e => setForm({...form, ruc: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Ciudad</label>
                            <input className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 outline-none" 
                                value={form.ciudad} onChange={e => setForm({...form, ciudad: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Dirección</label>
                        <input className="w-full p-2 border rounded-lg bg-slate-50 focus:bg-white focus:border-blue-500 outline-none" 
                            value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} />
                    </div>
                    <button disabled={saving} className="mt-2 w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex justify-center gap-2">
                        {saving ? <RefreshCw className="animate-spin"/> : <><Save size={18}/> Guardar Cambios</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---
export default function ActivosReportPage() {
  const [from, setFrom] = useState(minusDaysISO(30));
  const [to, setTo] = useState(todayISO());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // ESTADO PARA LA EMPRESA (CABECERA)
  const [company, setCompany] = useState(null);
  const [openSettings, setOpenSettings] = useState(false);

  // 1. Cargar Reporte
  const fetchReport = async () => {
    setLoading(true); 
    try {
      const { data } = await apiAssets.get("/Activos/report", { params: { from, to } });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  // 2. Cargar Datos Empresa (Cabecera)
  const fetchCompany = async () => {
      try {
          const { data } = await apiAssets.get("/Empresa");
          setCompany(data);
      } catch (error) { console.error("Error cargando empresa"); }
  };

  useEffect(() => { 
      fetchReport(); 
      fetchCompany(); // <--- Cargamos cabecera al iniciar
  }, []);

  const summary = useMemo(() => ({
    total: rows.length,
    totalValor: rows.reduce((acc, it) => acc + Number(it.valorCompra ?? 0), 0)
  }), [rows]);

  const printNow = () => window.print();

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px]">
        
        <div className="no-print">
            <ActivosNavBar />
        </div>

        {/* HEADER & FILTROS */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden print-card mb-6">
          <div className="relative z-10 flex flex-col gap-4">
            
            {/* === CABECERA DE BASE DE DATOS === */}
            {company && (
                <div className="hidden print:block mb-4 border-b-2 border-slate-900 pb-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">{company.nombre}</h2>
                            <p className="text-xs text-slate-500 font-semibold">{company.departamento}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-400">RUC: {company.ruc}</p>
                            <p className="text-xs text-slate-400">{company.ciudad}</p>
                            <p className="text-xs text-slate-400">{company.direccion}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reporte Detallado</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Rango: <span className="font-semibold text-slate-700">{from}</span> a <span className="font-semibold text-slate-700">{to}</span>
                    </p>
                </div>
                <div className="no-print flex items-center gap-2">
                    {/* BOTÓN EDITAR CABECERA */}
                    <button onClick={() => setOpenSettings(true)} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition" title="Configurar Cabecera">
                        <Settings size={20} />
                    </button>
                    
                    <button onClick={() => { setRefreshing(true); fetchReport().finally(() => setRefreshing(false)); }} className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-sm" title="Refrescar">
                        <RefreshCw size={20} className={refreshing ? "animate-spin text-blue-600" : ""} />
                    </button>
                    <button onClick={printNow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                        <Printer size={18} /> Imprimir
                    </button>
                </div>
            </div>

            {/* FILTROS (NO PRINT) */}
            <div className="no-print grid grid-cols-1 md:grid-cols-12 gap-4 items-end mt-2">
              <div className="md:col-span-4">
                <label className="text-xs font-bold text-slate-400 uppercase">Desde</label>
                <div className="relative mt-1">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none text-sm" />
                </div>
              </div>
              <div className="md:col-span-4">
                <label className="text-xs font-bold text-slate-400 uppercase">Hasta</label>
                <div className="relative mt-1">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-blue-500 outline-none text-sm" />
                </div>
              </div>
              <div className="md:col-span-4">
                <button onClick={fetchReport} className="w-full py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition" disabled={loading}>
                  {loading ? "Cargando..." : "Generar Reporte"}
                </button>
              </div>
            </div>

            {/* RESUMEN RÁPIDO */}
            <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Total Items</p>
                    <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Valor Total</p>
                    <p className="text-2xl font-bold text-emerald-600">{money(summary.totalValor)}</p>
                </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden print-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold">
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Activo</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4 text-right">Valor</th>
                  <th className="px-6 py-4 text-right">Vida Útil</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loading ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">Cargando...</td></tr> : 
                 rows.length === 0 ? <tr><td colSpan="6" className="p-8 text-center text-slate-400">Sin datos en este rango.</td></tr> :
                 rows.map((r) => (
                    <tr key={r.idActivo} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-slate-500 font-mono">{String(r.fechaRegistro ?? "").slice(0, 10)}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono">#{r.idActivo}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{r.nombre}</td>
                      <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold">{r.tipoActivoNombre}</span></td>
                      <td className="px-6 py-4 text-right font-mono">{money(r.valorCompra)}</td>
                      <td className="px-6 py-4 text-right">{r.periodosDepreciacionTotal} meses</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 text-right">
            <span className="text-xs text-slate-400 font-bold uppercase">Generado el {todayISO()}</span>
          </div>
        </div>
      </div>
      
      {/* MODAL DE EDICIÓN */}
      <EmpresaForm 
        open={openSettings} 
        onClose={() => setOpenSettings(false)} 
        currentData={company} 
        onSave={fetchCompany} 
      />

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; }
        }
      `}</style>
    </div>
  );
}