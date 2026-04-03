// Seed script untuk mengisi data contoh Cara Daftar langsung ke DB via Prisma
// Jalankan dengan: node seed-cara-daftar.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai mengisi data contoh Cara Daftar...\n");

  // --- Alur Pendaftaran ---
  await prisma.alurPendaftaran.createMany({
    data: [
      { title: "Isi Formulir Pendaftaran", icon: "FileText", urutan: 1, content: "Lengkapi data diri calon santri, data orang tua/wali, serta riwayat pendidikan asal dengan benar dan valid pada sistem pendaftaran online kami. Pastikan nomor WhatsApp dan email yang dimasukkan aktif dan dapat dihubungi." },
      { title: "Upload Dokumen Persyaratan", icon: "UploadCloud", urutan: 2, content: "Siapkan dan unggah dokumen persyaratan wajib seperti scan Kartu Keluarga (KK), Akta Kelahiran, dan Surat Keterangan Lulus (SKL) atau Ijazah dalam format JPG, PNG, atau PDF. Ukuran file maksimal 2MB per dokumen." },
      { title: "Pembayaran Biaya Pendaftaran", icon: "CreditCard", urutan: 3, content: "Lakukan pembayaran biaya pendaftaran awal sesuai dengan jenjang yang dipilih melalui rekening resmi Yayasan Jamaluddin Suralaga. Kemudian unggah foto bukti transfer yang jelas dan terbaca di halaman konfirmasi." },
      { title: "Verifikasi & Jadwal Seleksi", icon: "CheckCircle", urutan: 4, content: "Admin kami akan memverifikasi seluruh berkas dan pembayaran Anda dalam waktu maksimal 2x24 jam kerja. Jika dinyatakan valid, Anda akan mendapatkan kartu ujian dan jadwal seleksi wawancara atau tes baca Al-Quran." },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Alur Pendaftaran (4 langkah) berhasil disimpan.");

  // --- Timeline Penerimaan ---
  await prisma.timelinePenerimaan.createMany({
    data: [
      { date: "01 Februari - 31 Maret 2026", event: "Pendaftaran Gelombang 1", status: "active", urutan: 1 },
      { date: "05 April 2026", event: "Tes Seleksi Gelombang 1", status: "upcoming", urutan: 2 },
      { date: "15 April 2026", event: "Pengumuman Kelulusan Gelombang 1", status: "upcoming", urutan: 3 },
      { date: "20 April - 30 Mei 2026", event: "Daftar Ulang Calon Santri Diterima", status: "upcoming", urutan: 4 },
      { date: "01 Juni - 30 Juni 2026", event: "Pendaftaran Gelombang 2", status: "upcoming", urutan: 5 },
      { date: "14 Juli 2026", event: "Hari Pertama Masuk Pesantren", status: "upcoming", urutan: 6 },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Timeline Penerimaan (6 item) berhasil disimpan.");

  // --- FAQ ---
  await prisma.faqPendaftaran.createMany({
    data: [
      { urutan: 1, q: "Apakah bisa mendaftar jika belum memiliki ijazah asli?", a: "Bisa. Anda dapat menggunakan Surat Keterangan Lulus (SKL) sementara yang dikeluarkan oleh sekolah asal. Ijazah asli dapat diserahkan paling lambat saat daftar ulang atau awal tahun ajaran baru dimulai." },
      { urutan: 2, q: "Apakah ada beasiswa atau keringanan biaya pendidikan?", a: "Ya, Yayasan Jamaluddin Suralaga menyediakan program beasiswa bagi calon santri berprestasi dan santri dari keluarga kurang mampu. Informasi lebih lanjut dapat ditanyakan langsung ke panitia penerimaan melalui nomor WhatsApp resmi kami." },
      { urutan: 3, q: "Jika tidak lulus seleksi, apakah biaya pendaftaran dikembalikan?", a: "Biaya administrasi pendaftaran awal tidak dapat dikembalikan. Namun, biaya lain seperti uang gedung atau biaya pangkal yang mungkin sudah disetorkan akan dikembalikan 100% kepada orang tua/wali santri." },
      { urutan: 4, q: "Berapa lama proses verifikasi berkas berlangsung?", a: "Proses verifikasi berkas akan diselesaikan oleh tim admin kami dalam waktu 2x24 jam hari kerja (Senin-Jumat). Anda akan mendapat notifikasi melalui email atau WhatsApp yang telah terdaftar." },
    ],
    skipDuplicates: true,
  });
  console.log("✅ FAQ (4 pertanyaan) berhasil disimpan.");

  // --- Persyaratan ---
  await prisma.persyaratanDaftar.createMany({
    data: [
      { urutan: 1, teks: "Fotocopy Akta Kelahiran yang masih berlaku (3 lembar)", isImportant: false },
      { urutan: 2, teks: "Fotocopy Kartu Keluarga (KK) terbaru (3 lembar)", isImportant: false },
      { urutan: 3, teks: "Pas foto terbaru berwarna ukuran 3x4 (4 lembar)", isImportant: false },
      { urutan: 4, teks: "Scan Ijazah SD/MI atau SMP/MTs yang telah dilegalisir (format JPG/PDF)", isImportant: true },
      { urutan: 5, teks: "Surat Keterangan Berkelakuan Baik (SKBB) dari sekolah asal", isImportant: false },
      { urutan: 6, teks: "Surat Keterangan Sehat dari dokter atau Puskesmas setempat", isImportant: false },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Persyaratan Umum (6 item) berhasil disimpan.");

  console.log("\n🎉 Selesai! Semua data contoh telah berhasil dimasukkan ke database.");
  console.log("   → Buka http://localhost:3000/cara-daftar untuk melihat hasilnya.");
}

main()
  .catch((e) => {
    console.error("❌ Gagal:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
