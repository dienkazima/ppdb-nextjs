"use client";

import { useEffect, useState, use } from "react";
import { Plus, Edit, Trash2, Loader2, X, ArrowLeft, CheckCircle, DollarSign, Target as TargetIcon, Users, CheckSquare, UploadCloud, Link as LinkIcon } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function JenjangDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const jenjangId = params.id;

  const [jenjang, setJenjang] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"persyaratan" | "biaya" | "target" | "guru">("persyaratan");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});

  // Guru File Upload State
  const [uploadMethod, setUploadMethod] = useState<"url" | "file">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-slate-800 font-semibold";

  const fetchJenjang = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jenjang/${jenjangId}`);
      if (res.ok) {
        setJenjang(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJenjang();
  }, [jenjangId]);

  const handleOpenModal = (item: any = null) => {
    setIsEditing(!!item);
    if (activeTab === "persyaratan") {
      setFormData(item || { jenjangPendidikanId: jenjangId, deskripsi: "", isImportant: false });
    } else if (activeTab === "biaya") {
      setFormData(item || { jenjangPendidikanId: jenjangId, nama: "", nominal: "", keterangan: "" });
    } else if (activeTab === "target") {
      setFormData(item || { jenjangPendidikanId: jenjangId, deskripsi: "" });
    } else if (activeTab === "guru") {
      setFormData(item || { jenjangPendidikanId: jenjangId, id: item?.id || "", nama: "", jabatan: "", foto: "" });
      if (item) {
        setFormData({ ...item, jenjangPendidikanId: jenjangId });
        setPreviewUrl(item.foto || "");
        setUploadMethod(item.foto && item.foto.startsWith("http") ? "url" : "file");
      } else {
        setPreviewUrl("");
        setUploadMethod("file");
      }
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPreviewUrl("");
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData({ ...formData, foto: "" });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = isEditing ? `/api/${activeTab}/${formData.id}` : `/api/${activeTab}`;
      const method = isEditing ? "PUT" : "POST";

      let body: any;
      let headers: HeadersInit = {};

      if (activeTab === "guru") {
        const formDataPayload = new FormData();
        formDataPayload.append("jenjangPendidikanId", formData.jenjangPendidikanId);
        formDataPayload.append("nama", formData.nama);
        formDataPayload.append("jabatan", formData.jabatan);
        
        if (uploadMethod === "url" && formData.foto) {
          formDataPayload.append("foto", formData.foto);
        } else if (uploadMethod === "file" && selectedFile) {
          formDataPayload.append("file", selectedFile);
        } else if (isEditing && formData.foto) {
          formDataPayload.append("foto", formData.foto);
        }
        body = formDataPayload;
      } else {
        body = JSON.stringify(formData);
        headers = { "Content-Type": "application/json" };
      }

      const res = await fetch(url, {
        method,
        headers,
        body,
      });

      if (res.ok) {
        Swal.fire("Berhasil", "Data tersimpan", "success");
        closeModal();
        fetchJenjang();
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, endpoint: string) => {
    const res = await Swal.fire({
      title: "Hapus data ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      confirmButtonColor: "#dc2626",
    });
    if (res.isConfirmed) {
      try {
        const response = await fetch(`/api/${endpoint}/${id}`, { method: "DELETE" });
        if (response.ok) {
          Swal.fire("Terhapus", "", "success");
          fetchJenjang();
        } else {
          throw new Error("Gagal");
        }
      } catch (error) {
        Swal.fire("Error", "Gagal menghapus", "error");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;
  }

  if (!jenjang) {
    return <div className="p-10 text-center text-slate-500">Data tidak ditemukan</div>;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link href="/admin/jenjang" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold mb-6 transition-colors">
        <ArrowLeft size={18} /> Kembali ke Daftar
      </Link>

      <div className="bg-white rounded-3xl p-8 mb-8 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
           <span className="text-2xl font-black">{jenjang.nama.charAt(0)}</span>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">{jenjang.nama}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">{jenjang.deskripsi}</p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 hide-scrollbar">
        {[
          { id: "persyaratan", label: "Persyaratan", icon: <CheckSquare size={18} /> },
          { id: "biaya", label: "Rincian Biaya", icon: <DollarSign size={18} /> },
          { id: "target", label: "Target Pendidikan", icon: <TargetIcon size={18} /> },
          { id: "guru", label: "Tenaga Pendidik", icon: <Users size={18} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            Kelola {activeTab === "guru" ? "Tenaga Pendidik" : activeTab}
          </h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Plus size={18} /> Tambah Data
          </button>
        </div>

        {/* PERSYARATAN TAB */}
        {activeTab === "persyaratan" && (
          <div className="space-y-4">
            {jenjang.persyaratan.length === 0 ? <p className="text-slate-500 text-center py-6">Belum ada persyaratan</p> : null}
            {jenjang.persyaratan.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 group hover:border-blue-200 transition-colors">
                <CheckCircle className={item.isImportant ? "text-amber-500" : "text-green-500"} size={24} />
                <div className="flex-1">
                  <p className="font-semibold text-slate-700">{item.deskripsi}</p>
                  {item.isImportant && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mt-1 inline-block">Wajib / Penting</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-500 p-2 hover:bg-white rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(item.id, "persyaratan")} className="text-red-500 p-2 hover:bg-white rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BIAYA TAB */}
        {activeTab === "biaya" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm">
                  <th className="p-4 font-bold rounded-tl-xl rounded-bl-xl">Nama Biaya</th>
                  <th className="p-4 font-bold">Nominal</th>
                  <th className="p-4 font-bold">Keterangan</th>
                  <th className="p-4 font-bold text-right rounded-tr-xl rounded-br-xl">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {jenjang.biaya.length === 0 ? <tr><td colSpan={4} className="text-center py-6 text-slate-500">Belum ada rincian biaya</td></tr> : null}
                {jenjang.biaya.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">{item.nama}</td>
                    <td className="p-4 text-blue-600 font-bold">Rp {item.nominal.toLocaleString("id-ID")}</td>
                    <td className="p-4 text-slate-500 text-sm">{item.keterangan || "-"}</td>
                    <td className="p-4 flex gap-2 justify-end">
                      <button onClick={() => handleOpenModal(item)} className="text-blue-500 p-2 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => handleDelete(item.id, "biaya")} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TARGET TAB */}
        {activeTab === "target" && (
          <div className="space-y-4">
            {jenjang.target.length === 0 ? <p className="text-slate-500 text-center py-6">Belum ada target pendidikan</p> : null}
            {jenjang.target.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                <TargetIcon className="text-blue-500" size={24} />
                <p className="flex-1 font-semibold text-slate-700">{item.deskripsi}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(item)} className="text-blue-500 p-2 hover:bg-white rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(item.id, "target")} className="text-red-500 p-2 hover:bg-white rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* GURU TAB */}
        {activeTab === "guru" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jenjang.guru.length === 0 ? <p className="text-slate-500 col-span-full text-center py-6">Belum ada data tenaga pendidik</p> : null}
            {jenjang.guru.map((item: any) => (
              <div key={item.id} className="bg-slate-50 border border-slate-100 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center text-indigo-600 overflow-hidden border-2 border-white shadow-sm shrink-0">
                  {item.foto ? <img src={item.foto} alt="avatar" className="w-full h-full object-cover" /> : <Users size={28} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 truncate text-lg">{item.nama}</h3>
                  <p className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block mt-1 truncate max-w-full">{item.jabatan}</p>
                </div>
                <div className="flex flex-col gap-1 items-center justify-center shrink-0">
                  <button onClick={() => handleOpenModal(item)} className="text-slate-400 hover:text-blue-500 p-2 hover:bg-white rounded-md transition-colors"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(item.id, "guru")} className="text-slate-400 hover:text-red-500 p-2 hover:bg-white rounded-md transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 sticky top-0 z-10">
              <h2 className="font-extrabold text-xl text-slate-800 capitalize">{isEditing ? "Edit" : "Tambah"} {activeTab}</h2>
              <button type="button" onClick={closeModal} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSave} className="space-y-5">
                
                {activeTab === "persyaratan" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Deskripsi Persyaratan</label>
                      <input type="text" required value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} className={inputClass} placeholder="Contoh: Mengisi formulir pendaftaran" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <input type="checkbox" checked={formData.isImportant} onChange={e => setFormData({...formData, isImportant: e.target.checked})} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      <span className="font-semibold text-slate-700">Tandai sebagai Wajib/Penting</span>
                    </label>
                  </>
                )}

                {activeTab === "biaya" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Biaya</label>
                      <input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className={inputClass} placeholder="Contoh: SPP Bulanan" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nominal (Rp)</label>
                      <input type="number" required value={formData.nominal} onChange={e => setFormData({...formData, nominal: e.target.value})} className={inputClass} placeholder="Contoh: 150000" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Keterangan (Opsional)</label>
                      <input type="text" value={formData.keterangan || ""} onChange={e => setFormData({...formData, keterangan: e.target.value})} className={inputClass} placeholder="Contoh: Dibayar setiap awal bulan" />
                    </div>
                  </>
                )}

                {activeTab === "target" && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Target Pendidikan</label>
                    <input type="text" required value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} className={inputClass} placeholder="Contoh: Hafal 2 Juz Al-Quran" />
                  </div>
                )}

                {activeTab === "guru" && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Nama Guru / Staf</label>
                      <input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className={inputClass} placeholder="Contoh: Ahmad Yani, S.Pd" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Jabatan / Mapel</label>
                      <input type="text" required value={formData.jabatan} onChange={e => setFormData({...formData, jabatan: e.target.value})} className={inputClass} placeholder="Contoh: Guru Matematika" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Pilih Sumber Foto (Opsional)</label>
                      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-3">
                        <button 
                          type="button"
                          onClick={() => setUploadMethod("file")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${uploadMethod === "file" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
                        >
                          <UploadCloud size={18} /> Upload File
                        </button>
                        <button 
                          type="button"
                          onClick={() => setUploadMethod("url")}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${uploadMethod === "url" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
                        >
                          <LinkIcon size={18} /> Gunakan Link URL
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
                            <p className="text-sm font-bold text-slate-600">Klik untuk mencari file foto</p>
                            <p className="text-xs text-slate-400 mt-1">atau seret file ke area ini (maks 5MB)</p>
                          </div>
                        </div>
                      ) : (
                        <input
                          type="url"
                          value={formData.foto || ""}
                          onChange={(e) => {
                             setFormData({...formData, foto: e.target.value});
                             setPreviewUrl(e.target.value);
                          }}
                          className={inputClass}
                          placeholder="https://..."
                        />
                      )}
                    </div>

                    {previewUrl && (
                      <div className="mt-4 p-3 border border-slate-100 rounded-2xl bg-slate-50 flex gap-4 items-center">
                         <img src={previewUrl} alt="preview" className="w-16 h-16 object-cover rounded-full shadow-sm border border-slate-200" onError={(e) => (e.currentTarget.style.display = 'none')} />
                         <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Melihat Pratinjau Foto</p>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-6 flex gap-3 sticky bottom-0 bg-white">
                  <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSaving} className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-colors flex justify-center items-center">
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
