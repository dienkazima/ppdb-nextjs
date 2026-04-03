"use client";

import { CheckCircle2, Printer, ArrowLeft, Loader2, FileSearch, CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PembayaranModal from "@/app/components/PembayaranModal";

interface SuccessData {
  id: string;
  noPendaftaran: string;
  nama: string;
  jenjang: string;
  status?: string;
}

export default function SuccessRegistration({ data }: { data: SuccessData }) {
  const [mounted, setMounted] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[100dvh] bg-[#F0FDF4] flex py-2 sm:py-4 px-3 sm:px-4 font-sans relative overflow-hidden items-center justify-center">
      
      {/* Background Subtle Sparkles/Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-green-400/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-300/10 blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto bg-white rounded-[16px] shadow-[0_20px_60px_-15px_rgba(22,163,74,0.15)] overflow-hidden flex flex-col z-10 border border-green-50 max-h-[95vh] md:max-h-[90vh]"
      >
        
        {/* Header Success */}
        <div className="bg-gradient-to-br from-[#14532D] via-[#166534] to-[#22C55E] relative py-5 md:py-6 px-4 text-center overflow-hidden shrink-0">
          {/* Decorative shapes */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white rounded-full mix-blend-overlay blur-xl animate-pulse"></div>
            <div className="absolute bottom-[-50px] left-[-50px] w-24 h-24 bg-yellow-300 rounded-full mix-blend-overlay blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
              className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-white/30"
            >
              <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" />
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xl md:text-2xl font-extrabold text-white mb-1.5 drop-shadow-sm"
            >
              Pendaftaran Berhasil!
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="text-green-50 text-[11px] md:text-xs font-medium opacity-90 max-w-md mx-auto leading-relaxed"
            >
              Data pendaftaran Anda telah aman tersimpan di sistem kami.
            </motion.p>
          </div>
          
          {/* Bottom curve */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-0 transform translate-y-[1px]">
            <svg className="relative block w-full h-[20px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V120H0Z" fill="#ffffff"></path>
            </svg>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 md:p-5 bg-white relative overflow-y-auto custom-scrollbar shrink-0 flex-1">
          
          {/* Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-[#F8FAFC] border border-gray-100 rounded-xl p-3 md:p-4 mb-4 shadow-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-100/50 to-transparent rounded-bl-full -z-0"></div>
            
            <div className="relative z-10 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-200/80 pb-3">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nomor Pendaftaran</span>
                <span className="text-xl md:text-2xl font-black text-[#165534] tracking-tight drop-shadow-sm bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                  {data.noPendaftaran || "JSBS-2026-XXXX"}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-0">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Nama Siswa</span>
                  <span className="block text-sm md:text-base font-extrabold text-[#111827] capitalize">{data.nama}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Jenjang</span>
                  <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100">
                    {data.jenjang}
                  </span>
                </div>
                <div className="md:col-span-2 mt-0.5">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Status Pendaftaran</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-yellow-50 text-yellow-700 rounded-md text-[11px] font-bold border border-yellow-200/80 shadow-sm">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {data.status || "Menunggu Verifikasi"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-2 mb-4 shrink-0"
          >
            <button 
              onClick={() => setIsPayModalOpen(true)}
              className="flex-1 group relative flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white font-bold rounded-lg shadow-[0_4px_10px_rgba(22,163,74,0.25)] hover:shadow-[0_8px_15px_rgba(22,163,74,0.4)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
              <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10 group-hover:scale-110 transition-transform" />
              <span className="relative z-10 text-[11px] md:text-xs uppercase tracking-wide">Bayar Sekarang</span>
            </button>
            
            <Link 
              href="/?cek=true"
              className="flex-1 group flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-[#16A34A] font-bold rounded-lg border-2 border-green-100 hover:bg-green-50 hover:border-green-300 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              <FileSearch className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] md:text-xs uppercase tracking-wide">Cek Status</span>
            </Link>
          </motion.div>

          {isPayModalOpen && (
            <PembayaranModal
              onClose={() => setIsPayModalOpen(false)}
              pendaftarId={data.id}
              noPendaftaran={data.noPendaftaran}
              nama={data.nama}
            />
          )}

          {/* Back Home Link */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.3 }}
            className="text-center print:hidden"
          >
            <Link 
              href="/"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-green-600 transition-colors duration-300 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
          </motion.div>
          
        </div>
      </motion.div>
    </div>
  );
}
