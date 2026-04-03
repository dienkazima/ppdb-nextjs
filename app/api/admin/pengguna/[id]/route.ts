import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { username, name, password, role, jenjang } = body;

    const dataToUpdate: any = {
      username,
      name,
      role,
      jenjang
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await ((prisma as any).user).update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const user = await ((prisma as any).user).findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Cegah admin menghapus dirinya sendiri jika admin ini admin root - optional tapi baik.
    if (user.username === "admin") {
       return NextResponse.json({ error: "Akun Super Admin tidak bisa dihapus." }, { status: 403 });
    }

    await ((prisma as any).user).delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
