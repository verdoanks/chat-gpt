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
  // 1. Ambil riwayat dari LocalStorage saat pertama kali load
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("chat_history");
    if (saved) return JSON.parse(saved);
    return [
      { 
        id: Date.now(),
        role: "system", 
        content: `You are ${CONFIG.title}, A friendly and helpful AI assistant. You'll always reply in Indonesian.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // 2. Simpan ke LocalStorage setiap kali ada pesan baru
  useEffect(() => {
    localStorage.setItem("chat_history", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatMessage = (text) => {
    let content = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    
    if (content.includes("```")) {
      content = content.replace(/```([\s\S]*?)```/g, (match, code) => 
        `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto my-3 font-mono">${code.trim()}</pre>`
      );
    }
    return { __html: content };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: inputValue.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat(userMessage),
          brandingId: CONFIG.brandingId,
        }),
      });

      const data = await res.json();
      let reply = data.response || data.result?.response || (typeof data === 'string' ? data : "Maaf, terjadi kesalahan.");
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1,
        role: "assistant", 
        content: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        id: Date.now() + 1,
        role: "assistant", 
        content: "Maaf, koneksi terputus.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMessage = (id) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans antialiased overflow-hidden">
      {/* Header - Tetap di atas */}
      <header className="flex-none h-16 border-b border-slate-200 flex items-center justify-between px-4 bg-white z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-slate-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold">A</div>
          <div>
            <h2 className="font-bold text-sm leading-none">Asisten AI</h2>
            <span className="text-[10px] text-green-500 font-medium">● Online</span>
          </div>
        </div>
      </header>

      {/* Area Chat - Scrollable */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">
          
          {/* Welcome Card */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm text-sm text-slate-600 max-w-[85%]">
            {CONFIG.welcomeMessage}
          </div>

          {messages.map((msg, i) => {
            if (msg.role === "system") return null;
            const isUser = msg.role === "user";
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} group relative`}>
                <div className={`relative max-w-[85%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${
                  isUser ? "bg-orange-600 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                }`}>
                  <div dangerouslySetInnerHTML={formatMessage(msg.content)} />
                  
                  {/* Info Row: Time & Delete */}
                  <div className={`flex items-center gap-2 mt-2 text-[10px] ${isUser ? "text-orange-100 justify-end" : "text-slate-400 justify-start"}`}>
                    <span>{msg.time}</span>
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 p-1"
                      title="Hapus pesan"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 animate-pulse">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area - Tetap di bawah */}
      <footer className="flex-none p-4 bg-white border-t border-slate-200">
        <div className="max-w-2xl mx-auto flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-transparent focus-within:border-orange-400 focus-within:bg-white transition-all">
          <textarea
            ref={inputRef}
            rows="1"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 px-3 resize-none outline-none shadow-none focus:outline-none"
            style={{ outline: 'none', boxShadow: 'none' }} // Memastikan border hitam browser hilang
            placeholder="Tulis pesan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
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
            className="p-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 disabled:opacity-40 transition-all active:scale-95 shadow-md shadow-orange-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <div className="mt-2 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{CONFIG.watermarkText}</p>
        </div>
      </footer>
    </div>
  );
  }
