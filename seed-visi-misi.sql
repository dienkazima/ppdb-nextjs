-- Seed untuk tabel VisiSekolah, MisiSekolah, TujuanSekolah
CREATE TABLE IF NOT EXISTS "VisiSekolah" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT '1',
  "konten" TEXT NOT NULL,
  "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "MisiSekolah" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "teks" TEXT NOT NULL,
  "urutan" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
  "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS "TujuanSekolah" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "teks" TEXT NOT NULL,
  "urutan" INTEGER NOT NULL DEFAULT 0,
  "createdAt" DATETIME NOT NULL DEFAULT (datetime('now')),
  "updatedAt" DATETIME NOT NULL DEFAULT (datetime('now'))
);

-- Seed sample data
INSERT OR IGNORE INTO "VisiSekolah" (id, konten, updatedAt) VALUES (
  '1',
  'Menjadi lembaga pendidikan pesantren modern yang unggul dalam pembentukan generasi Qurani, berakhlak mulia, berwawasan luas, dan mampu menjadi pemimpin umat yang amanah di tengah masyarakat global yang terus berkembang.',
  datetime('now')
);

INSERT OR IGNORE INTO "MisiSekolah" (id, teks, urutan, createdAt, updatedAt) VALUES
('mis-1', 'Menyelenggarakan pendidikan berbasis Al-Quran dan Sunnah yang terintegrasi dengan ilmu pengetahuan modern.', 1, datetime('now'), datetime('now')),
('mis-2', 'Membentuk karakter santri yang disiplin, mandiri, dan bertanggung jawab melalui kehidupan pesantren yang terstruktur.', 2, datetime('now'), datetime('now')),
('mis-3', 'Mengembangkan potensi akademik, spiritual, dan kreativitas santri secara menyeluruh dan berimbang.', 3, datetime('now'), datetime('now')),
('mis-4', 'Membangun lingkungan belajar yang kondusif, aman, dan menyenangkan berbasis nilai-nilai Islam.', 4, datetime('now'), datetime('now')),
('mis-5', 'Meningkatkan mutu tenaga pendidik secara berkesinambungan melalui pelatihan dan pengembangan kompetensi.', 5, datetime('now'), datetime('now'));

INSERT OR IGNORE INTO "TujuanSekolah" (id, teks, urutan, createdAt, updatedAt) VALUES
('tuj-1', 'Menghasilkan lulusan yang hafal Al-Quran dan mampu mengamalkannya dalam kehidupan sehari-hari.', 1, datetime('now'), datetime('now')),
('tuj-2', 'Mencetak generasi muda yang berakhlak mulia, toleran, dan berkontribusi positif bagi masyarakat luas.', 2, datetime('now'), datetime('now')),
('tuj-3', 'Mempersiapkan santri untuk melanjutkan studi ke perguruan tinggi terkemuka di dalam maupun luar negeri.', 3, datetime('now'), datetime('now')),
('tuj-4', 'Mengembangkan jiwa kepemimpinan dan kewirausahaan santri yang berlandaskan nilai-nilai Islam.', 4, datetime('now'), datetime('now'));
