export default function Home() {
  return (
    <main className="min-h-screen bg-blue-50 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-blue-700">
        PPDB Online 2026
      </h1>

      <p className="mt-4 text-gray-600">
        Sistem Penerimaan Peserta Didik Baru
      </p>

      <a
        href="/daftar"
        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        Daftar Sekarang
      </a>
    </main>
  );
}
