import { apiMaintenance } from '../../../core/api/axios.js'; 

// ============================================================
// 1. ACTIVIDADES (Catálogo de Servicios)
// ============================================================
export const getActivities = async () => {
  const response = await apiMaintenance.get('/Activity');
  return response.data;
};

export const createActivity = async (data) => {
  const payload = {
    codigo: data.codigo,
    nombre: data.nombre,
    estado: true
  };
  return await apiMaintenance.post('/Activity', payload);
};

export const updateActivity = async (id, data) => {
  const payload = {
    iD_ACTIVIDAD: parseInt(id), // Aseguramos entero
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
// 2. ACTIVOS (Catálogo de Equipos)
// ============================================================
export const getAssets = async () => {
  const response = await apiMaintenance.get('/Asset');
  return response.data;
};

export const createAsset = async (data) => {
  const payload = {
    codigo: data.codigo,
    nombre: data.nombre,
    fechA_COMPRA: data.fecha_compra, // Asegúrate que el backend espere este nombre exacto
    estado: true
  };
  return await apiMaintenance.post('/Asset', payload);
};

export const updateAsset = async (id, data) => {
  const payload = {
    iD_ACTIVO: parseInt(id),
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
// 3. MANTENIMIENTO (Transaccional)
// ============================================================

// LISTAR (Historial)
export const getMaintenanceHistory = async () => {
  const response = await apiMaintenance.get('/Maintenance');
  return response.data;
};

// OBTENER POR ID (Para editar)
export const getMaintenanceById = async (id) => {
  const response = await apiMaintenance.get(`/Maintenance/${id}`);
  return response.data;
};

// CREAR ORDEN
export const createMaintenanceOrder = async (header, details) => {
  const payload = {
    iD_CABECERA: 0,
    numero: header.numero,
    fecha: new Date(header.fecha).toISOString(), 
    responsable: header.responsable,
    estadO_MQ: "PENDIENTE",
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

// MODIFICAR ORDEN (Con Fix del Error 400)
export const updateMaintenanceOrder = async (id, header, details) => {
  const payload = {
    iD_CABECERA: parseInt(id), // <--- CRÍTICO: Debe coincidir con la URL
    numero: header.numero,
    fecha: new Date(header.fecha).toISOString(),
    responsable: header.responsable,
    estadO_MQ: "PENDIENTE", // O mantienes el que tenía
    detalles: details.map(d => ({
      iD_DETALLE: d.iD_DETALLE || 0, // Si es nuevo detalle, va en 0
      iD_CABECERA: parseInt(id),     // Vinculamos al ID padre
      iD_ACTIVO: parseInt(d.id_activo),
      iD_ACTIVIDAD: parseInt(d.id_actividad),
      valor: parseFloat(d.valor),
      nombreActivo: "",
      nombreActividad: ""
    }))
  };
  return await apiMaintenance.put(`/Maintenance/${id}`, payload);
};

// ELIMINAR ORDEN
export const deleteMaintenanceOrder = async (id) => {
  return await apiMaintenance.delete(`/Maintenance/${id}`);
};

// REPORTE DE COSTOS
export const getMaintenanceReport = async (start, end) => {
  const response = await apiMaintenance.get('/Maintenance/report', { 
    params: { start, end } 
  });
  return response.data;
};


export const ObtenerMontoTota_MJBS = async () =>{
  const response = await apiMaintenance.get('/ServiceNew');

  return response.data;
}