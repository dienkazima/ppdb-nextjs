import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const item = await prisma.persyaratan.create({
      data: {
        jenjangPendidikanId: json.jenjangPendidikanId,
        deskripsi: json.deskripsi,
        isImportant: json.isImportant || false,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create persyaratan" }, { status: 500 });
  }
}
