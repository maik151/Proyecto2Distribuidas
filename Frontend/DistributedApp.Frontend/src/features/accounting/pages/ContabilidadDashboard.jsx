import { useNavigate } from "react-router-dom";
import { Calculator, FileText, BookOpen, BarChart3, ArrowLeft } from "lucide-react";

const ContabilidadDashboard = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 1,
      title: "Tipos de Cuenta",
      description: "Gestión de tipos contables (Activo, Pasivo, etc.)",
      icon: Calculator,
      color: "bg-blue-500",
      path: "/contabilidad/tipos-cuenta"
    },
    {
      id: 2,
      title: "Cuentas Contables",
      description: "Administrar plan de cuentas del sistema",
      icon: BookOpen,
      color: "bg-green-500",
      path: "/contabilidad/cuentas"
    },
    {
      id: 3,
      title: "Comprobantes",
      description: "Registro de asientos contables (Debe/Haber)",
      icon: FileText,
      color: "bg-purple-500",
      path: "/contabilidad/comprobantes"
    },
    {
      id: 4,
      title: "Reportes",
      description: "Balance General y Estado de Resultados",
      icon: BarChart3,
      color: "bg-orange-500",
      path: "/contabilidad/reportes"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contabilidad</h1>
              <p className="text-gray-600 mt-1">Balance general, costos y reportes financieros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => navigate(module.path)}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 text-left"
              >
                <div className="flex items-start gap-4">
                  <div className={`${module.color} p-4 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                    <Icon size={28} strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Card */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 p-3 rounded-xl">
              <Calculator size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Sistema Contable Integrado
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Gestiona todas las operaciones contables de tu empresa. Registra asientos, 
                genera reportes financieros y mantén el control total de tus cuentas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadDashboard;