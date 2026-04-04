import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { isi, urutan } = await req.json();

    if (!isi) {
      return NextResponse.json({ error: "Isi catatan wajib diisi" }, { status: 400 });
    }

    const now = new Date().toISOString();

    await prisma.catatanBiayaPendidikan.update({
      where: { id },
      data: {
        isi,
        urutan: Number(urutan)
      }
    });

    return NextResponse.json({ message: "Catatan berhasil diperbarui" });
  } catch (error) {
    console.error("PUT CATATAN BIAYA ERROR:", error);
    return NextResponse.json({ error: "Gagal memperbarui catatan biaya" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.catatanBiayaPendidikan.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Catatan berhasil dihapus" });
  } catch (error) {
    console.error("DELETE CATATAN BIAYA ERROR:", error);
    return NextResponse.json({ error: "Gagal menghapus catatan biaya" }, { status: 500 });
  }
}
