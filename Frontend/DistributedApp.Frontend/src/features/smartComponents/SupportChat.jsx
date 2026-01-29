import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../auth/context/AuthContext";

const SupportChat = () => {
  const { messages, sendMessage, isChatOpen, toggleChat } = useChat();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // Fix del Crash: Solo scrollear si el chat está abierto y la ref existe
  useEffect(() => {
    if (isChatOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {isChatOpen && (
        <div className="bg-[#e5ddd5] w-80 h-[28rem] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden mb-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          {/* Header */}
          <div className="bg-[#075E54] p-4 flex justify-between items-center text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">
                {user?.role === "admin" ? "🛠️" : "👤"}
              </div>
              <div>
                <h3 className="font-bold text-sm">Soporte en Línea</h3>
                <p className="text-[10px] opacity-80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"/> Conectado
                </p>
              </div>
            </div>
            <button onClick={toggleChat} className="hover:bg-white/10 p-1 rounded"><X size={18} /></button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#e5ddd5] bg-opacity-90">
            {messages.map((m, i) => {
              const isMe = m.sender === user?.username;
              return (
                <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div className={`p-2 px-3 rounded-lg text-sm max-w-[85%] shadow-sm relative ${
                      isMe ? "bg-[#dcf8c6] rounded-tr-none text-slate-800" : "bg-white rounded-tl-none text-slate-800"
                    }`}>
                    {!isMe && (
                      <p className="text-[10px] font-bold text-orange-600 mb-0.5 capitalize">
                        {m.sender} <span className="text-slate-400 font-normal">({m.role})</span>
                      </p>
                    )}
                    <p className="leading-relaxed">{m.message}</p>
                    <span className="text-[9px] text-slate-400 block text-right mt-1 opacity-70">
                      {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 bg-[#f0f0f0] flex gap-2 items-center">
            <input
              className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none border border-transparent focus:border-[#075E54] transition-all"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-[#075E54] text-white p-2.5 rounded-full hover:bg-[#054c44] transition disabled:opacity-50 shadow-md"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Botón Flotante (Con bolita roja si hay mensajes y chat cerrado) */}
      <button
        onClick={toggleChat}
        className={`${
          isChatOpen ? "bg-slate-700" : "bg-[#25D366] hover:bg-[#20bd5a]"
        } text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 relative`}
      >
        {isChatOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
};

export default SupportChat;