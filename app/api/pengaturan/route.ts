import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const row = await prisma.pengaturan.findUnique({
      where: { id: "1" }
    });
    
    if (!row) {
      const newRow = await prisma.pengaturan.create({
        data: {
          id: "1",
          bukaPendaftaran: true,
          jenjangTerbuka: "TK,SD,SMP,SMA",
          modeTahunAjaran: "AUTO",
          tahunAjaranManual: null
        }
      });
      return NextResponse.json(newRow);
    }
    
    return NextResponse.json(row);
  } catch (error: any) {
    console.error("GET /api/pengaturan error:", error);
    return NextResponse.json({ error: "Failed", detail: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // Hanya ADMIN yang boleh mengubah pengaturan pendaftaran
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Hanya Admin yang dapat mengubah status pendaftaran" }, { status: 403 });
    }

    const json = await req.json();
    const buka = json.bukaPendaftaran !== false;
    const jenjang = json.jenjangTerbuka || "TK,SD,SMP,SMA";
    const mode = json.modeTahunAjaran || "AUTO";
    const manual = json.tahunAjaranManual || null;
    
    const updated = await prisma.pengaturan.upsert({
      where: { id: "1" },
      update: {
        bukaPendaftaran: buka,
        jenjangTerbuka: jenjang,
        modeTahunAjaran: mode,
        tahunAjaranManual: manual
      },
      create: {
        id: "1",
        bukaPendaftaran: buka,
        jenjangTerbuka: jenjang,
        modeTahunAjaran: mode,
        tahunAjaranManual: manual
      }
    });
    
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT /api/pengaturan error:", error);
    return NextResponse.json({ error: "Failed", detail: error.message }, { status: 500 });
  }
}
