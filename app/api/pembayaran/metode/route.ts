import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET: Ambil semua metode pembayaran aktif (public) atau semua (admin)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "true";

  try {
    const data = await prisma.metodePembayaran.findMany({
      where: admin ? undefined : { isActive: true },
      orderBy: [
        { kategori: "asc" },
        { createdAt: "desc" }
      ]
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET METODE PEMBAYARAN ERROR:", error);
    return NextResponse.json({ error: "Gagal mengambil data metode pembayaran" }, { status: 500 });
  }
}

// POST: Tambah metode pembayaran baru (admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await prisma.metodePembayaran.create({
      data: {
        namaBank: body.namaBank,
        nomorRekening: body.nomorRekening,
        atasNama: body.atasNama,
        instruksi: body.instruksi,
        kategori: body.kategori || "BANK",
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("POST METODE PEMBAYARAN ERROR:", error);
    return NextResponse.json({ error: "Gagal menambah metode pembayaran" }, { status: 500 });
  }
}
