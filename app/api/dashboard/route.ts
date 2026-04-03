import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const whereClause: any = {};
    if (session.role === "PANITIA" && session.jenjang) {
      whereClause.jenjang = { contains: session.jenjang };
    }

    // Ambil semua jenjang dari DB (single source of truth)
    const allJenjang = await prisma.jenjangPendidikan.findMany({
      orderBy: { createdAt: "asc" },
      select: { nama: true },
    });

    const total = await prisma.pendaftar.count({ where: whereClause });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await prisma.pendaftar.count({
      where: { ...whereClause, createdAt: { gte: today } },
    });

    // Hitung pendaftar per jenjang secara dinamis
    const byJenjangArr = await Promise.all(
      allJenjang.map(async (j) => {
        if (session.role === "PANITIA" && session.jenjang && !j.nama.includes(session.jenjang)) {
          return { nama: j.nama, count: 0 };
        }
        const count = await prisma.pendaftar.count({
          where: { ...whereClause, jenjang: j.nama },
        });
        return { nama: j.nama, count };
      })
    );

    const byJenjang: Record<string, number> = {};
    byJenjangArr.forEach(({ nama, count }) => {
      byJenjang[nama] = count;
    });

    const menunggu = await prisma.pendaftar.count({
      where: { ...whereClause, status: "Menunggu" },
    });
    const diterima = await prisma.pendaftar.count({
      where: { ...whereClause, status: "Diterima" },
    });
    const ditolak = await prisma.pendaftar.count({
      where: { ...whereClause, status: "Ditolak" },
    });

    let byGender = null;
    if (session.role === "PANITIA") {
      const maleCount = await prisma.pendaftar.count({
        where: { ...whereClause, jenisKelamin: "Laki-laki" },
      });
      const femaleCount = await prisma.pendaftar.count({
        where: { ...whereClause, jenisKelamin: "Perempuan" },
      });
      byGender = { "Laki-laki": maleCount, "Perempuan": femaleCount };
    }

    return NextResponse.json({
      total,
      todayCount,
      byJenjang,       // { "TK": 5, "SD": 12, "SMP": 8, "SMA": 3, ... }
      jenjangList: allJenjang.map(j => j.nama), // urutan dari DB
      menunggu,
      diterima,
      ditolak,
      byGender,
    });

  } catch (error) {
    return NextResponse.json({ error: "Error dashboard" }, { status: 500 });
  }
}