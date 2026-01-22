import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'https://localhost:7182/api';

const apiAuth = axios.create({
  baseURL: baseURL, 
  headers: {
    'Content-Type': 'application/json',
  },
});


// --- INTERCEPTOR DE PETICIONES (REQUEST) ---
apiAuth.interceptors.request.use(
  (config) => {
    // Leemos el token directo del almacenamiento
    const token = localStorage.getItem('token');
    
    if (token) {
      // Si existe, lo agregamos al header Authorization
      // Formato estándar: "Bearer eyJhbGci..."
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- (OPCIONAL) INTERCEPTOR DE RESPUESTAS (RESPONSE) ---
apiAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // El token ya no vale o no existe
      console.warn("Sesión expirada o no autorizada");
      
      // Opcional: Limpiar storage y redirigir al login
      // localStorage.removeItem('token');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export { apiAuth };