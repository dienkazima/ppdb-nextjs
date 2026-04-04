import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const json = await req.json();
    const item = await prisma.biaya.create({
      data: {
        jenjangPendidikanId: json.jenjangPendidikanId,
        nama: json.nama,
        nominal: Number(json.nominal),
        keterangan: json.keterangan || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create biaya" }, { status: 500 });
  }
}
