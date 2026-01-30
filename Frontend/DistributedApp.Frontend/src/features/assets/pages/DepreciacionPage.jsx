import { useState, useEffect } from "react";
import { apiAssets } from "../../../core/api/axios";
import {
  Calculator, RefreshCw, AlertTriangle, CheckCircle2,
  Table as TableIcon, History, Printer, Save, Eye, X, Trash2
} from "lucide-react";
import { ActivosNavBar } from "./ActivosNavBar";

// --- UTILIDADES ---
const money = (n) => Number(n ?? 0).toLocaleString("es-EC", { style: "currency", currency: "USD" });
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("es-EC", { year: "numeric", month: "2-digit", day: "2-digit" }) : "-";

// =========================================================
// 1. TICKET DE IMPRESIÓN (INVISIBLE EN PANTALLA)
// =========================================================
const DepreciacionTicket = ({ data }) => {
  if (!data) return null;

  return (
    <div id="printable-area" className="hidden">
        {/* ENCABEZADO */}
        <div className="mb-8 border-b border-black pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold uppercase text-black">Comprobante de Diario</h1>
                    <p className="text-gray-600 text-sm">Depreciación de Activos Fijos</p>
                </div>
                <div className="text-right">
                    <div className="border border-black px-3 py-1 mb-1 inline-block">
                        <span className="block text-[10px] font-bold uppercase">Referencia</span>
                        <span className="text-lg font-mono font-bold">#{data.idDepreciacion}</span>
                    </div>
                    <p className="text-sm">Fecha: <b>{fmtDate(data.fecha)}</b></p>
                </div>
            </div>
            
            <div className="mt-4 p-3 border border-gray-300 bg-gray-50 text-sm">
                <p><span className="font-bold inline-block w-24">Concepto:</span> {data.observaciones}</p>
                <p><span className="font-bold inline-block w-24">Responsable:</span> {data.responsable}</p>
            </div>
        </div>

        {/* TABLA */}
        <table className="w-full text-left text-sm border-collapse mb-8">
            <thead>
                <tr className="border-b-2 border-black">
                    <th className="py-2 text-left w-1/2">Activo / Cuenta</th>
                    <th className="py-2 text-center">Periodo</th>
                    <th className="py-2 text-right">Valor Cuota</th>
                </tr>
            </thead>
            <tbody>
                {data.detalles?.map((d, idx) => (
                    <tr key={d.idDetalle} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="py-2 pr-2">{d.nombreActivo || `Activo ID: ${d.idActivo}`}</td>
                        <td className="py-2 text-center">{d.periodo}</td>
                        <td className="py-2 text-right font-mono">{money(d.valorDepreciacion)}</td>
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr className="border-t-2 border-black font-bold text-lg">
                    <td className="py-3">TOTAL GENERAL</td>
                    <td></td>
                    <td className="py-3 text-right">{money(data.detalles?.reduce((acc, curr) => acc + curr.valorDepreciacion, 0))}</td>
                </tr>
            </tfoot>
        </table>

        {/* FIRMAS */}
        <div className="mt-20 pt-10 flex justify-between px-10">
            <div className="text-center w-1/3">
                <div className="border-t border-black pt-2">
                    <p className="font-bold text-sm uppercase">Elaborado por</p>
                    <p className="text-xs text-gray-500">{data.responsable}</p>
                </div>
            </div>
            <div className="text-center w-1/3">
                <div className="border-t border-black pt-2">
                    <p className="font-bold text-sm uppercase">Aprobado por</p>
                    <p className="text-xs text-gray-500">Contabilidad</p>
                </div>
            </div>
        </div>
        
        <div className="mt-8 text-center text-[10px] text-gray-400">
            Impreso el {new Date().toLocaleString()}
        </div>
    </div>
  );
};

// =========================================================
// 2. MODAL VISUAL (SOLO PANTALLA)
// =========================================================
const DetalleModal = ({ open, onClose, data, loading, onPrint }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 no-print">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl ring-1 ring-black/5 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Detalle de Depreciación</h3>
            {!loading && data && <p className="text-sm text-slate-500 mt-0.5">Proceso #{data.idDepreciacion} • {fmtDate(data.fecha)}</p>}
          </div>
          <div className="flex gap-2">
             {!loading && data && (
                <button onClick={onPrint} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                    <Printer size={18} /> Imprimir
                </button>
             )}
             <button onClick={onClose} className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 transition"><X size={20} /></button>
          </div>
        </div>

        <div className="p-0 overflow-auto flex-1 bg-white">
            {loading ? (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center"><RefreshCw className="animate-spin mb-2" /> Cargando...</div>
            ) : data ? (
                <div className="p-6 sm:p-10">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                            <tr className="border-b-2 border-slate-300">
                                <th className="px-4 py-3 text-left w-1/2">Activo</th>
                                <th className="px-4 py-3 text-center">Periodo</th>
                                <th className="px-4 py-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {data.detalles?.map((d) => (
                                <tr key={d.idDetalle}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{d.nombreActivo || `Activo ID: ${d.idActivo}`}</td>
                                    <td className="px-4 py-3 text-center text-slate-600">{d.periodo}</td>
                                    <td className="px-4 py-3 text-right font-mono text-slate-800">{money(d.valorDepreciacion)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-900 border-t-2 border-slate-900">
                            <tr><td className="px-4 py-4 uppercase">Total</td><td className="px-4 py-4"></td><td className="px-4 py-4 text-right text-lg">{money(data.detalles?.reduce((acc, curr) => acc + curr.valorDepreciacion, 0))}</td></tr>
                        </tfoot>
                    </table>
                </div>
            ) : <div className="p-8 text-center text-rose-500">Error cargando información.</div>}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
            <button onClick={onClose} className="px-6 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

// =========================================================
// 3. PÁGINA PRINCIPAL
// =========================================================
export default function DepreciacionPage() {
  const [activeTab, setActiveTab] = useState("new"); 
  
  // Estados
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [observaciones, setObservaciones] = useState("Depreciación mensual automática");
  const [detalles, setDetalles] = useState([]);
  const [procesado, setProcesado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const [historyList, setHistoryList] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Datos para el Modal y para imprimir
  const [viewId, setViewId] = useState(null);
  const [viewData, setViewData] = useState(null); // <--- ESTA DATA SE PASARÁ AL TICKET
  const [loadingView, setLoadingView] = useState(false);

  // --- LÓGICA ---
  const procesar = async () => {
    setLoading(true); setMsg({ type:"", text:"" }); setDetalles([]);
    try {
      const { data: activos } = await apiAssets.get("/Activos");
      if (!activos?.length) throw new Error("No hay activos para depreciar.");
      const nuevos = activos.map(a => ({
        idActivo: a.idActivo, nombre: a.nombre,
        valor: Number(a.valorCompra || 0) / Number(a.periodosDepreciacionTotal || 1), periodo: 1 
      }));
      setDetalles(nuevos); setProcesado(true);
    } catch (e) { setMsg({ type: "error", text: e.message || "Error al calcular." }); }
    finally { setLoading(false); }
  };

  const guardar = async () => {
    if(!confirm("¿Guardar depreciación?")) return;
    setSaving(true);
    try {
      const payload = { fecha, observaciones, responsable: "Admin", detalles: detalles.map(d => ({ idActivo: d.idActivo, periodo: d.periodo, valorDepreciacion: d.valor })) };
      await apiAssets.post("/Depreciaciones", payload);
      setMsg({ type: "success", text: "¡Guardado correctamente!" });
      setDetalles([]); setProcesado(false);
      if(activeTab === "history") fetchHistory();
    } catch (e) { setMsg({ type: "error", text: "Error al guardar." }); }
    finally { setSaving(false); }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
        const { data } = await apiAssets.get("/Depreciaciones"); 
        setHistoryList(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoadingHistory(false); }
  };

  const openDetail = async (id) => {
      setViewId(id); setViewData(null); setLoadingView(true);
      try { const { data } = await apiAssets.get(`/Depreciaciones/${id}`); setViewData(data); } 
      catch (e) { alert("Error cargando detalles"); setViewId(null); } 
      finally { setLoadingView(false); }
  };

  const onAnulate = async (row) => {
      if(!confirm(`¿Anular depreciación #${row.idDepreciacion}?`)) return;
      try { await apiAssets.delete(`/Depreciaciones/${row.idDepreciacion}`); fetchHistory(); } 
      catch(e) { alert("No se pudo anular."); }
  };

  useEffect(() => { if (activeTab === "history") fetchHistory(); }, [activeTab]);
  const printHistory = () => window.print();

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1200px]">
        <ActivosNavBar />

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 no-print">
            <h1 className="text-2xl font-bold text-slate-900">Gestión de Depreciaciones</h1>
            <div className="bg-white p-1 rounded-xl border border-slate-200 flex">
                <button onClick={() => setActiveTab("new")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab==="new" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}>Nueva</button>
                <button onClick={() => setActiveTab("history")} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${activeTab==="history" ? "bg-slate-900 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}>Historial</button>
            </div>
        </div>

        {/* TAB NUEVA */}
        {activeTab === "new" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
                <div className="lg:col-span-1 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 h-fit">
                    <div className="flex items-center gap-2 mb-4 text-indigo-600 font-bold"><Calculator size={20}/> <span>Parámetros</span></div>
                    <div className="space-y-4">
                        <div><label className="text-xs font-bold text-slate-400 uppercase">Fecha Corte</label><input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold" disabled={procesado} /></div>
                        <div><label className="text-xs font-bold text-slate-400 uppercase">Observación</label><textarea value={observaciones} onChange={e=>setObservaciones(e.target.value)} className="w-full mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm" rows={3} disabled={procesado} /></div>
                        <button onClick={procesar} disabled={loading || procesado} className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition flex justify-center gap-2">{loading ? <RefreshCw className="animate-spin"/> : "1. Calcular"}</button>
                        {msg.text && <div className={`p-3 rounded-xl text-sm font-medium flex gap-2 ${msg.type==="error" ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}>{msg.type==="error" ? <AlertTriangle size={18}/> : <CheckCircle2 size={18}/>} {msg.text}</div>}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 min-h-[400px] flex flex-col relative">
                    {!procesado ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300"><TableIcon size={64} className="mb-4 opacity-50" /><p className="font-medium">Define la fecha y presiona "Calcular"</p></div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-slate-900">Previsualización</h3><div className="text-right"><span className="text-xs text-slate-400 uppercase font-bold">Total</span><p className="text-2xl font-bold text-emerald-600">{money(detalles.reduce((a,b)=>a+b.valor,0))}</p></div></div>
                            <div className="flex-1 overflow-auto border rounded-xl mb-4">
                                <table className="w-full text-sm text-left"><thead className="bg-slate-50 text-slate-500 font-bold sticky top-0"><tr><th className="p-3">Activo</th><th className="p-3 text-right">Valor</th></tr></thead><tbody className="divide-y">{detalles.map(d => (<tr key={d.idActivo}><td className="p-3">{d.nombre}</td><td className="p-3 text-right font-mono">{money(d.valor)}</td></tr>))}</tbody></table>
                            </div>
                            <div className="flex justify-end gap-3"><button onClick={()=>{setProcesado(false); setDetalles([]);}} className="px-6 py-3 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200">Cancelar</button><button onClick={guardar} disabled={saving} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-2">{saving ? <RefreshCw className="animate-spin"/> : <><Save size={18}/> Guardar</>}</button></div>
                        </>
                    )}
                </div>
            </div>
        )}

        {/* TAB HISTORIAL */}
        {activeTab === "history" && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden print-card">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div><h3 className="font-bold text-lg flex items-center gap-2"><History className="text-slate-400"/> Historial</h3><p className="text-sm text-slate-500 no-print">Registro de procesos.</p></div>
                    <div className="flex gap-2 no-print"><button onClick={printHistory} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm" title="Imprimir Lista"><Printer size={18}/></button><button onClick={fetchHistory} className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 shadow-sm"><RefreshCw size={18}/></button></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs"><tr><th className="px-6 py-4">ID</th><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Observaciones</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-center">Acciones</th></tr></thead>
                        <tbody className="divide-y divide-slate-50">
                            {loadingHistory ? <tr><td colSpan="5" className="p-8 text-center text-slate-400">Cargando...</td></tr> : historyList.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-400">Sin datos.</td></tr> :
                                historyList.map(h => (
                                    <tr key={h.idDepreciacion} className={`hover:bg-slate-50 ${h.estado === 0 ? "bg-slate-50/50 opacity-60" : ""}`}>
                                        <td className="px-6 py-4 font-mono text-slate-500">#{h.idDepreciacion}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{fmtDate(h.fecha)}</td>
                                        <td className="px-6 py-4 text-slate-600">{h.observaciones}</td>
                                        <td className="px-6 py-4">{h.estado === 1 ? <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold border border-emerald-100">Procesado</span> : <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs font-bold border border-rose-100">Anulado</span>}</td>
                                        <td className="px-6 py-4 text-center no-print flex justify-center gap-2">
                                            <button onClick={() => openDetail(h.idDepreciacion)} className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition" title="Ver Detalles"><Eye size={18}/></button>
                                            {h.estado === 1 && <button onClick={() => onAnulate(h)} className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition" title="Anular"><Trash2 size={18}/></button>}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
      
      {/* COMPONENTES FUERA DEL FLUJO PRINCIPAL */}
      <DetalleModal 
        open={!!viewId} 
        onClose={() => setViewId(null)} 
        data={viewData} 
        loading={loadingView} 
        onPrint={() => window.print()} 
      />

      {/* TICKET DE IMPRESIÓN (SE CARGA CON LA DATA DEL MODAL) */}
      <DepreciacionTicket data={viewData} />

      <style>{`
        @media print {
          /* 1. Ocultar TODO por defecto */
          body * { visibility: hidden; }
          
          /* 2. Mostrar SOLO el Ticket si hay datos */
          #printable-area, #printable-area * {
            visibility: visible;
          }

          /* 3. Posicionar el Ticket en toda la página */
          #printable-area {
            display: block !important; /* Forzar display */
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white;
          }

          /* 4. Ocultar la interfaz del sistema */
          .no-print { display: none !important; }

          /* CASO B: Si NO hay ticket (estamos imprimiendo el listado historial) */
          /* Si viewData es null, imprimimos .print-card */
          ${!viewData ? `
            .print-card, .print-card * { visibility: visible; }
            .print-card { position: absolute; left: 0; top: 0; width: 100%; }
          ` : ''}
        }
      `}</style>
    </div>
  );
}