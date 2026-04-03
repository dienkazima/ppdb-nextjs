import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient() as any;

const MODELS: Record<string, string> = {
  "alur": "alurPendaftaran",
  "timeline": "timelinePenerimaan",
  "faq": "faqPendaftaran",
  "persyaratan": "persyaratanDaftar"
};

export async function GET(req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const modelName = MODELS[slug];
  if (!modelName) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const data = await prisma[modelName].findMany({ orderBy: { urutan: "asc" } });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch data", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const modelName = MODELS[slug];
  if (!modelName) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const json = await req.json();
    const data = await prisma[modelName].create({ data: json });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create data", details: error.message }, { status: 500 });
  }
}
