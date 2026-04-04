import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.catatanBiayaPendidikan.findMany({
      orderBy: { urutan: 'asc' }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET CATATAN BIAYA ERROR:", error);
    return NextResponse.json({ error: "Gagal memuat catatan biaya" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { isi, urutan } = await req.json();
    if (!isi) {
      return NextResponse.json({ error: "Isi catatan wajib diisi" }, { status: 400 });
    }

    // Auto calculate urutan if not provided
    let newUrutan = urutan;
    if (urutan === undefined || urutan === null) {
      const lastItem = await prisma.catatanBiayaPendidikan.findFirst({
        orderBy: { urutan: 'desc' },
        select: { urutan: true }
      });
      newUrutan = lastItem ? Number(lastItem.urutan) + 1 : 1;
    }

    const catatanBaru = await prisma.catatanBiayaPendidikan.create({
      data: {
        isi,
        urutan: Number(newUrutan)
      }
    });

    return NextResponse.json({ message: "Catatan berhasil ditambahkan", id: catatanBaru.id });
  } catch (error) {
    console.error("POST CATATAN BIAYA ERROR:", error);
    return NextResponse.json({ error: "Gagal menambah catatan biaya" }, { status: 500 });
  }
}
