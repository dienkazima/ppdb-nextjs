import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Helper: Hitung total tagihan dari BiayaPendidikan berdasarkan jenjang + jenis kelamin
async function hitungTotalTagihan(jenjang: string, jenisKelamin: string): Promise<number | null> {
  try {
    const biayaList: any[] = await prisma.$queryRawUnsafe(`
      SELECT jenisPembayaran, tkLk, tkPr, sdLk, sdPr, smpLk, smpPr, smaLk, smaPr
      FROM BiayaPendidikan
    `);

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
      const nilai = b[fieldName];
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
    const pendaftarRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, jenjang, jenisKelamin, statusPembayaran, totalTagihan FROM Pendaftar WHERE id = ?`,
      idPendaftar
    );
    if (!pendaftarRows || pendaftarRows.length === 0) {
      return NextResponse.json({ error: "Pendaftar tidak ditemukan" }, { status: 404 });
    }
    const pendaftar = pendaftarRows[0];

    // Hitung nomor cicilan (count existing riwayat + 1)
    const countRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*) as cnt FROM RiwayatPembayaran WHERE pendaftarId = ?`,
      idPendaftar
    );
    const nomorCicilan = (Number(countRows[0]?.cnt) || 0) + 1;

    // Insert record RiwayatPembayaran baru
    const riwayatId = `rp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO RiwayatPembayaran (id, pendaftarId, nomorCicilan, nominal, metodePembayaran, buktiPembayaran, statusPembayaran, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, 'Menunggu Verifikasi', datetime('now'))`,
      riwayatId, idPendaftar, nomorCicilan, nominal, metodePembayaran, body.buktiPembayaran
    );

    // Hitung totalTagihan otomatis dari BiayaPendidikan (hanya jika belum ada)
    let totalTagihan = pendaftar.totalTagihan ? Number(pendaftar.totalTagihan) : null;
    if (!totalTagihan) {
      totalTagihan = await hitungTotalTagihan(pendaftar.jenjang, pendaftar.jenisKelamin);
    }

    // Update Pendaftar: statusPembayaran = "Menunggu Verifikasi", simpan totalTagihan, update last upload info
    const updateFields = totalTagihan
      ? `buktiPembayaran = ?, statusPembayaran = 'Menunggu Verifikasi', nominal = ?, metodePembayaran = ?, totalTagihan = ?`
      : `buktiPembayaran = ?, statusPembayaran = 'Menunggu Verifikasi', nominal = ?, metodePembayaran = ?`;

    if (totalTagihan) {
      await prisma.$executeRawUnsafe(
        `UPDATE Pendaftar SET ${updateFields} WHERE id = ?`,
        body.buktiPembayaran, nominal, metodePembayaran, totalTagihan, idPendaftar
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE Pendaftar SET ${updateFields} WHERE id = ?`,
        body.buktiPembayaran, nominal, metodePembayaran, idPendaftar
      );
    }

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
