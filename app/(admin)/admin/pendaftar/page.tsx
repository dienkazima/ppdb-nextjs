"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { ChevronDown, Printer, FileText, FileSpreadsheet, Download } from "lucide-react";
import { generateMultipleFormulirPDF, generateBlankFormulirPDF } from "@/lib/pdfGenerator";

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jenjangs, setJenjangs] = useState<string[]>([]);
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("isLogin");
    router.push("/");
  };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const handleDelete = async (id: string) => {

    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Data pendaftar akan dihapus permanen",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    await fetch(`/api/pendaftar/${id}`, {
      method: "DELETE",
    });

    await Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Data berhasil dihapus",
      timer: 1500,
      showConfirmButton: false
    });

    fetchData();

  };

  const exportExcel = () => {

    const exportData = data.map((item, index) => ({
      No: (page - 1) * 5 + index + 1,
      Nama: item.nama,
      Jenjang: item.jenjang,
      "Jenis Kelamin": item.jenisKelamin,
      "Tanggal Daftar": new Date(item.createdAt).toLocaleDateString("id-ID")
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Pendaftar");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const fileData = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
    });

    saveAs(fileData, "data-pendaftar.xlsx");
  };
  const cetakSemuaPDF = async () => {
    setIsPrinting(true);
    setIsExportMenuOpen(false);
    
    Swal.fire({
      title: "Menyiapkan PDF...",
      text: "Mohon tunggu, sedang merender data pendaftar.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const res = await fetch(`/api/pendaftar/all?jenjang=${filter}&status=${statusFilter}&search=${search}`);
      const result = await res.json();
      
      if (!result.data || result.data.length === 0) {
        Swal.fire("Gagal", "Tidak ada data untuk dicetak pada filter saat ini", "error");
        setIsPrinting(false);
        return;
      }
      
      const fileName = `Data-Pendaftar-${filter !== 'Semua' ? filter : 'Semua'}-${statusFilter !== 'Semua' ? statusFilter : 'Semua'}`;
      await generateMultipleFormulirPDF(result.data, fileName);
      
      Swal.close();
    } catch(err) {
      console.error(err);
      Swal.fire("Error", "Gagal melakukan cetak PDF", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  const cetakKosongPDF = async (jenjang: string) => {
    setIsPrinting(true);
    setIsExportMenuOpen(false);

    Swal.fire({
      title: "Menyiapkan Form Kosong...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const res = await fetch(`/api/jenjang`);
      const allJenjang = await res.json();
      
      let persyaratanData: any[] = [];
      const match = allJenjang.find((j: any) => 
        j.nama.toLowerCase() === jenjang.toLowerCase() ||
        j.nama.toLowerCase().includes(jenjang.toLowerCase()) ||
        jenjang.toLowerCase().includes(j.nama.toLowerCase())
      );

      if (match && match.persyaratan) {
        persyaratanData = match.persyaratan;
      }

      await generateBlankFormulirPDF(jenjang, persyaratanData);
      Swal.close();
    } catch(err) {
      console.error(err);
      Swal.fire("Error", "Gagal mencetak form kosong", "error");
    } finally {
      setIsPrinting(false);
    }
  };

  const fetchData = async () => {
    const res = await fetch(`/api/pendaftar?page=${page}&search=${search}`)
    const result = await res.json();

    setData(result.data);
    setTotalPages(result.totalPages);

  };

  useEffect(() => {
    // Fetch daftar jenjang dari DB (single source of truth)
    fetch("/api/jenjang")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setJenjangs(data.map((j: any) => j.nama));
      })
      .catch(() => {});

    const isLogin = localStorage.getItem("isLogin");
    if (!isLogin) {
      router.push("/login");
      return;
    }

    const checkLogin = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const result = await res.json();
          if (result.authenticated) {
            setUser(result.user);
            if (result.user.role === "PANITIA" && result.user.jenjang) {
               setFilter(result.user.jenjang);
            }
          } else {
            router.push("/login");
            return;
          }
        } else {
          router.push("/login");
          return;
        }
      } catch (e) {
        console.error(e);
      }
      fetchData();
    };

    checkLogin();
  }, [page, search]);

  const filteredData = data.filter((item) => {
    const matchSearch = item.nama
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchFilter =
      filter === "Semua" ? true : (item.jenjang || "").toLowerCase().includes(filter.toLowerCase());
    const matchStatus =
      statusFilter === "Semua" ? true : item.status === statusFilter;

    return matchSearch && matchFilter && matchStatus;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-[100vw] lg:max-w-7xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 mb-2">
            Manajemen Pendaftar
          </h1>
          <p className="text-slate-500">
            Kelola, verifikasi, dan ekspor data calon peserta didik baru.
          </p>
        </div>

        {/* EXPORT DROP DOWN */}
        <div className="relative z-50">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            disabled={isPrinting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all font-medium shadow-sm hover:shadow disabled:opacity-50"
          >
            <Download size={18} />
            {isPrinting ? "Memproses..." : "Download / Cetak"}
            <ChevronDown size={16} className={`transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isExportMenuOpen && (
            <>
              {/* Backdrop untuk menutup menu */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsExportMenuOpen(false)}
              ></div>
              
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  <p className="px-3 py-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">Aksi Massal</p>
                  
                  <button 
                    onClick={exportExcel}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 font-medium hover:bg-slate-50 hover:text-green-600 rounded-xl transition-colors text-left"
                  >
                    <FileSpreadsheet size={16} />
                    Export Excel (.xlsx)
                  </button>
                  
                  <button 
                    onClick={cetakSemuaPDF}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-700 font-medium hover:bg-slate-50 hover:text-red-600 rounded-xl transition-colors text-left"
                  >
                    <Printer size={16} />
                    Cetak Semua (PDF)
                  </button>

                  <div className="h-px bg-slate-100 my-2 mx-2"></div>
                  
                  <p className="px-3 py-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">Cetak Form Kosong</p>
                  
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {["TK", "SD", "SMP", "SMA"]
                      .filter(j => user?.role === "ADMIN" || (user?.jenjang || "").toLowerCase() === j.toLowerCase())
                      .map(j => (
                      <button 
                        key={j}
                        onClick={() => cetakKosongPDF(j)}
                        className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-bold bg-slate-50 text-slate-600 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 hover:text-blue-700 rounded-lg transition-all"
                      >
                        <FileText size={14} />
                        {j}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 flex flex-col md:flex-row gap-2">

        {/* SEARCH */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Cari nama pendaftar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-700 bg-slate-50 border-transparent focus:bg-white rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* SEPARATOR */}
        <div className="hidden md:block w-px bg-slate-100 my-1 mx-1"></div>

        {/* FILTER JENJANG — dinamis dari DB */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={user?.role === "PANITIA"}
          className={`md:w-40 px-4 py-2.5 text-sm text-slate-700 bg-slate-50 border-transparent focus:bg-white rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none text-center ${user?.role === "PANITIA" ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {user?.role === "PANITIA" ? (
            <option value={user.jenjang}>{user.jenjang}</option>
          ) : (
            <>
              <option value="Semua">Semua Jenjang</option>
              {jenjangs.map(nama => (
                <option key={nama} value={nama}>{nama}</option>
              ))}
            </>
          )}
        </select>

        {/* FILTER STATUS */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="md:w-44 px-4 py-2.5 text-sm text-slate-700 bg-slate-50 border-transparent focus:bg-white rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none text-center"
        >
          <option value="Semua">Semua Status</option>
          <option value="Menunggu">Menunggu</option>
          <option value="Diterima">Diterima</option>
          <option value="Ditolak">Ditolak</option>
        </select>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl w-16">No</th>
                <th className="px-6 py-4">No. Pend.</th>
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">Jenjang</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">L/P</th>
                <th className="px-6 py-4">Tanggal Daftar</th>
                <th className="px-6 py-4 text-center rounded-tr-2xl w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 text-slate-500">{(page - 1) * 5 + index + 1}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{item.noPendaftaran || "-"}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.nama}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide">
                      {item.jenjang}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "Menunggu" && (
                      <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ring-yellow-600/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                        Menunggu
                      </span>
                    )}
                    {item.status === "Diterima" && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ring-emerald-600/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Diterima
                      </span>
                    )}
                    {item.status === "Ditolak" && (
                      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ring-red-600/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Ditolak
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.jenisKelamin === "Laki-laki" ? "L" : (item.jenisKelamin === "Perempuan" ? "P" : "-")}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <a
                        href={`/admin/pendaftar/${item.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Detail"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </a>
                      {user?.role === "ADMIN" && (
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                      <svg className="w-12 h-12 mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-sm font-medium">Tidak ada data pendaftar yang ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER & PAGINATION */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
        <p className="text-sm text-slate-500">
          Menampilkan <span className="font-medium text-slate-700">{filteredData.length}</span> dari <span className="font-medium text-slate-700">{data.length}</span> data
        </p>

        <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            Prev
          </button>

          <div className="flex items-center px-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === i + 1
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/30"
                  : "text-slate-600 hover:bg-slate-50"
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}