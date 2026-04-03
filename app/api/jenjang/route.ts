import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const jenjangs = await prisma.jenjangPendidikan.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        persyaratan: true,
        biaya: true,
        target: true,
        guru: true,
      }
    });
    return NextResponse.json(jenjangs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jenjang pendidikan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const jenjang = await prisma.jenjangPendidikan.create({
      data: {
        nama: json.nama,
        deskripsi: json.deskripsi,
        icon: json.icon,
      },
    });
    return NextResponse.json(jenjang, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create jenjang pendidikan" }, { status: 500 });
  }
}
