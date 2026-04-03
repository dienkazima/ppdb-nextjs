import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient() as any;

// GET all visi/misi/tujuan combined
export async function GET() {
  try {
    const [visi, misi, tujuan] = await Promise.all([
      prisma.visiSekolah.findUnique({ where: { id: "1" } }),
      prisma.misiSekolah.findMany({ orderBy: { urutan: "asc" } }),
      prisma.tujuanSekolah.findMany({ orderBy: { urutan: "asc" } }),
    ]);
    return NextResponse.json({ visi, misi, tujuan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
