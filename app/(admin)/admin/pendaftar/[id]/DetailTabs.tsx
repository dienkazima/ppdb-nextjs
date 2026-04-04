"use client";

import { useState } from "react";
import { generateFormulirPDF } from "@/lib/pdfGenerator";
import QRCode from "qrcode";
import { ArrowLeft, Printer, CheckCircle, XCircle, Clock, FileText, User, Users, FileIcon } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function DetailTabs({ data }: { data: any }) {
  const [tab, setTab] = useState("siswa");

  const updateStatus = async (status: string) => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: `Yakin ingin mengubah status menjadi ${status}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: status === "Diterima" ? "#059669" : "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Ubah!",
      cancelButtonText: "Batal"
    });

    if (!result.isConfirmed) return;

    await fetch(`/api/pendaftar/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    await Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Status berhasil diubah",
      timer: 1500,
      showConfirmButton: false
    });

    location.reload();
  };

  const printCard = async () => {
    try {
      await generateFormulirPDF(data);
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Terjadi kesalahan saat membuat PDF", "error");
    }
  };

  // Helper for Status Badge
  const StatusBadge = () => {
    if (data.status === "Menunggu") {
      return (
        <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset ring-yellow-600/20">
          <Clock size={16} /> Menunggu Verifikasi
        </span>
      );
    }
    if (data.status === "Diterima") {
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset ring-emerald-600/20">
          <CheckCircle size={16} /> Diterima
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold ring-1 ring-inset ring-red-600/10">
        <XCircle size={16} /> Ditolak
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-5xl mx-auto space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 mb-2">
            Profil Pendaftar
          </h1>
          <p className="text-slate-500">
            Tinjau informasi pendaftaran, data orang tua, dan dokumen terkait.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/pendaftar"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium shadow-sm hover:shadow"
          >
            <ArrowLeft size={18} />
            Kembali
          </Link>
          <button
            onClick={printCard}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl font-medium shadow-sm shadow-blue-500/30 hover:bg-blue-700 transition-all"
          >
            <Printer size={18} />
            Cetak Formulir
          </button>
        </div>
      </div>

      {/* STATUS BANNER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200">
            <User size={28} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">Status Pendaftaran</p>
            <StatusBadge />
          </div>
        </div>

        <div className="flex gap-3">
          {data.status !== "Diterima" && (
            <button
              onClick={() => updateStatus("Diterima")}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-emerald-200 hover:border-emerald-600"
            >
              <CheckCircle size={18} /> Terima Pendaftar
            </button>
          )}

          {data.status !== "Ditolak" && (
            <button
              onClick={() => updateStatus("Ditolak")}
              className="flex items-center gap-2 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors border border-red-200 hover:border-red-600"
            >
              <XCircle size={18} /> Tolak Pendaftar
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="bg-white shadow-sm rounded-3xl border border-slate-200 overflow-hidden">

        {/* TABS HEADER */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setTab("siswa")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === "siswa"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
              }`}
          >
            <User size={18} /> Data Siswa
          </button>

          <button
            onClick={() => setTab("ortu")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === "ortu"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
              }`}
          >
            <Users size={18} /> Data Orang Tua
          </button>

          <button
            onClick={() => setTab("dokumen")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === "dokumen"
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
              }`}
          >
            <FileIcon size={18} /> Dokumen Pendukung
          </button>

          <button
            onClick={() => setTab("pembayaran")}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === "pembayaran"
                ? "bg-white text-emerald-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-700"
              }`}
          >
            <CheckCircle size={18} /> Histori Pembayaran
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-8">

          {/* DATA SISWA */}
          {tab === "siswa" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User size={18} />
                </div>
                Informasi Personal Siswa
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Info label="Nomor Pendaftaran" value={data.noPendaftaran} />
                <Info label="Nama Lengkap" value={data.nama} />
                <Info label="Jenis Kelamin" value={data.jenisKelamin} />
                <Info label="NIK" value={data.nik} />
                <Info label="Agama" value={data.agama} />
                <Info label="Tempat Lahir" value={data.tempatLahir} />
                <Info
                  label="Tanggal Lahir"
                  value={
                    data.tanggalLahir
                      ? new Date(data.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })
                      : "-"
                  }
                />
                <Info label="Jenjang Pendaftaran" value={data.jenjang} />
                <Info label="Anak Ke" value={data.anakKe} />
                <Info label="Jumlah Saudara" value={data.jumlahSaudara} />
                <Info label="Tinggi Badan" value={data.tinggiBadan ? `${data.tinggiBadan} cm` : "-"} />
                <Info label="Berat Badan" value={data.beratBadan ? `${data.beratBadan} kg` : "-"} />
                <Info label="Sekolah Asal" value={data.sekolahAsal} />
                <Info label="Transportasi" value={data.transportasi} />
              </div>

              {/* Alamat & Kontak Lengkap */}
              <div className="pt-8 mt-4 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  Alamat & Kontak Lengkap
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Info label="Dusun" value={data.dusun} />
                  <Info label="Desa / Kelurahan" value={data.desa} />
                  <Info label="Kecamatan" value={data.kecamatan} />
                  <Info label="Kabupaten / Kota" value={data.kabupaten} />
                  <Info label="No HP Orang Tua/Wali" value={data.noHpOrtu} />
                </div>
              </div>

            </div>
          )}

          {/* DATA ORANG TUA */}
          {tab === "ortu" && (
            <div className="animate-in fade-in duration-300 grid md:grid-cols-2 gap-8">

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  Data Ayah
                </h3>
                <div className="space-y-4">
                  <Info label="Nama Ayah" value={data.namaAyah} />
                  <Info label="Tahun Lahir" value={data.tahunLahirAyah} />
                  <Info label="Pendidikan Terakhir" value={data.pendidikanAyah} />
                  <Info label="Pekerjaan" value={data.pekerjaanAyah} />
                  <Info label="Penghasilan Bulanan" value={data.penghasilanAyah} />
                  <Info label="Alamat Ayah" value={data.alamatAyah} />
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                    <User size={18} />
                  </div>
                  Data Ibu
                </h3>
                <div className="space-y-4">
                  <Info label="Nama Ibu" value={data.namaIbu} />
                  <Info label="Tahun Lahir" value={data.tahunLahirIbu} />
                  <Info label="Pendidikan Terakhir" value={data.pendidikanIbu} />
                  <Info label="Pekerjaan" value={data.pekerjaanIbu} />
                  <Info label="Penghasilan Bulanan" value={data.penghasilanIbu} />
                  <Info label="Alamat Ibu" value={data.alamatIbu} />
                </div>
              </div>

            </div>
          )}

          {/* DOKUMEN */}
          {tab === "dokumen" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                Berkas & Dokumen Pendukung
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Document label="Scan Ijazah Terakhir" file={data.ijazah} />
                <Document label="Scan Kartu Keluarga" file={data.kk} />
                <Document label="Scan Akta Kelahiran" file={data.akta} />
                <Document label="Scan KTP Orang Tua" file={data.ktp} />
              </div>
            </div>
          )}

          {/* PEMBAYARAN */}
          {tab === "pembayaran" && (
            <div className="animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={18} />
                </div>
                Informasi Tagihan & Pembayaran
              </h3>

              {/* Status + Tombol Verifikasi Lunas */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap gap-6 items-center">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Status Pembayaran</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${
                      data.statusPembayaran === "Lunas" ? "bg-green-100 text-green-700 border-green-200" :
                      data.statusPembayaran === "Menunggu Verifikasi" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                      data.statusPembayaran === "Cicilan" ? "bg-blue-100 text-blue-700 border-blue-200" :
                      "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {data.statusPembayaran || "Belum Bayar"}
                    </span>
                  </div>
                  {data.totalTagihan && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Tagihan</p>
                      <p className="text-base font-bold text-slate-800">
                        Rp {Number(data.totalTagihan).toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                  {data.totalDibayar != null && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Sudah Dibayar</p>
                      <p className="text-base font-bold text-emerald-700">
                        Rp {Number(data.totalDibayar).toLocaleString("id-ID")}
                      </p>
                    </div>
                  )}
                </div>
                {data.statusPembayaran !== "Lunas" && (
                  <button
                    onClick={async () => {
                      const res = await Swal.fire({
                        title: "Konfirmasi Pelunasan",
                        text: "Ubah status menjadi Lunas?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Ya, Lunas!"
                      });
                      if (res.isConfirmed) {
                        await fetch(`/api/pendaftar/${data.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ statusPembayaran: "Lunas" })
                        });
                        location.reload();
                      }
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition"
                  >
                    Verifikasi Lunas
                  </button>
                )}
              </div>

              {/* Riwayat Cicilan */}
              <div>
                <p className="text-sm font-bold text-slate-700 mb-3">
                  Riwayat Cicilan ({(data.riwayatPembayaran || []).length}x)
                </p>
                {(!data.riwayatPembayaran || data.riwayatPembayaran.length === 0) ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
                    Belum ada riwayat pembayaran
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.riwayatPembayaran.map((r: any, idx: number) => (
                      <div
                        key={r.id}
                        className={`rounded-2xl border p-5 space-y-3 ${
                          r.statusPembayaran === "Diverifikasi" ? "border-emerald-200 bg-emerald-50/40" :
                          r.statusPembayaran === "Ditolak" ? "border-red-200 bg-red-50/40" :
                          "border-amber-200 bg-amber-50/40"
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-extrabold">
                              {r.nomorCicilan}
                            </span>
                            <span className="text-sm font-bold text-slate-700">
                              Cicilan ke-{r.nomorCicilan}
                            </span>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                            r.statusPembayaran === "Diverifikasi" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                            r.statusPembayaran === "Ditolak" ? "bg-red-100 text-red-700 border-red-200" :
                            "bg-amber-100 text-amber-700 border-amber-200"
                          }`}>
                            {r.statusPembayaran}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-slate-400 font-semibold mb-0.5">Nominal</p>
                            <p className="text-slate-800 font-bold">
                              Rp {Number(r.nominal || 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold mb-0.5">Metode</p>
                            <p className="text-slate-700 font-semibold">{r.metodePembayaran || "-"}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 font-semibold mb-0.5">Tanggal Upload</p>
                            <p className="text-slate-700 font-semibold">
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                            </p>
                          </div>
                          {r.tanggalVerifikasi && (
                            <div>
                              <p className="text-slate-400 font-semibold mb-0.5">Tanggal Verifikasi</p>
                              <p className="text-slate-700 font-semibold">
                                {new Date(r.tanggalVerifikasi).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                              </p>
                            </div>
                          )}
                          {r.catatan && (
                            <div className="col-span-2">
                              <p className="text-slate-400 font-semibold mb-0.5">Catatan</p>
                              <p className="text-slate-700 font-semibold">{r.catatan}</p>
                            </div>
                          )}
                          {r.catatanPenolakan && (
                            <div className="col-span-2">
                              <p className="text-red-400 font-semibold mb-0.5">Alasan Penolakan</p>
                              <p className="text-red-700 font-semibold">{r.catatanPenolakan}</p>
                            </div>
                          )}
                        </div>

                        {r.buktiPembayaran && (
                          <div className="pt-2 border-t border-slate-200/60">
                            <a
                              href={r.buktiPembayaran}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-xs px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl font-bold transition-colors border border-blue-100 hover:border-transparent"
                            >
                              <FileText size={14} /> Lihat Bukti Transfer
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-slate-800 font-semibold">{value || "-"}</p>
    </div>
  );
}

function Document({ label, file }: { label: string; file: string }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
          <FileText size={20} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {file ? "Dokumen tersedia" : "Belum diunggah"}
          </p>
        </div>
      </div>

      {file ? (
        <a
          href={file}
          target="_blank"
          className="w-full sm:w-auto text-center bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-colors border border-blue-100 hover:border-blue-600"
        >
          Lihat File
        </a>
      ) : (
        <span className="w-full sm:w-auto text-center bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-sm font-semibold">
          Kosong
        </span>
      )}
    </div>
  );
}