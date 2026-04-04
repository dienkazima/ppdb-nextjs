import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET visi
export async function GET() {
  try {
    const visi = await prisma.visiSekolah.findUnique({ where: { id: "1" } });
    return NextResponse.json(visi || { id: "1", konten: "" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT (upsert) visi
export async function PUT(req: Request) {
  try {
    const { konten } = await req.json();
    const data = await prisma.visiSekolah.upsert({
      where: { id: "1" },
      update: { konten },
      create: { id: "1", konten },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
