import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const no = searchParams.get("no");

  if (!no) {
    return NextResponse.json({ error: "Nomor pendaftaran wajib diisi" }, { status: 400 });
  }

  try {
    const data = await prisma.pendaftar.findFirst({
      where: { noPendaftaran: no },
      include: { riwayatPembayaran: true }
    });

    if (!data) {
      return NextResponse.json({ error: "Nomor pendaftaran tidak ditemukan atau belum terdaftar." }, { status: 404 });
    }

    // Hitung Total Tagihan dari BiayaPendidikan
    let totalTagihan = 0;
    try {
      const biayaList = await prisma.biayaPendidikan.findMany();
      const isLk = data.jenisKelamin?.toLowerCase().includes("laki");
      const genderSuffix = isLk ? "Lk" : "Pr";

      // Map nama jenjang (dari DB pendaftar) → prefix kolom biayaPendidikan
      const jenjangNama = (data.jenjang || "").toLowerCase();
      let jenjangPrefix = "";
      if (jenjangNama.includes("tk") || jenjangNama.includes("paud")) jenjangPrefix = "tk";
      else if (jenjangNama.includes("sd") || jenjangNama.includes("mi")) jenjangPrefix = "sd";
      else if (jenjangNama.includes("smp") || jenjangNama.includes("mts")) jenjangPrefix = "smp";
      else if (jenjangNama.includes("sma") || jenjangNama.includes("ma")) jenjangPrefix = "sma";

      if (jenjangPrefix) {
        const fieldName = `${jenjangPrefix}${genderSuffix}`; // contoh: "smaLk", "sdPr"
        totalTagihan = biayaList.reduce((acc: number, curr: any) => {
          return acc + (Number(curr[fieldName]) || 0);
        }, 0);
      }
    } catch (e) {
      console.log("Gagal hitung tagihan", e);
    }

    // Hitung totalDibayar (sudah Diverifikasi) dan totalMenunggu (belum diverifikasi)
    const riwayat = data.riwayatPembayaran || [];
    const totalDibayar = riwayat
      .filter((r: any) => r.statusPembayaran === "Diverifikasi")
      .reduce((acc: number, r: any) => acc + Number(r.nominal || 0), 0);

    const totalMenunggu = riwayat
      .filter((r: any) => r.statusPembayaran === "Menunggu Verifikasi")
      .reduce((acc: number, r: any) => acc + Number(r.nominal || 0), 0);

    // Prioritas status pembayaran: Ditolak → Lunas → Cicilan → Dalam Verifikasi → Belum Bayar
    let computedStatusPembayaran = "Belum Bayar";
    if (data.statusPembayaran === "Ditolak") {
      computedStatusPembayaran = "Ditolak";
    } else if (totalTagihan > 0 && totalDibayar >= totalTagihan) {
      computedStatusPembayaran = "Lunas";
    } else if (totalDibayar > 0 && totalTagihan > 0 && totalDibayar < totalTagihan) {
      computedStatusPembayaran = "Cicilan";
    } else if (totalMenunggu > 0 || data.statusPembayaran === "Menunggu Verifikasi" || (data.buktiPembayaran && totalDibayar === 0 && data.statusPembayaran !== "Ditolak")) {
      computedStatusPembayaran = "Dalam Verifikasi";
    }

    return NextResponse.json({
      id: data.id,
      noPendaftaran: data.noPendaftaran,
      nama: data.nama,
      jenjang: data.jenjang,
      totalTagihan,
      totalDibayar,
      totalMenunggu,
      // @ts-ignore
      status: data.status || "Menunggu Verifikasi",
      statusPembayaran: computedStatusPembayaran,
      // @ts-ignore
      buktiPembayaran: data.buktiPembayaran,
      // @ts-ignore
      createdAt: data.createdAt
    });
  } catch (error) {
    console.error("CEK STATUS ERROR:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
