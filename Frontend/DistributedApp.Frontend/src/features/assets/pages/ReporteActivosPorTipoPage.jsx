import { useEffect, useMemo, useState } from "react";
import { apiAssets } from "../../../core/api/axios";
import { Calendar, Printer, RefreshCw, PieChart } from "lucide-react";
import { ActivosNavBar } from "./ActivosNavBar"; // <--- Navbar compartida

// --- UTILIDADES ---
const money = (n) => Number(n ?? 0).toLocaleString("es-EC", { style: "currency", currency: "USD" });
const isoDate = (d) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
};
const todayISO = () => isoDate(new Date());
const minusDaysISO = (days) => {
  const d = new Date(); d.setDate(d.getDate() - days); return isoDate(d);
};

export default function ReporteActivosPorTipoPage() {
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
    } catch (e) { setError("Error cargando datos."); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const groupedData = useMemo(() => {
    const groups = {};
    rows.forEach((item) => {
      const tipo = item.tipoActivoNombre || "Sin Clasificar";
      if (!groups[tipo]) groups[tipo] = { nombre: tipo, cantidad: 0, valorTotal: 0 };
      groups[tipo].cantidad += 1;
      groups[tipo].valorTotal += Number(item.valorCompra || 0);
    });
    return Object.values(groups).sort((a, b) => b.cantidad - a.cantidad);
  }, [rows]);

  const totalGlobal = groupedData.reduce((acc, g) => acc + g.cantidad, 0);
  const valorGlobal = groupedData.reduce((acc, g) => acc + g.valorTotal, 0);
  const printNow = () => window.print();

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1200px]">
        
        <ActivosNavBar />

        {/* HEADER */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden print-card mb-6">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <PieChart className="text-indigo-600"/> Activos por Tipo
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">Resumen agrupado y valorizado.</p>
                </div>
                <div className="no-print flex gap-2">
                    <button onClick={() => { setRefreshing(true); fetchReport().finally(() => setRefreshing(false)); }} className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition shadow-sm"><RefreshCw size={20} className={refreshing ? "animate-spin" : ""} /></button>
                    <button onClick={printNow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"><Printer size={18} /> Imprimir</button>
                </div>
            </div>

            {/* FILTROS */}
            <div className="no-print grid grid-cols-1 md:grid-cols-12 gap-4 items-end mt-2">
                <div className="md:col-span-4 relative">
                    <label className="text-xs font-bold text-slate-400 uppercase">Desde</label>
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-indigo-500 outline-none"/>
                </div>
                <div className="md:col-span-4 relative">
                    <label className="text-xs font-bold text-slate-400 uppercase">Hasta</label>
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:border-indigo-500 outline-none"/>
                </div>
                <div className="md:col-span-4">
                    <button onClick={fetchReport} disabled={loading} className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition">{loading ? "Calculando..." : "Generar Resumen"}</button>
                </div>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        </div>

        {/* TABLA DE GRUPOS */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden print-card">
          {error && <div className="p-4 bg-rose-50 text-rose-600 text-sm text-center">{error}</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-bold">
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-center">Cantidad</th>
                  <th className="px-6 py-4 text-right">Valor Total</th>
                  <th className="px-6 py-4 w-1/3">Distribución</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loading ? <tr><td colSpan="4" className="p-8 text-center text-slate-400">Calculando...</td></tr> : 
                 groupedData.length === 0 ? <tr><td colSpan="4" className="p-8 text-center text-slate-400">Sin datos.</td></tr> :
                 groupedData.map((g) => {
                     const percent = totalGlobal > 0 ? (g.cantidad / totalGlobal) * 100 : 0;
                     return (
                      <tr key={g.nombre} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">{g.nombre}</td>
                        <td className="px-6 py-4 text-center"><span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs">{g.cantidad}</span></td>
                        <td className="px-6 py-4 text-right font-mono">{money(g.valorTotal)}</td>
                        <td className="px-6 py-4">
                           <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }}></div>
                           </div>
                           <span className="text-[10px] text-slate-400 mt-1 block">{percent.toFixed(1)}%</span>
                        </td>
                      </tr>
                    );
                  })
                }
                {!loading && groupedData.length > 0 && (
                  <tr className="bg-slate-50 font-bold border-t border-slate-200">
                    <td className="px-6 py-4 uppercase text-xs text-slate-500">Total General</td>
                    <td className="px-6 py-4 text-center text-lg text-slate-900">{totalGlobal}</td>
                    <td className="px-6 py-4 text-right text-lg text-emerald-600">{money(valorGlobal)}</td>
                    <td className="px-6 py-4"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; } .print-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; } }`}</style>
    </div>
  );
}