import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pendaftarId, nominal, catatan } = body;

    if (!pendaftarId || !nominal) {
      return NextResponse.json({ error: "Data pendaftar dan nominal diperlukan" }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Cari nomor cicilan terakhir
    const existingRiwayat = await prisma.riwayatPembayaran.aggregate({
      where: { pendaftarId },
      _max: { nomorCicilan: true }
    });
    const nomorCicilanBaru = (existingRiwayat._max.nomorCicilan || 0) + 1;

    // Gunakan executeRawUnsafe untuk insert, menghindari error pada Prisma Client yang belum di-generate
    const crypto = require("crypto");
    const newId = "man_" + crypto.randomUUID().replace(/-/g, "");

    await prisma.riwayatPembayaran.create({
      data: {
        id: newId,
        pendaftarId,
        nomorCicilan: nomorCicilanBaru,
        nominal: Number(nominal),
        metodePembayaran: "Offline",
        statusPembayaran: "Diverifikasi",
        tanggalVerifikasi: now,
        catatan: catatan || null
      }
    });

    // Hitung ulang total dibayar
    const verifiedRows = await prisma.riwayatPembayaran.aggregate({
      where: { pendaftarId, statusPembayaran: "Diverifikasi" },
      _sum: { nominal: true }
    });
    const totalDibayar = verifiedRows._sum.nominal || 0;

    // Ambil info pendaftar
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: pendaftarId },
      select: { totalTagihan: true, statusPembayaran: true }
    });

    const totalTagihan = pendaftar?.totalTagihan || null;

    // Cek apakah ada yang masih menunggu verifikasi (jika ada, statusnya "Menunggu Verifikasi")
    // Tapi karena manual input lansung diverifikasi, yang ini aman. Kita cek yg ada di db saja.
    const menunggu = await prisma.riwayatPembayaran.count({
      where: { pendaftarId, statusPembayaran: "Menunggu Verifikasi" }
    });

    let statusBaru: string;
    if (totalTagihan && totalDibayar >= totalTagihan) {
      statusBaru = "Lunas";
    } else if (menunggu > 0) {
      statusBaru = "Menunggu Verifikasi";
    } else if (totalDibayar > 0) {
      statusBaru = "Cicilan";
    } else {
      statusBaru = "Belum Bayar";
    }

    // Update Pendaftar
    await prisma.pendaftar.update({
      where: { id: pendaftarId },
      data: {
        totalDibayar,
        statusPembayaran: statusBaru,
        ...(statusBaru === "Lunas" && { tanggalVerifikasi: now })
      }
    });

    return NextResponse.json({
      message: "Pembayaran manual berhasil dicatat",
      statusPendaftar: statusBaru,
      totalDibayar,
    });
  } catch (error: any) {
    console.error("MANUAL PAYMENT ERROR:", error?.message || error);
    return NextResponse.json(
      { error: "Gagal mencatat pembayaran manual", detail: error?.message },
      { status: 500 }
    );
  }
}
