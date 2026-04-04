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
    const riwayat = await prisma.riwayatPembayaran.findUnique({
      where: { id: riwayatId },
      select: { id: true, pendaftarId: true, nominal: true }
    });
    if (!riwayat) {
      return NextResponse.json({ error: "Data cicilan tidak ditemukan" }, { status: 404 });
    }
    const pendaftarId = riwayat.pendaftarId;

    const now = new Date().toISOString();

    // Update status cicilan ini
    if (aksi === "VERIFIKASI") {
      await prisma.riwayatPembayaran.update({
        where: { id: riwayatId },
        data: { statusPembayaran: 'Diverifikasi', tanggalVerifikasi: now }
      });
    } else {
      await prisma.riwayatPembayaran.update({
        where: { id: riwayatId },
        data: { statusPembayaran: 'Ditolak', catatanPenolakan: catatan || "" }
      });
    }

    // Hitung ulang totalDibayar dari semua cicilan yang Diverifikasi
    const verifiedAgg = await prisma.riwayatPembayaran.aggregate({
      where: { pendaftarId, statusPembayaran: 'Diverifikasi' },
      _sum: { nominal: true }
    });
    const totalDibayar = verifiedAgg._sum.nominal || 0;

    // Ambil totalTagihan pendaftar
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { totalTagihan: true, statusPembayaran: true }
    });
    const totalTagihan = pendaftar?.totalTagihan || null;

    // Cek apakah masih ada cicilan yang menunggu verifikasi
    const menungguAgg = await prisma.riwayatPembayaran.count({
      where: { pendaftarId, statusPembayaran: 'Menunggu Verifikasi' }
    });
    const masihAdaMenunggu = menungguAgg > 0;

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
    await prisma.pendaftar.update({
      where: { id: pendaftarId },
      data: {
        statusPembayaran: statusBaru,
        totalDibayar,
        ...(statusBaru === "Lunas" && { tanggalVerifikasi: now })
      }
    });

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
