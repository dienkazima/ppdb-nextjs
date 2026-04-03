"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Edit2, Trash2, CreditCard, Smartphone,
  CheckCircle, XCircle, FileText, Download, CalendarDays,
  Eye, Clock, Search, Filter, AlertTriangle, CheckCheck,
  X, Banknote, User, Hash, Building2, RefreshCw, Layers,
  TrendingDown, Wallet, ChevronRight, AlertCircle
} from "lucide-react";
import MethodLogo from "@/app/components/MethodLogo";

interface MetodePembayaran {
  id: string;
  namaBank: string;
  nomorRekening: string;
  atasNama: string;
  instruksi: string;
  kategori: string;
  isActive: boolean;
}

interface RiwayatItem {
  id: string;
  nomorCicilan: number;
  nominal: number;
  metodePembayaran: string | null;
  buktiPembayaran: string | null;
  statusPembayaran: string;
  catatanPenolakan: string | null;
  catatan?: string | null;
  tanggalVerifikasi: string | null;
  createdAt: string;
}

interface Transaksi {
  id: string;
  nama: string;
  noPendaftaran: string;
  jenjang: string;
  jenisKelamin: string;
  statusPembayaran: string;
  buktiPembayaran: string | null;
  createdAt: string;
  nominal: number | null;
  metodePembayaran: string | null;
  catatanPenolakan: string | null;
  tanggalVerifikasi: string | null;
  // Cicilan fields
  totalTagihan: number | null;
  totalDibayar: number;
  totalMenunggu: number;
  sisaTagihan: number | null;
  jumlahCicilan: number;
  cicilanMenunggu: number;
  riwayat: RiwayatItem[];
}

function formatTanggal(raw: string | null | undefined): string {
  if (!raw) return "-";
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return "-";
    const day = String(d.getDate()).padStart(2, "0");
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hour = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${day} ${month} ${year} - ${hour}:${min}`;
  } catch {
    return "-";
  }
}

function formatRupiah(val: number | null | undefined): string {
  if (val == null || val === 0) return "Rp 0";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

function formatRupiahShort(val: number | null | undefined): string {
  if (val == null) return "-";
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(val % 1_000_000 === 0 ? 0 : 1)}jt`;
  if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}rb`;
  return `Rp ${val}`;
}

export default function ManajemenPembayaran() {
  const [activeTab, setActiveTab] = useState<"METODE" | "TRANSAKSI">("METODE");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // ── STATE METODE
  const [metodeList, setMetodeList] = useState<MetodePembayaran[]>([]);
  const [loadingMetode, setLoadingMetode] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    namaBank: "", nomorRekening: "", atasNama: "",
    instruksi: "", kategori: "BANK", isActive: true
  });

  // ── STATE TRANSAKSI
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loadingTransaksi, setLoadingTransaksi] = useState(false);

  // ── STATE FILTER
  const [searchNama, setSearchNama] = useState("");
  const [filterStatus, setFilterStatus] = useState("SEMUA");
  const [filterJenjang, setFilterJenjang] = useState("SEMUA");
  const [jenjangs, setJenjangs] = useState<string[]>([]);

  // ── STATE MODAL DETAIL
  const [detailItem, setDetailItem] = useState<Transaksi | null>(null);

  // ── STATE MODAL VERIFIKASI CICILAN
  const [verModal, setVerModal] = useState<{ transaksi: Transaksi; riwayat: RiwayatItem; aksi: "VERIFIKASI" | "TOLAK" } | null>(null);
  const [catatanTolak, setCatatanTolak] = useState("");
  const [verLoading, setVerLoading] = useState(false);

  // ── STATE MODAL MANUAL
  const [manualModal, setManualModal] = useState<{ transaksi: Transaksi } | null>(null);
  const [manualForm, setManualForm] = useState({ nominal: "", catatan: "" });
  const [manualLoading, setManualLoading] = useState(false);

  const rawManualNominal = parseInt(manualForm.nominal.replace(/\D/g, "")) || 0;
  const manualExceeds = manualModal?.transaksi.sisaTagihan != null && rawManualNominal > (manualModal.transaksi.sisaTagihan as number);

  useEffect(() => {
    // Fetch daftar jenjang dari DB
    fetch("/api/jenjang")
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setJenjangs(data.map((j: any) => j.nama)); })
      .catch(() => {});

    fetch("/api/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setUser(data.user);
          if (data.user.role === "PANITIA") {
            setActiveTab("TRANSAKSI");
            if (data.user.jenjang) {
              setFilterJenjang(data.user.jenjang);
            }
          }
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));

    if (activeTab === "METODE") fetchMetode();
    else fetchTransaksi();
  }, [activeTab]);

  const fetchMetode = async () => {
    setLoadingMetode(true);
    try {
      const res = await fetch("/api/pembayaran/metode?admin=true");
      setMetodeList(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoadingMetode(false); }
  };

  const fetchTransaksi = async () => {
    setLoadingTransaksi(true);
    try {
      const res = await fetch("/api/pembayaran/transaksi");
      const data = await res.json();
      setTransaksiList(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoadingTransaksi(false); }
  };

  // ── CRUD METODE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/pembayaran/metode/${editingId}` : "/api/pembayaran/metode";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setIsModalOpen(false); fetchMetode(); resetForm(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus metode pembayaran ini?")) return;
    await fetch(`/api/pembayaran/metode/${id}`, { method: "DELETE" });
    fetchMetode();
  };

  const resetForm = () => {
    setForm({ namaBank: "", nomorRekening: "", atasNama: "", instruksi: "", kategori: "BANK", isActive: true });
    setEditingId(null);
  };

  const openEdit = (m: MetodePembayaran) => {
    setForm({ namaBank: m.namaBank, nomorRekening: m.nomorRekening, atasNama: m.atasNama, instruksi: m.instruksi || "", kategori: m.kategori, isActive: m.isActive });
    setEditingId(m.id);
    setIsModalOpen(true);
  };

  // ── VERIFIKASI CICILAN
  const handleVerifikasiCicilan = async () => {
    if (!verModal) return;
    if (verModal.aksi === "TOLAK" && !catatanTolak.trim()) {
      alert("Mohon isi alasan penolakan.");
      return;
    }
    setVerLoading(true);
    try {
      const res = await fetch(`/api/pembayaran/verifikasi/${verModal.riwayat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aksi: verModal.aksi, catatan: catatanTolak })
      });
      if (res.ok) {
        setVerModal(null);
        setCatatanTolak("");
        setDetailItem(null);
        fetchTransaksi();
      }
    } finally {
      setVerLoading(false);
    }
  };

  // ── MANUAL PAYMENT
  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualModal) return;
    if (manualExceeds) {
      alert("Nominal melebihi sisa tagihan");
      return;
    }
    try {
      setManualLoading(true);
      const numNominal = parseInt(manualForm.nominal.replace(/\D/g, ""));
      if (isNaN(numNominal) || numNominal <= 0) {
        alert("Nominal tidak valid");
        return;
      }
      const res = await fetch("/api/pembayaran/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pendaftarId: manualModal.transaksi.id,
          nominal: numNominal,
          catatan: manualForm.catatan,
        }),
      });
      if (res.ok) {
        setManualModal(null);
        setManualForm({ nominal: "", catatan: "" });
        setDetailItem(null); // Tutup juga modal detail supaya status update tereflek di List
        fetchTransaksi();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal mencatat pembayaran");
      }
    } finally {
      setManualLoading(false);
    }
  };

  // ── FILTER
  const filtered = useMemo(() => {
    return transaksiList.filter(t => {
      const matchNama = t.nama.toLowerCase().includes(searchNama.toLowerCase()) ||
        (t.noPendaftaran || "").toLowerCase().includes(searchNama.toLowerCase());
      const matchStatus = filterStatus === "SEMUA" || t.statusPembayaran === filterStatus;
      const matchJenjang = filterJenjang === "SEMUA" || (t.jenjang || "").toLowerCase().includes(filterJenjang.toLowerCase());
      return matchNama && matchStatus && matchJenjang;
    });
  }, [transaksiList, searchNama, filterStatus, filterJenjang]);

  // ── SUMMARY
  const summary = useMemo(() => ({
    menunggu: transaksiList.filter(t => t.statusPembayaran === "Menunggu Verifikasi").length,
    lunas: transaksiList.filter(t => t.statusPembayaran === "Lunas").length,
    cicilan: transaksiList.filter(t => t.statusPembayaran === "Cicilan").length,
    ditolak: transaksiList.filter(t => t.statusPembayaran === "Ditolak").length,
    totalMenungguCicilan: transaksiList.reduce((sum, t) => sum + (t.cicilanMenunggu || 0), 0),
  }), [transaksiList]);

  // ── BADGE & ICON
  const statusBadge = (status: string) => {
    if (status === "Lunas") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Menunggu Verifikasi") return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "Cicilan") return "bg-blue-50 text-blue-700 border-blue-200";
    if (status === "Diverifikasi") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "Ditolak") return "bg-red-50 text-red-600 border-red-200";
    return "bg-slate-50 text-slate-500 border-slate-200";
  };
  const statusIcon = (status: string) => {
    if (status === "Lunas" || status === "Diverifikasi") return <CheckCircle size={11} />;
    if (status === "Menunggu Verifikasi") return <Clock size={11} />;
    if (status === "Cicilan") return <Layers size={11} />;
    return <XCircle size={11} />;
  };

  // Progress bar percentage
  const progressPct = (dibayar: number, tagihan: number | null) => {
    if (!tagihan || tagihan === 0) return 0;
    return Math.min(100, Math.round((dibayar / tagihan) * 100));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Pusat Pembayaran</h1>
          <p className="text-slate-500 mt-1 text-sm">Kelola metode transfer &amp; verifikasi cicilan calon pendaftar.</p>
        </div>
        {activeTab === "METODE" && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus size={18} /> Tambah Metode
          </button>
        )}
        {activeTab === "TRANSAKSI" && (
          <button onClick={fetchTransaksi} className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-sm w-full md:max-w-md">
        {user?.role !== "PANITIA" && (
          <button
            onClick={() => setActiveTab("METODE")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "METODE" ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
          >
            <CreditCard size={18} /> Metode Bayar
          </button>
        )}
        <button
          onClick={() => setActiveTab("TRANSAKSI")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === "TRANSAKSI" ? "bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
        >
          <FileText size={18} /> Bukti Transfer
          {summary.totalMenungguCicilan > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-amber-500 rounded-full">{summary.totalMenungguCicilan}</span>
          )}
        </button>
      </div>

      {/* ── TAB: METODE BAYAR */}
      {activeTab === "METODE" && (
        <div className="animate-in fade-in duration-300">
          {loadingMetode ? (
            <div className="text-center py-20 text-slate-400">Memuat data...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metodeList.map((m) => (
                <div key={m.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 lg:p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute top-3 right-3 flex flex-row items-center gap-1">
                    <button onClick={() => openEdit(m)} className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-colors">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(m.id)} className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mb-5 pr-20">
                    <MethodLogo name={m.namaBank} category={m.kategori} />
                    <div>
                      <h3 className="font-extrabold text-[15px] text-slate-800 tracking-tight">{m.namaBank}</h3>
                      <span className={`text-[10px] px-2 py-0.5 mt-1 rounded-md border font-bold tracking-widest uppercase inline-block ${m.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                        {m.isActive ? "AKTIF" : "NONAKTIF"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">Nomor Rekening/QRIS</p>
                      <p className="font-mono text-slate-800 font-bold tracking-wide">{m.nomorRekening}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-1">Atas Nama</p>
                      <p className="text-slate-700 capitalize text-sm font-semibold">{m.atasNama}</p>
                    </div>
                  </div>
                </div>
              ))}
              {metodeList.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CreditCard size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">Belum ada metode pembayaran yang ditambahkan.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TRANSAKSI */}
      {activeTab === "TRANSAKSI" && (
        <div className="animate-in slide-in-from-right-4 duration-300 space-y-5">

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">Menunggu</p>
                <p className="text-2xl font-extrabold text-amber-800">{summary.menunggu}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">Cicilan</p>
                <p className="text-2xl font-extrabold text-blue-800">{summary.cicilan}</p>
              </div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCheck size={20} />
              </div>
              <div>
                <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Lunas</p>
                <p className="text-2xl font-extrabold text-emerald-800">{summary.lunas}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <XCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Ditolak</p>
                <p className="text-2xl font-extrabold text-red-800">{summary.ditolak}</p>
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama / No. Pendaftaran..."
                value={searchNama}
                onChange={e => setSearchNama(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-300 text-slate-900 placeholder:text-slate-400 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="SEMUA">Semua Status</option>
                  <option value="Menunggu Verifikasi">Menunggu</option>
                  <option value="Cicilan">Cicilan</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <select
                value={filterJenjang}
                onChange={e => setFilterJenjang(e.target.value)}
                disabled={user?.role === "PANITIA"}
                className={`px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none font-semibold text-slate-700 appearance-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 ${user?.role === "PANITIA" ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {user?.role === "PANITIA" ? (
                  <option value={user.jenjang}>{user.jenjang}</option>
                ) : (
                  <>
                    <option value="SEMUA">Semua Jenjang</option>
                    {jenjangs.map(nama => (
                      <option key={nama} value={nama}>{nama}</option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                <CalendarDays size={18} />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-sm">Histori Pembayaran & Cicilan</h2>
                <p className="text-xs text-slate-500">Menampilkan {filtered.length} dari {transaksiList.length} data</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 min-w-[1000px]">
                <thead className="bg-slate-50/80 text-slate-400 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Nama Siswa</th>
                    <th className="px-5 py-3.5">Nominal Transfer</th>
                    <th className="px-5 py-3.5">Total Tagihan</th>
                    <th className="px-5 py-3.5">Sisa</th>
                    <th className="px-5 py-3.5">Cicilan</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingTransaksi ? (
                    <tr><td colSpan={7} className="py-20 text-center text-slate-400">Memuat histori...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-20 text-center text-slate-400 font-medium">Tidak ada data yang cocok.</td></tr>
                  ) : (
                    filtered.map(t => {
                      const pct = progressPct(t.totalDibayar, t.totalTagihan);
                      return (
                        <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Nama + jenjang */}
                          <td className="px-5 py-4">
                            <p className="font-bold text-slate-800 tracking-tight text-[14px]">{t.nama}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 border border-slate-200/60 rounded">{t.jenjang}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{t.noPendaftaran || "-"}</span>
                            </div>
                          </td>

                          {/* Nominal Transfer: verified + pending breakdown */}
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              {t.totalDibayar > 0 ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
                                  <p className="text-sm font-bold text-emerald-700">{formatRupiahShort(t.totalDibayar)}</p>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 italic">Belum ada</p>
                              )}
                              {t.totalMenunggu > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                                  <p className="text-xs font-semibold text-amber-700">{formatRupiahShort(t.totalMenunggu)} menunggu</p>
                                </div>
                              )}
                              {t.totalDibayar === 0 && t.totalMenunggu === 0 && (
                                <p className="text-xs text-slate-400 italic">-</p>
                              )}
                            </div>
                          </td>

                          {/* Total Tagihan */}
                          <td className="px-5 py-4">
                            {t.totalTagihan ? (
                              <div className="space-y-1.5">
                                <p className="text-sm font-semibold text-slate-600">{formatRupiahShort(t.totalTagihan)}</p>
                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-emerald-500" : pct > 0 ? "bg-blue-400" : "bg-slate-300"}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <p className="text-[9px] text-slate-400 font-medium">{pct}% terbayar</p>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Belum ditetapkan</span>
                            )}
                          </td>

                          {/* Sisa */}
                          <td className="px-5 py-4">
                            {t.sisaTagihan != null ? (
                              <span className={`text-sm font-bold ${t.sisaTagihan === 0 ? "text-emerald-600" : "text-orange-600"}`}>
                                {t.sisaTagihan === 0 ? "✓ Lunas" : formatRupiahShort(t.sisaTagihan)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>

                          {/* Cicilan badge */}
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit">
                                <Layers size={9} /> {t.jumlahCicilan}x cicilan
                              </span>
                              {t.cicilanMenunggu > 0 && (
                                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full w-fit">
                                  <Clock size={9} /> {t.cicilanMenunggu} menunggu
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusBadge(t.statusPembayaran)}`}>
                              {statusIcon(t.statusPembayaran)}
                              {t.statusPembayaran}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setDetailItem(t)}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-100 hover:border-transparent"
                              >
                                <Eye size={12} /> Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL CRUD METODE ══════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{editingId ? "Edit Metode" : "Tambah Metode Baru"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 bg-white shadow-sm rounded-full w-8 h-8 flex items-center justify-center transition-colors">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Kategori</label>
                  <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-sm text-slate-700">
                    <option value="BANK">Bank Transfer</option>
                    <option value="E-WALLET">E-Wallet (DANA, OVO, dll)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Status</label>
                  <select value={form.isActive.toString()} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none font-medium text-sm text-slate-700">
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Bank / Wallet</label>
                <input required type="text" placeholder="Cth: Bank Syariah Indonesia (BSI)" value={form.namaBank} onChange={e => setForm({ ...form, namaBank: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nomor Rekening/HP</label>
                  <input required type="text" value={form.nomorRekening} onChange={e => setForm({ ...form, nomorRekening: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm font-mono transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Atas Nama</label>
                  <input required type="text" value={form.atasNama} onChange={e => setForm({ ...form, atasNama: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Instruksi Pembayaran (Opsional)</label>
                <textarea rows={3} placeholder={"1. Buka m-banking...\n2. Masukkan nomor..."} value={form.instruksi} onChange={e => setForm({ ...form, instruksi: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-sm transition-all resize-none" />
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors">Batal</button>
                <button type="submit" className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-bold shadow-sm transition-all active:scale-95">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════ MODAL DETAIL CICILAN ══════════ */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Detail Pembayaran</h2>
                <p className="text-xs text-slate-500 mt-0.5">{detailItem.nama} · {detailItem.jenjang}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setManualModal({ transaksi: detailItem }); setManualForm({ nominal: "", catatan: "" }); }}
                  className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg font-bold transition-all border border-indigo-200 hover:border-transparent flex items-center gap-1.5"
                >
                  <Plus size={14} /> Bayar Manual
                </button>
                <button onClick={() => setDetailItem(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 bg-white shadow-sm rounded-full transition-colors border border-slate-100">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Status Banner */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${statusBadge(detailItem.statusPembayaran)}`}>
                {statusIcon(detailItem.statusPembayaran)}
                <span className="font-bold text-sm">{detailItem.statusPembayaran}</span>
                {detailItem.statusPembayaran === "Lunas" && detailItem.tanggalVerifikasi && (
                  <span className="ml-auto text-xs opacity-70">Lunas: {formatTanggal(detailItem.tanggalVerifikasi)}</span>
                )}
              </div>

              {/* Info Siswa */}
              <div className="grid grid-cols-2 gap-3">
                <InfoField icon={<User size={14} />} label="Nama Siswa" value={detailItem.nama} />
                <InfoField icon={<Hash size={14} />} label="No. Pendaftaran" value={detailItem.noPendaftaran || "-"} mono />
                <InfoField icon={<Building2 size={14} />} label="Jenjang" value={detailItem.jenjang} />
                <InfoField icon={<User size={14} />} label="Jenis Kelamin" value={detailItem.jenisKelamin || "-"} />
              </div>

              {/* Ringkasan Pembayaran */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Ringkasan Pembayaran</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-1">Total Tagihan</p>
                    <p className="text-sm font-bold text-white">
                      {detailItem.totalTagihan ? formatRupiah(detailItem.totalTagihan) : <span className="text-slate-400 text-xs italic">Belum ditetapkan</span>}
                    </p>
                  </div>
                  <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-300 uppercase tracking-wider mb-1">Sudah Dibayar</p>
                    <p className="text-sm font-bold text-emerald-300">{formatRupiah(detailItem.totalDibayar)}</p>
                  </div>
                  <div className={`rounded-xl p-3 text-center ${detailItem.sisaTagihan === 0 ? "bg-emerald-500/20 border border-emerald-400/30" : "bg-orange-500/20 border border-orange-400/30"}`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 ${detailItem.sisaTagihan === 0 ? "text-emerald-300" : "text-orange-300"}`}>Sisa Tagihan</p>
                    <p className={`text-sm font-bold ${detailItem.sisaTagihan === 0 ? "text-emerald-300" : "text-orange-300"}`}>
                      {detailItem.sisaTagihan != null ? (detailItem.sisaTagihan === 0 ? "✓ Lunas" : formatRupiah(detailItem.sisaTagihan)) : "-"}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {detailItem.totalTagihan && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progress Pembayaran</span>
                      <span className="font-bold text-white">{progressPct(detailItem.totalDibayar, detailItem.totalTagihan)}%</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressPct(detailItem.totalDibayar, detailItem.totalTagihan) >= 100 ? "bg-emerald-400" : "bg-blue-400"}`}
                        style={{ width: `${progressPct(detailItem.totalDibayar, detailItem.totalTagihan)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Riwayat Cicilan */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={16} className="text-indigo-500" />
                  <p className="text-sm font-bold text-slate-700">Riwayat Cicilan ({detailItem.jumlahCicilan}x)</p>
                </div>

                {detailItem.riwayat.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Belum ada data cicilan
                  </div>
                ) : (
                  <div className="space-y-3">
                    {detailItem.riwayat.map((r, idx) => (
                      <div key={r.id} className={`rounded-xl border p-4 space-y-3 ${r.statusPembayaran === "Diverifikasi" ? "border-emerald-200 bg-emerald-50/40" : r.statusPembayaran === "Ditolak" ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/40"}`}>
                        {/* Cicilan header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[11px] font-extrabold flex-shrink-0">
                              {r.nomorCicilan}
                            </span>
                            <span className="text-sm font-bold text-slate-700">
                              Cicilan ke-{r.nomorCicilan}
                              <span className="text-[10px] font-normal text-slate-400 ml-1">dari {detailItem.jumlahCicilan}</span>
                            </span>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${statusBadge(r.statusPembayaran)}`}>
                            {statusIcon(r.statusPembayaran)} {r.statusPembayaran}
                          </span>
                        </div>

                        {/* Detail cicilan */}
                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div className="bg-white rounded-lg p-2 border border-slate-100">
                            <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Nominal</p>
                            <p className="font-bold text-slate-800">{formatRupiah(r.nominal)}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-slate-100">
                            <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Metode</p>
                            <p className="font-semibold text-slate-700 truncate">{r.metodePembayaran || "-"}</p>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-slate-100">
                            <p className="text-slate-400 uppercase tracking-wider text-[9px] mb-0.5">Tanggal</p>
                            <p className="font-semibold text-slate-700">{formatTanggal(r.createdAt)}</p>
                          </div>
                        </div>

                        {/* Catatan penolakan */}
                        {r.statusPembayaran === "Ditolak" && r.catatanPenolakan && (
                          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-2.5">
                            <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-red-700">{r.catatanPenolakan}</p>
                          </div>
                        )}

                        {/* Catatan manual */}
                        {r.catatan && (
                          <div className="flex items-start gap-2 bg-indigo-50 border border-indigo-200 rounded-lg p-2.5">
                            <FileText size={13} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-indigo-700 italic">{r.catatan}</p>
                          </div>
                        )}

                        {/* Bukti Preview */}
                        {r.buktiPembayaran && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Bukti Transfer</p>
                            <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-[16/9] max-h-40">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={r.buktiPembayaran}
                                alt={`Bukti cicilan ${r.nomorCicilan}`}
                                className="w-full h-full object-contain"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <a href={r.buktiPembayaran} target="_blank" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-100 hover:border-transparent">
                                <Eye size={12} /> Buka
                              </a>
                              <a href={r.buktiPembayaran} download={`Bukti_Cicilan${r.nomorCicilan}_${detailItem.nama}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-700 text-slate-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-200 hover:border-transparent">
                                <Download size={12} /> Download
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Tombol Aksi per Cicilan */}
                        {r.statusPembayaran === "Menunggu Verifikasi" && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => { setVerModal({ transaksi: detailItem, riwayat: r, aksi: "VERIFIKASI" }); setCatatanTolak(""); }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm shadow-emerald-600/20"
                            >
                              <CheckCheck size={13} /> Terima Cicilan {r.nomorCicilan}
                            </button>
                            <button
                              onClick={() => { setVerModal({ transaksi: detailItem, riwayat: r, aksi: "TOLAK" }); setCatatanTolak(""); }}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm shadow-red-600/20"
                            >
                              <X size={13} /> Tolak
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL KONFIRMASI VERIFIKASI CICILAN ══════════ */}
      {verModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className={`px-6 py-4 ${verModal.aksi === "VERIFIKASI" ? "bg-emerald-600" : "bg-red-600"}`}>
              <div className="flex items-center gap-3">
                {verModal.aksi === "VERIFIKASI" ? <CheckCheck size={20} className="text-white" /> : <AlertTriangle size={20} className="text-white" />}
                <h2 className="text-lg font-bold text-white">
                  {verModal.aksi === "VERIFIKASI" ? "Konfirmasi Cicilan" : "Tolak Cicilan"}
                </h2>
              </div>
              <p className="text-sm mt-1 text-white/80">
                Cicilan ke-{verModal.riwayat.nomorCicilan} · {formatRupiah(verModal.riwayat.nominal)}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-1">
                <p className="text-xs text-slate-500">Siswa</p>
                <p className="font-bold text-slate-800">{verModal.transaksi.nama}</p>
                <p className="text-xs text-slate-400 font-mono">{verModal.transaksi.noPendaftaran}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Banknote size={13} className="text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">{formatRupiah(verModal.riwayat.nominal)}</span>
                  <span className="text-xs text-slate-400">via {verModal.riwayat.metodePembayaran || "-"}</span>
                </div>
              </div>

              {verModal.aksi === "TOLAK" && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Alasan Penolakan <span className="text-red-500">*</span></label>
                  <textarea
                    rows={3}
                    value={catatanTolak}
                    onChange={e => setCatatanTolak(e.target.value)}
                    placeholder="Contoh: Nominal tidak sesuai / Bukti tidak terbaca / ..."
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none text-sm resize-none transition-all"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setVerModal(null); setCatatanTolak(""); }}
                  className="flex-1 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors text-sm"
                  disabled={verLoading}
                >
                  Batal
                </button>
                <button
                  onClick={handleVerifikasiCicilan}
                  disabled={verLoading}
                  className={`flex-1 py-2.5 text-white rounded-xl font-bold transition-all active:scale-95 text-sm disabled:opacity-60 ${verModal.aksi === "VERIFIKASI" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {verLoading ? "Menyimpan..." : verModal.aksi === "VERIFIKASI" ? "✓ Verifikasi" : "✕ Tolak"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL MANUAL PAYMENT ══════════ */}
      {manualModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 bg-indigo-600 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Banknote size={20} className="text-white" />
                <div>
                  <h2 className="text-lg font-bold text-white">Input Pembayaran Manual</h2>
                  <p className="text-xs text-white/80">{manualModal.transaksi.nama}</p>
                </div>
              </div>
              <button onClick={() => setManualModal(null)} className="text-white/70 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualPayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Nominal (Rp) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  <input
                    required
                    type="text"
                    value={manualForm.nominal}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const formatted = val ? parseInt(val).toLocaleString("id-ID") : "";
                      setManualForm({ ...manualForm, nominal: formatted });
                    }}
                    placeholder="0"
                    className={`w-full pl-11 pr-4 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 outline-none font-bold text-slate-800 transition-all text-right ${manualExceeds ? "border-red-400 focus:ring-red-500/20 focus:border-red-500" : "border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-500"}`}
                  />
                </div>
                {manualExceeds && (
                  <p className="text-red-500 text-xs font-semibold mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> Nominal melebihi sisa tagihan (Rp {manualModal.transaksi.sisaTagihan?.toLocaleString("id-ID")})</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Metode Pembayaran</label>
                <input
                  type="text"
                  value="Offline"
                  disabled
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Catatan (Opsional)</label>
                <textarea
                  rows={2}
                  value={manualForm.catatan}
                  onChange={(e) => setManualForm({ ...manualForm, catatan: e.target.value })}
                  placeholder="Misal: Pembayaran tunai via resepsionis"
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm resize-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModal(null)}
                  className="flex-1 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors text-sm"
                  disabled={manualLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={manualLoading || manualExceeds || rawManualNominal <= 0}
                  className="flex-1 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all active:scale-95 text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {manualLoading ? "Menyimpan..." : <><CheckCheck size={16} /> Simpan Pembayaran</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Component
function InfoField({ icon, label, value, mono = false, bold = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean; bold?: boolean }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-3">
      <div className="flex items-center gap-1.5 mb-1 text-slate-400">
        {icon}
        <p className="text-[10px] font-bold uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-sm text-slate-800 ${mono ? "font-mono" : ""} ${bold ? "font-bold" : "font-semibold"}`}>{value}</p>
    </div>
  );
}
