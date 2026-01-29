import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleActive,
} from "../api/usersApi"; 
import { Link } from "react-router-dom";
import {
  UserPlus,
  Users,
  Mail,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";

// --- UTILIDADES ---

const getInitials = (name = "") => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
};

const BackToHomeButton = ({ to = "/dashboard", className = "" }) => (
  <Link
    to={to}
    className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-95 border ${className ? className : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm"}`}
  >
    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
    <span>Regresar</span>
  </Link>
);

// --- MODAL (UserForm) ---
const UserForm = ({ open, onClose, onSubmit, initialValues, loading }) => {
  const [form, setForm] = useState({
    nombreUsuario: "", 
    contrasena: "", 
    nombreCompleto: "", 
    correo: "", 
    rol: "user", 
    activo: true
  });
  
  const [showPwd, setShowPwd] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setErrorMsg("");
    if (initialValues) {
      setForm({
        nombreUsuario: initialValues.nombreUsuario || "",
        contrasena: "", // Siempre inicia vacía al editar para no mostrar el hash
        nombreCompleto: initialValues.nombreCompleto || "",
        correo: initialValues.correo || "",
        rol: initialValues.rol?.toLowerCase?.() || "user",
        activo: !!initialValues.activo,
      });
    } else {
      setForm({ nombreUsuario: "", contrasena: "", nombreCompleto: "", correo: "", rol: "user", activo: true });
    }
  }, [initialValues, open]);

  if (!open) return null;
  const isEdit = !!(initialValues && initialValues.idUsuario);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errorMsg) setErrorMsg("");
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.nombreUsuario?.trim()) {
      setErrorMsg("El nombre de usuario es obligatorio");
      return;
    }
    // Validación manual de contraseña al crear
    if (!isEdit && !form.contrasena) {
        setErrorMsg("La contraseña es obligatoria para nuevos usuarios");
        return;
    }
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl ring-1 ring-black/5 overflow-hidden transform transition-all scale-100">
        
        {/* Encabezado */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{isEdit ? "Editar Perfil" : "Nuevo Miembro"}</h3>
            <p className="text-sm text-slate-500 mt-0.5">{isEdit ? "Actualiza los datos." : "Ingresa la información."}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
             {isEdit ? <Pencil size={20} /> : <UserPlus size={20} />}
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={submit} className="p-8 grid gap-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center font-semibold border border-red-100">
                {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Usuario</label>
              <input name="nombreUsuario" value={form.nombreUsuario} onChange={handleChange} className="input-field" placeholder="ej. jdoe" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase">Rol</label>
              <select name="rol" value={form.rol} onChange={handleChange} className="input-field appearance-none">
                <option value="admin">Administrador</option>
                <option value="user">Usuario</option>
                <option value="contador">Contador</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Nombre Completo</label>
            <input name="nombreCompleto" value={form.nombreCompleto} onChange={handleChange} className="input-field" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">Correo</label>
            <input name="correo" type="email" value={form.correo} onChange={handleChange} className="input-field" required />
          </div>

          {/* CAMPO DE CONTRASEÑA (Ahora visible en Edición) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase">
                Contraseña {isEdit && <span className="text-slate-400 font-normal lowercase">(opcional)</span>}
            </label>
            <div className="relative">
              <input 
                name="contrasena" 
                type={showPwd ? "text" : "password"} 
                value={form.contrasena} 
                onChange={handleChange} 
                className="input-field pr-10" 
                // Si es edición, no es required y minLength es flexible. Si es nuevo, required y min 6.
                minLength={isEdit ? 0 : 6} 
                required={!isEdit}
                placeholder={isEdit ? "Dejar vacía para mantener actual" : "Mínimo 6 caracteres"}
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600">
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input id="activo" name="activo" type="checkbox" checked={form.activo} onChange={handleChange} className="h-5 w-5 accent-purple-600 cursor-pointer" />
            <label htmlFor="activo" className="text-sm font-medium text-slate-700 cursor-pointer">Usuario Activo</label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-50">
             <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition">Cancelar</button>
             
             <button 
               type="submit" 
               disabled={loading} 
               style={{ backgroundColor: '#7C3AED', color: '#ffffff' }}
               className="flex-1 py-3 rounded-xl font-bold transition shadow-lg shadow-purple-200 disabled:opacity-70 flex justify-center items-center gap-2 hover:opacity-90"
             >
               {loading ? (
                 <>
                   <RefreshCw className="animate-spin" size={20} />
                   <span>Procesando...</span>
                 </>
               ) : (
                 isEdit ? "Guardar Cambios" : "Crear Usuario"
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- PÁGINA PRINCIPAL ---

const UsuariosPage = () => {
  const [allItems, setAllItems] = useState([]);
  
  // Filtros locales
  const [usernameQ, setUsernameQ] = useState("");
  const [emailQ, setEmailQ] = useState("");
  const [roleQ, setRoleQ] = useState("all");
  const [statusQ, setStatusQ] = useState("all");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUsers();
      const lista = Array.isArray(data) ? data : (data.data || []);
      setAllItems(lista);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  // FILTRADO
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (usernameQ && !item.nombreUsuario?.toLowerCase().includes(usernameQ.toLowerCase())) return false;
      if (emailQ && !item.correo?.toLowerCase().includes(emailQ.toLowerCase())) return false;
      if (roleQ !== "all" && item.rol?.toLowerCase() !== roleQ) return false;
      if (statusQ !== "all") {
        const isActive = statusQ === "active";
        if (item.activo !== isActive) return false;
      }
      return true;
    });
  }, [allItems, usernameQ, emailQ, roleQ, statusQ]);

  const resetFilters = () => { setUsernameQ(""); setEmailQ(""); setRoleQ("all"); setStatusQ("all"); };
  const onCreate = () => { setEditing(null); setOpenForm(true); };
  const onEdit = (row) => { setEditing(row); setOpenForm(true); };
  
  const onDelete = async (row) => {
    if (!confirm(`¿Eliminar a ${row.nombreUsuario}?`)) return;
    setDeletingId(row.idUsuario);
    try { await deleteUser(row.idUsuario); await fetchList(); } 
    catch (e) { alert("Error al eliminar."); } finally { setDeletingId(null); }
  };
  
  const onToggleActive = async (row) => {
    try { await toggleActive(row.idUsuario, !row.activo); await fetchList(); } 
    catch (e) { alert("Error al cambiar estado."); }
  };

  const handleSubmitForm = async (form) => {
    setSaving(true);
    try {
      const payload = {
        idUsuario: editing?.idUsuario || 0,
        nombreUsuario: form.nombreUsuario,
        nombreCompleto: form.nombreCompleto,
        correo: form.correo,
        rol: form.rol || "user",
        activo: typeof form.activo === 'boolean' ? form.activo : true,
        fechaCreacion: editing?.fechaCreacion || new Date().toISOString(),
      };

      if (editing?.idUsuario) {
        // EDICIÓN
        if (form.contrasena) {
            // Si el usuario escribió algo, mandamos la nueva contraseña
            payload.contrasena = form.contrasena;
        } else {
            // Si no, mandamos la contraseña antigua para que el backend no la borre
            // (Asumiendo que 'editing.contrasena' tiene el valor actual o hash)
            payload.contrasena = editing.contrasena; 
        }
        await updateUser(editing.idUsuario, payload);
      } else {
        // CREACIÓN
        payload.contrasena = form.contrasena;
        await createUser(payload);
      }

      setOpenForm(false);
      setEditing(null);
      await fetchList();
      
    } catch (e) {
      console.error(e);
      const msg = e.response?.data?.Error || "Error al guardar. Revisa los datos.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const summary = useMemo(() => {
    const activos = allItems.filter((i) => !!i.activo).length;
    return { activos, inactivos: allItems.length - activos };
  }, [allItems]);

  const cardBase = "bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300";

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-4 sm:p-6 md:p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px] space-y-6">
        
        {/* HEADER & STATS */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className={`${cardBase} md:col-span-6 flex flex-col justify-between relative overflow-hidden`}>
             <div className="relative z-10">
                <div className="flex justify-between items-start">
                   <BackToHomeButton />
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Users size={24} /></div>
                </div>
                <div className="mt-6">
                   <h1 className="text-3xl font-bold tracking-tight text-slate-900">Usuarios</h1>
                   <p className="text-slate-500 mt-2 text-sm max-w-sm">Gestiona el acceso, roles y permisos.</p>
                </div>
             </div>
             <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
          </div>

          <div className={`${cardBase} md:col-span-3 flex flex-col justify-center space-y-4`}>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle2 size={20} /></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase">Activos</p><p className="text-2xl font-bold text-slate-900">{summary.activos}</p></div>
             </div>
             <div className="h-px bg-slate-100 w-full"></div>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><XCircle size={20} /></div>
                <div><p className="text-xs font-bold text-slate-400 uppercase">Inactivos</p><p className="text-2xl font-bold text-slate-900">{summary.inactivos}</p></div>
             </div>
          </div>

          <div 
            className="md:col-span-3 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col items-center justify-center text-center bg-purple-600 text-white hover:bg-purple-700" 
            style={{ backgroundColor: '#7C3AED', color: '#fff' }} 
            onClick={onCreate}>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UserPlus size={28} />
              </div>
              <h3 className="text-lg font-bold">Nuevo Usuario</h3>
          </div>
        </div>

        {/* FILTROS */}
        <div className={`${cardBase} py-4 px-6 flex flex-col lg:flex-row items-center gap-4`}>
           <div className="flex items-center gap-2 text-slate-400 lg:pr-4 lg:border-r border-slate-100 w-full lg:w-auto">
              <Filter size={18} /> <span className="text-sm font-medium">Filtros</span>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
              <div className="relative group">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                 <input value={usernameQ} onChange={(e) => setUsernameQ(e.target.value)} placeholder="Buscar usuario..." className="filter-input" />
              </div>
              <div className="relative group">
                 <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                 <input value={emailQ} onChange={(e) => setEmailQ(e.target.value)} placeholder="Buscar correo..." className="filter-input" />
              </div>
              <select value={roleQ} onChange={(e) => setRoleQ(e.target.value)} className="filter-input">
                 <option value="all">Todos los Roles</option>
                 <option value="admin">Administrador</option>
                 <option value="user">Usuario</option>
                 <option value="contador">Contador</option>
              </select>
              <select value={statusQ} onChange={(e) => setStatusQ(e.target.value)} className="filter-input">
                 <option value="all">Todos los Estados</option>
                 <option value="active">Activos</option>
                 <option value="inactive">Inactivos</option>
              </select>
           </div>
           {(usernameQ || emailQ || roleQ !== 'all' || statusQ !== 'all') && (
              <button onClick={resetFilters} className="text-sm font-semibold text-rose-500 hover:text-rose-700 whitespace-nowrap px-2">Limpiar</button>
           )}
           <button onClick={() => { setRefreshing(true); fetchList().finally(() => setRefreshing(false)); }} className="p-2 text-slate-400 hover:text-purple-600 transition-colors ml-auto lg:ml-0" title="Refrescar">
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
           </button>
        </div>

        {/* TABLA DE RESULTADOS */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          {error && <div className="p-4 bg-rose-50 text-rose-600 text-sm font-medium text-center">{error}</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="px-6 py-5">Usuario / ID</th>
                  <th className="px-6 py-5">Rol</th>
                  <th className="px-6 py-5">Estado</th>
                  <th className="px-6 py-5">Contacto</th>
                  <th className="px-6 py-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {loading ? (
                   <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Cargando datos...</td></tr>
                ) : filteredItems.length === 0 ? (
                   <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">No se encontraron usuarios.</td></tr>
                ) : (
                   filteredItems.map((row) => (
                     <tr key={row.idUsuario} className="group hover:bg-slate-50/80 transition-colors">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs ring-2 ring-white shadow-sm">
                             {getInitials(row.nombreCompleto || row.nombreUsuario)}
                           </div>
                           <div>
                             <p className="font-semibold text-slate-900">{row.nombreUsuario}</p>
                             <p className="text-xs text-slate-400 font-mono">ID: {row.idUsuario}</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                             row.rol?.toLowerCase() === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                             row.rol?.toLowerCase() === 'contador' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                             'bg-slate-50 text-slate-600 border-slate-200'
                           }`}>
                             {row.rol === 'admin' && <ShieldCheck size={10} className="mr-1" />}
                             {row.rol || 'user'}
                           </span>
                       </td>
                       <td className="px-6 py-4">
                           <button onClick={() => onToggleActive(row)} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all border ${
                             row.activo 
                             ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                             : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                           }`}>
                             <span className={`w-2 h-2 rounded-full ${row.activo ? 'bg-green-500' : 'bg-rose-500'}`}></span>
                             {row.activo ? "Activo" : "Inactivo"}
                           </button>
                       </td>
                       <td className="px-6 py-4">
                           <div className="flex flex-col">
                             <span className="text-slate-900 font-medium">{row.nombreCompleto}</span>
                             <span className="text-slate-500 text-xs">{row.correo}</span>
                           </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => onEdit(row)} className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-purple-600 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200 transition-all" title="Editar"><Pencil size={16} /></button>
                             <button onClick={() => onDelete(row)} disabled={deletingId === row.idUsuario} className="p-2 rounded-xl text-slate-500 hover:bg-white hover:text-rose-600 hover:shadow-sm ring-1 ring-transparent hover:ring-slate-200 transition-all" title="Eliminar"><Trash2 size={16} /></button>
                           </div>
                       </td>
                     </tr>
                   ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end">
              <span className="text-xs text-slate-500 font-medium">
                  Total Registros: {filteredItems.length} (de {allItems.length})
              </span>
          </div>
        </div>
      </div>
      <UserForm open={openForm} onClose={() => { setOpenForm(false); setEditing(null); }} onSubmit={handleSubmitForm} initialValues={editing} loading={saving} />
      
      <style>{`
        .input-field { 
          width: 100%; 
          border-radius: 0.75rem; 
          background-color: #F1F5F9; 
          border: 1px solid transparent; 
          padding: 0.75rem 1rem; 
          font-size: 0.875rem; 
          transition: all 0.2s; 
        } 
        .input-field:focus { 
          background-color: white; 
          border-color: #7C3AED; 
          outline: none; 
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1); 
        } 
        .filter-input { 
          width: 100%; 
          border-radius: 0.75rem; 
          background-color: #F8F9FC; 
          border: 1px solid #E2E8F0; 
          padding: 0.6rem 1rem 0.6rem 2.5rem; 
          font-size: 0.875rem; 
          color: #334155; 
          transition: all 0.2s; 
        } 
        .filter-input:focus { 
          background-color: white; 
          border-color: #7C3AED; 
          outline: none; 
        }
      `}</style>
    </div>
  );
};
export default UsuariosPage;