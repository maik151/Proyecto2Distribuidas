import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 
import { GoogleOAuthProvider } from '@react-oauth/google';

// 1. IMPORTA TU PROVEEDOR (Ajusta la ruta si tu archivo está en otro lado)
import { AuthProvider } from './features/auth/context/AuthContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="220912218741-c0t2luqp91uhshf0j9bc8ojblu7f9hfh.apps.googleusercontent.com">
      
      {/* 2. ENVUELVE TU APP CON EL AUTHPROVIDER */}
      <AuthProvider>
        <App />
      </AuthProvider>

    </GoogleOAuthProvider>
  </React.StrictMode>,
)