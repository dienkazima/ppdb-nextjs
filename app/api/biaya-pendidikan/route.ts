import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.biayaPendidikan.findMany({
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await prisma.biayaPendidikan.create({
      data: {
        jenisPembayaran: body.jenisPembayaran,
        uraian: body.uraian || null,
        tkLk: body.tkLk ? parseInt(body.tkLk) : null,
        tkPr: body.tkPr ? parseInt(body.tkPr) : null,
        sdLk: body.sdLk ? parseInt(body.sdLk) : null,
        sdPr: body.sdPr ? parseInt(body.sdPr) : null,
        smpLk: body.smpLk ? parseInt(body.smpLk) : null,
        smpPr: body.smpPr ? parseInt(body.smpPr) : null,
        smaLk: body.smaLk ? parseInt(body.smaLk) : null,
        smaPr: body.smaPr ? parseInt(body.smaPr) : null,
        keterangan: body.keterangan || null,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create data" }, { status: 500 });
  }
}
