"use client";

import { useState } from "react";
import { Loader2, X, CheckCircle2, AlertTriangle } from "lucide-react";
import TataTertibModal from "@/app/components/TataTertibModal";

export default function DaftarButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [showClosed, setShowClosed] = useState(false);
  const [showTataTertib, setShowTataTertib] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pengaturan", { cache: "no-store" });
      const data = await res.json();
      if (data.bukaPendaftaran === true) {
        setShowTataTertib(true);
      } else {
        setShowClosed(true);
      }
    } catch (e) {
      // Jika terjadi error jaringan, tampilkan modal tata tertib sebagai fallback
      setShowTataTertib(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={className}
        style={{ cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin inline-block" />
            Memeriksa...
          </span>
        ) : "Daftar Sekarang"}
      </button>

      {/* MODAL TATA TERTIB */}
      <TataTertibModal
        isOpen={showTataTertib}
        onClose={() => setShowTataTertib(false)}
      />

      {/* MODAL PENDAFTARAN DITUTUP */}
      {showClosed && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowClosed(false); }}
        >
          <div className="bg-[#FEF2F2] rounded-[28px] shadow-2xl shadow-red-900/20 w-full max-w-sm border border-red-100 relative animate-in zoom-in-95 duration-300">
            <button
              type="button"
              onClick={() => setShowClosed(false)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-700 hover:bg-white p-2 rounded-full transition-all duration-200 shadow-sm"
            >
              <X size={20} />
            </button>

            <div className="p-8 pb-10 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-[24px] flex items-center justify-center shadow-[0_10px_25px_rgba(225,29,72,0.35)] mb-6">
                <AlertTriangle size={38} />
              </div>

              <h3 className="text-2xl font-extrabold text-red-900 mb-3">Pendaftaran Ditutup</h3>
              <p className="text-red-700/80 font-medium text-sm leading-relaxed mb-8 px-2">
                Mohon maaf, saat ini periode pendaftaran belum dibuka atau sudah ditutup oleh Admin. Pantau terus informasi terbaru kami.
              </p>

              <button
                type="button"
                onClick={() => setShowClosed(false)}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-3.5 px-6 rounded-2xl shadow-[0_8px_20px_rgba(225,29,72,0.3)] hover:shadow-[0_12px_25px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 transition-all duration-200 text-base"
              >
                Mengerti, Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
