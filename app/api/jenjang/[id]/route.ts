import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const jenjang = await prisma.jenjangPendidikan.findUnique({
      where: { id: params.id },
      include: {
        persyaratan: true,
        biaya: true,
        target: true,
        guru: true,
      }
    });
    if (!jenjang) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(jenjang);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jenjang" }, { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const json = await req.json();
    const jenjang = await prisma.jenjangPendidikan.update({
      where: { id: params.id },
      data: {
        nama: json.nama,
        deskripsi: json.deskripsi,
        icon: json.icon,
      },
    });
    return NextResponse.json(jenjang);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update jenjang" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await prisma.jenjangPendidikan.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete jenjang" }, { status: 500 });
  }
}
