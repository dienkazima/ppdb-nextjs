import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  try {
    const users = await ((prisma as any).user).findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        jenjang: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ data: users });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, name, password, role, jenjang } = body;

    // Default password handling or explicit password
    const plainPassword = password || "123456"; 
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await ((prisma as any).user).create({
      data: {
        username,
        name,
        password: hashedPassword,
        role: role || "PANITIA",
        jenjang: jenjang || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
      },
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Username sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
