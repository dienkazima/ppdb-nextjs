"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Loader2, AlertCircle, CheckCircle2, User, GraduationCap, Clock, FileText, School, CalendarDays, XCircle, CreditCard } from "lucide-react";
import PembayaranModal from "@/app/components/PembayaranModal";

interface CekStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StatusResult {
  id: string;
  noPendaftaran: string;
  nama: string;
  jenjang: string;
  status: string;
  statusPembayaran?: string;
  buktiPembayaran?: string;
  createdAt?: string;
  totalDibayar?: number;
  totalTagihan?: number;
}

export default function CekStatusModal({ isOpen, onClose }: CekStatusModalProps) {
  const [noDaftar, setNoDaftar] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setNoDaftar("");
      setResult(null);
      setError(null);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  const handleCek = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noDaftar.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/cek-status?no=${encodeURIComponent(noDaftar.trim())}`);
      const data = await res.json();

      if (!res.ok) {
         setError(data.error || "Gagal mengecek status.");
      } else {
         setResult(data);
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("terima") || s === "lulus") {
      return {
        bg: "bg-emerald-600",
        icon: <CheckCircle2 className="w-8 h-8 text-white" />,
        desc: "Selamat! Anda dinyatakan lulus/diterima."
      };
    }
    if (s.includes("tolak") || s === "tidak lulus") {
      return {
        bg: "bg-red-600",
        icon: <XCircle className="w-8 h-8 text-white" />,
        desc: "Mohon maaf, Anda belum lulus seleksi/diterima."
      };
    }
    return {
      bg: "bg-[#e89005]", // specifically matching the amber image
      icon: <Clock className="w-8 h-8 text-white" />,
      desc: "Pendaftaran sedang dalam proses verifikasi oleh panitia"
    };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timePart = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    }).replace(".", ":");
    return `${datePart} pukul ${timePart}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-0 sm:px-4 md:px-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={onClose}
          ></motion.div>

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-t-[20px] sm:rounded-[16px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col z-10 max-h-[92vh] sm:max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#166534] to-[#22C55E] px-4 py-3 flex items-center justify-between shadow-sm relative overflow-hidden shrink-0">
               <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
               <h2 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-sm relative z-10">
                 <Search className="w-4 h-4 text-green-200" />
                 Cek Status
               </h2>
               <button 
                 onClick={onClose}
                 className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white transition-colors relative z-10"
               >
                 <X className="w-4 h-4" />
               </button>
            </div>

            {/* Body */}
            <div className="p-3 md:p-5 overflow-y-auto custom-scrollbar">
              <form onSubmit={handleCek} className="mb-3 shrink-0">
                 <label className="block text-[11px] font-bold text-gray-700 mb-1">
                   Nomor Pendaftaran <span className="text-red-500">*</span>
                 </label>
                 <div className="flex flex-col sm:flex-row gap-2">
                   <input 
                     type="text" 
                     value={noDaftar}
                     onChange={(e) => setNoDaftar(e.target.value.toUpperCase())}
                     placeholder="JSBS-2026-0001"
                     className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 focus:bg-white transition-all duration-300 placeholder:text-gray-400 font-medium"
                     required
                   />
                   <button 
                     type="submit"
                     disabled={loading || !noDaftar.trim()}
                     className="group px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold text-sm rounded-lg shadow-[0_4px_10px_rgba(22,163,74,0.2)] hover:shadow-[0_8px_15px_rgba(22,163,74,0.35)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 min-w-[100px]"
                   >
                     {loading ? (
                       <Loader2 className="w-4 h-4 animate-spin" />
                     ) : (
                       <>
                         <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                         Periksa
                       </>
                     )}
                   </button>
                 </div>
              </form>

              {/* Loading State */}
              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-6 text-center"
                >
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100 mb-3 shadow-inner">
                    <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                  </div>
                  <p className="text-gray-500 text-xs font-medium">Sedang menegecek sistem...</p>
                </motion.div>
              )}

              {/* Error State */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#FEF2F2] border border-red-100 rounded-xl p-3 flex items-start gap-3 shadow-sm"
                >
                  <div className="p-1.5 bg-red-100 text-red-600 rounded-full shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-800 text-sm mb-0.5">Tidak Ditemukan</h4>
                    <p className="text-xs text-red-600/90 leading-relaxed font-medium">
                      {error}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Success State */}
              {result && (() => {
                const config = getStatusConfig(result.status);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden shrink-0"
                  >
                    {/* Header Card */}
                    <div className={`${config.bg} p-3 flex items-center gap-3 shrink-0`}>
                      <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm border border-white/20">
                        <div className="scale-[0.6]">{config.icon}</div>
                      </div>
                      <div>
                        <div className="inline-block px-1.5 py-0.5 bg-transparent border border-white/40 text-white rounded text-[10px] font-semibold mb-0.5 shadow-sm">
                          {result.status}
                        </div>
                        <p className="text-white/95 text-[11px] font-medium leading-snug">
                          {config.desc}
                        </p>
                      </div>
                    </div>
                    
                    {/* Body Card */}
                    <div className="p-3 shrink-0">
                      {/* Registration Number Format */}
                      <div className="bg-[#F8FAFC] border border-gray-100/80 rounded-lg p-2.5 flex justify-between items-center mb-3 shadow-sm">
                        <div>
                          <p className="text-slate-500 text-[10px] mb-0.5 font-medium">Nomor Pendaftaran</p>
                          <p className="text-base md:text-lg font-black text-[#0F172A] tracking-tight">{result.noPendaftaran}</p>
                        </div>
                        <div className="bg-white p-1.5 rounded-md shadow-sm border border-gray-50 flex-shrink-0">
                          <FileText className="text-slate-300 w-4 h-4" />
                        </div>
                      </div>

                      {/* Detail Rows */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-inner">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] font-medium mb-0.5">Nama Siswa</p>
                            <p className="font-bold text-slate-800 text-xs capitalize">{result.nama}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                            <School className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] font-medium mb-0.5">Jenjang</p>
                            <span className="inline-block bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-slate-200/60 uppercase">
                              {result.jenjang}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-inner">
                            <CalendarDays className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] font-medium mb-0.5">Tanggal Pendaftaran</p>
                            <p className="font-bold text-slate-800 text-[11px]">{formatDate(result.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const statusText = result.statusPembayaran || "Belum Bayar";
                      let statusColor = "text-slate-500";
                      let isLunas = false;

                      if (statusText === "Lunas") {
                        statusColor = "text-emerald-600";
                        isLunas = true;
                      } else if (statusText === "Cicilan") {
                        statusColor = "text-blue-600";
                      } else if (statusText === "Dalam Verifikasi") {
                        statusColor = "text-yellow-600";
                      } else if (statusText === "Ditolak") {
                        statusColor = "text-red-600";
                      } else if (statusText === "Belum Bayar") {
                        statusColor = "text-red-500";
                      }

                      return (
                        <div className="bg-slate-50 border-t border-gray-100 p-3 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs font-semibold px-1">
                             <span className="text-slate-500">Status Pembayaran</span>
                             <span className={statusColor}>
                               {statusText}
                             </span>
                          </div>
                          {!isLunas && (
                            <button
                              onClick={() => setIsPayModalOpen(true)}
                              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                            >
                              <CreditCard className="w-4 h-4" />
                              Bayar Sekarang
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </motion.div>
                );
              })()}

              {isPayModalOpen && result && (
                <PembayaranModal
                  onClose={() => {
                    setIsPayModalOpen(false);
                  }}
                  onSuccess={() => {
                     // Optionally re-fetch status to show "Menunggu Verifikasi"
                     setResult({...result, statusPembayaran: "Menunggu Verifikasi"});
                  }}
                  pendaftarId={result.id}
                  noPendaftaran={result.noPendaftaran}
                  nama={result.nama}
                />
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
