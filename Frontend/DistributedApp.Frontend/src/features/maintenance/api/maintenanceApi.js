import { apiMaintenance } from '../../../core/api/axios.js'; 

// ============================================================
// 1. ACTIVIDADES (Ajustado a iD_ACTIVIDAD)
// ============================================================
export const getActivities = async () => {
  const response = await apiMaintenance.get('/Activity');
  return response.data;
};

export const createActivity = async (data) => {
  const payload = {
    // Si tu GET devuelve iD_ACTIVIDAD, es probable que el POST espere lo mismo
    // o simplemente las props del DTO. Usamos la convención del JSON que mostraste.
    codigo: data.codigo,
    nombre: data.nombre,
    estado: true
  };
  return await apiMaintenance.post('/Activity', payload);
};

export const updateActivity = async (id, data) => {
  const payload = {
    iD_ACTIVIDAD: id, // <--- OJO A ESTO
    codigo: data.codigo,
    nombre: data.nombre,
    estado: data.estado
  };
  return await apiMaintenance.put(`/Activity/${id}`, payload);
};

export const deleteActivity = async (id) => {
  return await apiMaintenance.delete(`/Activity/${id}`);
};

// ============================================================
// 2. ACTIVOS (Ajustado a iD_ACTIVO)
// ============================================================
export const getAssets = async () => {
  const response = await apiMaintenance.get('/Asset');
  return response.data;
};

export const createAsset = async (data) => {
  const payload = {
    codigo: data.codigo,
    nombre: data.nombre,
    fechA_COMPRA: data.fecha_compra,
    estado: true
  };
  return await apiMaintenance.post('/Asset', payload);
};

export const updateAsset = async (id, data) => {
  const payload = {
    iD_ACTIVO: id, // <--- OJO A ESTO
    codigo: data.codigo,
    nombre: data.nombre,
    fechA_COMPRA: data.fecha_compra,
    estado: data.estado
  };
  return await apiMaintenance.put(`/Asset/${id}`, payload);
};

export const deleteAsset = async (id) => {
  return await apiMaintenance.delete(`/Asset/${id}`);
};


// ============================================================
// 3. MANTENIMIENTO (CRUD COMPLETO)
// ============================================================



// CREAR
export const createMaintenanceOrder = async (header, details) => {
  const payload = {
    // Para crear, mandamos IDs en 0
    iD_CABECERA: 0,
    numero: header.numero,
    fecha: new Date(header.fecha).toISOString(), 
    responsable: header.responsable,
    detalles: details.map(d => ({
      iD_DETALLE: 0,
      iD_CABECERA: 0,
      iD_ACTIVO: parseInt(d.id_activo),
      iD_ACTIVIDAD: parseInt(d.id_actividad),
      valor: parseFloat(d.valor),
      nombreActivo: "", 
      nombreActividad: "" 
    }))
  };
  return await apiMaintenance.post('/Maintenance', payload);
};

// MODIFICAR (Requisito Crítico)
export const updateMaintenanceOrder = async (id, header, details) => {
  const payload = {
    iD_CABECERA: id, // ID de la orden que editamos
    numero: header.numero,
    fecha: new Date(header.fecha).toISOString(),
    responsable: header.responsable,
    detalles: details.map(d => ({
      // Si tiene ID_DETALLE lo mantenemos, si es nuevo va en 0
      iD_DETALLE: d.iD_DETALLE || 0,
      iD_CABECERA: id,
      iD_ACTIVO: parseInt(d.id_activo),
      iD_ACTIVIDAD: parseInt(d.id_actividad),
      valor: parseFloat(d.valor),
      nombreActivo: "",
      nombreActividad: ""
    }))
  };
  return await apiMaintenance.put(`/Maintenance/${id}`, payload);
};

// ELIMINAR
export const deleteMaintenanceOrder = async (id) => {
  return await apiMaintenance.delete(`/Maintenance/${id}`);
};

// REPORTE
export const getMaintenanceReport = async (start, end) => {
  const response = await apiMaintenance.get('/Maintenance/report', { 
    params: { start, end } 
  });
  return response.data;
};

// LISTAR (Historial)
export const getMaintenanceHistory = async () => {
  const response = await apiMaintenance.get('/Maintenance');
  return response.data;
};

// --- AGREGAR ESTA FUNCIÓN ---
// OBTENER POR ID (Trae la orden completa con detalles)
export const getMaintenanceById = async (id) => {
  const response = await apiMaintenance.get(`/Maintenance/${id}`);
  return response.data;
};