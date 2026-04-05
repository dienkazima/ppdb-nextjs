"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { Users, FileText, School, TrendingUp, Power, Loader2, CheckCircle2, XCircle } from "lucide-react";

// Palet warna yang bisa di-cycle untuk jenjang dinamis
const JENJANG_COLORS = [
  { bg: "bg-emerald-50", text: "text-emerald-600", hover: "group-hover:bg-emerald-600", blob: "bg-emerald-500/5" },
  { bg: "bg-amber-50",   text: "text-amber-600",   hover: "group-hover:bg-amber-600",   blob: "bg-amber-500/5" },
  { bg: "bg-purple-50",  text: "text-purple-600",  hover: "group-hover:bg-purple-600",  blob: "bg-purple-500/5" },
  { bg: "bg-rose-50",    text: "text-rose-600",    hover: "group-hover:bg-rose-600",    blob: "bg-rose-500/5" },
  { bg: "bg-cyan-50",    text: "text-cyan-600",    hover: "group-hover:bg-cyan-600",    blob: "bg-cyan-500/5" },
  { bg: "bg-orange-50",  text: "text-orange-600",  hover: "group-hover:bg-orange-600",  blob: "bg-orange-500/5" },
];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [bukaPendaftaran, setBukaPendaftaran] = useState(true);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [modeTahun, setModeTahun] = useState("AUTO");
  const [tahunManual, setTahunManual] = useState("");
  const [isSavingTahun, setIsSavingTahun] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((result) => setData(result));

    fetch("/api/me")
      .then(res => res.json())
      .then(res => { if (res.authenticated) setUser(res.user); })
      .catch(() => { });

    fetch("/api/pengaturan")
      .then(res => res.json())
      .then(res => {
        setBukaPendaftaran(res.bukaPendaftaran || false);
        if (res.modeTahunAjaran) setModeTahun(res.modeTahunAjaran);
        if (res.tahunAjaranManual) setTahunManual(res.tahunAjaranManual);
      })
      .catch(() => { });
  }, []);

  const togglePendaftaran = async () => {
    setLoadingToggle(true);
    try {
      const res = await fetch("/api/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bukaPendaftaran: !bukaPendaftaran, modeTahunAjaran: modeTahun, tahunAjaranManual: tahunManual })
      });
      if (res.ok) setBukaPendaftaran(!bukaPendaftaran);
    } finally {
      setLoadingToggle(false);
    }
  };

  const saveTahunAjaran = async () => {
    setIsSavingTahun(true);
    try {
      await fetch("/api/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bukaPendaftaran, modeTahunAjaran: modeTahun, tahunAjaranManual: tahunManual })
      });
    } finally {
      setIsSavingTahun(false);
    }
  };

  if (!data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Chart data & stat cards dinamis dari jenjangList + byJenjang (dari API)
  const jenjangList: string[] = data.jenjangList || [];
  const byJenjang: Record<string, number> = data.byJenjang || {};
  const chartData = jenjangList.map(nama => ({ name: nama, total: byJenjang[nama] ?? 0 }));
  const byGender = data.byGender || null;

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* HEADER WITH TOGGLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 mb-2">
            {user?.role === "PANITIA" ? "Dashboard Panitia" : "Dashboard Admin"}
          </h1>
          <p className="text-slate-500">Berikut adalah ringkasan data pendaftar hari ini.</p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Pengaturan Tahun Ajaran */}
          {user?.role === "ADMIN" && (
            <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Tahun Ajaran:</span>
              <select
                value={modeTahun}
                onChange={(e) => setModeTahun(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white border border-slate-300 text-slate-700 outline-none"
              >
                <option value="AUTO">🤖 Layanan Auto</option>
                <option value="MANUAL">✍️ Manual Override</option>
              </select>
              {modeTahun === "MANUAL" && (
                <input
                  type="text"
                  value={tahunManual}
                  onChange={(e) => setTahunManual(e.target.value)}
                  placeholder="Ex. 2026/2027"
                  className="px-3 py-1.5 w-32 rounded-lg text-sm font-semibold border border-slate-300 text-slate-900 placeholder:text-slate-400 outline-blue-500"
                />
              )}
              <button
                onClick={saveTahunAjaran}
                disabled={isSavingTahun}
                className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Simpan
              </button>
            </div>
          )}

          {/* Toggle Pendaftaran — hanya ADMIN */}
          <div className={`flex flex-col md:flex-row items-center gap-4 p-4 rounded-2xl border ${bukaPendaftaran ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'} transition-colors`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm ${bukaPendaftaran ? 'bg-green-500' : 'bg-red-500'}`}>
                {bukaPendaftaran ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0.5">Status Pendaftaran</p>
                <p className={`font-extrabold text-sm ${bukaPendaftaran ? 'text-green-700' : 'text-red-700'}`}>
                  {bukaPendaftaran ? "SEDANG DIBUKA" : "TELAH DITUTUP"}
                </p>
              </div>
            </div>
            {user?.role === "ADMIN" && (
              <button
                onClick={togglePendaftaran}
                disabled={loadingToggle}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-all ${bukaPendaftaran
                  ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-500/25'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/25'
                  } hover:-translate-y-0.5`}
              >
                {loadingToggle ? <Loader2 size={18} className="animate-spin" /> : <Power size={18} />}
                {bukaPendaftaran ? "Tutup Form" : "Buka Form"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CARD STATISTIK — 2 card tetap + per-jenjang dinamis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">

        {/* Card Total */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Total Pendaftar</p>
          <h2 className="text-3xl font-bold text-slate-800">{data.total}</h2>
        </div>

        {/* Card Hari Ini */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
          <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Hari Ini</p>
          <h2 className="text-3xl font-bold text-slate-800">{data.todayCount}</h2>
        </div>

        {/* Card Per Jenjang atau Per Gender */}
        {user?.role === "PANITIA" && byGender ? (
          <>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Laki-laki</p>
              <h2 className="text-3xl font-bold text-slate-800">{byGender["Laki-laki"] ?? 0}</h2>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/5 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                  <Users size={24} />
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-1">Perempuan</p>
              <h2 className="text-3xl font-bold text-slate-800">{byGender["Perempuan"] ?? 0}</h2>
            </div>
          </>
        ) : (
          jenjangList.map((nama, idx) => {
            const color = JENJANG_COLORS[idx % JENJANG_COLORS.length];
            return (
              <div key={nama} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                <div className={`absolute right-0 top-0 w-24 h-24 ${color.blob} rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform`}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${color.bg} ${color.text} rounded-xl flex items-center justify-center ${color.hover} group-hover:text-white transition-colors`}>
                    <School size={24} />
                  </div>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-1">Pendaftar {nama}</p>
                <h2 className="text-3xl font-bold text-slate-800">{byJenjang[nama] ?? 0}</h2>
              </div>
            );
          })
        )}
      </div>

      {/* GRAFIK DINAMIS */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {user?.role === "PANITIA" ? "Statistik Berdasarkan Jenis Kelamin" : "Statistik Berdasarkan Jenjang"}
            </h2>
            <p className="text-sm text-slate-500">
              {user?.role === "PANITIA" ? `Sebaran pendaftar laki-laki dan perempuan (${user?.jenjang || "Semua"})` : "Sebaran data pendaftar per jenjang pendidikan"}
            </p>
          </div>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <FileText size={20} />
          </div>
        </div>

        {user?.role === "PANITIA" && byGender ? (
          (() => {
             const m = byGender["Laki-laki"] ?? 0;
             const f = byGender["Perempuan"] ?? 0;
             const t = m + f;
             if (t === 0) {
               return (
                 <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
                   Belum ada data pendaftar
                 </div>
               );
             }
             const pm = Math.round((m / t) * 100);
             const pf = Math.round((f / t) * 100);
             return (
               <div className="space-y-8 mt-4">
                 {/* Progress Bar Laki-laki */}
                 <div>
                   <div className="flex justify-between text-sm font-bold mb-3">
                     <span className="text-blue-600 flex items-center gap-2 tracking-wide uppercase"><div className="w-3.5 h-3.5 rounded-full bg-blue-500"></div> Laki-laki</span>
                     <span className="text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{m} Siswa <span className="text-slate-400 mx-1">|</span> <span className="text-blue-600">{pm}%</span></span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden shadow-inner border border-slate-200">
                     <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-5 rounded-full transition-all duration-1000 relative" style={{ width: `${pm}%` }}>
                       <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                     </div>
                   </div>
                 </div>
                 {/* Progress Bar Perempuan */}
                 <div>
                   <div className="flex justify-between text-sm font-bold mb-3">
                     <span className="text-rose-500 flex items-center gap-2 tracking-wide uppercase"><div className="w-3.5 h-3.5 rounded-full bg-rose-400"></div> Perempuan</span>
                     <span className="text-slate-700 bg-slate-100 px-3 py-1 rounded-full">{f} Siswa <span className="text-slate-400 mx-1">|</span> <span className="text-rose-500">{pf}%</span></span>
                   </div>
                   <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden shadow-inner border border-slate-200">
                     <div className="bg-gradient-to-r from-rose-400 to-rose-600 h-5 rounded-full transition-all duration-1000 relative" style={{ width: `${pf}%` }}>
                       <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                     </div>
                   </div>
                 </div>
               </div>
             );
          })()
        ) : (
          chartData.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center text-slate-400 text-sm">
              Belum ada data jenjang. Tambahkan jenjang di menu Jenjang Pendidikan.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          )
        )}
      </div>

    </div>
  );
}