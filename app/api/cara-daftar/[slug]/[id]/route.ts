import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const MODELS: Record<string, string> = {
  "alur": "alurPendaftaran",
  "timeline": "timelinePenerimaan",
  "faq": "faqPendaftaran",
  "persyaratan": "persyaratanDaftar"
};

export async function PUT(
  req: Request,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await context.params;
  const modelName = MODELS[slug];
  if (!modelName) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const json = await req.json();
    const data = await (prisma as any)[modelName].update({
      where: { id },
      data: json,
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update data", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await context.params;
  const modelName = MODELS[slug];
  if (!modelName) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await (prisma as any)[modelName].delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete data", details: error.message }, { status: 500 });
  }
}
