import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data: any[] = await prisma.$queryRawUnsafe(`
      SELECT * FROM CatatanBiayaPendidikan ORDER BY urutan ASC
    `);
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
      const lastItem: any[] = await prisma.$queryRawUnsafe(`
        SELECT urutan FROM CatatanBiayaPendidikan ORDER BY urutan DESC LIMIT 1
      `);
      newUrutan = lastItem.length > 0 ? Number(lastItem[0].urutan) + 1 : 1;
    }

    // Use executeRawUnsafe to circumvent schema mismatch during dev server
    const crypto = require("crypto");
    const newId = "cat_" + crypto.randomUUID().replace(/-/g, "");
    const now = new Date().toISOString();

    await prisma.$executeRawUnsafe(
      `INSERT INTO CatatanBiayaPendidikan (id, isi, urutan, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      newId,
      isi,
      Number(newUrutan),
      now,
      now
    );

    return NextResponse.json({ message: "Catatan berhasil ditambahkan", id: newId });
  } catch (error) {
    console.error("POST CATATAN BIAYA ERROR:", error);
    return NextResponse.json({ error: "Gagal menambah catatan biaya" }, { status: 500 });
  }
}
