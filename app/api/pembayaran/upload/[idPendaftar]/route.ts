import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper: Hitung total tagihan dari BiayaPendidikan berdasarkan jenjang + jenis kelamin
async function hitungTotalTagihan(jenjang: string, jenisKelamin: string): Promise<number | null> {
  try {
    const biayaList = await prisma.biayaPendidikan.findMany({
      select: { jenisPembayaran: true, tkLk: true, tkPr: true, sdLk: true, sdPr: true, smpLk: true, smpPr: true, smaLk: true, smaPr: true }
    });

    if (!biayaList || biayaList.length === 0) return null;

    const isLk = jenisKelamin?.toLowerCase().includes("laki");
    const j = (jenjang || "").toLowerCase();

    // Map nama jenjang dinamis → prefix kolom
    let prefix = "";
    if (j.includes("tk") || j.includes("paud"))       prefix = "tk";
    else if (j.includes("sd") || j.includes("mi"))    prefix = "sd";
    else if (j.includes("smp") || j.includes("mts")) prefix = "smp";
    else if (j.includes("sma") || j.includes("ma"))  prefix = "sma";

    if (!prefix) return null;
    const fieldName = `${prefix}${isLk ? "Lk" : "Pr"}`;

    let total = 0;
    for (const b of biayaList) {
      const nilai = (b as any)[fieldName];
      if (nilai) total += Number(nilai);
    }
    return total > 0 ? total : null;
  } catch {
    return null;
  }
}

// POST: Upload cicilan baru (setiap upload = record RiwayatPembayaran baru)
export async function POST(req: Request, { params }: { params: Promise<{ idPendaftar: string }> }) {
  try {
    const { idPendaftar } = await params;
    const body = await req.json();

    if (!body.buktiPembayaran) {
      return NextResponse.json({ error: "Bukti pembayaran tidak boleh kosong" }, { status: 400 });
    }
    if (!idPendaftar) {
      return NextResponse.json({ error: "ID pendaftar tidak valid" }, { status: 400 });
    }

    const nominal = body.nominal ? parseFloat(body.nominal) : 0;
    const metodePembayaran = body.metodePembayaran || null;

    // Ambil data pendaftar untuk hitung totalTagihan
    const pendaftar = await prisma.pendaftar.findUnique({
      where: { id: idPendaftar },
      select: { id: true, jenjang: true, jenisKelamin: true, statusPembayaran: true, totalTagihan: true }
    });

    if (!pendaftar) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan" }, { status: 404 });
    }

    // Hitung nomor cicilan (count existing riwayat + 1)
    const countRiwayat = await prisma.riwayatPembayaran.count({
      where: { pendaftarId: idPendaftar }
    });
    const nomorCicilan = countRiwayat + 1;

    // Insert record RiwayatPembayaran baru
    const riwayatId = `rp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await prisma.riwayatPembayaran.create({
      data: {
        id: riwayatId,
        pendaftarId: idPendaftar,
        nomorCicilan,
        nominal,
        metodePembayaran,
        buktiPembayaran: body.buktiPembayaran,
        statusPembayaran: 'Menunggu Verifikasi',
      }
    });

    // Hitung totalTagihan otomatis dari BiayaPendidikan (hanya jika belum ada)
    let totalTagihan = pendaftar.totalTagihan ? Number(pendaftar.totalTagihan) : null;
    if (!totalTagihan) {
      totalTagihan = await hitungTotalTagihan(pendaftar.jenjang, pendaftar.jenisKelamin);
    }

    // Update Pendaftar: statusPembayaran = "Menunggu Verifikasi", simpan totalTagihan, update last upload info
    const updateData: any = {
      buktiPembayaran: body.buktiPembayaran,
      statusPembayaran: 'Menunggu Verifikasi',
      nominal,
      metodePembayaran,
    };
    if (totalTagihan) {
      updateData.totalTagihan = totalTagihan;
    }

    await prisma.pendaftar.update({
      where: { id: idPendaftar },
      data: updateData
    });

    return NextResponse.json({
      message: `Cicilan ke-${nomorCicilan} berhasil diupload`,
      nomorCicilan,
      riwayatId
    });
  } catch (error: any) {
    console.error("UPLOAD CICILAN ERROR:", error?.message || error);
    return NextResponse.json(
      { error: "Gagal menyimpan bukti pembayaran", detail: error?.message },
      { status: 500 }
    );
  }
}
