"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, X, DollarSign, Info } from "lucide-react";
import Swal from "sweetalert2";

export default function AdminBiayaPendidikan() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  const [catatanData, setCatatanData] = useState<any[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [formCatatan, setFormCatatan] = useState<any>({});
  const [isCatatanModalOpen, setIsCatatanModalOpen] = useState(false);
  const [isCatEditing, setIsCatEditing] = useState(false);
  const [isCatSaving, setIsCatSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setCatLoading(true);
    try {
      const [resBiaya, resCat] = await Promise.all([
        fetch("/api/biaya-pendidikan"),
        fetch("/api/biaya/catatan")
      ]);
      if (resBiaya.ok) setData(await resBiaya.json());
      if (resCat.ok) setCatatanData(await resCat.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setCatLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (item: any = null) => {
    setIsEditing(!!item);
    setFormData(item || {
      jenisPembayaran: "", uraian: "",
      tkLk: "", tkPr: "", sdLk: "", sdPr: "",
      smpLk: "", smpPr: "", smaLk: "", smaPr: "",
      keterangan: ""
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = isEditing ? `/api/biaya-pendidikan/${formData.id}` : "/api/biaya-pendidikan";
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Gagal menyimpan data");
      Swal.fire("Berhasil", "Data berhasil disimpan", "success");
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({
      title: "Hapus biaya ini?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus"
    });
    if (res.isConfirmed) {
      try {
        const delRes = await fetch(`/api/biaya-pendidikan/${id}`, { method: "DELETE" });
        if (delRes.ok) {
          Swal.fire("Terhapus!", "Data telah dihapus.", "success");
          fetchData();
        }
      } catch {
        Swal.fire("Gagal", "Terjadi kesalahan", "error");
      }
    }
  };

  const openCatatanModal = (item: any = null) => {
    setIsCatEditing(!!item);
    setFormCatatan(item || { isi: "", urutan: "" });
    setIsCatatanModalOpen(true);
  };

  const handleSaveCatatan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCatSaving(true);
    try {
      const url = isCatEditing ? `/api/biaya/catatan/${formCatatan.id}` : "/api/biaya/catatan";
      const method = isCatEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCatatan)
      });
      if (!res.ok) throw new Error("Gagal menyimpan catatan");
      Swal.fire("Berhasil", "Catatan berhasil disimpan", "success");
      setIsCatatanModalOpen(false);
      fetchData();
    } catch (error: any) {
      Swal.fire("Gagal", error.message, "error");
    } finally {
      setIsCatSaving(false);
    }
  };

  const handleDeleteCatatan = async (id: string) => {
    const res = await Swal.fire({
      title: "Hapus catatan ini?",
      text: "Data tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus"
    });
    if (res.isConfirmed) {
      try {
        const delRes = await fetch(`/api/biaya/catatan/${id}`, { method: "DELETE" });
        if (delRes.ok) {
          Swal.fire("Terhapus!", "Catatan telah dihapus.", "success");
          fetchData();
        }
      } catch {
        Swal.fire("Gagal", "Terjadi kesalahan", "error");
      }
    }
  };

  const handleNumberChange = (field: string, value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setFormData({ ...formData, [field]: numericValue ? parseInt(numericValue, 10) : "" });
  };

  const formatRupiah = (value: any) => {
    if (!value && value !== 0) return "";
    const num = parseInt(value.toString().replace(/\D/g, ""), 10);
    return isNaN(num) ? "" : num.toLocaleString("id-ID");
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">Biaya Pendidikan (Global)</h1>
          <p className="text-slate-500 mt-2">Kelola tabel biaya pendidikan multi-level secara terpusat.</p>
        </div>
        <button onClick={() => openModal()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <Plus size={20} /> Tambah Biaya Baru
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1200px] text-xs md:text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm border-b border-slate-200">
            <tr className="text-slate-600 text-[10px] md:text-xs uppercase tracking-wide">
              <th className="px-4 py-3 font-bold w-1/4">Kategori & Uraian</th>
              <th className="px-4 py-3 font-bold text-center">TK</th>
              <th className="px-4 py-3 font-bold text-center">SD</th>
              <th className="px-4 py-3 font-bold text-center">SMP</th>
              <th className="px-4 py-3 font-bold text-center">SMA</th>
              <th className="px-4 py-3 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center p-10"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center p-10 text-slate-500">Belum ada data biaya.</td></tr>
            ) : (
              data.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2">
                    <div className="font-extrabold text-slate-800 text-sm md:text-base">{item.jenisPembayaran}</div>
                    {item.uraian && <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full shrink-0"></div>
                      {item.uraian}
                    </div>}
                  </td>
                  <td className="px-3 py-2 text-center text-[10px] md:text-xs align-top">
                    <div className="bg-yellow-50 text-yellow-700 py-1 px-2 rounded font-semibold border border-yellow-100 mb-1">LK: {formatRupiah(item.tkLk) || '-'}</div>
                    <div className="bg-yellow-50 text-yellow-700 py-1 px-2 rounded font-semibold border border-yellow-100">PR: {formatRupiah(item.tkPr) || '-'}</div>
                  </td>
                  <td className="px-3 py-2 text-center text-[10px] md:text-xs align-top">
                    <div className="bg-pink-50 text-pink-700 py-1 px-2 rounded font-semibold border border-pink-100 mb-1">LK: {formatRupiah(item.sdLk) || '-'}</div>
                    <div className="bg-pink-50 text-pink-700 py-1 px-2 rounded font-semibold border border-pink-100">PR: {formatRupiah(item.sdPr) || '-'}</div>
                  </td>
                  <td className="px-3 py-2 text-center text-[10px] md:text-xs align-top">
                    <div className="bg-blue-50 text-blue-700 py-1 px-2 rounded font-semibold border border-blue-100 mb-1">LK: {formatRupiah(item.smpLk) || '-'}</div>
                    <div className="bg-blue-50 text-blue-700 py-1 px-2 rounded font-semibold border border-blue-100">PR: {formatRupiah(item.smpPr) || '-'}</div>
                  </td>
                  <td className="px-3 py-2 text-center text-[10px] md:text-xs align-top">
                    <div className="bg-slate-100 text-slate-700 py-1 px-2 rounded font-semibold border border-slate-200 mb-1">LK: {formatRupiah(item.smaLk) || '-'}</div>
                    <div className="bg-slate-100 text-slate-700 py-1 px-2 rounded font-semibold border border-slate-200">PR: {formatRupiah(item.smaPr) || '-'}</div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={() => openModal(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── MANAJEMEN CATATAN ── */}
      <div className="mt-12 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center border border-blue-200/50">
              <Info size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Catatan Khusus Biaya</h2>
              <p className="text-slate-500 text-sm mt-0.5">Teks keterangan penting di bawah tabel Rincian pada sistem pendaftaran user.</p>
            </div>
          </div>
          <button onClick={() => openCatatanModal()} className="px-5 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex justify-center items-center gap-2 whitespace-nowrap shadow-sm">
            <Plus size={18} /> Tambah Catatan Tambahan
          </button>
        </div>
        
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[600px]">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr className="text-slate-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-3 font-bold w-16 text-center">No</th>
                <th className="px-6 py-3 font-bold">Isi Catatan</th>
                <th className="px-6 py-3 font-bold w-32 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {catLoading ? (
                <tr><td colSpan={3} className="text-center p-8"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
              ) : catatanData.length === 0 ? (
                <tr><td colSpan={3} className="text-center p-8 text-slate-400 font-medium bg-slate-50/30">Belum ada catatan biaya. Tampilan user tidak akan me-render area catatan.</td></tr>
              ) : (
                catatanData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <span className="w-6 h-6 inline-flex items-center justify-center bg-slate-100 text-slate-600 font-bold rounded text-xs border border-slate-200">{item.urutan}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium leading-relaxed">{item.isi}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 justify-center">
                        <button onClick={() => openCatatanModal(item)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors shadow-sm"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteCatatan(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 leading-tight">{isEditing ? "Edit Biaya Pendidikan" : "Tambah Biaya Baru"}</h2>
                  <p className="text-slate-500 text-sm">Lengkapi rincian biaya untuk seluruh jenjang di bawah ini.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2.5 rounded-full cursor-pointer transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto w-full custom-scrollbar">
              <form id="biayaForm" onSubmit={handleSave} className="space-y-8 w-full">
                
                {/* Informasi Dasar */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden w-full">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Jenis Pembayaran (Kategori) <span className="text-red-500">*</span></label>
                    <input 
                      type="text" required 
                      value={formData.jenisPembayaran} 
                      onChange={e => setFormData({...formData, jenisPembayaran: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-800 font-medium" 
                      placeholder="Cth: Seragam Sekolah" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Uraian / Sub Detail <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <input 
                      type="text" 
                      value={formData.uraian || ""} 
                      onChange={e => setFormData({...formData, uraian: e.target.value})} 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-slate-800 font-medium" 
                      placeholder="Cth: Merah Putih, Pramuka..." 
                    />
                  </div>
                </div>

                {/* TK Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
                  <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex items-center gap-3">
                    <div className="w-2 h-8 bg-yellow-400 rounded-full"></div>
                    <h3 className="font-extrabold text-yellow-800 text-lg">Biaya Jenjang TK</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Laki-Laki</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                        <input type="text" value={formatRupiah(formData.tkLk)} onChange={e => handleNumberChange("tkLk", e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-sm text-lg font-semibold text-slate-800" placeholder="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Perempuan</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                        <input type="text" value={formatRupiah(formData.tkPr)} onChange={e => handleNumberChange("tkPr", e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-sm text-lg font-semibold text-slate-800" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SD Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
                  <div className="bg-pink-50 px-6 py-4 border-b border-pink-100 flex items-center gap-3">
                    <div className="w-2 h-8 bg-pink-400 rounded-full"></div>
                    <h3 className="font-extrabold text-pink-800 text-lg">Biaya Jenjang SD</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Laki-Laki</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                        <input type="text" value={formatRupiah(formData.sdLk)} onChange={e => handleNumberChange("sdLk", e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all shadow-sm text-lg font-semibold text-slate-800" placeholder="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Perempuan</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                        <input type="text" value={formatRupiah(formData.sdPr)} onChange={e => handleNumberChange("sdPr", e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all shadow-sm text-lg font-semibold text-slate-800" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SMP Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
                  <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                    <h3 className="font-extrabold text-blue-800 text-lg">Biaya Jenjang SMP</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Laki-Laki</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                        <input type="text" value={formatRupiah(formData.smpLk)} onChange={e => handleNumberChange("smpLk", e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-lg font-semibold text-slate-800" placeholder="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Perempuan</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                        <input type="text" value={formatRupiah(formData.smpPr)} onChange={e => handleNumberChange("smpPr", e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm text-lg font-semibold text-slate-800" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SMA Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden w-full">
                  <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
                    <div className="w-2 h-8 bg-slate-500 rounded-full"></div>
                    <h3 className="font-extrabold text-slate-800 text-lg">Biaya Jenjang SMA</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Laki-Laki</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                        <input type="text" value={formatRupiah(formData.smaLk)} onChange={e => handleNumberChange("smaLk", e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all shadow-sm text-lg font-semibold text-slate-800" placeholder="0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Perempuan</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">Rp</span>
                        <input type="text" value={formatRupiah(formData.smaPr)} onChange={e => handleNumberChange("smaPr", e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all shadow-sm text-lg font-semibold text-slate-800" placeholder="0" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* KETERANGAN */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden w-full">
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Keterangan Tambahan <span className="text-slate-400 font-normal">(Opsional)</span></label>
                    <textarea value={formData.keterangan || ""} onChange={e => setFormData({...formData, keterangan: e.target.value})} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm text-slate-800 font-medium" placeholder="Tuliskan keterangan detail di sini..."></textarea>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 flex flex-col md:flex-row gap-4 bg-white sticky bottom-0 justify-end w-full">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3.5 font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 transition-all w-full md:w-auto">Batal</button>
              <button form="biayaForm" type="submit" disabled={isSaving} className="px-10 py-3.5 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] transition-all flex justify-center items-center w-full md:w-auto">
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Simpan Data"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CATATAN */}
      {isCatatanModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col scale-100 relative ring-1 ring-white/10">
            <div className="bg-slate-50 p-5 px-6 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex justify-center items-center"><Info size={16}/></div>
                <h2 className="text-lg font-extrabold text-slate-800">{isCatEditing ? "Edit Catatan" : "Tambah Catatan Tambahan"}</h2>
              </div>
              <button type="button" onClick={() => setIsCatatanModalOpen(false)} className="w-8 h-8 bg-white border border-slate-200 text-slate-400 hover:text-red-500 rounded-full flex justify-center items-center transition-colors shadow-sm"><X size={18} /></button>
            </div>
            
            <form id="catatanForm" onSubmit={handleSaveCatatan} className="p-6 space-y-5 bg-white">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Isi Catatan <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={4}
                  value={formCatatan.isi || ""}
                  onChange={e => setFormCatatan({...formCatatan, isi: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-[13px] md:text-sm resize-none font-medium text-slate-800"
                  placeholder="Contoh: Pembayaran pendaftaran tidak dapat ditarik kembali apabila siswa mengundurkan diri."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Urutan (Opsional)</label>
                <input 
                  type="number" 
                  value={formCatatan.urutan || ""}
                  onChange={e => setFormCatatan({...formCatatan, urutan: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm font-medium text-slate-800"
                  placeholder="Kosongkan untuk menyisipkan otomatis di bagian akhir"
                />
              </div>
            </form>
            
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
              <button type="button" onClick={() => setIsCatatanModalOpen(false)} className="px-5 py-2.5 font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all shadow-sm">Batal</button>
              <button form="catatanForm" type="submit" disabled={isCatSaving} className="px-7 py-2.5 font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all flex items-center justify-center gap-2">
                {isCatSaving ? <Loader2 className="animate-spin" size={16} /> : "Simpan Catatan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}
