import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.tataTertib.findMany({
      orderBy: [
        { urutan: 'asc' },
        { createdAt: 'asc' }
      ]
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("GET tata-tertib error:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { teks, urutan } = await req.json();
    if (!teks?.trim()) {
      return NextResponse.json({ error: "Teks wajib diisi" }, { status: 400 });
    }
    const urutanVal = Number(urutan ?? 0);
    const item = await prisma.tataTertib.create({
      data: {
        teks: teks.trim(),
        urutan: urutanVal
      }
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST tata-tertib error:", error);
    return NextResponse.json({ error: "Gagal menambah data" }, { status: 500 });
  }
}
