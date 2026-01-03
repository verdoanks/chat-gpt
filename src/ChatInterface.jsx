// src/ChatInterface.jsx
import { useState, useRef, useEffect } from "react";

const CONFIG = {
  apiUrl: "https://aichat.verdoank.workers.dev/",
  title: "Asisten AI",
  welcomeMessage: "Halo! Saya Asisten AI Anda. Ada yang bisa saya bantu hari ini?",
  watermarkText: "Powered by VERDOANK",
  watermarkLink: "https://github.com/verdoanks",
  brandingId: "VERDOANK_CHAT_V1",
};

export default function ChatInterface({ onBack }) {
  // 1. Inisialisasi pesan (Termasuk Welcome Message dengan waktu)
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_history_v2");
    if (saved) return JSON.parse(saved);
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      // Proteksi Sistem (Jangan dihapus/ditampilkan)
      { role: "system", content: `You are ${CONFIG.title}, A friendly and helpful AI assistant. You'll always reply in Indonesian.`, id: "sys-1" },
      // Obrolan Pertama (Welcome)
      { role: "assistant", content: CONFIG.welcomeMessage, time: now, id: Date.now() }
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll & simpan history
  useEffect(() => {
    localStorage.setItem("chat_history_v2", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessage = (text) => {
    let content = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    if (content.includes("```")) {
      content = content.replace(/```([\s\S]*?)```/g, (match, code) => 
        `<pre class="bg-slate-800 text-pink-300 p-3 rounded-lg text-xs overflow-x-auto my-2 font-mono">${code.trim()}</pre>`
      );
    }
    return { __html: content };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { 
      role: "user", 
      content: inputValue.trim(), 
      time: now, 
      id: Date.now() 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMsg), // Kirim semua history untuk konteks
          brandingId: CONFIG.brandingId,
        }),
      });

      const data = await res.json();
      let reply = data.response || data.result?.response || (typeof data === 'string' ? data : "Maaf, terjadi kesalahan.");
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: reply, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Gangguan server, coba lagi.", time: now, id: Date.now() + 2 }]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return (
    <div className="flex flex-col h-dvh bg-white overflow-hidden font-sans">
      
      {/* HEADER - Dibuat kaku agar tidak goyang */}
      <header className="flex-none h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full">
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold shadow-inner">A</div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-none">{CONFIG.title}</h1>
            <p className="text-[10px] text-green-500 font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
            </p>
          </div>
        </div>
      </header>

      {/* AREA CHAT - Diberi padding-top agar tidak tertutup header */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 pt-6 space-y-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-4">
          
          {messages.map((msg) => {
            if (msg.role === "system") return null; // Proteksi: Jangan tampilkan pesan sistem
            const isUser = msg.role === "user";
            
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                
                {/* Balon Pesan */}
                <div className={`relative group max-w-[85%] p-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                  isUser ? "bg-orange-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                }`}>
                  <div dangerouslySetInnerHTML={formatMessage(msg.content)} />
                  
                  {/* Tombol Hapus (Muncul saat hover di PC, atau terlihat kecil di Mobile) */}
                  <button 
                    onClick={() => deleteMessage(msg.id)}
                    className={`absolute -top-2 ${isUser ? "-left-2" : "-right-2"} bg-white border border-slate-200 text-slate-400 hover:text-red-500 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 md:transition-opacity`}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* WAKTU DI LUAR BALON (Bawah) */}
                <span className="text-[10px] text-slate-400 mt-1 px-1 font-medium">
                  {msg.time}
                </span>

              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex gap-1 p-2 bg-white w-fit rounded-lg border border-slate-100 ml-2">
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* AREA INPUT - Tanpa border hitam browser */}
      <footer className="flex-none p-4 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-transparent focus-within:border-orange-400 focus-within:bg-white transition-all">
          <textarea
            rows="1"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none outline-none shadow-none"
            placeholder="Tulis pesan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ appearance: 'none', WebkitAppearance: 'none' }} // Hilangkan border default HP
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-30 transition-all active:scale-95 shadow-md shadow-orange-100"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-center">
            <p className="text-[9px] text-slate-300 font-bold tracking-widest uppercase">{CONFIG.watermarkText}</p>
        </div>
      </footer>
    </div>
  );
       }
