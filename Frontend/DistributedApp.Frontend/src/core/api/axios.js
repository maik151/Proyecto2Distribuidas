import axios from 'axios';

// ============================================
// 1. DEFINICIÓN DE URLS (CONSTANTES)
// ============================================
// Auth: Puerto 7182
const AUTH_URL = import.meta.env.VITE_API_URL || 'https://localhost:7182/api';

// Mantenimiento: Puerto 7200
const MAINTENANCE_URL = 'https://localhost:7200/api';

// Contabilidad: Puerto 7026
const ACCOUNTING_URL = import.meta.env.VITE_API_ACCOUNTING_URL || 'https://localhost:7026/api';

// Activos (Nuevo): Puerto 7174
const ASSETS_URL = import.meta.env.VITE_ASSETS_API_URL || 'https://localhost:7174/api';


// ============================================
// 2. CREACIÓN DE INSTANCIAS AXIOS
// ============================================
const apiAuth = axios.create({
  baseURL: AUTH_URL,
  headers: { 'Content-Type': 'application/json' },
});

const apiMaintenance = axios.create({
  baseURL: MAINTENANCE_URL,
  headers: { 'Content-Type': 'application/json' },
});

const apiAccounting = axios.create({
  baseURL: ACCOUNTING_URL,
  headers: { 'Content-Type': 'application/json' },
});

const apiAssets = axios.create({
  baseURL: ASSETS_URL,
  headers: { 'Content-Type': 'application/json' },
});


// ============================================
// 3. CONFIGURACIÓN DE INTERCEPTORES (DRY)
// ============================================

// Función Helper: Adjuntar Token en cada petición
const attachToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Función Helper: Manejo global de errores (ej. Token vencido)
const handleGlobalError = (error) => {
  if (error.response && error.response.status === 401) {
    console.warn(`Sesión expirada o no autorizada en: ${error.config.baseURL}`);
    // Aquí podrías forzar logout si quisieras:
    // localStorage.removeItem('token');
    // window.location.href = '/login';
  }
  return Promise.reject(error);
};

// --- APLICAR A AUTH ---
apiAuth.interceptors.request.use(attachToken, Promise.reject);
apiAuth.interceptors.response.use((r) => r, handleGlobalError);

// --- APLICAR A MANTENIMIENTO ---
apiMaintenance.interceptors.request.use(attachToken, Promise.reject);
apiMaintenance.interceptors.response.use((r) => r, handleGlobalError);

// --- APLICAR A CONTABILIDAD ---
apiAccounting.interceptors.request.use(attachToken, Promise.reject);
apiAccounting.interceptors.response.use((r) => r, handleGlobalError);

// --- APLICAR A ACTIVOS (NUEVO) ---
apiAssets.interceptors.request.use(attachToken, Promise.reject);
apiAssets.interceptors.response.use((r) => r, handleGlobalError);


// ============================================
// 4. EXPORTAR TODO
// ============================================
export { apiAuth, apiMaintenance, apiAccounting, apiAssets };