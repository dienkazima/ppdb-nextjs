"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Loader2, AlertCircle, ScrollText } from "lucide-react";
import { useRouter } from "next/navigation";

interface TataTertibModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TataTertibModal({ isOpen, onClose }: TataTertibModalProps) {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [warn, setWarn] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
      setWarn(false);
      setLoading(true);
      document.body.style.overflow = "hidden";
      fetch("/api/tata-tertib")
        .then((r) => r.json())
        .then((d) => setItems(Array.isArray(d) ? d : []))
        .catch(() => setItems([]))
        .finally(() => setLoading(false));
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  const handleLanjut = () => {
    if (!agreed) {
      setWarn(true);
      return;
    }
    setIsNavigating(true);
    router.push("/daftar");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
          {/* Backdrop — tidak bisa ditutup klik luar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="relative w-full max-w-lg bg-white rounded-t-[24px] sm:rounded-[20px] shadow-2xl z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            {/* ── HEADER ── */}
            <div className="relative bg-gradient-to-br from-[#14532D] via-[#166534] to-[#15803D] px-5 py-4 flex items-center gap-3 shrink-0 overflow-hidden">
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                <ScrollText className="text-white" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-green-200 text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5">
                  Wajib Dibaca
                </p>
                <h2 className="text-white text-base font-bold leading-snug break-words">
                  Tata Tertib & Ketentuan Pendaftaran
                </h2>
              </div>
            </div>

            {/* ── BODY (scrollable) ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-10 text-slate-400">
                  <Loader2 className="animate-spin" size={22} />
                  <span className="text-sm">Memuat ketentuan...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                  <ScrollText size={32} className="text-slate-200" />
                  <p className="text-sm">Belum ada tata tertib yang ditetapkan.</p>
                </div>
              ) : (
                <ol className="space-y-2.5">
                  {items.map((item, idx) => (
                    <li key={item.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-green-200 hover:bg-green-50/40 transition-colors">
                      <span className="w-5 h-5 bg-[#16A34A] text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-slate-700 text-sm leading-relaxed">{item.teks}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* ── FOOTER ── */}
            <div className="shrink-0 border-t border-slate-100 px-5 py-4 space-y-3 bg-white">
              {/* Checkbox */}
              <button
                onClick={() => { setAgreed(!agreed); setWarn(false); }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                  agreed
                    ? "border-green-500 bg-green-50 shadow-[0_0_0_3px_rgba(34,197,94,0.15)]"
                    : warn
                    ? "border-red-400 bg-red-50 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
                    : "border-slate-200 hover:border-green-300 bg-slate-50"
                }`}
              >
                {/* Custom checkbox */}
                <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                  agreed ? "bg-green-600 border-green-600 scale-110" : warn ? "border-red-400" : "border-slate-300"
                }`}>
                  {agreed && (
                    <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3">
                      <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                <span className={`text-xs font-semibold leading-snug ${agreed ? "text-green-800" : warn ? "text-red-700" : "text-slate-600"}`}>
                  Saya menyetujui tata tertib dan ketentuan yang berlaku
                </span>
              </button>

              {/* Warning */}
              <AnimatePresence>
                {warn && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-1.5 text-red-600 text-xs font-semibold px-1"
                  >
                    <AlertCircle size={13} />
                    Centang persetujuan untuk melanjutkan pendaftaran.
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Lanjut button only */}
              <button
                onClick={handleLanjut}
                disabled={isNavigating}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  agreed
                    ? "bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:-translate-y-0.5"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isNavigating
                  ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                  : <><ArrowRight size={16} /> Lanjut Daftar</>
                }
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
