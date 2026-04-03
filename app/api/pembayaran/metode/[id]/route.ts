import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const data = await prisma.metodePembayaran.update({
      where: { id },
      data: {
        namaBank: body.namaBank,
        nomorRekening: body.nomorRekening,
        atasNama: body.atasNama,
        instruksi: body.instruksi,
        kategori: body.kategori,
        isActive: body.isActive
      }
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT METODE PEMBAYARAN ERROR:", error);
    return NextResponse.json({ error: "Gagal update metode pembayaran" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await prisma.metodePembayaran.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Metode pembayaran berhasil dihapus" });
  } catch (error) {
    console.error("DELETE METODE PEMBAYARAN ERROR:", error);
    return NextResponse.json({ error: "Gagal menghapus metode pembayaran" }, { status: 500 });
  }
}
