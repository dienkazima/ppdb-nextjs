"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  GraduationCap, BookOpen, Library, School, Building,
  CheckCircle, Target as TargetIcon, Users, DollarSign,
  ArrowRight, CheckSquare, Loader2, Info,
} from "lucide-react";
import HomeBiayaPendidikan from "./HomeBiayaPendidikan";

interface Jenjang {
  id: string;
  nama: string;
  deskripsi: string;
  icon: string;
  persyaratan: any[];
  biaya: any[];
  target: any[];
  guru: any[];
}

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap size={26} />,
  BookOpen: <BookOpen size={26} />,
  Library: <Library size={26} />,
  School: <School size={26} />,
  Building: <Building size={26} />,
};

const TABS = [
  { id: "persyaratan", label: "Persyaratan", icon: <CheckSquare size={15} /> },
  { id: "biaya", label: "Rincian Biaya", icon: <DollarSign size={15} /> },
  { id: "target", label: "Target", icon: <TargetIcon size={15} /> },
  { id: "guru", label: "Pendidik", icon: <Users size={15} /> },
] as const;

const getSchoolName = (jenjangName: string) => {
  const j = (jenjangName || "").toLowerCase();
  if (j.includes("tk") || j.includes("paud")) return "TK ISLAM TERPADU AN-NUR SURALAGA";
  if (j.includes("sd") || j.includes("mi")) return "SD ISLAM TERPADU SURALAGA";
  if (j.includes("smp") || j.includes("mts")) return "SMPS ISLAM TERPADU AN-NUR SURALAGA";
  if (j.includes("sma") || j.includes("ma")) return "SMAS ISLAM TERPADU AN-NUR SURALAGA";
  return "YAYASAN AN-NUR SURALAGA";
};

export default function HomeJenjang() {
  const [jenjangs, setJenjangs] = useState<Jenjang[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"persyaratan" | "biaya" | "target" | "guru">("persyaratan");
  const [cols, setCols] = useState(3);

  const gridRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  /* ── Fetch jenjang ── */
  useEffect(() => {
    fetch("/api/jenjang")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setJenjangs(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ── Deteksi jumlah kolom aktual via ResizeObserver ── */
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setCols(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [jenjangs]);

  /* ── Auto-scroll ke detail ── */
  useEffect(() => {
    if (activeId && detailRef.current) {
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
    }
  }, [activeId]);

  const toggle = useCallback((id: string) => {
    setActiveId(prev => prev === id ? null : id);
    setActiveTab("persyaratan");
  }, []);

  if (loading) return (
    <section className="py-24 bg-[#F0FDF4] flex justify-center">
      <Loader2 className="animate-spin text-[#16A34A]" size={40} />
    </section>
  );

  if (!jenjangs.length) return null;

  const selected = jenjangs.find(j => j.id === activeId);

  /* ── Slice jenjang ke baris-baris virtual ── */
  const rows: Jenjang[][] = [];
  for (let i = 0; i < jenjangs.length; i += cols) rows.push(jenjangs.slice(i, i + cols));
  const activeRow = activeId ? rows.findIndex(r => r.some(j => j.id === activeId)) : -1;

  return (
    <section className="w-full py-12 sm:py-16 md:py-20 bg-[#F0FDF4] overflow-x-hidden" id="jenjang">
      <div className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── HEADING ── */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#14532D] to-[#16A34A] mb-3">
            JENJANG PENDIDIKAN
          </h2>
          <p className="text-sm sm:text-base text-[#6B7280] max-w-xl mx-auto">
            Temukan jenjang pendidikan yang tepat dengan fasilitas, tenaga pendidik profesional, dan program unggulan kami.
          </p>
        </div>

        {/* ── GRID (baris per baris, sisip detail di bawah baris aktif) ── */}
        <div ref={gridRef} className="w-full">
          {rows.map((row, rowIdx) => {
            const showDetail = activeRow === rowIdx && selected;
            /* indeks card aktif dalam baris ini */
            const activeColIdx = row.findIndex(j => j.id === activeId);

            return (
              <div key={rowIdx} className="w-full">

                {/* Baris card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                  {row.map((jenjang) => {
                    const isActive = activeId === jenjang.id;
                    return (
                      <div
                        key={jenjang.id}
                        onClick={() => toggle(jenjang.id)}
                        className={`w-full bg-white rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 flex flex-col border-2 ${isActive
                          ? "border-[#22C55E] shadow-lg shadow-green-500/10 -translate-y-1"
                          : "border-transparent shadow-md hover:-translate-y-1 hover:shadow-lg hover:border-[#D1FAE5]"
                          }`}
                      >
                        {/* Icon */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-sm transition-transform duration-300 ${isActive ? "bg-[#16A34A] text-white scale-110" : "bg-[#F0FDF4] text-[#16A34A] group-hover:scale-110"
                          }`}>
                          {iconMap[jenjang.icon] || <School size={22} />}
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-[#111827] mb-1.5">{jenjang.nama}</h3>
                        <p className="text-[#6B7280] text-sm leading-relaxed flex-1 mb-5">{jenjang.deskripsi}</p>

                        <button
                          onClick={(e) => { e.stopPropagation(); toggle(jenjang.id); }}
                          className={`self-start inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${isActive
                            ? "bg-[#F0FDF4] text-[#16A34A] border border-[#22C55E]"
                            : "bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white shadow-sm hover:opacity-90"
                            }`}
                        >
                          {isActive ? "Tutup Detail" : "Lihat Detail"}
                          <ArrowRight size={14} className={`transition-transform duration-300 ${isActive ? "rotate-90" : ""}`} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Placeholder agar kolom terakhir tidak kosong/shift */}
                  {row.length < cols && Array.from({ length: cols - row.length }).map((_, i) => (
                    <div key={`ph-${i}`} className="hidden sm:block" aria-hidden="true" />
                  ))}
                </div>

                {/* ── DETAIL PANEL — tepat di bawah baris aktif ── */}
                {showDetail && (
                  <div
                    ref={detailRef}
                    className="w-full mt-3 mb-1 animate-in fade-in slide-in-from-top-3 duration-300"
                  >
                    {/* Panah indikator — mengarah ke card aktif */}
                    {activeColIdx >= 0 && (
                      <div className="w-full relative h-4 mb-[-2px]">
                        <div
                          className="absolute w-4 h-4 bg-white border-t-2 border-l-2 border-[#22C55E]/40 rotate-45 rounded-tl-sm"
                          style={{
                            left: `calc(${activeColIdx} * (100% / ${cols}) + (100% / ${cols} / 2) - 8px)`,
                          }}
                        />
                      </div>
                    )}

                    {/* Panel konten — tanpa header hijau */}
                    <div className="w-full bg-white rounded-2xl border-2 border-[#22C55E]/25 shadow-xl overflow-hidden">
                      <div className="p-4 sm:p-6">

                        {/* Header Jenjang Sekolah */}
                        <div className="mb-5 pb-4 border-b border-gray-100 flex items-center gap-3 sm:gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] rounded-xl flex items-center justify-center text-[#16A34A] shrink-0 border border-[#bbf7d0] shadow-sm">
                            <School size={26} />
                          </div>
                          <div>
                            <p className="text-[11px] sm:text-xs font-bold text-[#16A34A] uppercase tracking-wider mb-0.5">DETAIL INFORMASI {selected.nama}</p>
                            <h3 className="text-xl sm:text-2xl font-black text-[#111827] leading-tight tracking-tight">
                              {getSchoolName(selected.nama)}
                            </h3>
                          </div>
                        </div>

                        {/* Tab bar */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {TABS.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id)}
                              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                                ? "bg-gradient-to-br from-[#22C55E] to-[#15803D] text-white shadow-md shadow-green-500/20"
                                : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E5E7EB]"
                                }`}
                            >
                              {tab.icon} {tab.label}
                            </button>
                          ))}
                        </div>

                        {/* Tab content */}
                        <div className="w-full min-h-[260px]">

                          {/* PERSYARATAN */}
                          {activeTab === "persyaratan" && (
                            <div className="animate-in fade-in duration-300">
                              {selected.persyaratan.length === 0
                                ? <p className="text-[#9CA3AF] italic text-sm">Data belum tersedia.</p>
                                : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selected.persyaratan.map((item: any) => (
                                      <div key={item.id} className="flex gap-3 p-4 bg-[#F0FDF4] rounded-xl border border-[#D1FAE5] hover:border-[#16A34A]/40 transition-colors">
                                        <CheckCircle size={18} className={`shrink-0 mt-0.5 ${item.isImportant ? "text-amber-500" : "text-[#16A34A]"}`} />
                                        <div>
                                          <p className="text-[#374151] text-sm leading-relaxed">{item.deskripsi}</p>
                                          {item.isImportant && (
                                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-md">
                                              <Info size={9} /> Wajib
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              }
                            </div>
                          )}

                          {/* BIAYA */}
                          {activeTab === "biaya" && (
                            <div className="animate-in fade-in duration-300 w-full overflow-x-auto">
                              <HomeBiayaPendidikan selectedJenjangName={selected.nama} />
                            </div>
                          )}

                          {/* TARGET */}
                          {activeTab === "target" && (
                            <div className="animate-in fade-in duration-300">
                              {selected.target.length === 0
                                ? <p className="text-[#9CA3AF] italic text-sm">Data belum tersedia.</p>
                                : (
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {selected.target.map((item: any) => (
                                      <li key={item.id} className="flex items-start gap-3 p-4 bg-[#F0FDF4] rounded-xl border border-[#D1FAE5]">
                                        <TargetIcon size={18} className="shrink-0 mt-0.5 text-[#16A34A]" />
                                        <span className="text-[#374151] text-sm leading-relaxed">{item.deskripsi}</span>
                                      </li>
                                    ))}
                                  </ul>
                                )
                              }
                            </div>
                          )}

                          {/* GURU */}
                          {activeTab === "guru" && (
                            <div className="animate-in fade-in duration-300">
                              {selected.guru.length === 0
                                ? <p className="text-[#9CA3AF] italic text-sm">Data belum tersedia.</p>
                                : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {selected.guru.map((item: any) => (
                                      <div key={item.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#22C55E] to-[#15803D] flex items-center justify-center text-white overflow-hidden shrink-0">
                                          {item.foto
                                            ? <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" />
                                            : <Users size={18} />
                                          }
                                        </div>
                                        <div className="min-w-0">
                                          <p className="font-bold text-[#111827] text-sm truncate">{item.nama}</p>
                                          <p className="text-[10px] font-semibold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded mt-0.5 truncate uppercase tracking-wide border border-[#D1FAE5] inline-block">
                                            {item.jabatan}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )
                              }
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gap antar baris */}
                {rowIdx < rows.length - 1 && <div className="h-4 sm:h-5 lg:h-6" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
