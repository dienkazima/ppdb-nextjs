"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import Navbar from "@/app/components/Navbar";
import HomeJenjang from "@/app/components/HomeJenjang";
import HomeVisiMisi from "@/app/components/HomeVisiMisi";
import HomeYayasanInfo from "@/app/components/HomeYayasanInfo";
import DaftarButton from "@/app/components/DaftarButton";
import Footer from "@/app/components/Footer";
import CekStatusModal from "@/app/components/CekStatusModal";

export default function Home() {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [tahunAjaran, setTahunAjaran] = useState("...");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("cek") === "true") {
        setIsStatusModalOpen(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    fetch("/api/pengaturan")
      .then(res => res.json())
      .then(data => {
        let dynamicTahun = "2026/2027";
        if (data.modeTahunAjaran === "MANUAL" && data.tahunAjaranManual) {
          dynamicTahun = data.tahunAjaranManual;
        } else {
          const date = new Date();
          const y = date.getFullYear();
          const m = date.getMonth();
          dynamicTahun = (m >= 11) ? `${y + 1}/${y + 2}` : `${y}/${y + 1}`;
        }
        setTahunAjaran(dynamicTahun);
      })
      .catch(console.error);
  }, []);

  const scrollToVisiMisi = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById("visi-misi");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <Navbar />

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes sway {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-20px) translateX(15px); }
        }
        @keyframes sway-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(15px) translateX(-25px); }
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
          box-shadow: 0 0 12px 2px rgba(255, 255, 255, 0.4);
        }
      `}} />

      {/* HERO */}
      <section className="relative w-full min-h-[92vh] sm:min-h-[95vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#14532D] via-[#166534] to-[#22C55E] pb-[50px] sm:pb-[70px] md:pb-[100px] lg:pb-[120px]">

        {/* Background Glow */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#34d399]/20 blur-[130px] mix-blend-screen"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#86efac]/10 blur-[150px] mix-blend-screen"></div>
          <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[100px] mix-blend-overlay"></div>
        </div>

        {/* Floating Particles — hidden on small screens */}
        <div className="absolute inset-0 z-0 pointer-events-none hidden sm:block">
          <div className="particle w-2.5 h-2.5 top-[15%] left-[20%] opacity-60" style={{ animation: 'sway 8s infinite ease-in-out' }}></div>
          <div className="particle w-1.5 h-1.5 top-[25%] right-[25%] opacity-40 text-white shadow-none bg-white" style={{ animation: 'sway-slow 12s infinite ease-in-out' }}></div>
          <div className="particle w-3 h-3 top-[50%] left-[10%] opacity-70" style={{ animation: 'sway 10s infinite ease-in-out 1s' }}></div>
          <div className="particle w-2 h-2 bottom-[35%] right-[15%] opacity-50" style={{ animation: 'sway-slow 14s infinite ease-in-out' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl w-full">

          {/* Badge */}
          <div className="inline-block mb-6 sm:mb-8 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-green-50 text-xs sm:text-sm font-semibold tracking-widest uppercase shadow-[0_4px_15px_rgba(0,0,0,0.1)] animate-in fade-in slide-in-from-bottom-4 duration-700">
            Sistem Penerimaan Murid Baru {tahunAjaran}
          </div>

          {/* Title */}
          <h1 className="text-1xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 sm:mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150 drop-shadow-md">
            YAYASAN JAMALUDDIN SURALAGA
            <br />
            <span className="block mt-3 sm:mt-4 text-[#FDE047] text-lg sm:text-xl md:text-3xl lg:text-4xl font-extrabold tracking-wide drop-shadow-lg">
              Jamaluddin Suralaga Boarding School (JSBS)
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-xl text-green-50/90 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            &quot;Mencetak generasi Qurani yang berakhlak mulia, berilmu,
            dan siap menghadapi tantangan zaman dengan pondasi
            iman dan sunnah&quot;
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-5 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
            <DaftarButton className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white text-[#14532D] font-extrabold text-base sm:text-lg shadow-[0_8px_25px_rgba(255,255,255,0.25)] hover:shadow-[0_12px_30px_rgba(255,255,255,0.4)] hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-2 border-transparent" />

            <button
              onClick={scrollToVisiMisi}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/40 text-white font-bold text-base sm:text-lg hover:bg-white/25 hover:border-white/60 transition-all duration-300 shadow-[0_4px_15px_rgba(0,0,0,0.15)] hover:-translate-y-1"
            >
              Visi, Misi dan Tujuan
            </button>

            <button
              onClick={() => setIsStatusModalOpen(true)}
              className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-center gap-2 rounded-full outline outline-1 outline-white/40 bg-white/5 backdrop-blur-md text-white font-bold text-base sm:text-lg hover:bg-white/20 hover:outline-white/80 transition-all duration-300 hover:-translate-y-1 hover:scale-105 group"
            >
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform drop-shadow-sm" />
              Cek Status
            </button>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 pointer-events-none transform translate-y-[1px]">
          <svg className="relative block w-full h-[50px] sm:h-[70px] md:h-[90px] lg:h-[120px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V120H0Z" fill="rgba(240, 253, 244, 0.2)"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-23.84V120H0Z" fill="rgba(240, 253, 244, 0.45)"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V120H0Z" fill="#F0FDF4"></path>
          </svg>
        </div>
      </section>

      <HomeJenjang />
      <HomeVisiMisi />
      <HomeYayasanInfo />
      <Footer />

      <CekStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </>
  );
}
