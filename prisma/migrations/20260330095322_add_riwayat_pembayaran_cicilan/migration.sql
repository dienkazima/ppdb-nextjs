-- CreateTable
CREATE TABLE "RiwayatPembayaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pendaftarId" TEXT NOT NULL,
    "nomorCicilan" INTEGER NOT NULL DEFAULT 1,
    "nominal" REAL NOT NULL,
    "metodePembayaran" TEXT,
    "buktiPembayaran" TEXT,
    "statusPembayaran" TEXT NOT NULL DEFAULT 'Menunggu Verifikasi',
    "catatanPenolakan" TEXT,
    "tanggalVerifikasi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RiwayatPembayaran_pendaftarId_fkey" FOREIGN KEY ("pendaftarId") REFERENCES "Pendaftar" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetodePembayaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "namaBank" TEXT NOT NULL,
    "nomorRekening" TEXT NOT NULL,
    "atasNama" TEXT NOT NULL,
    "instruksi" TEXT,
    "kategori" TEXT NOT NULL DEFAULT 'BANK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "JenjangPendidikan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Persyaratan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenjangPendidikanId" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Persyaratan_jenjangPendidikanId_fkey" FOREIGN KEY ("jenjangPendidikanId") REFERENCES "JenjangPendidikan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Biaya" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenjangPendidikanId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nominal" REAL NOT NULL,
    "keterangan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Biaya_jenjangPendidikanId_fkey" FOREIGN KEY ("jenjangPendidikanId") REFERENCES "JenjangPendidikan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenjangPendidikanId" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Target_jenjangPendidikanId_fkey" FOREIGN KEY ("jenjangPendidikanId") REFERENCES "JenjangPendidikan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TenagaPendidik" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenjangPendidikanId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jabatan" TEXT NOT NULL,
    "foto" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TenagaPendidik_jenjangPendidikanId_fkey" FOREIGN KEY ("jenjangPendidikanId") REFERENCES "JenjangPendidikan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pengaturan" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '1',
    "bukaPendaftaran" BOOLEAN NOT NULL DEFAULT true,
    "jenjangTerbuka" TEXT NOT NULL DEFAULT 'TK,SD,SMP,SMA',
    "modeTahunAjaran" TEXT NOT NULL DEFAULT 'AUTO',
    "tahunAjaranManual" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AlurPendaftaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TimelinePenerimaan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FaqPendaftaran" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "q" TEXT NOT NULL,
    "a" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PersyaratanDaftar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teks" TEXT NOT NULL,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VisiSekolah" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '1',
    "konten" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MisiSekolah" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teks" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TujuanSekolah" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teks" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProfilYayasan" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT '1',
    "deskripsi" TEXT NOT NULL,
    "embedMap" TEXT NOT NULL,
    "nomorWa" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JamPelayanan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hari" TEXT NOT NULL,
    "jam" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "KontakPanitia" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BiayaPendidikan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jenisPembayaran" TEXT NOT NULL,
    "uraian" TEXT,
    "tkLk" INTEGER,
    "tkPr" INTEGER,
    "sdLk" INTEGER,
    "sdPr" INTEGER,
    "smpLk" INTEGER,
    "smpPr" INTEGER,
    "smaLk" INTEGER,
    "smaPr" INTEGER,
    "keterangan" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pendaftar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "noPendaftaran" TEXT,
    "jenjang" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" DATETIME NOT NULL,
    "nik" TEXT NOT NULL,
    "anakKe" INTEGER,
    "jumlahSaudara" INTEGER,
    "agama" TEXT,
    "tinggiBadan" REAL,
    "beratBadan" REAL,
    "alamat" TEXT,
    "dusun" TEXT,
    "desa" TEXT,
    "kecamatan" TEXT,
    "kabupaten" TEXT,
    "noHpOrtu" TEXT,
    "sekolahAsal" TEXT,
    "transportasi" TEXT,
    "namaAyah" TEXT,
    "tempatLahirAyah" TEXT,
    "alamatAyah" TEXT,
    "tahunLahirAyah" INTEGER,
    "pendidikanAyah" TEXT,
    "pekerjaanAyah" TEXT,
    "penghasilanAyah" TEXT,
    "namaIbu" TEXT,
    "tempatLahirIbu" TEXT,
    "alamatIbu" TEXT,
    "tahunLahirIbu" INTEGER,
    "pendidikanIbu" TEXT,
    "pekerjaanIbu" TEXT,
    "penghasilanIbu" TEXT,
    "ijazah" TEXT,
    "kk" TEXT,
    "akta" TEXT,
    "ktp" TEXT,
    "statusPembayaran" TEXT NOT NULL DEFAULT 'Belum Bayar',
    "buktiPembayaran" TEXT,
    "nominal" REAL,
    "metodePembayaran" TEXT,
    "catatanPenolakan" TEXT,
    "tanggalVerifikasi" TEXT,
    "totalTagihan" REAL,
    "totalDibayar" REAL
);
INSERT INTO "new_Pendaftar" ("agama", "akta", "alamat", "alamatAyah", "alamatIbu", "anakKe", "beratBadan", "createdAt", "desa", "dusun", "id", "ijazah", "jenisKelamin", "jenjang", "jumlahSaudara", "kabupaten", "kecamatan", "kk", "ktp", "nama", "namaAyah", "namaIbu", "nik", "noHpOrtu", "noPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "pendidikanAyah", "pendidikanIbu", "penghasilanAyah", "penghasilanIbu", "sekolahAsal", "status", "tahunLahirAyah", "tahunLahirIbu", "tanggalLahir", "tempatLahir", "tempatLahirAyah", "tempatLahirIbu", "tinggiBadan", "transportasi") SELECT "agama", "akta", "alamat", "alamatAyah", "alamatIbu", "anakKe", "beratBadan", "createdAt", "desa", "dusun", "id", "ijazah", "jenisKelamin", "jenjang", "jumlahSaudara", "kabupaten", "kecamatan", "kk", "ktp", "nama", "namaAyah", "namaIbu", "nik", "noHpOrtu", "noPendaftaran", "pekerjaanAyah", "pekerjaanIbu", "pendidikanAyah", "pendidikanIbu", "penghasilanAyah", "penghasilanIbu", "sekolahAsal", "status", "tahunLahirAyah", "tahunLahirIbu", "tanggalLahir", "tempatLahir", "tempatLahirAyah", "tempatLahirIbu", "tinggiBadan", "transportasi" FROM "Pendaftar";
DROP TABLE "Pendaftar";
ALTER TABLE "new_Pendaftar" RENAME TO "Pendaftar";
CREATE UNIQUE INDEX "Pendaftar_noPendaftaran_key" ON "Pendaftar"("noPendaftaran");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
