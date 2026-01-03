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
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_history_v3");
    if (saved) return JSON.parse(saved);
    
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return [
      { role: "system", content: `You are ${CONFIG.title}, A friendly and helpful AI assistant. You'll always reply in Indonesian.`, id: "sys-protect" },
      { role: "assistant", content: CONFIG.welcomeMessage, time: now, id: "welcome-msg" }
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("chat_history_v3", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessage = (text) => {
    let content = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    if (content.includes("```")) {
      content = content.replace(/```([\s\S]*?)```/g, (match, code) => 
        `<pre class="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs overflow-x-auto my-2 font-mono">${code.trim()}</pre>`
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

    // MENGEMBALIKAN PROTEKSI BRANDING KE PAYLOAD
    const payload = {
      messages: messages.concat(userMsg),
      brandingId: CONFIG.brandingId,
      watermarkText: CONFIG.watermarkText,
      watermarkLink: CONFIG.watermarkLink,
    };

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Server Error");

      const data = await res.json();
      let reply = data.response || data.result?.response || (typeof data === 'string' ? data : "Maaf, respon tidak valid.");
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: reply, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: Date.now() + 1 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Maaf, terjadi kesalahan koneksi.", time: now, id: Date.now() + 2 }]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return (
    <div className="flex flex-col h-dvh bg-white font-sans overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-none h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition">
            <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold text-lg">A</div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Asisten AI</h1>
            <p className="text-[10px] text-green-500 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
            </p>
          </div>
        </div>
      </header>

      {/* AREA CHAT - Pt-4 dipastikan agar tidak tertutup header */}
      <main className="flex-1 overflow-y-auto bg-slate-50/30 p-4 space-y-6 pt-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-5">
          
          {messages.map((msg) => {
            if (msg.role === "system") return null;
            const isUser = msg.role === "user";
            
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                
                <div className="relative group max-w-[85%]">
                  {/* BALON PESAN */}
                  <div className={`p-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                    isUser ? "bg-orange-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                  }`}>
                    <div dangerouslySetInnerHTML={formatMessage(msg.content)} />
                  </div>

                  {/* TOMBOL HAPUS - HANYA UNTUK USER (Icon Tong Sampah) */}
                  {isUser && (
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute -top-2 -left-2 bg-white border border-slate-200 text-slate-400 hover:text-red-600 p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
                      title="Hapus Pesan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* WAKTU DI BAWAH BALON */}
                <span className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium italic">
                  {msg.time}
                </span>

              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex gap-1.5 p-3 bg-white w-fit rounded-xl border border-slate-100 shadow-sm ml-2">
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-200"></div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* FOOTER & INPUT */}
      <footer className="flex-none p-4 bg-white border-t border-slate-100">
        <div className="max-w-2xl mx-auto flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-transparent focus-within:border-orange-400 focus-within:bg-white transition-all shadow-inner">
          <textarea
            rows="1"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none outline-none"
            placeholder="Tulis pesan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ outline: 'none', boxShadow: 'none', appearance: 'none' }}
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
            className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-20 transition-all shadow-md active:scale-95"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <div className="mt-3 text-center">
          <a href={CONFIG.watermarkLink} target="_blank" className="text-[10px] text-slate-300 font-bold tracking-widest uppercase hover:text-orange-400 transition">
            {CONFIG.watermarkText}
          </a>
        </div>
      </footer>
    </div>
  );
  }
