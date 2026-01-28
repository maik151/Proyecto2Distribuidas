import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiAccounting } from "../../../core/api/axios";
import { Plus, Trash2, Save, ArrowLeft, AlertCircle, FileText, Eye, X } from "lucide-react";

const ComprobantePage = () => {
  const navigate = useNavigate();
  const [comprobantes, setComprobantes] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [viewingId, setViewingId] = useState(null);
  const [detallesViewing, setDetallesViewing] = useState([]);
  
  const [cabecera, setCabecera] = useState({
    numero: "",
    fecha: new Date().toISOString().split('T')[0],
    observaciones: "",
  });

  const [detalles, setDetalles] = useState([
    { idCuenta: "", debe: 0, haber: 0 }
  ]);

  useEffect(() => {
    fetchComprobantes();
    fetchCuentas();
  }, []);

  const fetchComprobantes = async () => {
    setLoading(true);
    try {
      const response = await apiAccounting.get("/Comprobante");
      setComprobantes(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCuentas = async () => {
    try {
      const response = await apiAccounting.get("/Cuenta");
      setCuentas(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const response = await apiAccounting.get(`/Comprobante/${id}`);
      setDetallesViewing(response.data.detalles);
      setViewingId(id);
    } catch (error) {
      alert("❌ Error al cargar detalles");
    }
  };

  const addDetalle = () => {
    setDetalles([...detalles, { idCuenta: "", debe: 0, haber: 0 }]);
  };

  const removeDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index));
  };

  const updateDetalle = (index, field, value) => {
    const updated = [...detalles];
    updated[index][field] = field === "idCuenta" ? parseInt(value) : parseFloat(value) || 0;
    setDetalles(updated);
  };

  const calculateTotals = () => {
    const totalDebe = detalles.reduce((sum, d) => sum + (parseFloat(d.debe) || 0), 0);
    const totalHaber = detalles.reduce((sum, d) => sum + (parseFloat(d.haber) || 0), 0);
    return { totalDebe, totalHaber, balanced: totalDebe === totalHaber };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const { totalDebe, totalHaber, balanced } = calculateTotals();

    if (!balanced) {
      setError(`❌ Comprobante descuadrado: Debe ($${totalDebe.toFixed(2)}) ≠ Haber ($${totalHaber.toFixed(2)})`);
      return;
    }

    if (detalles.length < 2) {
      setError("❌ Debe tener al menos 2 líneas de detalle");
      return;
    }

    setLoading(true);
    try {
      await apiAccounting.post("/Comprobante", {
        cabecera: {
          ...cabecera,
          numero: parseInt(cabecera.numero)
        },
        detalles
      });
      alert("✅ Comprobante guardado exitosamente");
      resetForm();
      fetchComprobantes();
    } catch (error) {
      setError("Error al guardar comprobante");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCabecera({ numero: "", fecha: new Date().toISOString().split('T')[0], observaciones: "" });
    setDetalles([{ idCuenta: "", debe: 0, haber: 0 }]);
    setShowForm(false);
    setError("");
  };

  const { totalDebe, totalHaber, balanced } = calculateTotals();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/contabilidad")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Comprobantes Contables</h1>
                <p className="text-gray-600 mt-1">Registro de asientos (Debe/Haber)</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 transition-all shadow-sm hover:shadow-md"
            >
              {showForm ? (
                <>
                  <X size={20} /> Cancelar
                </>
              ) : (
                <>
                  <Plus size={20} /> Nuevo Comprobante
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Comprobante Contable</h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Cabecera */}
              <div className="border-b pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número *</label>
                    <input
                      type="number"
                      value={cabecera.numero}
                      onChange={(e) => setCabecera({ ...cabecera, numero: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha *</label>
                    <input
                      type="date"
                      value={cabecera.fecha}
                      onChange={(e) => setCabecera({ ...cabecera, fecha: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Observaciones</label>
                    <input
                      type="text"
                      value={cabecera.observaciones}
                      onChange={(e) => setCabecera({ ...cabecera, observaciones: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={500}
                      placeholder="Descripción del asiento"
                    />
                  </div>
                </div>
              </div>

              {/* Detalles */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Líneas de Detalle</h3>
                  <button
                    type="button"
                    onClick={addDetalle}
                    className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
                  >
                    <Plus size={16} /> Agregar Línea
                  </button>
                </div>

                <div className="space-y-3">
                  {detalles.map((detalle, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-4 rounded-xl">
                      <div className="col-span-6">
                        <select
                          value={detalle.idCuenta}
                          onChange={(e) => updateDetalle(index, "idCuenta", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                          required
                        >
                          <option value="">Seleccionar Cuenta...</option>
                          {cuentas.map(c => (
                            <option key={c.idCuenta} value={c.idCuenta}>
                              {c.codigo} - {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={detalle.debe}
                          onChange={(e) => updateDetalle(index, "debe", e.target.value)}
                          placeholder="Debe"
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={detalle.haber}
                          onChange={(e) => updateDetalle(index, "haber", e.target.value)}
                          placeholder="Haber"
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div className="col-span-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeDetalle(index)}
                          disabled={detalles.length === 1}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border-2 ${balanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-sm text-gray-600 mb-1">Total Debe</p>
                    <p className="text-2xl font-bold text-gray-900">${totalDebe.toFixed(2)}</p>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${balanced ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-sm text-gray-600 mb-1">Total Haber</p>
                    <p className="text-2xl font-bold text-gray-900">${totalHaber.toFixed(2)}</p>
                  </div>
                  <div className={`p-4 rounded-xl border-2 ${balanced ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <p className="text-sm text-gray-600 mb-1">Estado</p>
                    <p className="text-xl font-bold">{balanced ? '✅ Balanceado' : '❌ Descuadrado'}</p>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading || !balanced}
                  className="flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-semibold"
                >
                  <Save size={20} />
                  Guardar Comprobante
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Comprobantes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Número</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Fecha</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Observaciones</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        <span>Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : comprobantes.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <FileText size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No hay comprobantes registrados</p>
                        <p className="text-sm text-gray-400">Haz clic en "Nuevo Comprobante" para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  comprobantes.map((comp) => (
                    <tr key={comp.idComprobante} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold">
                          #{comp.numero}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {new Date(comp.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{comp.observaciones || "-"}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetails(comp.idComprobante)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                        >
                          <Eye size={16} /> Ver Detalles
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        {comprobantes.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Comprobantes</p>
                <p className="text-3xl font-bold text-gray-900">{comprobantes.length}</p>
              </div>
              <div className="bg-purple-500 p-4 rounded-xl">
                <FileText size={32} className="text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalles */}
        {viewingId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Detalles del Comprobante #{viewingId}
                </h3>
                <button
                  onClick={() => setViewingId(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">Cuenta</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Debe</th>
                      <th className="px-4 py-3 text-right text-sm font-bold text-gray-900">Haber</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {detallesViewing.map((det, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900">{det.nombreCuenta}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          ${det.debe.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                          ${det.haber.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-bold">
                      <td className="px-4 py-3">TOTALES</td>
                      <td className="px-4 py-3 text-right text-green-600">
                        ${detallesViewing.reduce((sum, d) => sum + d.debe, 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        ${detallesViewing.reduce((sum, d) => sum + d.haber, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setViewingId(null)}
                className="mt-6 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 w-full font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprobantePage;