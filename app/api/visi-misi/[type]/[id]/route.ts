import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MODEL_MAP: Record<string, string> = {
  misi: "misiSekolah",
  tujuan: "tujuanSekolah",
};

export async function PUT(
  req: Request,
  context: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await context.params;
  const model = MODEL_MAP[type];
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const json = await req.json();
    const data = await (prisma as any)[model].update({ where: { id }, data: json });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await context.params;
  const model = MODEL_MAP[type];
  if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await (prisma as any)[model].delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
