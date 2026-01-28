import axios from 'axios';

// ============================================
// DEFINICIÓN DE URLS (CONSTANTES)
// ============================================
// Auth usa la variable de entorno de producción o un fallback local
const AUTH_URL = import.meta.env.VITE_API_URL || 'https://localhost:7182/api';
// Mantenimiento usa el puerto 7200 (Hardcoded o variable si quisieras agregarla)
const MAINTENANCE_URL = 'https://localhost:7200/api';
// Contabilidad usa la variable de entorno o el puerto 7026
const ACCOUNTING_URL = import.meta.env.VITE_API_ACCOUNTING_URL || 'https://localhost:7026/api';


// ============================================
// 1. INSTANCIA AUTH
// ============================================
const apiAuth = axios.create({
  baseURL: AUTH_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor Request (Token)
apiAuth.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

// Interceptor Response (Manejo de errores globales como 401)
apiAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada en Auth");
      // Aquí podrías redirigir al login si quisieras: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


// ============================================
// 2. INSTANCIA MANTENIMIENTO (Puerto 7200)
// ============================================
const apiMaintenance = axios.create({
  baseURL: MAINTENANCE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiMaintenance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

apiMaintenance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada en Mantenimiento");
    }
    return Promise.reject(error);
  }
);


// ============================================
// 3. INSTANCIA CONTABILIDAD (Puerto 7026)
// ============================================
const apiAccounting = axios.create({
  baseURL: ACCOUNTING_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiAccounting.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));

apiAccounting.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Sesión expirada en Contabilidad");
    }
    return Promise.reject(error);
  }
);


// ============================================
// EXPORTAR TODO
// ============================================
// Esto soluciona el error de "does not provide an export named apiAccounting"
export { apiAuth, apiMaintenance, apiAccounting };