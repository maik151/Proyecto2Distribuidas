import { createContext, useContext, useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel, HubConnectionState } from "@microsoft/signalr";
import { useAuth } from "../features/auth/context/AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [connection, setConnection] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState([]); 
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 1. DEFINIR LA URL DEL CHAT
  // Si existe la variable en el .env la usa, si no, usa localhost por defecto
  const CHAT_URL = import.meta.env.VITE_SUPPORT_MODULE_URL || "https://localhost:7500/chatHub";

  const clearNotifications = () => setUnreadMessages([]);

  const toggleChat = () => {
    if (!isChatOpen) clearNotifications();
    setIsChatOpen((prev) => !prev);
  };

  // 2. CONEXIÓN (Usando la variable de entorno)
  useEffect(() => {
    console.log("🔌 Conectando al chat en:", CHAT_URL); // Log para verificar

    const newConnection = new HubConnectionBuilder()
      .withUrl(CHAT_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning) // Warning para ensuciar menos la consola
      .build();

    setConnection(newConnection);
  }, []);

  // 3. EVENTOS Y LÓGICA (Igual que antes)
  useEffect(() => {
    if (connection) {
      if (connection.state === HubConnectionState.Disconnected) {
        connection.start()
          .then(() => {
            console.log("✅ Socket Conectado Exitosamente");

            connection.off("ReceiveMessage");
            connection.off("receivemessage"); 

            const handleMessage = (sender, role, message, timestamp) => {
              console.log("📩 Mensaje:", message);
              const newMessage = { sender, role, message, timestamp };
              
              setMessages((prev) => [...prev, newMessage]);

              const isMe = sender === user?.username;
              if (!isMe && !isChatOpen) {
                setUnreadMessages((prev) => [newMessage, ...prev]);
              }
            };

            connection.on("ReceiveMessage", handleMessage);   
            connection.on("receivemessage", handleMessage);   
          })
          .catch((e) => console.error("❌ Fallo conexión SignalR:", e));
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
        unreadMessages,
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