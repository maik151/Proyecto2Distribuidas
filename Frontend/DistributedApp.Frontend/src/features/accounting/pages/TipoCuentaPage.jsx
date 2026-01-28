import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiAccounting } from "../../../core/api/axios";
import { Plus, Edit2, Trash2, Save, X, ArrowLeft, AlertCircle } from "lucide-react";

const TipoCuentaPage = () => {
  const navigate = useNavigate();
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    idTipoCuenta: 0,
    codigo: "",
    nombre: "",
  });

  useEffect(() => {
    fetchTipos();
  }, []);

  const fetchTipos = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiAccounting.get("/TipoCuenta");
      setTipos(response.data);
    } catch (error) {
      setError("Error al cargar tipos de cuenta");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingId) {
        await apiAccounting.put(`/TipoCuenta/${editingId}`, form);
        alert("✅ Tipo de cuenta actualizado");
      } else {
        await apiAccounting.post("/TipoCuenta", form);
        alert("✅ Tipo de cuenta creado");
      }
      
      resetForm();
      fetchTipos();
    } catch (error) {
      setError("Error al guardar");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tipo) => {
    setForm(tipo);
    setEditingId(tipo.idTipoCuenta);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que deseas eliminar este tipo de cuenta?")) return;

    setLoading(true);
    try {
      await apiAccounting.delete(`/TipoCuenta/${id}`);
      alert("✅ Tipo de cuenta eliminado");
      fetchTipos();
    } catch (error) {
      setError("Error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ idTipoCuenta: 0, codigo: "", nombre: "" });
    setEditingId(null);
    setShowForm(false);
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Tipos de Cuenta</h1>
                <p className="text-gray-600 mt-1">Gestión de clasificación contable</p>
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              {showForm ? <X size={20} /> : <Plus size={20} />}
              {showForm ? "Cancelar" : "Nuevo Tipo"}
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
              {editingId ? "Editar Tipo de Cuenta" : "Nuevo Tipo de Cuenta"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    maxLength={10}
                    placeholder="Ej: 1, 2, 3..."
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                    maxLength={100}
                    placeholder="Ej: Activo, Pasivo..."
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md font-semibold"
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

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Código</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Nombre</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span>Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : tipos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle size={48} className="text-gray-300" />
                        <p className="text-lg font-medium">No hay tipos de cuenta registrados</p>
                        <p className="text-sm text-gray-400">Haz clic en "Nuevo Tipo" para comenzar</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  tipos.map((tipo) => (
                    <tr key={tipo.idTipoCuenta} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-lg font-bold">
                          {tipo.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{tipo.nombre}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(tipo)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(tipo.idTipoCuenta)}
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
        {tipos.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Tipos de Cuenta</p>
                <p className="text-3xl font-bold text-gray-900">{tipos.length}</p>
              </div>
              <div className="bg-blue-500 p-4 rounded-xl">
                <Edit2 size={32} className="text-white" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TipoCuentaPage;