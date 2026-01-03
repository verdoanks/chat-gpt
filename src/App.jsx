// src/App.jsx
import { useState, useEffect } from "react";
import ChatInterface from "./ChatInterface";

function App() {
  // Ambil status terakhir dari localStorage saat pertama kali load
  const [showChat, setShowChat] = useState(() => {
    const savedPage = localStorage.getItem("active_page");
    return savedPage === "chat"; // Jika "chat", langsung tampilkan chat
  });

  // Simpan status halaman setiap kali showChat berubah
  useEffect(() => {
    localStorage.setItem("active_page", showChat ? "chat" : "home");
  }, [showChat]);

  // Fungsi untuk kembali ke beranda (lewat tombol < di header)
  const handleBackToHome = () => {
    setShowChat(false);
  };

  if (showChat) {
    return <ChatInterface onBack={handleBackToHome} />;
  }

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100">
        <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600 font-bold text-4xl">
          A
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Asisten AI</h1>
          <p className="text-slate-500 leading-relaxed">
            Solusi cerdas untuk setiap pertanyaan Anda. Klik tombol di bawah untuk memulai percakapan.
          </p>
        </div>

        <button 
          onClick={() => setShowChat(true)}
          className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-2xl shadow-lg shadow-orange-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 group"
        >
          Mulai Obrolan
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:translate-x-1 transition-transform">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;
