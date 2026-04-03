import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    const { teks, urutan } = await req.json();

    let data: any = {};
    if (typeof teks !== "undefined") data.teks = teks.trim();
    if (typeof urutan !== "undefined") data.urutan = Number(urutan);

    if (Object.keys(data).length > 0) {
      await prisma.tataTertib.update({
        where: { id },
        data
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PUT tata-tertib error:", error);
    return NextResponse.json({ error: "Gagal mengubah data", detail: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const { id } = await context.params;
    await prisma.tataTertib.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE tata-tertib error:", error);
    return NextResponse.json({ error: "Gagal menghapus data", detail: error.message }, { status: 500 });
  }
}
