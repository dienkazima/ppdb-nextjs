import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search") || "";
  let jenjang = searchParams.get("jenjang") || "Semua";
  const status = searchParams.get("status") || "Semua";

  // Enforce jenjang restriction for Panitia
  if (session.role === "PANITIA" && session.jenjang) {
    jenjang = session.jenjang;
  }

  const where: any = {
    nama: {
      contains: search
    }
  };

  if (jenjang !== "Semua") {
    where.jenjang = { contains: jenjang };
  }

  if (status !== "Semua") {
    where.status = status;
  }

  try {
    const dataResponse = await prisma.pendaftar.findMany({
      where,
      orderBy: {
        createdAt: "desc"
      }
    });

    const semuaJenjang = await prisma.jenjangPendidikan.findMany({
      include: {
        persyaratan: {
          orderBy: { createdAt: "asc" }
        }
      },
    });

    const attachedData = dataResponse.map((pendaftar) => {
      const pJenjang = pendaftar.jenjang || "";
      const match = semuaJenjang.find(j => 
        j.nama.toLowerCase() === pJenjang.toLowerCase() ||
        j.nama.toLowerCase().includes(pJenjang.toLowerCase()) ||
        pJenjang.toLowerCase().includes(j.nama.toLowerCase())
      );
      
      return {
        ...pendaftar,
        persyaratan: match ? match.persyaratan : []
      };
    });

    console.log("User Jenjang (All data):", session.jenjang);
    console.log("Data Returned (All data):", attachedData.length, "items");

    return NextResponse.json({ data: attachedData });
  } catch(error) {
     return NextResponse.json({ error: "Failed to fetch all data" }, { status: 500 });
  }
}
