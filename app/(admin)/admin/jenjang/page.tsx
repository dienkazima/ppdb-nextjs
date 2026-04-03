"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader2, X, Settings, GraduationCap, BookOpen, Library, School, Building } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

interface Jenjang {
  id: string;
  nama: string;
  deskripsi: string;
  icon: string;
}

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap size={40} className="text-blue-500" />,
  BookOpen: <BookOpen size={40} className="text-blue-500" />,
  Library: <Library size={40} className="text-blue-500" />,
  School: <School size={40} className="text-blue-500" />,
  Building: <Building size={40} className="text-blue-500" />
};

export default function AdminJenjangPage() {
  const [jenjangs, setJenjangs] = useState<Jenjang[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ id: "", nama: "", deskripsi: "", icon: "GraduationCap" });
  const [isSaving, setIsSaving] = useState(false);

  // Settings State
  const [pengaturan, setPengaturan] = useState<any>(null);
  const [jenjangTerbuka, setJenjangTerbuka] = useState<string[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchPengaturan = async () => {
    try {
      const res = await fetch("/api/pengaturan");
      const data = await res.json();
      setPengaturan(data);
      if (data.jenjangTerbuka) {
        setJenjangTerbuka(data.jenjangTerbuka.split(',').filter(Boolean));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const toggleJenjangTerbuka = async (jnj: string) => {
    setSavingSettings(true);
    const newArr = jenjangTerbuka.includes(jnj) 
      ? jenjangTerbuka.filter(j => j !== jnj) 
      : [...jenjangTerbuka, jnj];
    
    setJenjangTerbuka(newArr);

    try {
      await fetch("/api/pengaturan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          bukaPendaftaran: pengaturan?.bukaPendaftaran ?? true,
          jenjangTerbuka: newArr.join(",") 
        })
      });
    } catch(err) {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan pengaturan", "error");
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchJenjangs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jenjang");
      const data = await res.json();
      if (Array.isArray(data)) {
        setJenjangs(data);
      } else {
        setJenjangs([]);
      }
    } catch (error) {
      console.error(error);
      setJenjangs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJenjangs();
    fetchPengaturan();
  }, []);

  const handleOpenModal = (jenjang?: Jenjang) => {
    if (jenjang) {
      setFormData(jenjang);
      setIsEditing(true);
    } else {
      setFormData({ id: "", nama: "", deskripsi: "", icon: "GraduationCap" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSaving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const url = isEditing ? `/api/jenjang/${formData.id}` : "/api/jenjang";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Data tingkat pendidikan berhasil ${isEditing ? "diperbarui" : "ditambahkan"}.`,
          timer: 1500,
          showConfirmButton: false,
        });
        closeModal();
        fetchJenjangs();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan data");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message || "Terjadi kesalahan saat menyimpan data", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Semua data terkait jenjang ini (persyaratan, biaya, target, guru) akan ikut terhapus!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/jenjang/${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
          fetchJenjangs();
        } else {
          throw new Error("Gagal menghapus");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus jenjang", "error");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-indigo-600 mb-2">
            Manajemen Jenjang Pendidikan
          </h1>
          <p className="text-slate-500">Kelola daftar jenjang pendidikan dan lengkapi detail persyaratan, biaya, serta fasilitasnya.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/30 transition-all cursor-pointer"
        >
          <Plus size={18} /> Tambah Jenjang
        </button>
      </div>

      {/* Pengaturan Jenjang Terbuka */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 animate-in fade-in slide-in-from-top-4">
        <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          <Settings size={20} className="text-blue-500" /> Pengaturan Pendaftaran Jenjang
        </h2>
        <p className="text-slate-500 mb-4 text-sm max-w-3xl">
          Pilih jenjang pendidikan mana saja yang saat ini <b>sedang dibuka</b> untuk pendaftaran siswa baru. Jenjang yang tidak dicentang akan <b>disembunyikan otomatis</b> dari formulir pendaftaran peserta didik di halaman publik.
        </p>

        <div className="flex flex-wrap gap-4">
          {jenjangs.map(jnj => (
            <label key={jnj.nama} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all select-none shadow-sm ${jenjangTerbuka.includes(jnj.nama) ? 'bg-blue-50 border-blue-500 shadow-blue-500/10' : 'bg-slate-50 border-slate-200 hover:border-blue-300'}`}>
              <input
                type="checkbox"
                checked={jenjangTerbuka.includes(jnj.nama)}
                onChange={() => toggleJenjangTerbuka(jnj.nama)}
                disabled={savingSettings}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              <span className={`font-bold ${jenjangTerbuka.includes(jnj.nama) ? 'text-blue-700' : 'text-slate-600'}`}>{jnj.nama}</span>
            </label>
          ))}
          {jenjangs.length === 0 && (
            <p className="text-sm text-slate-400 italic">Belum ada jenjang. Tambahkan jenjang terlebih dahulu.</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : jenjangs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <School size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Belum ada jenjang pendidikan</h2>
          <p className="text-slate-500 mb-6">Mulai tambahkan jenjang pendidikan seperti PAUD, SD/MI, dll.</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold px-6 py-2.5 rounded-xl transition-colors inline-block cursor-pointer"
          >
            Tambah Jenjang Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jenjangs.map((j) => (
            <div key={j.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="p-6 flex-1 flex flex-col">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600 border border-blue-100">
                  {iconMap[j.icon] || <School size={32} />}
                </div>
                <h3 className="font-bold text-slate-800 text-xl mb-2">{j.nama}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-1 line-clamp-3">
                  {j.deskripsi}
                </p>
                
                <div className="space-y-3 mt-auto">
                  <Link href={`/admin/jenjang/${j.id}`} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20">
                    <Settings size={16} /> Kelola Detail Konten
                  </Link>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(j)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-3 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-100 hover:border-blue-200"
                    >
                      <Edit size={16} /> Edit Info
                    </button>
                    <button
                      onClick={() => handleDelete(j.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-2 rounded-xl text-sm font-semibold transition-colors border border-slate-100 hover:border-red-200"
                    >
                      <Trash2 size={16} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {isEditing ? "Edit Jenjang" : "Tambah Jenjang Baru"}
              </h2>
              <button 
                onClick={closeModal} 
                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Jenjang (MISAL: PAUD, SD/MI)</label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="Contoh: SD / MI"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi Singkat</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                    placeholder="Deskripsi singkat tentang pendidikan tingkat ini..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Pilih Icon Library</label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="GraduationCap">Graduation Cap (Topi Toga)</option>
                    <option value="School">School (Gedung Sekolah)</option>
                    <option value="Building">Building (Bangunan Universitas)</option>
                    <option value="BookOpen">Book Open (Buku Terbuka)</option>
                    <option value="Library">Library (Perpustakaan)</option>
                  </select>
                </div>

                <div className="pt-6 flex gap-3 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSaving}
                    className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 font-bold px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-4 py-3 rounded-xl shadow-md shadow-blue-500/30 transition-all disabled:opacity-50"
                  >
                     {isSaving ? <Loader2 size={18} className="animate-spin" /> : "Simpan Data"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
