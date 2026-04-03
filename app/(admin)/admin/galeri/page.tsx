"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Image as ImageIcon, Loader2, X, UploadCloud, Link as LinkIcon } from "lucide-react";
import Swal from "sweetalert2";

interface Gallery {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

export default function AdminGalleryPage() {
  const [images, setImages] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ id: "", title: "", category: "Fasilitas", imageUrl: "" });
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/galeri");
      const data = await res.json();
      if (Array.isArray(data)) {
        setImages(data);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error(error);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenModal = (img?: Gallery) => {
    if (img) {
      setFormData(img);
      setIsEditing(true);
      setUploadMethod("url");
      setPreviewUrl(img.imageUrl);
      setSelectedFile(null);
    } else {
      setFormData({ id: "", title: "", category: "Fasilitas", imageUrl: "" });
      setIsEditing(false);
      setUploadMethod("file");
      setPreviewUrl("");
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsSaving(false);
    setPreviewUrl("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData({ ...formData, imageUrl: "" }); 
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData({ ...formData, imageUrl: url });
    setPreviewUrl(url);
    setSelectedFile(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMethod === "url" && !formData.imageUrl) {
      return Swal.fire("Peringatan", "URL gambar harus diisi!", "warning");
    }
    if (uploadMethod === "file" && !selectedFile && !isEditing) {
      return Swal.fire("Peringatan", "Pilih file gambar terlebih dahulu!", "warning");
    }

    setIsSaving(true);
    
    try {
      const formPayload = new FormData();
      formPayload.append("title", formData.title);
      formPayload.append("category", formData.category);
      
      if (uploadMethod === "url") {
        formPayload.append("imageUrl", formData.imageUrl);
      }
      if (uploadMethod === "file" && selectedFile) {
        formPayload.append("file", selectedFile);
      } else if (isEditing && formData.imageUrl) {
        formPayload.append("imageUrl", formData.imageUrl);
      }

      const url = isEditing ? `/api/galeri/${formData.id}` : "/api/galeri";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formPayload,
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: `Foto berhasil ${isEditing ? "diperbarui" : "ditambahkan"}.`,
          timer: 1500,
          showConfirmButton: false,
        });
        closeModal();
        fetchGallery();
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
      text: "Data foto ini akan dihapus secara permanen dari Galeri!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/galeri/${id}`, { method: "DELETE" });
        if (res.ok) {
          Swal.fire("Terhapus!", "Foto berhasil dihapus.", "success");
          fetchGallery();
        } else {
          throw new Error("Gagal menghapus");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus foto", "error");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 mb-2">
            Manajemen Galeri
          </h1>
          <p className="text-slate-500">Atur kategori, judul, dan koleksi foto untuk ditampilkan di Galeri Publik.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/30 transition-all"
        >
          <Plus size={18} /> Tambah Foto
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ImageIcon size={40} />
          </div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">Belum ada foto</h2>
          <p className="text-slate-500 mb-6">Mulai tambahkan foto kegiatan sekolah untuk ditampilkan di galeri.</p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold px-6 py-2.5 rounded-xl transition-colors inline-block"
          >
            Tambah Foto Sekarang
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="relative aspect-video bg-slate-100 overflow-hidden flex items-center justify-center">
                <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 absolute inset-0" />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-700 shadow-sm z-10">
                  {img.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2" title={img.title}>{img.title}</h3>
                <p className="text-xs text-slate-400 mb-4 flex-1">
                   Dibuat: {new Date(img.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => handleOpenModal(img)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-100 hover:border-blue-200"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-2 rounded-lg text-sm font-semibold transition-colors border border-slate-100 hover:border-red-200"
                  >
                    <Trash2 size={16} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-800">
                {isEditing ? "Edit Foto" : "Tambah Foto Galeri"}
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
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Judul Foto</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    placeholder="Contoh: Kegiatan Upacara Bendera"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium cursor-pointer"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Fasilitas">Fasilitas</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Siswa">Siswa</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">Sumber Gambar</label>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-3">
                    <button 
                      type="button"
                      onClick={() => setUploadMethod("file")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${uploadMethod === "file" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
                    >
                      <UploadCloud size={18} /> Upload Komputer
                    </button>
                    <button 
                      type="button"
                      onClick={() => setUploadMethod("url")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${uploadMethod === "url" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
                    >
                      <LinkIcon size={18} /> Link Internet
                    </button>
                  </div>

                  {uploadMethod === "file" ? (
                    <div className="w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-100 transition-colors relative">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                      <div className="flex flex-col items-center justify-center pointer-events-none">
                        <UploadCloud size={32} className="text-blue-500 mb-2" />
                        <p className="text-sm font-bold text-slate-600">Klik untuk mencari file gambar</p>
                        <p className="text-xs text-slate-400 mt-1">atau seret file ke area ini (maks 5MB)</p>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={handleUrlChange}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      placeholder="https://..."
                    />
                  )}
                </div>

                {previewUrl && (
                  <div className="mt-4 p-2 border border-slate-100 rounded-2xl bg-slate-50 animate-in fade-in duration-300">
                     <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2 px-2">Preview Gambar:</p>
                     <img src={previewUrl} alt="preview" className="w-full h-48 object-cover rounded-xl shadow-sm border border-slate-200" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}

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
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-xl shadow-md shadow-blue-500/30 transition-all disabled:opacity-50"
                  >
                     {isSaving ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? "Simpan Perubahan" : "Upload & Simpan")}
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
