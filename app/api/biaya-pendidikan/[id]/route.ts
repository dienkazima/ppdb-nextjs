import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const data = await prisma.biayaPendidikan.findUnique({ where: { id } });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const data = await prisma.biayaPendidikan.update({
      where: { id },
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
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await prisma.biayaPendidikan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
