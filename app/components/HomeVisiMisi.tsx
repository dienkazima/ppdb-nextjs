"use client";

import { useState, useEffect } from "react";
import { Eye, ListChecks, Target } from "lucide-react";

interface VisiMisiData {
  visi: { id: string; konten: string } | null;
  misi: { id: string; teks: string; urutan: number }[];
  tujuan: { id: string; teks: string; urutan: number }[];
}

export default function HomeVisiMisi() {
  const [data, setData] = useState<VisiMisiData>({ visi: null, misi: [], tujuan: [] });
  const [loading, setLoading] = useState(true);

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

        {/* 3-column grid: Visi | Misi | Tujuan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 items-start">

          {/* VISI */}
          {data.visi && (
            <div className="group relative bg-gradient-to-br from-[#14532D] to-[#16A34A] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-28 h-28 sm:w-32 sm:h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-sm border border-white/20">
                  <Eye size={24} className="text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold mb-4 sm:mb-5 text-white tracking-tight">Visi</h3>
                <p className="text-green-50/90 text-sm sm:text-base leading-relaxed font-medium">
                  {data.visi.konten}
                </p>
              </div>
            </div>
          )}

          {/* MISI */}
          {data.misi.length > 0 && (
            <div className="bg-[#F0FDF4] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_40px_rgba(22,163,74,0.1)] hover:-translate-y-1 transition-all duration-300 border border-green-100">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-md">
                <ListChecks size={24} className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] mb-4 sm:mb-6 tracking-tight">Misi</h3>
              <ul className="space-y-3 sm:space-y-4">
                {data.misi.map((item, idx) => (
                  <li key={item.id} className="flex items-start gap-3 sm:gap-4 group/item">
                    <span className="mt-0.5 flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                      {idx + 1}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed font-medium group-hover/item:text-gray-900 transition-colors">
                      {item.teks}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* TUJUAN */}
          {data.tujuan.length > 0 && (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_40px_rgba(22,163,74,0.1)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 md:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-md">
                <Target size={24} className="text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111827] mb-4 sm:mb-6 tracking-tight">Tujuan</h3>
              <ul className="space-y-3 sm:space-y-4">
                {data.tujuan.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 sm:gap-4 group/item">
                    <span className="mt-2 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-yellow-400 shrink-0"></span>
                    <p className="text-gray-700 text-sm leading-relaxed font-medium group-hover/item:text-gray-900 transition-colors">
                      {item.teks}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
