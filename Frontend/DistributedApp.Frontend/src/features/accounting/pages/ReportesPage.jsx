import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiAccounting } from "../../../core/api/axios";
import { ArrowLeft, FileText, BarChart3, Download, Calendar, AlertCircle, TrendingUp, DollarSign, RefreshCw } from "lucide-react";

const ReportesPage = () => {
  const navigate = useNavigate();
  const [activeReport, setActiveReport] = useState("balance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Datos calculados
  const [saldos, setSaldos] = useState([]);
  
  // Filtros de fecha
  const today = new Date().toISOString().split('T')[0];
  const [fechaInicio, setFechaInicio] = useState(today);
  const [fechaFin, setFechaFin] = useState(today);

  useEffect(() => {
    fetchSaldos();
  }, []);

  const fetchSaldos = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiAccounting.get("/Reportes/saldos", {
        params: {
          fechaInicio,
          fechaFin
        }
      });
      
      setSaldos(response.data);
    } catch (error) {
      setError("Error al cargar saldos. Asegúrate de tener comprobantes registrados.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar por tipo de cuenta
  const agruparPorTipo = () => {
    const grupos = {
      1: { codigo: "1", nombre: "ACTIVO", cuentas: [], total: 0 },
      2: { codigo: "2", nombre: "PASIVO", cuentas: [], total: 0 },
      3: { codigo: "3", nombre: "PATRIMONIO", cuentas: [], total: 0 },
      4: { codigo: "4", nombre: "INGRESOS", cuentas: [], total: 0 },
      5: { codigo: "5", nombre: "EGRESOS", cuentas: [], total: 0 }
    };

    saldos.forEach(cuenta => {
      if (grupos[cuenta.idTipoCuenta]) {
        grupos[cuenta.idTipoCuenta].cuentas.push(cuenta);
        grupos[cuenta.idTipoCuenta].total += Math.abs(cuenta.saldo);
      }
    });

    return grupos;
  };

  const grupos = agruparPorTipo();

  // Calcular Balance General
  const calcularBalance = () => {
    return {
      totalActivo: grupos[1].total,
      totalPasivo: grupos[2].total,
      totalPatrimonio: grupos[3].total,
      totalPasivoPatrimonio: grupos[2].total + grupos[3].total
    };
  };

  // Calcular Estado de Resultados
  const calcularResultados = () => {
    return {
      totalIngresos: grupos[4].total,
      totalEgresos: grupos[5].total,
      utilidad: grupos[4].total - grupos[5].total
    };
  };

  const balance = calcularBalance();
  const resultados = calcularResultados();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b print:hidden">
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
                <h1 className="text-3xl font-bold text-gray-900">Reportes Financieros</h1>
                <p className="text-gray-600 mt-1">Balance General y Estado de Resultados</p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              <Download size={20} />
              Imprimir
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800 print:hidden">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 print:hidden">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Calendar size={20} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Rango de Fechas:</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="text-gray-500">—</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchSaldos}
              disabled={loading}
              className="ml-auto flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-xl hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Selector de Reporte */}
        <div className="flex gap-4 mb-6 print:hidden">
          <button
            onClick={() => setActiveReport("balance")}
            className={`flex-1 flex items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
              activeReport === "balance"
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            <BarChart3 size={24} />
            <span className="text-lg font-bold">Balance General</span>
          </button>
          <button
            onClick={() => setActiveReport("resultados")}
            className={`flex-1 flex items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
              activeReport === "resultados"
                ? "bg-green-50 border-green-500 text-green-700"
                : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
            }`}
          >
            <TrendingUp size={24} />
            <span className="text-lg font-bold">Estado de Resultados</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generando reporte...</p>
          </div>
        ) : (
          <>
            {/* BALANCE GENERAL */}
            {activeReport === "balance" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-8 text-center">
                  <h2 className="text-3xl font-bold mb-2">BALANCE GENERAL</h2>
                  <p className="text-blue-100">
                    Del {new Date(fechaInicio).toLocaleDateString('es-ES')} al {new Date(fechaFin).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* ACTIVO */}
                    <div>
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                        <h3 className="text-xl font-bold text-blue-900">ACTIVO</h3>
                      </div>
                      
                      {grupos[1].cuentas.length === 0 ? (
                        <p className="text-gray-500 py-4 text-center">No hay cuentas de activo</p>
                      ) : (
                        grupos[1].cuentas.map(cuenta => (
                          <div key={cuenta.idCuenta} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-700">{cuenta.codigo} - {cuenta.nombre}</span>
                            <span className="font-semibold text-gray-900">${Math.abs(cuenta.saldo).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                      
                      <div className="flex justify-between py-4 mt-4 border-t-2 border-blue-500 bg-blue-50 px-4 rounded-lg">
                        <span className="font-bold text-blue-900">TOTAL ACTIVO</span>
                        <span className="font-bold text-blue-900 text-lg">${balance.totalActivo.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* PASIVO Y PATRIMONIO */}
                    <div>
                      {/* PASIVO */}
                      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                        <h3 className="text-xl font-bold text-red-900">PASIVO</h3>
                      </div>
                      
                      {grupos[2].cuentas.length === 0 ? (
                        <p className="text-gray-500 py-4 text-center">No hay cuentas de pasivo</p>
                      ) : (
                        grupos[2].cuentas.map(cuenta => (
                          <div key={cuenta.idCuenta} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-700">{cuenta.codigo} - {cuenta.nombre}</span>
                            <span className="font-semibold text-gray-900">${Math.abs(cuenta.saldo).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                      
                      <div className="flex justify-between py-3 mt-2 bg-red-50 px-4 rounded-lg">
                        <span className="font-semibold text-red-900">Total Pasivo</span>
                        <span className="font-semibold text-red-900">${balance.totalPasivo.toFixed(2)}</span>
                      </div>

                      {/* PATRIMONIO */}
                      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4 mt-6">
                        <h3 className="text-xl font-bold text-purple-900">PATRIMONIO</h3>
                      </div>
                      
                      {grupos[3].cuentas.length === 0 ? (
                        <p className="text-gray-500 py-4 text-center">No hay cuentas de patrimonio</p>
                      ) : (
                        grupos[3].cuentas.map(cuenta => (
                          <div key={cuenta.idCuenta} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-700">{cuenta.codigo} - {cuenta.nombre}</span>
                            <span className="font-semibold text-gray-900">${Math.abs(cuenta.saldo).toFixed(2)}</span>
                          </div>
                        ))
                      )}
                      
                      <div className="flex justify-between py-3 mt-2 bg-purple-50 px-4 rounded-lg">
                        <span className="font-semibold text-purple-900">Total Patrimonio</span>
                        <span className="font-semibold text-purple-900">${balance.totalPatrimonio.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between py-4 mt-4 border-t-2 border-gray-500 bg-gray-100 px-4 rounded-lg">
                        <span className="font-bold text-gray-900">TOTAL PASIVO + PATRIMONIO</span>
                        <span className="font-bold text-gray-900 text-lg">${balance.totalPasivoPatrimonio.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verificación */}
                  <div className={`mt-8 p-6 rounded-xl border-2 ${
                    Math.abs(balance.totalActivo - balance.totalPasivoPatrimonio) < 0.01
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {Math.abs(balance.totalActivo - balance.totalPasivoPatrimonio) < 0.01 ? (
                          <>
                            <div className="bg-green-500 text-white rounded-full p-2">✓</div>
                            <span className="font-bold text-green-900 text-lg">Balance Cuadrado</span>
                          </>
                        ) : (
                          <>
                            <div className="bg-red-500 text-white rounded-full p-2">✗</div>
                            <span className="font-bold text-red-900 text-lg">Balance Descuadrado</span>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Diferencia</p>
                        <p className="text-2xl font-bold text-gray-900">
                          ${Math.abs(balance.totalActivo - balance.totalPasivoPatrimonio).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ESTADO DE RESULTADOS */}
            {activeReport === "resultados" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-8 text-center">
                  <h2 className="text-3xl font-bold mb-2">ESTADO DE RESULTADOS</h2>
                  <p className="text-green-100">
                    Del {new Date(fechaInicio).toLocaleDateString('es-ES')} al {new Date(fechaFin).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className="p-8">
                  {/* INGRESOS */}
                  <div className="mb-8">
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                      <h3 className="text-xl font-bold text-green-900 flex items-center gap-2">
                        <DollarSign size={24} />
                        INGRESOS
                      </h3>
                    </div>
                    
                    {grupos[4].cuentas.length === 0 ? (
                      <p className="text-gray-500 py-4 text-center">No hay cuentas de ingresos</p>
                    ) : (
                      grupos[4].cuentas.map(cuenta => (
                        <div key={cuenta.idCuenta} className="flex justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4">
                          <span className="text-gray-700">{cuenta.codigo} - {cuenta.nombre}</span>
                          <span className="font-semibold text-gray-900">${Math.abs(cuenta.saldo).toFixed(2)}</span>
                        </div>
                      ))
                    )}
                    
                    <div className="flex justify-between py-4 mt-4 bg-green-50 px-4 rounded-lg border-t-2 border-green-500">
                      <span className="font-bold text-green-900 text-lg">TOTAL INGRESOS</span>
                      <span className="font-bold text-green-900 text-xl">${resultados.totalIngresos.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* EGRESOS */}
                  <div className="mb-8">
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                      <h3 className="text-xl font-bold text-red-900 flex items-center gap-2">
                        <TrendingUp size={24} />
                        EGRESOS
                      </h3>
                    </div>
                    
                    {grupos[5].cuentas.length === 0 ? (
                      <p className="text-gray-500 py-4 text-center">No hay cuentas de egresos</p>
                    ) : (
                      grupos[5].cuentas.map(cuenta => (
                        <div key={cuenta.idCuenta} className="flex justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-4">
                          <span className="text-gray-700">{cuenta.codigo} - {cuenta.nombre}</span>
                          <span className="font-semibold text-gray-900">${Math.abs(cuenta.saldo).toFixed(2)}</span>
                        </div>
                      ))
                    )}
                    
                    <div className="flex justify-between py-4 mt-4 bg-red-50 px-4 rounded-lg border-t-2 border-red-500">
                      <span className="font-bold text-red-900 text-lg">TOTAL EGRESOS</span>
                      <span className="font-bold text-red-900 text-xl">${resultados.totalEgresos.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* UTILIDAD */}
                  <div className={`p-8 rounded-2xl border-2 ${
                    resultados.utilidad >= 0
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                      : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-500'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-600 mb-2">
                          {resultados.utilidad >= 0 ? 'UTILIDAD DEL EJERCICIO' : 'PÉRDIDA DEL EJERCICIO'}
                        </p>
                        <p className={`text-5xl font-bold ${
                          resultados.utilidad >= 0 ? 'text-green-900' : 'text-red-900'
                        }`}>
                          ${Math.abs(resultados.utilidad).toFixed(2)}
                        </p>
                      </div>
                      <div className={`p-6 rounded-full ${
                        resultados.utilidad >= 0 ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {resultados.utilidad >= 0 ? (
                          <TrendingUp size={48} className="text-white" />
                        ) : (
                          <TrendingUp size={48} className="text-white transform rotate-180" />
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl">
                        <p className="text-xs text-gray-600 mb-1">Ingresos Totales</p>
                        <p className="text-xl font-bold text-gray-900">${resultados.totalIngresos.toFixed(2)}</p>
                      </div>
                      <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl">
                        <p className="text-xs text-gray-600 mb-1">Egresos Totales</p>
                        <p className="text-xl font-bold text-gray-900">${resultados.totalEgresos.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Info */}
        {!loading && saldos.length === 0 && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6 print:hidden">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-900 font-semibold mb-1">No hay datos para mostrar</p>
                <p className="text-sm text-yellow-800">
                  Para ver los reportes, primero debes:
                </p>
                <ul className="mt-2 ml-4 text-sm text-yellow-800 list-disc space-y-1">
                  <li>Crear Tipos de Cuenta (Activo, Pasivo, etc.)</li>
                  <li>Crear Cuentas asociadas a esos tipos</li>
                  <li>Registrar Comprobantes Contables con detalles</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesPage;