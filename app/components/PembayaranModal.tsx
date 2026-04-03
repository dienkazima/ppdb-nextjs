"use client";

import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2, Copy, CreditCard, UploadCloud, X,
  Loader2, Landmark, Check, Banknote, AlertCircle, Info
} from "lucide-react";
import MethodLogo from "./MethodLogo";

interface PembayaranModalProps {
  onClose: () => void;
  pendaftarId: string;
  noPendaftaran: string;
  nama: string;
  onSuccess?: () => void;
}

// ── Currency formatter helpers ─────────────────────────────
function toRawNumber(formatted: string): number {
  const raw = formatted.replace(/[^\d]/g, "");
  return raw ? parseInt(raw, 10) : 0;
}

function formatCurrency(value: number): string {
  if (!value) return "";
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function PembayaranModal({
  onClose, pendaftarId, noPendaftaran, nama, onSuccess
}: PembayaranModalProps) {

  const [metode, setMetode] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Payment info
  const [jenjang, setJenjang] = useState<string>("");
  const [totalTagihan, setTotalTagihan] = useState<number>(0);
  const [totalDibayar, setTotalDibayar] = useState<number>(0);
  const [totalMenunggu, setTotalMenunggu] = useState<number>(0);
  const [sisaTagihan, setSisaTagihan] = useState<number | null>(null);

  // Nominal input
  const [nominalDisplay, setNominalDisplay] = useState<string>("");
  const [nominalError, setNominalError] = useState<string | null>(null);
  const nominalRef = useRef<HTMLInputElement>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/cek-status?no=" + noPendaftaran)
      .then(res => res.json())
      .then(d => {
        if (d.jenjang) setJenjang(d.jenjang);
        if (d.totalTagihan) setTotalTagihan(Number(d.totalTagihan));
        const dibayar = Number(d.totalDibayar || 0);
        const menunggu = Number(d.totalMenunggu || 0);
        setTotalDibayar(dibayar);
        setTotalMenunggu(menunggu);
        // Sisa tagihan = total - sudah diverifikasi (belum termasuk yang menunggu)
        if (d.totalTagihan) {
          const sisa = Number(d.totalTagihan) - dibayar;
          setSisaTagihan(sisa > 0 ? sisa : 0);
        }
      }).catch(() => {});

    fetch("/api/pembayaran/metode")
      .then(res => res.json())
      .then(data => setMetode(data))
      .finally(() => setLoading(false));
  }, [noPendaftaran]);

  // Auto-focus nominal after file selected
  useEffect(() => {
    if (file && nominalRef.current) {
      setTimeout(() => nominalRef.current?.focus(), 150);
    }
  }, [file]);

  const banks = metode.filter(m => m.kategori === "BANK");
  const eWallets = metode.filter(m => m.kategori === "E-WALLET");
  const selectedMetode = metode.find(m => m.id === selectedId);

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    // Hindari scroll ke bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        alert("Gagal menyalin nomor rekening.");
      }
    } catch (err) {
      console.error('Fallback error:', err);
      alert("Browser tidak mendukung fitur salin otomatis.");
    }
    document.body.removeChild(textArea);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopyTextToClipboard(text));
    } else {
      fallbackCopyTextToClipboard(text);
    }
  };

  // ── Nominal input handler ─────────────────────────────────
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = toRawNumber(e.target.value);
    setNominalDisplay(raw > 0 ? formatCurrency(raw) : "");
    setNominalError(null);
  };

  const validateNominal = (): boolean => {
    const val = toRawNumber(nominalDisplay);
    if (!val || val <= 0) {
      setNominalError("Nominal tidak boleh kosong / harus lebih dari 0.");
      return false;
    }
    if (sisaTagihan !== null && val > sisaTagihan) {
      setNominalError(`Nominal melebihi sisa tagihan (${formatCurrency(sisaTagihan)}).`);
      return false;
    }
    return true;
  };

  // ── Submit ────────────────────────────────────────────────
  const submitProof = async () => {
    if (!file) return;
    if (!pendaftarId) {
      setUploadError("ID pendaftar tidak ditemukan. Coba muat ulang halaman.");
      return;
    }
    if (!validateNominal()) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Step 1: Upload file
      const formData = new FormData();
      formData.append("file", file);
      const resUpload = await fetch("/api/upload", { method: "POST", body: formData });
      const dataUpload = await resUpload.json();

      if (!resUpload.ok || !dataUpload.filePath) {
        setUploadError(dataUpload?.error || "Gagal mengunggah file. Coba lagi.");
        return;
      }

      // Step 2: Simpan ke DB dengan nominal + metode
      const resUpdate = await fetch(`/api/pembayaran/upload/${pendaftarId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buktiPembayaran: dataUpload.filePath,
          nominal: toRawNumber(nominalDisplay),
          metodePembayaran: selectedMetode?.namaBank || null,
        })
      });

      const dataUpdate = await resUpdate.json();

      if (resUpdate.ok) {
        setIsSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        setUploadError(dataUpdate?.error || `Gagal menyimpan data (${resUpdate.status})`);
      }
    } catch (error: any) {
      console.error("Submit Error:", error);
      setUploadError("Koneksi bermasalah. Pastikan internet Anda stabil dan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────
  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-[24px] overflow-hidden shadow-2xl w-full max-w-sm p-8 text-center relative">
          <div className="mx-auto w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 border-8 border-emerald-50/50">
            <CheckCircle2 size={40} className="drop-shadow-sm" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1A233A] mb-2 tracking-tight">Terima Kasih!</h2>
          <p className="text-slate-500 mb-2 leading-relaxed text-sm">
            Bukti transfer sebesar{" "}
            <strong className="text-emerald-600">Rp {nominalDisplay}</strong> berhasil kami terima.
          </p>
          <p className="text-slate-400 text-xs mb-8">Status: <strong className="text-amber-600">Menunggu Verifikasi</strong></p>
          <button
            onClick={onClose}
            className="w-full bg-[#1A233A] text-white font-bold py-3.5 rounded-xl hover:bg-[#253251] shadow-lg shadow-blue-900/10 transition-all active:scale-95"
          >
            Tutup Jendela Ini
          </button>
        </div>
      </div>
    );
  }

  const parseInstructions = (text?: string) => {
    if (!text) return ["Konfirmasi dan simpan bukti transfer"];
    return text.split('\n').map(s => s.trim()).filter(Boolean);
  };

  const renderMethodItem = (m: any) => {
    const isSelected = selectedId === m.id;

    return (
      <div
        key={m.id}
        onClick={() => setSelectedId(m.id)}
        className={`bg-white rounded-2xl border transition-all cursor-pointer overflow-hidden
          ${isSelected
            ? 'border-emerald-400 shadow-[0_4px_20px_-10px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400'
            : 'border-slate-200 hover:border-emerald-300 hover:shadow-sm'
          }`}
      >
        <div className="flex items-center gap-4 p-4 lg:p-5">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${isSelected ? 'border-emerald-500' : 'border-slate-300'}`}>
            {isSelected && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
          </div>
          
          <MethodLogo name={m.namaBank} category={m.kategori} />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-[#1A233A] text-[15px] truncate">{m.namaBank}</h4>
            <p className="text-[12px] text-slate-500">{m.kategori === 'BANK' ? 'Transfer Bank' : 'E-Wallet'}</p>
          </div>
          {isSelected && (
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-widest hidden sm:block">
              Dipilih
            </div>
          )}
        </div>

        {isSelected && (
          <div className="px-4 pb-5 lg:px-5 lg:pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
            <div className="bg-emerald-50/50 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 border border-emerald-100">
              <div>
                <p className="text-emerald-700/80 text-xs font-semibold uppercase tracking-widest mb-1.5">Nomor Rekening</p>
                <p className="text-[#1A233A] font-extrabold text-2xl tracking-wider font-mono lg:text-3xl">{m.nomorRekening}</p>
                <p className="text-emerald-700/80 text-sm font-medium mt-1">a.n. <span className="font-bold">{m.atasNama}</span></p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); copyToClipboard(m.nomorRekening); }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-xl border border-slate-200 hover:bg-slate-50 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                {copied ? "Tersalin!" : "Salin"}
              </button>
            </div>

            {m.instruksi && (
              <div className="pl-1">
                <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3">Cara Pembayaran</p>
                <div className="space-y-3">
                  {parseInstructions(m.instruksi).map((step: string, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <span className="w-5 h-5 shrink-0 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold border border-emerald-200 mt-0.5 shadow-sm">
                        {idx + 1}
                      </span>
                      <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Is submit ready? ───────────────────────────────────────
  const nominalVal = toRawNumber(nominalDisplay);
  const isReady = !!file && nominalVal > 0 && !!selectedId;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-end sm:items-center justify-end sm:justify-center p-0 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-[#F8FAFC] w-full max-w-xl rounded-t-[24px] sm:rounded-[24px] shadow-2xl flex flex-col h-auto max-h-[92vh] sm:max-h-[95vh] relative overflow-hidden ring-1 ring-white/10 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

        {/* Close button */}
        <div className="absolute top-3 right-3 z-50">
          <button 
            onClick={onClose} 
            className="w-9 h-9 bg-white/80 backdrop-blur text-slate-500 hover:text-red-500 rounded-full flex items-center justify-center shadow-sm border border-slate-200 hover:scale-105 transition-all"
            title="Tutup dan kembali"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 relative hide-scrollbar">
          <div className="p-4 md:p-8 md:pt-6 space-y-6">

            {/* ── RINGKASAN PEMBAYARAN ── */}
            <div className="bg-white rounded-3xl shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
              <div className="bg-[#1A233A] px-5 py-4 flex items-center gap-2">
                <CreditCard className="text-emerald-400" size={18} />
                <h3 className="text-white font-bold">Ringkasan Pembayaran</h3>
              </div>
              <div className="p-5 md:p-6 pb-4">
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">Nama Siswa</p>
                    <p className="text-[13px] md:text-sm font-bold text-[#1A233A] leading-tight">{nama}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">Jenjang</p>
                    <p className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-flex border border-slate-200/50">{jenjang || "–"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">No. Pendaftaran</p>
                    <p className="text-[13px] md:text-sm font-bold text-[#1A233A] font-mono">{noPendaftaran}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium mb-1">Keterangan</p>
                    <p className="text-[12px] font-medium text-slate-600">Biaya Pendaftaran SPMB JSBS</p>
                  </div>
                </div>

                {/* Tagihan summary */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-400">Total Tagihan</p>
                    <p className="text-xl font-extrabold text-[#1A233A]">
                      {totalTagihan > 0 ? `Rp ${formatCurrency(totalTagihan)}` : "Sedang dihitung..."}
                    </p>
                  </div>
                  {totalDibayar > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-emerald-600">✓ Sudah Diverifikasi</p>
                      <p className="text-base font-bold text-emerald-600">Rp {formatCurrency(totalDibayar)}</p>
                    </div>
                  )}
                  {totalMenunggu > 0 && (
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold text-amber-600">⏳ Menunggu Verifikasi</p>
                      <p className="text-base font-bold text-amber-600">Rp {formatCurrency(totalMenunggu)}</p>
                    </div>
                  )}
                  {sisaTagihan !== null && totalTagihan > 0 && (
                    <div className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                      <p className="text-[11px] font-bold text-orange-700">Sisa yang Harus Dibayar</p>
                      <p className="text-lg font-extrabold text-orange-600">
                        {sisaTagihan === 0 ? "✓ Lunas" : `Rp ${formatCurrency(sisaTagihan)}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── METODE PEMBAYARAN ── */}
            <div>
              <h3 className="font-bold text-[#1A233A] text-lg flex items-center gap-2 mb-4 px-1">
                <Landmark className="text-emerald-500" size={20} />
                Pilih Metode Pembayaran
              </h3>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 rounded-3xl bg-white border border-slate-100">
                  <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
                  <p className="text-slate-500 text-sm font-medium">Memuat metode aktif...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {banks.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase pl-2">Transfer Bank</p>
                      <div className="flex flex-col gap-3">{banks.map(renderMethodItem)}</div>
                    </div>
                  )}
                  {eWallets.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-[11px] font-bold text-slate-400 tracking-widest uppercase pl-2">E-Wallet</p>
                      <div className="flex flex-col gap-3">{eWallets.map(renderMethodItem)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── UPLOAD + NOMINAL CARD (visible after metode dipilih) ── */}
            {selectedId && (
              <div className="bg-white rounded-3xl p-5 md:p-6 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] border border-slate-100 space-y-5">
                <h3 className="font-bold text-[#1A233A] text-[15px]">Kirim Bukti Pembayaran</h3>

                {/* Dropzone */}
                <label className={`block w-full border-2 border-dashed ${file ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50/30'} rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all relative overflow-hidden group`}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0];
                      if (selectedFile) {
                        if (selectedFile.size > 2 * 1024 * 1024) {
                          alert("Ukuran file tidak boleh lebih dari 2MB");
                          return;
                        }
                        setFile(selectedFile);
                        setNominalError(null);
                      }
                    }}
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                        <CheckCircle2 className="text-emerald-500" size={24} />
                      </div>
                      <p className="text-emerald-700 font-bold text-[15px] truncate max-w-[250px]">{file.name}</p>
                      <p className="text-xs text-emerald-600/70 mt-1 font-medium bg-emerald-100/50 px-3 py-1 rounded-full border border-emerald-200/50">Klik untuk ganti file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm group-hover:scale-110 group-hover:bg-emerald-50 transition-all">
                        <UploadCloud className="text-slate-400 group-hover:text-emerald-500 transition-colors" size={26} />
                      </div>
                      <p className="font-bold text-[#1A233A] text-[15px] mb-1">Unggah Bukti Transfer</p>
                      <p className="text-xs font-semibold text-slate-400">Format JPG, PNG, PDF (Maks 2MB)</p>
                    </div>
                  )}
                </label>

                {/* ── NOMINAL INPUT (muncul setelah file dipilih) ── */}
                {file && (
                  <div className="animate-in slide-in-from-bottom-2 duration-300 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-[#1A233A]">
                      <Banknote size={16} className="text-emerald-500" />
                      Nominal Transfer <span className="text-red-500">*</span>
                    </label>

                    {/* Helper tip */}
                    <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2.5">
                      <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-blue-700 leading-snug">
                        Masukkan nominal <strong>sesuai jumlah yang Anda transfer</strong> (bisa cicilan).
                        {sisaTagihan !== null && sisaTagihan > 0 && (
                          <> Sisa tagihan: <strong>Rp {formatCurrency(sisaTagihan)}</strong>.</>
                        )}
                        {totalMenunggu > 0 && (
                          <> <span className="text-amber-700">Rp {formatCurrency(totalMenunggu)} sedang menunggu verifikasi.</span></>
                        )}
                      </p>
                    </div>

                    {/* Input field */}
                    <div className={`relative flex items-center bg-slate-50 border-2 rounded-2xl overflow-hidden transition-all focus-within:border-emerald-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(52,211,153,0.1)] ${nominalError ? "border-red-400 bg-red-50/30" : "border-slate-200"}`}>
                      <span className="pl-4 pr-2 text-sm font-bold text-slate-500 shrink-0 select-none">Rp</span>
                      <input
                        ref={nominalRef}
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={nominalDisplay}
                        onChange={handleNominalChange}
                        onBlur={validateNominal}
                        className="flex-1 py-4 pr-4 bg-transparent text-lg font-extrabold text-[#1A233A] outline-none placeholder:text-slate-300 tracking-wide"
                      />
                      {nominalDisplay && (
                        <button
                          type="button"
                          onClick={() => { setNominalDisplay(""); setNominalError(null); }}
                          className="pr-4 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Nominal preview / error */}
                    {nominalError ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={13} />
                        <p className="text-xs font-semibold">{nominalError}</p>
                      </div>
                    ) : nominalVal > 0 ? (
                      <p className="text-xs text-emerald-600 font-semibold pl-1">
                        ✓ Nominal: <strong>Rp {formatCurrency(nominalVal)}</strong>
                      </p>
                    ) : null}
                  </div>
                )}

                {/* Error Banner */}
                {uploadError && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                    <span className="text-lg mt-0.5 shrink-0">⚠️</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">Upload Gagal</p>
                      <p className="text-[13px] leading-relaxed mt-0.5">{uploadError}</p>
                    </div>
                    <button onClick={() => setUploadError(null)} className="text-red-400 hover:text-red-600 shrink-0 p-1">✕</button>
                  </div>
                )}

                {/* Submit button */}
                <button
                  disabled={!isReady || isUploading}
                  onClick={submitProof}
                  className={`w-full py-4 rounded-[14px] font-bold text-[15px] flex items-center justify-center gap-2 transition-all ${
                    !isReady
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                      : isUploading
                        ? "bg-emerald-400 text-white cursor-wait"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                  }`}
                >
                  {isUploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                  {isUploading
                    ? "Menyimpan..."
                    : !file
                      ? "Pilih File Terlebih Dahulu"
                      : !nominalVal
                        ? "Isi Nominal Transfer"
                        : "Kirim Bukti Pembayaran"}
                </button>
              </div>
            )}

            {/* Safe Bottom space for mobile */}
            <div className="h-8 md:hidden"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
