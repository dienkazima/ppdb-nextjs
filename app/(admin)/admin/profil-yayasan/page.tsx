"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Loader2, Info, MessageCircle, MapPin, Clock, Phone } from "lucide-react";
import Swal from "sweetalert2";

export default function ProfilYayasanAdminPage() {
  // Profil State
  const [deskripsi, setDeskripsi] = useState("");
  const [embedMap, setEmbedMap] = useState("");
  
  // Jam Pelayanan State
  const [jamList, setJamList] = useState<any[]>([]);
  
  // Kontak Panitia State
  const [kontakList, setKontakList] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profil");

  // Modal State Jam Pelayanan
  const [modalJamOpen, setModalJamOpen] = useState(false);
  const [editJamId, setEditJamId] = useState<string | null>(null);
  const [formHari, setFormHari] = useState("");
  const [formJam, setFormJam] = useState("");
  const [formUrutanJam, setFormUrutanJam] = useState(0);

  // Modal State Kontak Panitia
  const [modalKontakOpen, setModalKontakOpen] = useState(false);
  const [editKontakId, setEditKontakId] = useState<string | null>(null);
  const [formNama, setFormNama] = useState("");
  const [formNomor, setFormNomor] = useState("");
  const [formUrutanKontak, setFormUrutanKontak] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load Profil
      const resProfil = await fetch("/api/profil-yayasan");
      const dProfil = await resProfil.json();
      if (dProfil) {
        setDeskripsi(dProfil.deskripsi || "");
        setEmbedMap(dProfil.embedMap || "");
      }

      // Load Jam
      const resJam = await fetch("/api/jam-pelayanan");
      const dJam = await resJam.json();
      setJamList(Array.isArray(dJam) ? dJam : []);

      // Load Kontak
      const resKontak = await fetch("/api/kontak-panitia");
      const dKontak = await resKontak.json();
      setKontakList(Array.isArray(dKontak) ? dKontak : []);

    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const saveProfil = async () => {
    // nomorWa is no longer needed in the profil update, but API still expects it as a string field in schema, so we send empty string
    const res = await fetch("/api/profil-yayasan", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deskripsi, embedMap, nomorWa: "" }),
    });
    if (res.ok) Swal.fire("Berhasil", "Profil Yayasan berhasil disimpan!", "success");
    else Swal.fire("Gagal", "Terjadi kesalahan server", "error");
  };

  // --- JAM PELAYANAN CRUD ---
  const openModalJam = (item?: any) => {
    if (item) {
      setEditJamId(item.id);
      setFormHari(item.hari);
      setFormJam(item.jam);
      setFormUrutanJam(item.urutan);
    } else {
      setEditJamId(null);
      setFormHari("");
      setFormJam("");
      setFormUrutanJam(jamList.length + 1);
    }
    setModalJamOpen(true);
  };

  const saveJam = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editJamId ? `/api/jam-pelayanan/${editJamId}` : `/api/jam-pelayanan`;
    const method = editJamId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hari: formHari, jam: formJam, urutan: formUrutanJam }),
    });
    
    if (res.ok) {
      Swal.fire("Berhasil", "Jam pelayanan berhasil disimpan", "success");
      setModalJamOpen(false);
      loadData();
    } else {
      Swal.fire("Gagal", "Terjadi kesalahan server", "error");
    }
  };

  const removeJam = async (id: string) => {
    const r = await Swal.fire({
      title: "Hapus Data?",
      text: "Data ini tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });
    if (!r.isConfirmed) return;
    const res = await fetch(`/api/jam-pelayanan/${id}`, { method: "DELETE" });
    if (res.ok) { 
      Swal.fire("Terhapus!", "Jam pelayanan berhasil dihapus.", "success"); 
      loadData(); 
    }
  };

  // --- KONTAK PANITIA CRUD ---
  const openModalKontak = (item?: any) => {
    if (item) {
      setEditKontakId(item.id);
      setFormNama(item.nama);
      setFormNomor(item.nomor);
      setFormUrutanKontak(item.urutan);
    } else {
      setEditKontakId(null);
      setFormNama("");
      setFormNomor("");
      setFormUrutanKontak(kontakList.length + 1);
    }
    setModalKontakOpen(true);
  };

  const saveKontak = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editKontakId ? `/api/kontak-panitia/${editKontakId}` : `/api/kontak-panitia`;
    const method = editKontakId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama: formNama, nomor: formNomor, urutan: formUrutanKontak }),
    });
    
    if (res.ok) {
      Swal.fire("Berhasil", "Kontak Panitia berhasil disimpan", "success");
      setModalKontakOpen(false);
      loadData();
    } else {
      Swal.fire("Gagal", "Terjadi kesalahan server", "error");
    }
  };

  const removeKontak = async (id: string) => {
    const r = await Swal.fire({
      title: "Hapus Kontak?",
      text: "Kontak ini tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
    });
    if (!r.isConfirmed) return;
    const res = await fetch(`/api/kontak-panitia/${id}`, { method: "DELETE" });
    if (res.ok) { 
      Swal.fire("Terhapus!", "Kontak Panitia berhasil dihapus.", "success"); 
      loadData(); 
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-gradient-to-r from-[#14532D] to-[#16A34A] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl hidden md:block">
            <Info className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold mb-2">Profil & Kontak Yayasan</h1>
            <p className="text-green-50/80 font-medium">Kelola deskripsi yayasan, kontak WhatsApp, tautan peta, dan jadwal pelayanan publik.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* TAB Navigation - Vertical on Desktop, Horizontal Scroll on Mobile */}
        <div className="flex md:flex-col border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50 overflow-x-auto min-w-[220px]">
          <button onClick={() => setActiveTab("profil")}
            className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-3 whitespace-nowrap 
              ${activeTab === "profil" ? "border-b-2 md:border-b-0 md:border-r-2 border-[#16A34A] text-[#166534] bg-white" : "border-transparent text-slate-500 hover:bg-white/50"}`}>
            <Info size={18} /> Informasi Utama
          </button>
          <button onClick={() => setActiveTab("jam")}
            className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-3 whitespace-nowrap
              ${activeTab === "jam" ? "border-b-2 md:border-b-0 md:border-r-2 border-[#16A34A] text-[#166534] bg-white" : "border-transparent text-slate-500 hover:bg-white/50"}`}>
            <Clock size={18} /> Jam Pelayanan
          </button>
          <button onClick={() => setActiveTab("kontak")}
            className={`px-6 py-4 font-semibold text-sm transition-all flex items-center gap-3 whitespace-nowrap
              ${activeTab === "kontak" ? "border-b-2 md:border-b-0 md:border-r-2 border-[#16A34A] text-[#166534] bg-white" : "border-transparent text-slate-500 hover:bg-white/50"}`}>
            <Phone size={18} /> Kontak Panitia
          </button>
        </div>

        {/* TAB Content */}
        <div className="p-6 md:p-8 bg-slate-50/30 flex-1">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600" size={32} /></div>
          ) : (
            <>
              {/* --- PROFIL YAYASAN TAB --- */}
              {activeTab === "profil" && (
                <div className="space-y-6 max-w-4xl">
                  {/* Deskripsi */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1"><Info size={18} className="text-green-600"/> Deskripsi Yayasan</h3>
                    <p className="text-sm text-gray-500 mb-4">Teks ini akan muncul di beranda dan memberikan gambaran singkat mengenai institusi.</p>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition resize-y min-h-[140px] text-gray-900 bg-gray-50/50 hover:bg-white text-sm"
                      value={deskripsi}
                      onChange={e => setDeskripsi(e.target.value)}
                      placeholder="Masukkan deskripsi yayasan..."
                    />
                  </div>

                  {/* Peta */}
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-1"><MapPin size={18} className="text-green-600"/> Google Maps (URL / iFrame)</h3>
                    <p className="text-sm text-gray-500 mb-4">Masukkan URL Maps Embed. (Catatan: Lokasi di halaman beranda telah di-hardcode sesuai permintaan, namun ini bisa disimpan untuk cadangan).</p>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900 bg-gray-50/50 hover:bg-white text-sm overflow-hidden text-ellipsis whitespace-nowrap"
                      value={embedMap}
                      onChange={e => setEmbedMap(e.target.value)}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button onClick={saveProfil} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-xl font-bold font-sans flex items-center gap-2 transition shadow-lg shadow-green-600/20 hover:-translate-y-0.5">
                      <Save size={18} /> Simpan Informasi Utama
                    </button>
                  </div>
                </div>
              )}
              
              {/* --- JAM PELAYANAN TAB --- */}
              {activeTab === "jam" && (
                <div className="space-y-5 max-w-3xl">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Clock size={20} className="text-green-600"/> Daftar Jam Pelayanan
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Jadwal operasional panitia yang ditampilkan di beranda.</p>
                    </div>
                    <button onClick={() => openModalJam()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition shrink-0">
                      <Plus size={16} /> Tambah Jam
                    </button>
                  </div>
                  
                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="w-full overflow-hidden">
                      <table className="w-full text-sm text-gray-600 text-left">
                        <thead className="bg-gray-50 border-b text-gray-700 uppercase text-xs">
                          <tr>
                            <th className="px-5 py-3 font-bold w-16">No</th>
                            <th className="px-5 py-3 font-bold">Hari</th>
                            <th className="px-5 py-3 font-bold">Jam Layanan</th>
                            <th className="px-5 py-3 font-bold text-right w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {jamList.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-8 text-gray-400">Belum ada data jam pelayanan</td></tr>
                          ) : jamList.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50 transition">
                              <td className="px-5 py-4 font-semibold text-gray-500">{row.urutan}</td>
                              <td className="px-5 py-4 font-bold text-gray-800">{row.hari}</td>
                              <td className="px-5 py-4 text-gray-600">
                                <span className="inline-block px-2.5 py-1 bg-green-50 text-green-700 rounded-md font-semibold text-xs border border-green-100 break-words max-w-[200px] md:max-w-none">
                                  {row.jam}
                                </span>
                              </td>
                              <td className="px-5 py-4 flex justify-end gap-2">
                                <button onClick={() => openModalJam(row)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg bg-white border border-gray-100 shadow-sm"><Edit size={16} /></button>
                                <button onClick={() => removeJam(row.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg bg-white border border-gray-100 shadow-sm"><Trash2 size={16} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* --- KONTAK PANITIA TAB --- */}
              {activeTab === "kontak" && (
                <div className="space-y-5 max-w-4xl">
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Phone size={20} className="text-green-600"/> Daftar Kontak Panitia
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Kelola nomor WhatsApp panitia untuk dihubungi oleh calon pendaftar.</p>
                    </div>
                    <button onClick={() => openModalKontak()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition shrink-0">
                      <Plus size={16} /> Tambah Kontak
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {kontakList.length === 0 ? (
                       <div className="col-span-full text-center py-10 text-gray-400 bg-white border border-dashed rounded-xl">Belum ada data kontak panitia</div>
                    ) : kontakList.map((kontak) => (
                      <div key={kontak.id} className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex items-center gap-4 group hover:border-green-200 transition">
                        <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                          <MessageCircle size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-800 truncate">{kontak.nama}</h4>
                          <p className="text-sm font-medium text-gray-500 truncate">{kontak.nomor}</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                           <button onClick={() => openModalKontak(kontak)} className="text-blue-500 bg-blue-50/50 hover:bg-blue-100 p-1.5 rounded-lg transition"><Edit size={16} /></button>
                           <button onClick={() => removeKontak(kontak.id)} className="text-red-500 bg-red-50/50 hover:bg-red-100 p-1.5 rounded-lg transition"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}
        </div>
      </div>

      {/* MODAL Add/Edit Jam Pelayanan */}
      {modalJamOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Clock size={18} className="text-green-600"/> {editJamId ? "Edit" : "Tambah"} Jam Pelayanan</h3>
              <button onClick={() => setModalJamOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white shadow-sm border border-gray-100 p-1.5 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={saveJam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Urutan (Sortir)</label>
                <input type="number" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 hover:bg-white transition"
                  value={formUrutanJam} onChange={e => setFormUrutanJam(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Hari Layanan</label>
                <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 hover:bg-white transition"
                  value={formHari} onChange={e => setFormHari(e.target.value)} placeholder="Contoh: Senin - Jumat" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Waktu Jam</label>
                <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 hover:bg-white transition"
                  value={formJam} onChange={e => setFormJam(e.target.value)} placeholder="Contoh: 08.00 - 16.00" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalJamOpen(false)} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition flex items-center gap-2"><Save size={16} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL Add/Edit Kontak Panitia */}
      {modalKontakOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Phone size={18} className="text-green-600"/> {editKontakId ? "Edit" : "Tambah"} Kontak Panitia</h3>
              <button onClick={() => setModalKontakOpen(false)} className="text-gray-400 hover:text-gray-600 bg-white shadow-sm border border-gray-100 p-1.5 rounded-full"><X size={18} /></button>
            </div>
            <form onSubmit={saveKontak} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Urutan Tampil</label>
                <input type="number" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 hover:bg-white transition"
                  value={formUrutanKontak} onChange={e => setFormUrutanKontak(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Nama / Jabatan</label>
                <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 hover:bg-white transition"
                  value={formNama} onChange={e => setFormNama(e.target.value)} placeholder="Contoh: Panitia SD IT" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Nomor WhatsApp</label>
                <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none text-gray-900 bg-gray-50 hover:bg-white transition"
                  value={formNomor} onChange={e => setFormNomor(e.target.value)} placeholder="Contoh: +628123456789 (Gunakan format international)" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalKontakOpen(false)} className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition flex items-center gap-2"><Save size={16} /> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
