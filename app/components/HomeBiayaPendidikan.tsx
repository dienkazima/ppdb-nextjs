"use client";

import { useEffect, useState } from "react";
import { Loader2, DollarSign, Info } from "lucide-react";

export default function HomeBiayaPendidikan({ selectedJenjangName }: { selectedJenjangName?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [catatanData, setCatatanData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBiaya = async () => {
      try {
        const [resBiaya, resCat] = await Promise.all([
          fetch("/api/biaya-pendidikan"),
          fetch("/api/biaya/catatan")
        ]);
        if (resBiaya.ok) {
          setData(await resBiaya.json());
        }
        if (resCat.ok) {
          setCatatanData(await resCat.json());
        }
      } catch (error) {
        console.error("Failed to fetch biaya pendidikan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBiaya();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#10B981]" size={40} />
      </div>
    );
  }

  if (data.length === 0) return null;

  const jenjangStr = (selectedJenjangName || "").toLowerCase();
  const isTK = jenjangStr.includes("tk") || jenjangStr.includes("paud");
  const isSD = jenjangStr.includes("sd") || jenjangStr.includes("mi");
  const isSMP = jenjangStr.includes("smp") || jenjangStr.includes("mts");
  const isSMA = jenjangStr.includes("sma") || jenjangStr.includes("ma");

  const showAll = !isTK && !isSD && !isSMP && !isSMA;
  
  const showTK = showAll || isTK;
  const showSD = showAll || isSD;
  const showSMP = showAll || isSMP;
  const showSMA = showAll || isSMA;

  // Filter out any rows that have NO nominals for the currently active jenjang
  const filteredData = data.filter((item) => {
    if (showAll) return true; // Keep everything if no specific jenjang selected
    if (showTK && (item.tkLk || item.tkPr)) return true;
    if (showSD && (item.sdLk || item.sdPr)) return true;
    if (showSMP && (item.smpLk || item.smpPr)) return true;
    if (showSMA && (item.smaLk || item.smaPr)) return true;
    return false;
  });

  if (filteredData.length === 0) {
    return (
      <div className="w-full p-8 text-center text-slate-500 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-200/60 font-medium">
        Belum ada rincian biaya untuk jenjang ini.
      </div>
    );
  }

  // Group by jenisPembayaran
  const groupedData: any[] = [];
  filteredData.forEach((item) => {
    const lastGroup = groupedData[groupedData.length - 1];
    if (lastGroup && lastGroup[0].jenisPembayaran === item.jenisPembayaran) {
      lastGroup.push(item);
    } else {
      groupedData.push([item]);
    }
  });

  // Calculate Totals purely based on the strictly filtered data
  const totals = {
    tkLk: filteredData.reduce((acc, curr) => acc + (curr.tkLk || 0), 0),
    tkPr: filteredData.reduce((acc, curr) => acc + (curr.tkPr || 0), 0),
    sdLk: filteredData.reduce((acc, curr) => acc + (curr.sdLk || 0), 0),
    sdPr: filteredData.reduce((acc, curr) => acc + (curr.sdPr || 0), 0),
    smpLk: filteredData.reduce((acc, curr) => acc + (curr.smpLk || 0), 0),
    smpPr: filteredData.reduce((acc, curr) => acc + (curr.smpPr || 0), 0),
    smaLk: filteredData.reduce((acc, curr) => acc + (curr.smaLk || 0), 0),
    smaPr: filteredData.reduce((acc, curr) => acc + (curr.smaPr || 0), 0),
  };

  const formatRp = (num: number | null) => (num ? `Rp ${num.toLocaleString("id-ID")}` : "-");
  
  // Highlight cell logic for numbers: centered text and light colorful background
  const getCellClass = (num: number | null, color: string) => {
    if (!num || num === 0) return "px-2 py-1 border-b border-slate-200 text-center text-slate-400 font-medium whitespace-nowrap";
    return `px-2 py-1 border-b border-slate-200 text-center font-bold text-slate-800 ${color} whitespace-nowrap`;
  };

  return (
    <div className="w-full overflow-hidden rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-200/60 bg-white animate-in fade-in zoom-in-95 duration-500">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="table-auto w-full text-left border-collapse min-w-max text-xs text-slate-600">
          <thead className="sticky top-0 z-20">
            {/* Row 1 */}
            <tr className="bg-emerald-600 text-white font-bold tracking-wide">
              <th className="px-2 py-1.5 text-center border-b border-emerald-700 uppercase" rowSpan={2}>NO</th>
              <th className="px-2 py-1.5 text-left border-b border-emerald-700 uppercase" rowSpan={2}>JENIS PEMBAYARAN</th>
              <th className="px-2 py-1.5 text-left border-b border-emerald-700 uppercase" rowSpan={2}>URAIAN</th>
              
              {showTK && <th className="bg-yellow-500 text-yellow-950 px-2 py-1.5 text-center uppercase tracking-wider" colSpan={2}>TK / PAUD</th>}
              {showSD && <th className="bg-pink-500 text-white px-2 py-1.5 text-center uppercase tracking-wider" colSpan={2}>SD / MI</th>}
              {showSMP && <th className="bg-blue-600 text-white px-2 py-1.5 text-center uppercase tracking-wider" colSpan={2}>SMP / MTs</th>}
              {showSMA && <th className="bg-slate-600 text-white px-2 py-1.5 text-center uppercase tracking-wider" colSpan={2}>SMA / MA</th>}
              
              <th className="px-2 py-1.5 text-center border-b border-emerald-700 uppercase" rowSpan={2}>KETERANGAN</th>
            </tr>
            {/* Row 2: LK & PR */}
            <tr>
              {showTK && <><th className="bg-yellow-400 text-yellow-950 px-2 py-1 text-center text-[10px] font-bold uppercase border-b border-yellow-600">Laki-laki</th>
              <th className="bg-yellow-400 text-yellow-950 px-2 py-1 text-center text-[10px] font-bold uppercase border-b border-yellow-600">Perempuan</th></>}
              
              {showSD && <><th className="bg-pink-400 text-white px-2 py-1 text-center text-[10px] font-bold uppercase border-b border-pink-600">Laki-laki</th>
              <th className="bg-pink-400 text-white px-2 py-1 text-center text-[10px] font-bold uppercase border-b border-pink-600">Perempuan</th></>}
              
              {showSMP && <><th className="bg-blue-500 text-white px-2 py-1 text-center text-[10px] font-bold uppercase border-b border-blue-700">Laki-laki</th>
              <th className="bg-blue-500 text-white px-2 py-1 text-center text-[10px] font-bold uppercase border-b border-blue-700">Perempuan</th></>}
              
              {showSMA && <><th className="bg-slate-500 text-white px-2 py-1 text-center text-[10px] font-bold uppercase border-b border-slate-700">Laki-laki</th>
              <th className="bg-slate-500 text-white px-2 py-1 text-center text-[10px] font-bold uppercase border-b border-slate-700">Perempuan</th></>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {groupedData.map((group, groupIdx) => (
              group.map((item: any, itemIdx: number) => {
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group/row">
                    {/* NO cell (rowSpan) */}
                    {itemIdx === 0 && (
                      <td className="px-2 py-1 border-b border-slate-200 text-center text-slate-500 font-extrabold align-top border-r border-slate-100 bg-white" rowSpan={group.length}>
                        {groupIdx + 1}
                      </td>
                    )}
                    
                    {/* JENIS PEMBAYARAN cell (rowSpan) */}
                    {itemIdx === 0 && (
                      <td className="px-2 py-1 border-b border-slate-200 font-extrabold text-slate-800 align-top bg-white border-r border-slate-100" rowSpan={group.length}>
                        {item.jenisPembayaran}
                      </td>
                    )}
                    
                    {/* URAIAN cell */}
                    <td className="px-3 py-1.5 border-b border-slate-200 text-slate-700 font-medium border-r border-slate-50/50 flex items-center gap-2">
                      <span className="w-1 h-1 bg-slate-400 rounded-full shrink-0 hidden md:block"></span>
                      {item.uraian || <span className="text-slate-300 italic">-</span>}
                    </td>
                    
                    {/* DATA cells */}
                    {showTK && <td className={getCellClass(item.tkLk, 'bg-yellow-50/50')}>{formatRp(item.tkLk)}</td>}
                    {showTK && <td className={getCellClass(item.tkPr, 'bg-yellow-50/50')}>{formatRp(item.tkPr)}</td>}
                    {showSD && <td className={getCellClass(item.sdLk, 'bg-pink-50/50')}>{formatRp(item.sdLk)}</td>}
                    {showSD && <td className={getCellClass(item.sdPr, 'bg-pink-50/50')}>{formatRp(item.sdPr)}</td>}
                    {showSMP && <td className={getCellClass(item.smpLk, 'bg-blue-50/50')}>{formatRp(item.smpLk)}</td>}
                    {showSMP && <td className={getCellClass(item.smpPr, 'bg-blue-50/50')}>{formatRp(item.smpPr)}</td>}
                    {showSMA && <td className={getCellClass(item.smaLk, 'bg-slate-50/50')}>{formatRp(item.smaLk)}</td>}
                    {showSMA && <td className={getCellClass(item.smaPr, 'bg-slate-50/50')}>{formatRp(item.smaPr)}</td>}
                    
                    {/* KETERANGAN cell */}
                    <td className="px-2 py-1 border-b border-slate-200 text-slate-500 text-[10px] md:text-xs leading-tight group-hover/row:text-slate-700 text-center align-middle">
                      {item.keterangan || <span className="text-slate-300">-</span>}
                    </td>
                  </tr>
                );
              })
            ))}
          </tbody>
          <tfoot className="font-extrabold text-xs">
            <tr className="bg-yellow-100 text-yellow-900 border-t border-yellow-300">
              <td className="px-2 py-1.5 text-center uppercase tracking-wider" colSpan={3}>
                TOTAL KESELURUHAN &nbsp;→
              </td>
              {showTK && <td className="px-2 py-1.5 text-center bg-yellow-300/40 whitespace-nowrap">{formatRp(totals.tkLk)}</td>}
              {showTK && <td className="px-2 py-1.5 text-center bg-yellow-300/40 whitespace-nowrap">{formatRp(totals.tkPr)}</td>}
              {showSD && <td className="px-2 py-1.5 text-center bg-yellow-300/40 whitespace-nowrap">{formatRp(totals.sdLk)}</td>}
              {showSD && <td className="px-2 py-1.5 text-center bg-yellow-300/40 whitespace-nowrap">{formatRp(totals.sdPr)}</td>}
              {showSMP && <td className="px-2 py-1.5 text-center bg-yellow-300/40 whitespace-nowrap">{formatRp(totals.smpLk)}</td>}
              {showSMP && <td className="px-2 py-1.5 text-center bg-yellow-300/40 whitespace-nowrap">{formatRp(totals.smpPr)}</td>}
              {showSMA && <td className="px-2 py-1.5 text-center bg-yellow-300/40 whitespace-nowrap">{formatRp(totals.smaLk)}</td>}
              {showSMA && <td className="px-2 py-1.5 text-center bg-yellow-300/40 whitespace-nowrap">{formatRp(totals.smaPr)}</td>}
              <td className="px-2 py-1.5 text-center"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* CATATAN BIAYA PENDIDIKAN SECTION */}
      {catatanData.length > 0 && (
        <div className="bg-sky-50/80 border-t border-sky-100 p-5 md:p-6 text-sky-800 text-left">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-8 h-8 rounded-full bg-sky-200/50 flex items-center justify-center border border-sky-200 text-sky-600 mt-0.5 shadow-sm">
              <Info size={16} strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h4 className="text-[11px] font-bold uppercase tracking-widest mb-2.5 text-sky-700/80">Catatan Penting</h4>
              {catatanData.length === 1 ? (
                <p className="text-[13px] md:text-sm font-medium leading-relaxed text-sky-900/90 whitespace-pre-line">{catatanData[0].isi}</p>
              ) : (
                <ul className="space-y-2.5 text-[13px] md:text-sm font-medium text-sky-900/90 w-full pr-2">
                  {catatanData.map((item) => (
                    <li key={item.id} className="flex gap-2.5 items-start">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shadow-sm"></span>
                      <span className="whitespace-pre-line leading-relaxed text-balance flex-1">{item.isi}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 0 0 12px 12px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
