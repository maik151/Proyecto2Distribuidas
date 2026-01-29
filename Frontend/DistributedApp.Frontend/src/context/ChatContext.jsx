import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";
import { useAuth } from "../features/auth/context/AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // AHORA LAS NOTIFICACIONES SON UN ARRAY DE OBJETOS
  const [unreadMessages, setUnreadMessages] = useState([]); 
  
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Limpiar notificaciones (cuando abres el chat o el panel)
  const clearNotifications = () => setUnreadMessages([]);

  const toggleChat = () => {
    // Si abrimos el chat, borramos las notificaciones
    if (!isChatOpen) clearNotifications();
    setIsChatOpen((prev) => !prev);
  };

  // 1. Crear Conexión
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
      .withUrl("https://localhost:7500/chatHub")
      .withAutomaticReconnect()
      .configureLogging(LogLevel.None) // Menos ruido en consola
      .build();

    setConnection(newConnection);
  }, []);

  // 2. Manejar Eventos
  useEffect(() => {
    if (connection) {
      if (connection.state === HubConnectionState.Disconnected) {
        connection.start()
          .then(() => {
            console.log("✅ Socket Conectado");

            connection.off("ReceiveMessage"); // Limpiar listeners previos
            
            // Escuchar el mensaje (Case Sensitive Fix)
            connection.on("ReceiveMessage", (sender, role, message, timestamp) => {
              console.log("📩 Mensaje entrante:", message);

              const newMessage = { sender, role, message, timestamp };

              // 1. Agregar al historial del chat
              setMessages((prev) => [...prev, newMessage]);

              // 2. Si el chat está cerrado Y no soy yo, agregar al panel de notificaciones
              const isMe = sender === user?.username;
              if (!isMe && !isChatOpen) {
                setUnreadMessages((prev) => [newMessage, ...prev]); // Los más nuevos primero
              }
            });
          })
          .catch((e) => console.error("Fallo conexión:", e));
      }
    }
  }, [connection, user, isChatOpen]);

  const sendMessage = async (msgText) => {
    if (connection?.state === HubConnectionState.Connected) {
      try {
        await connection.invoke("SendMessage", user?.username || "Anónimo", user?.role || "user", msgText);
      } catch (e) { console.error(e); }
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        unreadMessages, // Exportamos la lista, no el número
        isChatOpen,
        toggleChat,
        clearNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);