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
// 3. MANTENIMIENTO Y REPORTES
// ============================================================

export const createMaintenanceOrder = async (header, details) => {
  const payload = {
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

export const getMaintenanceReport = async (start, end) => {
  // El input date devuelve YYYY-MM-DD, que es válido para C#
  // Ejemplo URL: /api/Maintenance/report?start=2026-01-26&end=2026-01-27
  const response = await apiMaintenance.get('/Maintenance/report', { 
    params: { start, end } 
  });
  return response.data;
};