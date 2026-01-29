import { useEffect, useMemo, useState } from "react";
import { apiAssets } from "../../../core/api/axios";
import { Boxes, Calendar, Printer, RefreshCw } from "lucide-react";
import { ActivosNavBar } from "./ActivosNavBar"; // <--- Importamos la Navbar

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

export default function ActivosReportPage() {
  const [from, setFrom] = useState(minusDaysISO(30));
  const [to, setTo] = useState(todayISO());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await apiAssets.get("/Activos/report", { params: { from, to } });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) { setError("No se pudo cargar el reporte."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const summary = useMemo(() => ({
    total: rows.length,
    totalValor: rows.reduce((acc, it) => acc + Number(it.valorCompra ?? 0), 0)
  }), [rows]);

  const printNow = () => window.print();

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px]">
        
        {/* NAVEGACIÓN */}
        <ActivosNavBar />

        {/* HEADER & FILTROS */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden print-card mb-6">
          <div className="relative z-10 flex flex-col gap-4">
            
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reporte Detallado</h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Rango: <span className="font-semibold text-slate-700">{from}</span> a <span className="font-semibold text-slate-700">{to}</span>
                    </p>
                </div>
                <div className="no-print flex items-center gap-2">
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
          {/* Decoración */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden print-card">
          {error && <div className="p-4 bg-rose-50 text-rose-600 text-sm text-center font-medium">{error}</div>}
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