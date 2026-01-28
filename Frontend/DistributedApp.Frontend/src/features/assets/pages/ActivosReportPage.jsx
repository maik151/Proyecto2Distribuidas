import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiAssets } from "../../../core/api/axios";
import { ArrowLeft, Boxes, Calendar, Printer, RefreshCw } from "lucide-react";

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

const BackToActivosButton = () => (
  <Link
    to="/activos"
    className="no-print group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 border bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
  >
    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    <span>Volver a Activos</span>
  </Link>
);

export default function ActivosReportPage() {
  const [from, setFrom] = useState(minusDaysISO(30));
  const [to, setTo] = useState(todayISO());

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await apiAssets.get("/Activos/report", { params: { from, to } });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el reporte. Verifica el rango de fechas o el backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useMemo(() => {
    const total = rows.length;
    const totalValor = rows.reduce((acc, it) => acc + Number(it.valorCompra ?? 0), 0);
    return { total, totalValor };
  }, [rows]);

  const cardBase =
    "bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300";

  const printNow = () => window.print();

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px] space-y-6">
        {/* HEADER */}
        <div className={`${cardBase} relative overflow-hidden print-card`}>
          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <BackToActivosButton />

              <div className="no-print flex items-center gap-2">
                <button
                  onClick={() => {
                    setRefreshing(true);
                    fetchReport().finally(() => setRefreshing(false));
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
                  title="Refrescar"
                  type="button"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin text-blue-600" : "text-slate-400"} />
                  Refrescar
                </button>

                <button
                  onClick={printNow}
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

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reporte de Activos</h1>
              <p className="text-slate-500 mt-2 text-sm">
                Rango: <span className="font-semibold text-slate-700">{from}</span> a{" "}
                <span className="font-semibold text-slate-700">{to}</span>
              </p>
            </div>

            {/* FILTROS */}
            <div className="no-print grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-4">
                <label className="text-xs font-semibold text-slate-500 uppercase">Desde</label>
                <div className="relative mt-1">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="filter-input"
                  />
                </div>
              </div>

              <div className="md:col-span-4">
                <label className="text-xs font-semibold text-slate-500 uppercase">Hasta</label>
                <div className="relative mt-1">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="filter-input" />
                </div>
              </div>

              <div className="md:col-span-4 flex gap-2">
                <button
                  onClick={fetchReport}
                  className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-sm"
                  type="button"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Generar reporte"}
                </button>
              </div>
            </div>

            {/* RESUMEN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase">Total registros</p>
                <p className="text-2xl font-bold text-slate-900">{summary.total}</p>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-xs font-bold text-slate-400 uppercase">Total valor</p>
                <p className="text-2xl font-bold text-slate-900">{money(summary.totalValor)}</p>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
        </div>

        {/* TABLA */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden print-card">
          {error && <div className="p-4 bg-rose-50 text-rose-600 text-sm font-medium text-center">{error}</div>}

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
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      Cargando datos...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                      No hay datos para el rango seleccionado.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.idActivo} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-mono text-xs text-slate-500">
                          {String(r.fechaRegistro ?? "").slice(0, 10)}
                        </p>
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
