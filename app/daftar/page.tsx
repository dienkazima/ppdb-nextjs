"use client";

import { useState } from "react";

export default function Daftar() {
  const [form, setForm] = useState({
    nama: "",
    nisn: "",
    sekolah: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const existing = localStorage.getItem("ppdb");

    const data = existing ? JSON.parse(existing) : [];

    const updated = [...data, form];

    localStorage.setItem("ppdb", JSON.stringify(updated));

    alert("Pendaftaran berhasil!");

    setForm({
      nama: "",
      nisn: "",
      sekolah: "",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold">
          Form Pendaftaran
        </h2>

        <input
          type="text"
          placeholder="Nama Lengkap"
          value={form.nama}
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, nama: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="NISN"
          value={form.nisn}
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, nisn: e.target.value })
          }
        />

        <input
          type="text"
          placeholder="Asal Sekolah"
          value={form.sekolah}
          className="w-full border p-2 rounded"
          onChange={(e) =>
            setForm({ ...form, sekolah: e.target.value })
          }
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Daftar
        </button>
      </form>
    </div>
  );
}
