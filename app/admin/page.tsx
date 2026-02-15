"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [data, setData] = useState<any[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    nama: "",
    nisn: "",
    sekolah: "",
  });

  const router = useRouter();

  useEffect(() => {
    const isLogin = localStorage.getItem("isLogin");

    if (!isLogin) {
      router.push("/login");
      return;
    }

    const stored = localStorage.getItem("ppdb");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  function handleDelete(index: number) {
    const updated = data.filter((_, i) => i !== index);
    setData(updated);
    localStorage.setItem("ppdb", JSON.stringify(updated));
  }

  function handleEdit(index: number) {
    setEditIndex(index);
    setEditForm(data[index]);
  }

  function handleUpdate() {
    if (editIndex === null) return;

    const updated = [...data];
    updated[editIndex] = editForm;

    setData(updated);
    localStorage.setItem("ppdb", JSON.stringify(updated));

    setEditIndex(null);
  }

  function handleLogout() {
    localStorage.removeItem("isLogin");
    router.push("/login");
  }

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Dashboard Admin PPDB
        </h1>

        <button
          onClick={handleLogout}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* FORM EDIT */}
      {editIndex !== null && (
        <div className="bg-yellow-100 p-6 rounded mb-6">
          <h2 className="text-xl font-bold mb-4">
            Edit Data
          </h2>

          <div className="space-y-3">
            <input
              type="text"
              value={editForm.nama}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, nama: e.target.value })
              }
            />

            <input
              type="text"
              value={editForm.nisn}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, nisn: e.target.value })
              }
            />

            <input
              type="text"
              value={editForm.sekolah}
              className="w-full border p-2 rounded"
              onChange={(e) =>
                setEditForm({ ...editForm, sekolah: e.target.value })
              }
            />

            <button
              onClick={handleUpdate}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      )}

      {/* TABEL */}
      {data.length === 0 ? (
        <p>Belum ada data</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3">No</th>
                <th className="p-3">Nama</th>
                <th className="p-3">NISN</th>
                <th className="p-3">Asal Sekolah</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{item.nama}</td>
                  <td className="p-3">{item.nisn}</td>
                  <td className="p-3">{item.sekolah}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
