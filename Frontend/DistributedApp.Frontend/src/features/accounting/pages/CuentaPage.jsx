import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiAccounting } from "../../../core/api/axios";
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, AlertCircle, Search } from "lucide-react";

const CuentaPage = () => {
  const navigate = useNavigate();
  const [cuentas, setCuentas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const [form, setForm] = useState({
    idCuenta: 0,
    codigo: "",
    nombre: "",
    idTipoCuenta: "",
  });

  useEffect(() => {
    fetchCuentas();
    fetchTipos();
  }, []);

  const fetchCuentas = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiAccounting.get("/Cuenta");
      setCuentas(response.data);
    } catch (error) {
      setError("Error al cargar cuentas");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipos = async () => {
    try {
      const response = await apiAccounting.get("/TipoCuenta");
      setTipos(response.data);
    } catch (error) {
      console.error("Error al cargar tipos:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingId) {
        await apiAccounting.put(`/Cuenta/${editingId}`, form);
        alert("✅ Cuenta actualizada");
      } else {
        await apiAccounting.post("/Cuenta", form);
        alert("✅ Cuenta creada");
      }
      
      resetForm();
      fetchCuentas();
    } catch (error) {
      setError("Error al guardar");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cuenta) => {
    setForm({
      idCuenta: cuenta.idCuenta,
      codigo: cuenta.codigo,
      nombre: cuenta.nombre,
      idTipoCuenta: cuenta.idTipoCuenta,
    });
    setEditingId(cuenta.idCuenta);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar esta cuenta?")) return;

    setLoading(true);
    try {
      await apiAccounting.delete(`/Cuenta/${id}`);
      alert("✅ Cuenta eliminada");
      fetchCuentas();
    } catch (error) {
      setError("Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ idCuenta: 0, codigo: "", nombre: "", idTipoCuenta: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredCuentas = cuentas.filter(cuenta =>
    cuenta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cuenta.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-3xl font-bold text-gray-900">Cuentas Contables</h1>
                <p className="text-gray-600 mt-1">Plan de cuentas del sistema</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all shadow-sm hover:shadow-md"
            >
              {showForm ? <X size={20} /> : <Plus size={20} />}
              {showForm ? "Cancelar" : "Nueva Cuenta"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-800">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Formulario */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? "Editar Cuenta" : "Nueva Cuenta"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                    maxLength={20}
                    placeholder="Ej: 1.1.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                    maxLength={150}
                    placeholder="Ej: Caja General"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Cuenta *
                  </label>
                  <select
                    value={form.idTipoCuenta}
                    onChange={(e) => setForm({ ...form, idTipoCuenta: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {tipos.map(tipo => (
                      <option key={tipo.idTipoCuenta} value={tipo.idTipoCuenta}>
                        {tipo.codigo} - {tipo.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-semibold"
                >
                  <Save size={20} />
                  {editingId ? "Actualizar" : "Guardar"}
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

        {/* Buscador */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código o nombre..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Código</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Nombre</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Tipo</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        <span>Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredCuentas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No hay cuentas registradas</p>
                        <p className="text-sm text-gray-400">Haz clic en "Nueva Cuenta" para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCuentas.map((cuenta) => (
                    <tr key={cuenta.idCuenta} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg font-mono font-semibold text-sm">
                          {cuenta.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{cuenta.nombre}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                          {cuenta.nombreTipoCuenta}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(cuenta)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(cuenta.idCuenta)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats */}
        {cuentas.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Total de Cuentas</p>
              <p className="text-3xl font-bold text-gray-900">{cuentas.length}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Tipos Activos</p>
              <p className="text-3xl font-bold text-gray-900">{tipos.length}</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <p className="text-sm text-gray-600 mb-1">Resultados</p>
              <p className="text-3xl font-bold text-gray-900">{filteredCuentas.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuentaPage;