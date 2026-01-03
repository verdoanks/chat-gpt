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
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: `You are ${CONFIG.title}, A friendly and helpful AI assistant. You'll always reply in Indonesian.` },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const formatMessage = (text) => {
    let content = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    
    if (content.includes("```")) {
      content = content.replace(/```([\s\S]*?)```/g, (match, code) => 
        `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs overflow-x-auto my-3 font-mono border border-slate-700">${code.trim()}</pre>`
      );
    }
    return { __html: content };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userText = inputValue.trim();
    
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const res = await fetch(CONFIG.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userText }],
          brandingId: CONFIG.brandingId,
        }),
      });

      const data = await res.json();
      let reply = data.response || data.result?.response || (typeof data === 'string' ? data : "Maaf, saya tidak mengerti.");
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Gangguan koneksi, coba lagi nanti." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white font-sans antialiased text-slate-900">
      {/* Header */}
      <header className="h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
            </div>
            <div>
              <h2 className="font-bold text-sm md:text-base leading-none">{CONFIG.title}</h2>
              <span className="text-[11px] text-green-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 scrollbar-hide">
        <div className="max-w-3xl mx-auto p-4 md:p-8 flex flex-col gap-6">
          {/* Welcome Card */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm text-slate-600 text-sm leading-relaxed max-w-[90%] md:max-w-[80%]">
            {CONFIG.welcomeMessage}
          </div>

          {messages.map((msg, i) => {
            if (msg.role === "system") return null;
            const isUser = msg.role === "user";
            return (
              <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div 
                  className={`max-w-[90%] md:max-w-[80%] p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm ${
                    isUser 
                      ? "bg-orange-600 text-white rounded-tr-none" 
                      : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                  }`}
                  dangerouslySetInnerHTML={formatMessage(msg.content)}
                />
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1.5">
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto flex items-end gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-50 transition-all">
          <textarea
            ref={inputRef}
            rows="1"
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 py-2 px-3 resize-none max-h-32"
            placeholder="Tulis pesan Anda..."
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
            className="p-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 disabled:opacity-40 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <div className="mt-3 text-center">
            <a href={CONFIG.watermarkLink} target="_blank" className="text-[10px] uppercase tracking-widest text-slate-400 font-bold hover:text-orange-600 transition">
              {CONFIG.watermarkText}
            </a>
        </div>
      </footer>
    </div>
  );
    }
