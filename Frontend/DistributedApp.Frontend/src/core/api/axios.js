import axios from 'axios';

// ---------------------------------------------------------------------------
// 1. INSTANCIA DE AUTENTICACIÓN (CORREGIDA)
// ---------------------------------------------------------------------------
const apiAuth = axios.create({
  // CORRECCIÓN AQUÍ: Usamos VITE_API_URL que es como se llama en tu archivo .env
  baseURL: import.meta.env.VITE_API_URL, 
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor Auth (Igual que antes)
apiAuth.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
}, (error) => Promise.reject(error));


// ---------------------------------------------------------------------------
// 2. INSTANCIA PARA MANTENIMIENTO (LOCAL .NET)
// ---------------------------------------------------------------------------
const apiMaintenance = axios.create({
  baseURL: 'https://localhost:7200/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor Mantenimiento
apiMaintenance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------------------------------------------------------------------
// EXPORTAR AMBAS
// ---------------------------------------------------------------------------
export { apiAuth, apiMaintenance };