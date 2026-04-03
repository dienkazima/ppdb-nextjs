import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// GET detail by ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const data = await prisma.pendaftar.findUnique({
      where: { id },
    });

    if (!data) {
      return NextResponse.json(
        { error: "Data tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.log("GET DETAIL ERROR:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data" },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Hanya ADMIN yang boleh menghapus data pendaftar
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Hanya Admin yang dapat menghapus data pendaftar" }, { status: 403 });
    }

    const { id } = await context.params; // ✅ WAJIB await

    await prisma.pendaftar.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Berhasil dihapus" });
  } catch (error) {
    console.log("DELETE ERROR:", error);
    return NextResponse.json(
      { error: "Gagal menghapus" },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params; // ✅ WAJIB await
    const body = await request.json();

    const updated = await prisma.pendaftar.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log("UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Gagal update" },
      { status: 500 }
    );
  }
}
