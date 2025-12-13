// src/ChatWidget.jsx

import { useState, useRef, useEffect } from "react";

const CONFIG = {
  apiUrl: "https://aichat.verdoank.workers.dev/",
  title: "Asisten AI",
  welcomeMessage: "Punya pertanyaan? saya punya jawaban.",
  watermarkText: "Powered by VERDOANK",
  watermarkLink: "https://github.com/verdoanks",
  brandingId: "VERDOANK_CHAT_V1",
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: `You are ${CONFIG.title}, A friendly and helpful AI assistant will answer your messages and get a reply right away! You'll always reply in Indonesian..` },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isLoading]);

  // Focus input saat dibuka
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // Formatter pesan (HTML & Code Block)
  const formatMessage = (text) => {
    let content = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");
    
    if (content.includes("```")) {
      content = content.replace(/```([\s\S]*?)```/g, (match, code) => 
        `<pre class="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto my-2 font-mono">${code.trim()}</pre>`
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

    const payload = {
      messages: [...messages, { role: "user", content: userText }],
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

      if (!res.ok) throw new Error("Gagal terhubung ke server");

      const data = await res.json();
      let reply = data.response || data.result?.response || (typeof data === 'string' ? data : JSON.stringify(data));
      
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Maaf, terjadi gangguan koneksi. Silakan coba lagi nanti." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Z-Index tinggi agar selalu di atas
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-4 font-sans antialiased">
      
      {/* --- BOX CHAT --- */}
      <div 
        className={`
          bg-white shadow-2xl shadow-orange-900/10 rounded-[1.5rem] border border-gray-100 overflow-hidden flex flex-col
          transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right
          w-[360px] h-[500px]
          max-sm:fixed max-sm:bottom-0 max-sm:right-0 max-sm:w-full max-sm:h-[100dvh] max-sm:rounded-none max-sm:z-[9999]
          ${isOpen ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-90 translate-y-10 pointer-events-none hidden"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-white border-b border-gray-100 shadow-sm z-10">
          <div className="flex items-center gap-3">
             <div className="relative">
               <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                   <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813a3.75 3.75 0 002.576-2.576l.813-2.846A.75.75 0 019 4.5zM15.3 15.3a.75.75 0 01.721.544l.277.971a1.875 1.875 0 001.288 1.288l.972.277a.75.75 0 010 1.442l-.972.277a1.875 1.875 0 00-1.288 1.288l-.277.972a.75.75 0 01-1.442 0l-.277-.972a1.875 1.875 0 00-1.288-1.288l-.972-.277a.75.75 0 010-1.442l.972-.277a1.875 1.875 0 001.288-1.288l.277-.971a.75.75 0 01.721-.544z" clipRule="evenodd" />
                 </svg>
               </div>
               <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
             </div>
             <div>
               <h3 className="font-bold text-gray-900 text-sm leading-tight">{CONFIG.title}</h3>
               <p className="text-[10px] text-gray-500 font-medium">Online • Siap membantu</p>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
          <div className="bg-white border border-gray-100 self-start p-3.5 rounded-2xl rounded-bl-none text-sm text-gray-600 shadow-sm max-w-[85%] leading-relaxed">
            {CONFIG.welcomeMessage}
          </div>

          {messages.map((msg, i) => {
            if (msg.role === "system") return null;
            const isUser = msg.role === "user";
            return (
              <div
                key={i}
                className={`p-3.5 rounded-2xl text-sm max-w-[85%] shadow-sm break-words leading-relaxed ${
                  isUser 
                    ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white self-end rounded-br-none" 
                    : "bg-white border border-gray-100 text-gray-600 self-start rounded-bl-none"
                }`}
                dangerouslySetInnerHTML={formatMessage(msg.content)}
              />
            );
          })}
          
          {isLoading && (
            <div className="self-start bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5 w-fit">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 max-sm:pb-6">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-gray-50 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition disabled:opacity-60"
            placeholder="Ketik pesan..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-200 hover:shadow-lg hover:shadow-orange-300 hover:scale-105 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>

        {/* Footer / Watermark */}
        <div className="text-center text-[10px] py-1.5 text-gray-300 bg-white border-t border-gray-50 select-none">
          <a href={CONFIG.watermarkLink} target="_blank" rel="noreferrer" className="hover:text-orange-400 transition font-medium">
            {CONFIG.watermarkText}
          </a>
        </div>
      </div>

      {/* --- FAB BUTTON (Gradient & Shadow) --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full text-white shadow-xl shadow-orange-500/30 flex items-center justify-center 
          bg-gradient-to-br from-orange-600 to-orange-500
          transition-all duration-500 hover:scale-110 active:scale-95 hover:shadow-2xl hover:shadow-orange-500/50
          ${isOpen ? "max-sm:hidden rotate-90 opacity-0 pointer-events-none" : "rotate-0 opacity-100"}
        `}
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

    </div>
  );
                                           }
