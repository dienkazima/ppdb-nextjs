"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, X, GripVertical, ScrollText, Loader2, Save } from "lucide-react";
import Swal from "sweetalert2";

interface TataTertibItem {
  id: string;
  teks: string;
  urutan: number;
}

export default function TataTertibPage() {
  const [items, setItems] = useState<TataTertibItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTeks, setNewTeks] = useState("");
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTeks, setEditTeks] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tata-tertib");
      const d = await res.json();
      setItems(Array.isArray(d) ? d : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAdd = async () => {
    if (!newTeks.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/tata-tertib", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teks: newTeks.trim(), urutan: items.length }),
      });
      if (res.ok) {
        setNewTeks("");
        await fetchItems();
      } else {
        Swal.fire("Gagal", "Tidak dapat menambahkan data", "error");
      }
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (item: TataTertibItem) => {
    setEditId(item.id);
    setEditTeks(item.teks);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditTeks("");
  };

  const handleSave = async (id: string) => {
    if (!editTeks.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tata-tertib/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teks: editTeks.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        Swal.fire("Gagal", err.error || "Tidak dapat menyimpan perubahan", "error");
        return;
      }
      setEditId(null);
      await fetchItems();
    } catch (e) {
      Swal.fire("Error", "Terjadi kesalahan jaringan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus Aturan?",
      text: "Data akan dihapus permanen dan tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;
    await fetch(`/api/tata-tertib/${id}`, { method: "DELETE" });
    await fetchItems();
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <ScrollText size={22} />
            </div>
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500">
              Tata Tertib Pendaftaran
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-13">
            Kelola ketentuan yang wajib disetujui calon pendaftar sebelum mengisi formulir.
          </p>
        </div>
      </div>

      {/* Add New Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <Plus size={16} className="text-green-600" />
          Tambah Aturan Baru
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            value={newTeks}
            onChange={(e) => setNewTeks(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAdd(); } }}
            placeholder="Tulis aturan / ketentuan di sini..."
            rows={2}
            className="flex-1 px-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 focus:bg-white transition-all resize-none text-slate-700 placeholder:text-slate-400"
          />
          <button
            onClick={handleAdd}
            disabled={adding || !newTeks.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-green-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 text-sm"
          >
            {adding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Tambah
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-700 text-sm">
            Daftar Aturan <span className="ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold">{items.length}</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 gap-3">
            <Loader2 size={24} className="animate-spin" />
            <span className="text-sm">Memuat data...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
            <ScrollText size={40} className="text-slate-200" />
            <p className="text-sm font-medium">Belum ada aturan yang ditambahkan</p>
            <p className="text-xs">Mulai tambahkan aturan tata tertib di atas.</p>
          </div>
        ) : (
          <ol className="divide-y divide-slate-50">
            {items.map((item, idx) => (
              <li key={item.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors group">
                {/* Nomor */}
                <span className="mt-0.5 w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-black shrink-0 shadow-sm">
                  {idx + 1}
                </span>

                {/* Teks / Edit mode */}
                <div className="flex-1 min-w-0">
                  {editId === item.id ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <textarea
                        value={editTeks}
                        onChange={(e) => setEditTeks(e.target.value)}
                        rows={2}
                        autoFocus
                        className="flex-1 px-3 py-2 text-sm bg-white border-2 border-green-500 rounded-xl focus:outline-none resize-none text-slate-700"
                      />
                      <div className="flex sm:flex-col gap-2">
                        <button
                          onClick={() => handleSave(item.id)}
                          disabled={saving}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                        >
                          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Simpan
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-200 transition"
                        >
                          <X size={14} />
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-700 text-sm leading-relaxed">{item.teks}</p>
                  )}
                </div>

                {/* Actions */}
                {editId !== item.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Info card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <div className="w-8 h-8 bg-amber-400 text-white rounded-lg flex items-center justify-center shrink-0">
          <ScrollText size={16} />
        </div>
        <div>
          <p className="text-amber-800 font-bold text-sm">Catatan Penting</p>
          <p className="text-amber-700 text-xs leading-relaxed mt-0.5">
            Aturan ini akan otomatis tampil pada popup sebelum calon siswa melanjutkan ke formulir pendaftaran.
            Pastikan isi sudah benar sebelum dipublikasikan.
          </p>
        </div>
      </div>
    </div>
  );
}
