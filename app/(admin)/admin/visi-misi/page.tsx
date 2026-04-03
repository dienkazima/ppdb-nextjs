"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

export default function VisiMisiAdminPage() {
  const [visiText, setVisiText] = useState("");
  const [misiList, setMisiList] = useState<any[]>([]);
  const [tujuanList, setTujuanList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("visi");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"misi" | "tujuan">("misi");
  const [editId, setEditId] = useState<string | null>(null);
  const [formTeks, setFormTeks] = useState("");
  const [formUrutan, setFormUrutan] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/visi-misi");
      const d = await res.json();
      setVisiText(d.visi?.konten || "");
      setMisiList(Array.isArray(d.misi) ? d.misi : []);
      setTujuanList(Array.isArray(d.tujuan) ? d.tujuan : []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveVisi = async () => {
    const res = await fetch("/api/visi-misi/visi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ konten: visiText }),
    });
    if (res.ok) Swal.fire("Berhasil", "Visi berhasil disimpan!", "success");
    else Swal.fire("Gagal", "Terjadi kesalahan", "error");
  };

  const openModal = (type: "misi" | "tujuan", item?: any) => {
    setModalType(type);
    if (item) {
      setEditId(item.id);
      setFormTeks(item.teks);
      setFormUrutan(item.urutan);
    } else {
      setEditId(null);
      setFormTeks("");
      setFormUrutan((type === "misi" ? misiList : tujuanList).length + 1);
    }
    setModalOpen(true);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/visi-misi/${modalType}/${editId}` : `/api/visi-misi/${modalType}`;
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teks: formTeks, urutan: formUrutan }),
    });
    if (res.ok) {
      Swal.fire("Berhasil", "Data berhasil disimpan", "success");
      setModalOpen(false);
      load();
    } else {
      Swal.fire("Gagal", "Terjadi kesalahan server", "error");
    }
  };

  const removeItem = async (type: "misi" | "tujuan", id: string) => {
    const r = await Swal.fire({
      title: "Hapus Data?",
      text: "Data ini tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });
    if (!r.isConfirmed) return;
    const res = await fetch(`/api/visi-misi/${type}/${id}`, { method: "DELETE" });
    if (res.ok) { Swal.fire("Terhapus!", "Data berhasil dihapus.", "success"); load(); }
  };

  const ItemTable = ({ type, list }: { type: "misi" | "tujuan", list: any[] }) => (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800 capitalize">Daftar {type === "misi" ? "Misi" : "Tujuan"}</h3>
        <button onClick={() => openModal(type)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition">
          <Plus size={16} /> Tambah
        </button>
      </div>
      <div className="bg-white border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-gray-600 text-left">
          <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 font-bold">Urutan</th>
              <th className="px-5 py-3 font-bold">Teks</th>
              <th className="px-5 py-3 font-bold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {list.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">Belum ada data</td></tr>
            ) : list.map(row => (
              <tr key={row.id} className="hover:bg-gray-50 transition">
                <td className="px-5 py-4 font-semibold text-gray-500 w-20">{row.urutan}</td>
                <td className="px-5 py-4 text-gray-700 max-w-md">{row.teks}</td>
                <td className="px-5 py-4 flex justify-end gap-2">
                  <button onClick={() => openModal(type, row)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg"><Edit size={16} /></button>
                  <button onClick={() => removeItem(type, row.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-[#14532D] to-[#16A34A] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">Kelola Visi, Misi &amp; Tujuan</h1>
          <p className="text-green-50/80 font-medium">Atur identitas dan arah pendidikan sekolah yang tampil di halaman beranda.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {["visi", "misi", "tujuan"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 font-semibold text-sm capitalize flex-1 border-b-2 transition-all ${activeTab === tab ? "border-[#16A34A] text-[#166534] bg-white" : "border-transparent text-slate-500 hover:bg-white/50"}`}>
              {tab === "visi" ? "Visi Sekolah" : tab === "misi" ? "Misi Sekolah" : "Tujuan Sekolah"}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 bg-slate-50/30">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600" size={32} /></div>
          ) : (
            <>
              {activeTab === "visi" && (
                <div className="space-y-5 max-w-3xl">
                  <h3 className="text-lg font-bold text-gray-800">Teks Visi Sekolah</h3>
                  <p className="text-sm text-gray-500">Rumuskan visi sekolah yang inspiratif, jelas, dan mengandung cita-cita jangka panjang.</p>
                  <textarea
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition resize-y min-h-[140px] text-gray-900 bg-white text-base leading-relaxed"
                    value={visiText}
                    onChange={e => setVisiText(e.target.value)}
                    placeholder="Masukkan teks visi sekolah..."
                  />
                  <div className="flex justify-end">
                    <button onClick={saveVisi} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition">
                      <Save size={18} /> Simpan Visi
                    </button>
                  </div>
                </div>
              )}
              {activeTab === "misi" && <ItemTable type="misi" list={misiList} />}
              {activeTab === "tujuan" && <ItemTable type="tujuan" list={tujuanList} />}
            </>
          )}
        </div>
      </div>

      {/* MODAL Add/Edit Misi & Tujuan */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{editId ? "Edit" : "Tambah"} {modalType === "misi" ? "Misi" : "Tujuan"}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"><X size={20} /></button>
            </div>
            <form onSubmit={saveItem} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Urutan</label>
                <input type="number" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-white transition"
                  value={formUrutan} onChange={e => setFormUrutan(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teks {modalType === "misi" ? "Misi" : "Tujuan"}</label>
                <textarea required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none resize-y min-h-[100px] text-gray-900 bg-white transition"
                  value={formTeks} onChange={e => setFormTeks(e.target.value)} placeholder="Tulis teks secara lengkap..." />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition">Batal</button>
                <button type="submit" className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition flex items-center gap-2"><Save size={16} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
