import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT: Verifikasi atau Tolak satu cicilan (RiwayatPembayaran)
// Body: { aksi: "VERIFIKASI" | "TOLAK", catatan?: string }
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: riwayatId } = await params;
    const body = await req.json();
    const { aksi, catatan } = body;

    if (!aksi || !["VERIFIKASI", "TOLAK"].includes(aksi)) {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    // Ambil riwayat untuk dapatkan pendaftarId
    const riwayatRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, pendaftarId, nominal FROM RiwayatPembayaran WHERE id = ?`,
      riwayatId
    );
    if (!riwayatRows || riwayatRows.length === 0) {
      return NextResponse.json({ error: "Data cicilan tidak ditemukan" }, { status: 404 });
    }
    const riwayat = riwayatRows[0];
    const pendaftarId = riwayat.pendaftarId;

    const now = new Date().toISOString();

    // Update status cicilan ini
    if (aksi === "VERIFIKASI") {
      await prisma.$executeRawUnsafe(
        `UPDATE RiwayatPembayaran SET statusPembayaran = 'Diverifikasi', tanggalVerifikasi = ? WHERE id = ?`,
        now, riwayatId
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE RiwayatPembayaran SET statusPembayaran = 'Ditolak', catatanPenolakan = ? WHERE id = ?`,
        catatan || "", riwayatId
      );
    }

    // Hitung ulang totalDibayar dari semua cicilan yang Diverifikasi
    const verifiedRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT SUM(nominal) as total FROM RiwayatPembayaran WHERE pendaftarId = ? AND statusPembayaran = 'Diverifikasi'`,
      pendaftarId
    );
    const totalDibayar = Number(verifiedRows[0]?.total || 0);

    // Ambil totalTagihan pendaftar
    const pendaftarRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT totalTagihan, statusPembayaran FROM Pendaftar WHERE id = ?`,
      pendaftarId
    );
    const totalTagihan = pendaftarRows[0]?.totalTagihan ? Number(pendaftarRows[0].totalTagihan) : null;

    // Cek apakah masih ada cicilan yang menunggu verifikasi
    const menungguRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as cnt FROM RiwayatPembayaran WHERE pendaftarId = ? AND statusPembayaran = 'Menunggu Verifikasi'`,
      pendaftarId
    );
    const masihAdaMenunggu = Number(menungguRows[0]?.cnt || 0) > 0;

    // Tentukan status baru Pendaftar
    let statusBaru: string;
    if (totalTagihan && totalDibayar >= totalTagihan) {
      statusBaru = "Lunas";
    } else if (masihAdaMenunggu) {
      statusBaru = "Menunggu Verifikasi";
    } else if (totalDibayar > 0) {
      statusBaru = "Cicilan";
    } else {
      statusBaru = "Ditolak";
    }

    // Update Pendaftar
    await prisma.$executeRawUnsafe(
      `UPDATE Pendaftar SET statusPembayaran = ?, totalDibayar = ? WHERE id = ?`,
      statusBaru, totalDibayar, pendaftarId
    );

    // Jika Lunas, simpan tanggalVerifikasi di Pendaftar
    if (statusBaru === "Lunas") {
      await prisma.$executeRawUnsafe(
        `UPDATE Pendaftar SET tanggalVerifikasi = ? WHERE id = ?`,
        now, pendaftarId
      );
    }

    return NextResponse.json({
      message: aksi === "VERIFIKASI" ? "Cicilan berhasil diverifikasi" : "Cicilan ditolak",
      statusPendaftar: statusBaru,
      totalDibayar,
    });
  } catch (error: any) {
    console.error("VERIFIKASI CICILAN ERROR:", error?.message || error);
    return NextResponse.json(
      { error: "Gagal memperbarui status pembayaran", detail: error?.message },
      { status: 500 }
    );
  }
}
