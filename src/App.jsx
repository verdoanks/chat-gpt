// src/App.jsx
import { useState, useEffect } from "react";
import ChatInterface from "./ChatInterface";

function App() {
  const [showChat, setShowChat] = useState(() => {
    const savedPage = localStorage.getItem("active_page");
    return savedPage === "chat";
  });

  useEffect(() => {
    localStorage.setItem("active_page", showChat ? "chat" : "home");
  }, [showChat]);

  if (showChat) {
    return <ChatInterface onBack={() => setShowChat(false)} />;
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
        
        {/* ICON OBROLAN */}
        <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
            <path d="M4.913 2.658c2.326-.305 4.695-.458 7.087-.458s4.761.153 7.087.458c1.812.238 3.213 1.818 3.213 3.647v6.122c0 1.829-1.4 3.409-3.213 3.647a48.584 48.584 0 0 1-2.483.239c-.77.063-1.465.509-1.814 1.177l-1.303 2.481a.75.75 0 0 1-1.34 0l-1.303-2.481c-.349-.668-1.044-1.114-1.814-1.177a48.58 48.58 0 0 1-2.483-.239c-1.812-.238-3.213-1.818-3.213-3.647V6.305c0-1.829 1.4-3.409 3.213-3.647Z" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Asisten AI</h1>
          <p className="text-slate-500 leading-relaxed text-sm">
            Solusi cerdas untuk setiap pertanyaan Anda. Klik tombol di bawah untuk memulai percakapan.
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => setShowChat(true)}
            className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl shadow-lg shadow-orange-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group"
          >
            Mulai Obrolan
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>

          {/* TEKS FAKE SOCIAL PROOF */}
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <img src="https://i.pravatar.cc/100?u=1" alt="u1" />
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <img src="https://i.pravatar.cc/100?u=2" alt="u2" />
              </div>
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                <img src="https://i.pravatar.cc/100?u=3" alt="u3" />
              </div>
            </div>
            <p className="text-[11px] font-medium italic">
              Lebih dari <span className="text-orange-500 font-bold">2.4 Juta+</span> orang telah menggunakan asisten ini.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
