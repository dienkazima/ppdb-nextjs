"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, Search, Edit2, Trash2,
  Shield, UserCheck, CheckCircle2, XCircle, FileText
} from "lucide-react";
import Swal from "sweetalert2";

export default function PenggunaPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: "",
    username: "",
    name: "",
    password: "",
    role: "PANITIA",
    jenjang: "SD",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/pengguna");
      if (res.ok) {
        const result = await res.json();
        setUsers(result.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setIsEdit(true);
      setFormData({
        id: user.id || "",
        username: user.username || "",
        name: user.name || "",
        password: "", // Don't show password, leave blank for no change
        role: user.role || "PANITIA",
        jenjang: user.jenjang || "SD",
      });
    } else {
      setIsEdit(false);
      setFormData({
        id: "",
        username: "",
        name: "",
        password: "",
        role: "PANITIA",
        jenjang: "SD",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validasi
    if (!formData.username || !formData.name) {
      Swal.fire("Error", "Username dan Nama wajib diisi!", "error");
      setIsSubmitting(false);
      return;
    }
    if (!isEdit && !formData.password) {
      Swal.fire("Error", "Password wajib diisi untuk pengguna baru!", "error");
      setIsSubmitting(false);
      return;
    }

    const payload: any = {
      username: formData.username,
      name: formData.name,
      role: formData.role,
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    if (formData.role === "PANITIA") {
      payload.jenjang = formData.jenjang;
    } else {
      payload.jenjang = null; // Admin has full access
    }

    try {
      const url = isEdit ? `/api/admin/pengguna/${formData.id}` : "/api/admin/pengguna";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Gagal menyimpan data");

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: `Pengguna berhasil ${isEdit ? 'diperbarui' : 'ditambahkan'}`,
        timer: 1500,
        showConfirmButton: false
      });

      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      Swal.fire("Error", error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (username === "admin") {
      Swal.fire("Peringatan", "Akun root admin tidak bisa dihapus!", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: 'Hapus Pengguna?',
      text: "Anda tidak dapat mengembalikan data yang sudah dihapus",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/pengguna/${id}`, {
          method: 'DELETE'
        });

        if (!res.ok) {
          const result = await res.json();
          throw new Error(result.error || "Gagal menghapus pengguna");
        }

        setUsers(users.filter(u => u.id !== id));
        Swal.fire('Terhapus!', 'Pengguna telah dihapus.', 'success');
      } catch (error: any) {
        Swal.fire('Error!', error.message, 'error');
      }
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-500 mb-2 flex items-center gap-3">
            <Users size={32} className="text-blue-600" /> Manajemen Pengguna
          </h1>
          <p className="text-slate-500">
            Kelola akses Admin dan Panitia sesuai otoritas jenjang masing-masing.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
        >
          <UserPlus size={20} />
          Tambah Pengguna
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pengguna.."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-blue-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="font-semibold text-slate-500 animate-pulse">Memuat data pengguna...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Users size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Tidak ditemukan</h3>
            <p className="text-slate-500">Data pengguna tidak ditemukan cocok dengan pencarian.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase font-bold tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Pengguna</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Akses Jenjang</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm ${user.role === 'ADMIN' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-emerald-500 to-teal-500'
                          }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-base">{user.name}</p>
                          <p className="text-slate-500 text-xs font-medium">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${user.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                        {user.role === 'ADMIN' ? <Shield size={14} /> : <UserCheck size={14} />}
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 text-slate-500 text-xs font-semibold bg-slate-100 px-2 py-1 rounded-md">
                          <CheckCircle2 size={14} className="text-slate-400" /> Semua Otoritas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-teal-600 text-xs font-bold bg-teal-50 px-2 py-1 rounded-md border border-teal-100 shadow-sm">
                          <FileText size={14} /> Jenjang {user.jenjang || "Tidak Ada"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.username)}
                          disabled={user.username === "admin"}
                          className={`p-2 rounded-lg transition-colors ${user.username === "admin"
                            ? "text-slate-300 cursor-not-allowed"
                            : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                            }`}
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                  {isEdit ? <Edit2 className="text-blue-500" size={20} /> : <UserPlus className="text-blue-500" size={20} />}
                  {isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-xl transition"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Nama Lengkap</label>
                    <input
                      required
                      type="text"
                      disabled={formData.username === "admin"}
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none disabled:opacity-100"
                      placeholder="Contoh: Sakduddin"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600">Username Login</label>
                    <input
                      required
                      type="text"
                      disabled={formData.username === "admin"}
                      value={formData.username}
                      onChange={e => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none disabled:opacity-100"
                      placeholder="Username pendek"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    Password {isEdit && <span className="text-slate-400 font-normal">(Kosongkan jika tidak ingin diubah)</span>}
                  </label>
                  <input
                    type="text" // using text to easily see default passwords for panitia initially
                    required={!isEdit}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none disabled:opacity-100"
                    placeholder="Masukkan sandi..."
                  />
                </div>

                {formData.username !== "admin" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">Role Pengguna</label>
                      <select
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-semibold text-slate-700"
                      >
                        <option value="PANITIA">👨‍💼 Panitia (Terpusat per Jenjang)</option>
                        <option value="ADMIN">🛡️ Administrator (Akses Penuh)</option>
                      </select>
                    </div>

                    {formData.role === "PANITIA" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-1.5"
                      >
                        <label className="text-xs font-bold text-slate-600">Akses Jenjang</label>
                        <select
                          value={formData.jenjang}
                          onChange={e => setFormData({ ...formData, jenjang: e.target.value })}
                          className="w-full px-4 py-2.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none font-bold"
                        >
                          <option value="TK">TK (Taman Kanak-Kanak)</option>
                          <option value="SD">SD (Sekolah Dasar)</option>
                          <option value="SMP">SMP (Menengah Pertama)</option>
                          <option value="SMA">SMA (Menengah Atas)</option>
                        </select>
                      </motion.div>
                    )}
                  </>
                )}

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>{isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
