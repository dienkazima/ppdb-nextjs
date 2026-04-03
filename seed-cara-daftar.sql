-- Seed data untuk tabel AlurPendaftaran
INSERT INTO "AlurPendaftaran" (id, title, icon, urutan, content, "createdAt", "updatedAt") VALUES
('alur-1', 'Isi Formulir Pendaftaran', 'FileText', 1, 'Lengkapi data diri calon santri, data orang tua/wali, serta riwayat pendidikan asal dengan benar dan valid pada sistem pendaftaran online kami. Pastikan nomor WhatsApp dan email yang dimasukkan aktif dan dapat dihubungi.', datetime('now'), datetime('now')),
('alur-2', 'Upload Dokumen Persyaratan', 'UploadCloud', 2, 'Siapkan dan unggah dokumen persyaratan wajib seperti scan Kartu Keluarga (KK), Akta Kelahiran, dan Surat Keterangan Lulus (SKL) atau Ijazah dalam format JPG, PNG, atau PDF. Ukuran file maksimal 2MB per dokumen.', datetime('now'), datetime('now')),
('alur-3', 'Pembayaran Biaya Pendaftaran', 'CreditCard', 3, 'Lakukan pembayaran biaya pendaftaran awal sesuai dengan jenjang yang dipilih melalui rekening resmi Yayasan Jamaluddin Suralaga. Kemudian unggah foto bukti transfer yang jelas dan terbaca di halaman konfirmasi.', datetime('now'), datetime('now')),
('alur-4', 'Verifikasi & Jadwal Seleksi', 'CheckCircle', 4, 'Admin kami akan memverifikasi seluruh berkas dan pembayaran Anda dalam waktu maksimal 2x24 jam kerja. Jika dinyatakan valid, Anda akan mendapatkan kartu ujian dan jadwal seleksi wawancara atau tes baca Al-Quran.', datetime('now'), datetime('now'));

-- Seed data untuk tabel TimelinePenerimaan
INSERT INTO "TimelinePenerimaan" (id, date, event, status, urutan, "createdAt", "updatedAt") VALUES
('tl-1', '01 Februari - 31 Maret 2026', 'Pendaftaran Gelombang 1', 'active', 1, datetime('now'), datetime('now')),
('tl-2', '05 April 2026', 'Tes Seleksi Gelombang 1', 'upcoming', 2, datetime('now'), datetime('now')),
('tl-3', '15 April 2026', 'Pengumuman Kelulusan Gelombang 1', 'upcoming', 3, datetime('now'), datetime('now')),
('tl-4', '20 April - 30 Mei 2026', 'Daftar Ulang Calon Santri Diterima', 'upcoming', 4, datetime('now'), datetime('now')),
('tl-5', '01 Juni - 30 Juni 2026', 'Pendaftaran Gelombang 2', 'upcoming', 5, datetime('now'), datetime('now')),
('tl-6', '14 Juli 2026', 'Hari Pertama Masuk Pesantren', 'upcoming', 6, datetime('now'), datetime('now'));

-- Seed data untuk tabel FaqPendaftaran
INSERT INTO "FaqPendaftaran" (id, q, a, urutan, "createdAt", "updatedAt") VALUES
('faq-1', 'Apakah bisa mendaftar jika belum memiliki ijazah asli?', 'Bisa. Anda dapat menggunakan Surat Keterangan Lulus (SKL) sementara yang dikeluarkan oleh sekolah asal. Ijazah asli dapat diserahkan paling lambat saat daftar ulang atau awal tahun ajaran baru dimulai.', 1, datetime('now'), datetime('now')),
('faq-2', 'Apakah ada beasiswa atau keringanan biaya pendidikan?', 'Ya, Yayasan Jamaluddin Suralaga menyediakan program beasiswa bagi calon santri berprestasi dan santri dari keluarga kurang mampu. Informasi lebih lanjut dapat ditanyakan langsung ke panitia penerimaan melalui nomor WhatsApp resmi kami.', 2, datetime('now'), datetime('now')),
('faq-3', 'Jika tidak lulus seleksi, apakah biaya pendaftaran dikembalikan?', 'Biaya administrasi pendaftaran awal tidak dapat dikembalikan. Namun, biaya lain seperti uang gedung atau biaya pangkal yang mungkin sudah disetorkan akan dikembalikan 100% kepada orang tua/wali santri.', 3, datetime('now'), datetime('now')),
('faq-4', 'Berapa lama proses verifikasi berkas berlangsung?', 'Proses verifikasi berkas akan diselesaikan oleh tim admin kami dalam waktu 2x24 jam hari kerja (Senin-Jumat). Anda akan mendapat notifikasi melalui email atau WhatsApp yang telah terdaftar.', 4, datetime('now'), datetime('now'));

-- Seed data untuk tabel PersyaratanDaftar
INSERT INTO "PersyaratanDaftar" (id, teks, "isImportant", urutan, "createdAt", "updatedAt") VALUES
('psy-1', 'Fotocopy Akta Kelahiran yang masih berlaku (3 lembar)', 0, 1, datetime('now'), datetime('now')),
('psy-2', 'Fotocopy Kartu Keluarga (KK) terbaru (3 lembar)', 0, 2, datetime('now'), datetime('now')),
('psy-3', 'Pas foto terbaru berwarna ukuran 3x4 (4 lembar)', 0, 3, datetime('now'), datetime('now')),
('psy-4', 'Scan Ijazah SD/MI atau SMP/MTs yang telah dilegalisir (format JPG/PDF)', 1, 4, datetime('now'), datetime('now')),
('psy-5', 'Surat Keterangan Berkelakuan Baik (SKBB) dari sekolah asal', 0, 5, datetime('now'), datetime('now')),
('psy-6', 'Surat Keterangan Sehat dari dokter atau Puskesmas setempat', 0, 6, datetime('now'), datetime('now'));
