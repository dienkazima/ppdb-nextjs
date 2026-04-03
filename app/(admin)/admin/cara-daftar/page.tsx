"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

function GenericCrudTab({ slug, title, fields }: { slug: string, title: string, fields: any[] }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cara-daftar/" + slug);
      if(res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [slug]);

  const openForm = (item?: any) => {
    if (item) {
      setEditId(item.id);
      setForm({ ...item });
    } else {
      setEditId(null);
      const initial: any = {};
      fields.forEach(f => initial[f.name] = f.default !== undefined ? f.default : (f.type === "number" ? 0 : ""));
      setForm(initial);
    }
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? "/api/cara-daftar/" + slug + "/" + editId : "/api/cara-daftar/" + slug;
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) {
        Swal.fire("Berhasil", "Data berhasil disimpan", "success");
        setModalOpen(false);
        loadData();
      } else {
        Swal.fire("Gagal", "Terjadi kesalahan server", "error");
      }
    } catch {
      Swal.fire("Gagal", "Tidak dapat terhubung ke server", "error");
    }
  };

  const remove = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Data?",
      text: "Data ini tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!"
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch("/api/cara-daftar/" + slug + "/" + id, { method: "DELETE" });
        if (res.ok) {
          Swal.fire("Terhapus!", "Data berhasil dihapus.", "success");
          loadData();
        }
      } catch {
        Swal.fire("Error", "Gagal menghapus data", "error");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <button onClick={() => openForm()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition">
          <Plus size={18} /> Tambah Data
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-500" size={32} /></div>
      ) : (
        <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
            <thead className="bg-gray-50 border-b text-gray-700 uppercase">
              <tr>
                {fields.map(f => <th key={f.name} className="px-6 py-4 font-bold">{f.label}</th>)}
                <th className="px-6 py-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 ? (
                <tr><td colSpan={fields.length + 1} className="text-center py-8 text-gray-400">Belum ada data tersedia</td></tr>
              ) : (
                data.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 transition">
                    {fields.map(f => (
                      <td key={f.name} className="px-6 py-4 max-w-xs truncate">
                        {typeof row[f.name] === 'boolean' ? (row[f.name] ? 'Ya' : 'Tidak') : row[f.name]}
                      </td>
                    ))}
                    <td className="px-6 py-4 flex justify-end gap-3 border-l bg-white group-hover:bg-gray-50 sticky right-0">
                      <button onClick={() => openForm(row)} className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition" title="Edit"><Edit size={18} /></button>
                      <button onClick={() => remove(row.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition" title="Hapus"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b shrink-0">
              <h3 className="text-xl font-bold text-gray-800">{editId ? "Edit" : "Tambah"} Data</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full transition"><X size={20} /></button>
            </div>
            <form onSubmit={save} className="flex-1 overflow-y-auto p-6 space-y-5">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea 
                      required={f.required !== false} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 min-h-[100px] outline-none transition resize-y text-gray-900 bg-white"
                      value={form[f.name] || ''} onChange={e => setForm({...form, [f.name]: e.target.value})}
                    />
                  ) : f.type === "select" ? (
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 bg-white"
                      value={form[f.name] || ''} onChange={e => setForm({...form, [f.name]: e.target.value})}
                    >
                      {f.options.map((opt:any) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                    </select>
                  ) : f.type === "boolean" ? (
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id={f.name} checked={!!form[f.name]} onChange={e => setForm({...form, [f.name]: e.target.checked})} className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500" />
                      <label htmlFor={f.name} className="text-gray-600">Aktifkan / Flag Penting</label>
                    </div>
                  ) : (
                     <input 
                      type={f.type || "text"}
                      required={f.required !== false} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 bg-white"
                      value={form[f.name] ?? ''} onChange={e => setForm({...form, [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value})}
                    />
                  )}
                </div>
              ))}
              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Batal</button>
                <button type="submit" className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center gap-2"><Save size={18} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const schemaAlur = [
  { name: "urutan", label: "Urutan", type: "number", default: 0 },
  { name: "title", label: "Judul Langkah", type: "text" },
  { name: "icon", label: "Kode Ikon Lucide", type: "text", default: "FileText" },
  { name: "content", label: "Deskripsi Singkat", type: "textarea" },
];

const schemaTimeline = [
  { name: "urutan", label: "Urutan", type: "number", default: 0 },
  { name: "date", label: "Waktu/Tanggal", type: "text" },
  { name: "event", label: "Nama Acara/Informasi", type: "text" },
  { name: "status", label: "Status Indikator", type: "select", options: [{val:"upcoming", label:"Upcoming (Abu-abu)"}, {val:"active", label:"Active (Hijau Beputar)"}], default: "upcoming" },
];

const schemaFaq = [
  { name: "urutan", label: "Urutan", type: "number", default: 0 },
  { name: "q", label: "Pertanyaan", type: "text" },
  { name: "a", label: "Jawaban Lengkap", type: "textarea" },
];

const schemaPersyaratan = [
  { name: "urutan", label: "Urutan", type: "number", default: 0 },
  { name: "teks", label: "Detail Persyaratan", type: "textarea" },
  { name: "isImportant", label: "Bersifat Darurat/Penting?", type: "boolean", default: false },
];

export default function CaraDaftarAdminPage() {
  const [activeTab, setActiveTab] = useState("alur");

  const tabs = [
    { id: "alur", label: "Alur Pendaftaran" },
    { id: "timeline", label: "Timeline" },
    { id: "faq", label: "FAQ / Tanya Jawab" },
    { id: "persyaratan", label: "Persyaratan Umum" }
  ];

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-[#166534] to-[#15803D] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2 text-white">Kelola Panduan Pendaftaran</h1>
          <p className="text-green-50/80 font-medium">
            Atur konten alur pendaftaran, list timeline, blok tanya jawab, dan syarat daftar dengan mudah.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 hide-scrollbar bg-slate-50/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-all border-b-2 flex-1 text-center ${
                activeTab === tab.id
                  ? "border-[#16A34A] text-[#166534] bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 bg-slate-50/30">
          {activeTab === "alur" && <GenericCrudTab slug="alur" title="Langkah-Langkah Pendaftaran" fields={schemaAlur} />}
          {activeTab === "timeline" && <GenericCrudTab slug="timeline" title="Timeline Tanggal Penting" fields={schemaTimeline} />}
          {activeTab === "faq" && <GenericCrudTab slug="faq" title="Pertanyaan Umum (FAQ)" fields={schemaFaq} />}
          {activeTab === "persyaratan" && <GenericCrudTab slug="persyaratan" title="Syarat Wajib Masuk" fields={schemaPersyaratan} />}
        </div>
      </div>
    </div>
  );
}
