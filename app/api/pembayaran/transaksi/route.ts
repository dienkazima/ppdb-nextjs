import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Helper: map jenjang name → biayaPendidikan column key
function getBiayaFieldName(jenjang: string, jenisKelamin: string): string | null {
  const j = (jenjang || "").toLowerCase();
  const isLk = (jenisKelamin || "").toLowerCase().includes("laki");
  const suffix = isLk ? "Lk" : "Pr";
  if (j.includes("tk") || j.includes("paud"))  return `tk${suffix}`;
  if (j.includes("sd") || j.includes("mi"))    return `sd${suffix}`;
  if (j.includes("smp") || j.includes("mts")) return `smp${suffix}`;
  if (j.includes("sma") || j.includes("ma"))  return `sma${suffix}`;
  return null;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    let whereClause = `statusPembayaran != 'Belum Bayar'`;
    if (session.role === "PANITIA" && session.jenjang) {
      whereClause += ` AND jenjang LIKE '%${session.jenjang}%'`;
    }

    // Ambil semua pendaftar yang sudah pernah upload
    const pendaftarList: any[] = await prisma.$queryRawUnsafe(`
      SELECT
        id, nama, noPendaftaran, jenjang, jenisKelamin,
        statusPembayaran, buktiPembayaran, createdAt,
        nominal, metodePembayaran, catatanPenolakan, tanggalVerifikasi,
        totalTagihan, totalDibayar
      FROM Pendaftar
      WHERE ${whereClause}
      ORDER BY createdAt DESC
    `);

    if (!pendaftarList || pendaftarList.length === 0) {
      return NextResponse.json([]);
    }

    // Ambil semua riwayat cicilan
    const ids = pendaftarList.map((p: any) => `'${p.id}'`).join(",");
    const riwayatList: any[] = ids.length > 0
      ? await prisma.$queryRawUnsafe(`
          SELECT id, pendaftarId, nomorCicilan, nominal, metodePembayaran,
                 buktiPembayaran, statusPembayaran, catatanPenolakan, catatan, tanggalVerifikasi, createdAt
          FROM RiwayatPembayaran
          WHERE pendaftarId IN (${ids})
          ORDER BY nomorCicilan ASC
        `)
      : [];

    // Ambil semua biaya pendidikan sekali (efisiensi — 1 query untuk semua rows)
    let biayaList: any[] = [];
    try {
      biayaList = await prisma.$queryRawUnsafe(
        `SELECT tkLk, tkPr, sdLk, sdPr, smpLk, smpPr, smaLk, smaPr FROM BiayaPendidikan`
      ) as any[];
    } catch { /* biayaList stays [] */ }

    // Gabungkan data
    const result = pendaftarList.map((p: any) => {
      const riwayat = riwayatList.filter((r: any) => r.pendaftarId === p.id);

      const totalDibayar = riwayat
        .filter((r: any) => r.statusPembayaran === "Diverifikasi")
        .reduce((sum: number, r: any) => sum + Number(r.nominal || 0), 0);

      const totalMenunggu = riwayat
        .filter((r: any) => r.statusPembayaran === "Menunggu Verifikasi")
        .reduce((sum: number, r: any) => sum + Number(r.nominal || 0), 0);

      // totalTagihan: gunakan dari kolom DB jika ada; jika tidak, hitung dari biayaPendidikan
      let totalTagihan: number | null = p.totalTagihan ? Number(p.totalTagihan) : null;
      if (!totalTagihan && biayaList.length > 0) {
        const fieldName = getBiayaFieldName(p.jenjang, p.jenisKelamin);
        if (fieldName) {
          const computed = biayaList.reduce((sum: number, b: any) => sum + (Number(b[fieldName]) || 0), 0);
          if (computed > 0) totalTagihan = computed;
        }
      }

      const sisaTagihan = totalTagihan != null ? Math.max(0, totalTagihan - totalDibayar) : null;
      const jumlahCicilan = riwayat.length;
      const cicilanMenunggu = riwayat.filter((r: any) => r.statusPembayaran === "Menunggu Verifikasi").length;

      let statusPembayaran = p.statusPembayaran;
      if (sisaTagihan !== null && sisaTagihan <= 0 && totalDibayar > 0) {
        statusPembayaran = "Lunas";
      } else if (statusPembayaran === "Lunas" && sisaTagihan !== null && sisaTagihan > 0) {
        statusPembayaran = "Cicilan";
      } else if (totalMenunggu > 0 && totalDibayar === 0 && statusPembayaran !== "Ditolak") {
        statusPembayaran = "Menunggu Verifikasi";
      }

      return {
        id: p.id,
        nama: p.nama,
        noPendaftaran: p.noPendaftaran,
        jenjang: p.jenjang,
        jenisKelamin: p.jenisKelamin,
        statusPembayaran: statusPembayaran,
        buktiPembayaran: p.buktiPembayaran,
        createdAt: p.createdAt,
        nominal: p.nominal,
        metodePembayaran: p.metodePembayaran,
        catatanPenolakan: p.catatanPenolakan,
        tanggalVerifikasi: p.tanggalVerifikasi,
        totalTagihan,
        totalDibayar,
        totalMenunggu,
        sisaTagihan,
        jumlahCicilan,
        cicilanMenunggu,
        riwayat: riwayat.map((r: any) => ({
          id: r.id,
          nomorCicilan: Number(r.nomorCicilan),
          nominal: Number(r.nominal),
          metodePembayaran: r.metodePembayaran,
          buktiPembayaran: r.buktiPembayaran,
          statusPembayaran: r.statusPembayaran,
          catatanPenolakan: r.catatanPenolakan,
          catatan: r.catatan,
          tanggalVerifikasi: r.tanggalVerifikasi,
          createdAt: r.createdAt,
        })),
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET TRANSAKSI ERROR:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
