"use client";

import { useState, useEffect } from "react";
import { Eye, ListChecks, Target, ChevronDown, ChevronUp } from "lucide-react";

interface VisiMisiData {
  visi: { id: string; konten: string } | null;
  misi: { id: string; teks: string; urutan: number }[];
  tujuan: { id: string; teks: string; urutan: number }[];
}

export default function HomeVisiMisi() {
  const [data, setData] = useState<VisiMisiData>({ visi: null, misi: [], tujuan: [] });
  const [loading, setLoading] = useState(true);
  
  // States for "Show More" toggles
  const [showAllMisi, setShowAllMisi] = useState(false);
  const [showAllTujuan, setShowAllTujuan] = useState(false);

  const handleToggleMisi = () => {
    if (showAllMisi) {
      setShowAllMisi(false);
      setTimeout(() => document.getElementById("misi-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else setShowAllMisi(true);
  };

  const handleToggleTujuan = () => {
    if (showAllTujuan) {
      setShowAllTujuan(false);
      setTimeout(() => document.getElementById("tujuan-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } else setShowAllTujuan(true);
  };

  useEffect(() => {
    fetch("/api/visi-misi")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data.visi && data.misi.length === 0 && data.tujuan.length === 0) return null;

  const displayedMisi = showAllMisi ? data.misi : data.misi.slice(0, 5);
  const displayedTujuan = showAllTujuan ? data.tujuan : data.tujuan.slice(0, 5);

  return (
    <section id="visi-misi" className="bg-white py-14 sm:py-20 md:py-28 px-4 sm:px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#F0FDF4] border border-green-100 rounded-full text-[#16A34A] text-xs sm:text-sm font-semibold shadow-sm">
            <Eye size={14} />
            Visi, Misi &amp; Tujuan Kami
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#111827] mb-3 sm:mb-4">
            Fondasi Pendidikan
            <span className="text-[#16A34A]"> Kami</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed px-4">
            Dengan visi, misi, dan tujuan yang jelas, kami berkomitmen untuk mencetak generasi terbaik yang siap menghadapi tantangan zaman.
          </p>
        </div>

        {/* VISI - FULL WIDTH */}
        {data.visi && (
          <div className="max-w-4xl mx-auto mb-8 sm:mb-10">
            <div className="group relative bg-gradient-to-br from-[#14532D] to-[#16A34A] rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-white/20 shrink-0">
                  <Eye size={28} className="text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-5 text-white tracking-tight">Visi</h3>
                <p className="text-green-50/90 text-base sm:text-lg lg:text-xl leading-relaxed font-medium max-w-3xl">
                  &quot;{data.visi.konten}&quot;
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2-COLUMN GRID: MISI & TUJUAN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch max-w-5xl mx-auto">
          
          {/* MISI */}
          {data.misi.length > 0 && (
            <div id="misi-card" className="bg-[#F0FDF4] h-full flex flex-col rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-green-100 scroll-mt-24">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-md shrink-0">
                <ListChecks size={24} className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] mb-5 tracking-tight text-left">Misi</h3>
              <ul className="space-y-4 flex-1">
                {displayedMisi.map((item, idx) => (
                  <li key={item.id} className="flex items-start gap-4 group/item">
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {idx + 1}
                    </span>
                    <p className={`flex-1 min-w-0 text-gray-700 text-sm sm:text-base leading-relaxed font-medium text-left break-words break-all transition-all duration-300 ${!showAllMisi ? 'line-clamp-3' : ''}`}>
                      {item.teks}
                    </p>
                  </li>
                ))}
              </ul>
              
              {data.misi.length > 5 && (
                <button 
                  onClick={handleToggleMisi}
                  className="mt-6 flex items-center gap-2 text-[#16A34A] font-bold text-sm hover:text-[#15803D] transition-colors bg-white/50 px-4 py-2 rounded-xl self-start"
                >
                  {showAllMisi ? (
                    <><ChevronUp size={18} /> Tampilkan Lebih Sedikit</>
                  ) : (
                    <><ChevronDown size={18} /> Tampilkan {data.misi.length - 5} Misi Lainnya</>
                  )}
                </button>
              )}
            </div>
          )}

          {/* TUJUAN */}
          {data.tujuan.length > 0 && (
            <div id="tujuan-card" className="bg-white h-full flex flex-col rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 scroll-mt-24">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-md shrink-0">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] mb-5 tracking-tight text-left">Tujuan</h3>
              <ul className="space-y-4 flex-1">
                {displayedTujuan.map((item) => (
                  <li key={item.id} className="flex items-start gap-4 group/item">
                    <span className="mt-2.5 flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400"></span>
                    <p className={`flex-1 min-w-0 text-gray-700 text-sm sm:text-base leading-relaxed font-medium text-left break-words break-all transition-all duration-300 ${!showAllTujuan ? 'line-clamp-3' : ''}`}>
                      {item.teks}
                    </p>
                  </li>
                ))}
              </ul>
              
              {data.tujuan.length > 5 && (
                <button 
                  onClick={handleToggleTujuan}
                  className="mt-6 flex items-center gap-2 text-orange-500 font-bold text-sm hover:text-orange-600 transition-colors bg-orange-50 px-4 py-2 rounded-xl self-start"
                >
                  {showAllTujuan ? (
                    <><ChevronUp size={18} /> Tampilkan Lebih Sedikit</>
                  ) : (
                    <><ChevronDown size={18} /> Tampilkan {data.tujuan.length - 5} Tujuan Lainnya</>
                  )}
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
