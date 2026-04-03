import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// ====================
// GET DATA PENDAFTAR
// ====================
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || 1);
  const search = searchParams.get("search") || "";

  const limit = Number(searchParams.get("limit") || 5);
  const skip = (page - 1) * limit;

  const where: any = {
    nama: {
      contains: search
    }
  };

  if (session.role === "PANITIA" && session.jenjang) {
    where.jenjang = { contains: session.jenjang };
  }

  const total = await prisma.pendaftar.count({
    where
  });

  const data = await prisma.pendaftar.findMany({
    where,
    orderBy: {
      createdAt: "desc"
    },
    skip,
    take: limit
  });

  console.log("User Jenjang:", session.jenjang);
  console.log("Data Returned:", data.length, "items");

  return NextResponse.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
}


// ====================
// CREATE PENDAFTAR
// ====================
export async function POST(req: Request) {
  try {

    const body = await req.json();

    // ambil nomor pendaftaran terakhir
    const last = await prisma.pendaftar.findFirst({
      orderBy: {
        noPendaftaran: "desc"
      }
    });

    let nomor = "0001";

    if (last?.noPendaftaran) {
      const lastNumber = parseInt(last.noPendaftaran.split("-")[2]);
      nomor = String(lastNumber + 1).padStart(4, "0");
    }

    const tahun = new Date().getFullYear();
    const noPendaftaran = `JSBS-${tahun}-${nomor}`;

    // ubah tanggal
    if (body.tanggalLahir) {
      body.tanggalLahir = new Date(body.tanggalLahir);
    }

    // ubah number field
    body.anakKe = body.anakKe ? Number(body.anakKe) : null;
    body.jumlahSaudara = body.jumlahSaudara ? Number(body.jumlahSaudara) : null;
    body.tinggiBadan = body.tinggiBadan ? Number(body.tinggiBadan) : null;
    body.beratBadan = body.beratBadan ? Number(body.beratBadan) : null;
    body.tahunLahirAyah = body.tahunLahirAyah ? Number(body.tahunLahirAyah) : null;
    body.tahunLahirIbu = body.tahunLahirIbu ? Number(body.tahunLahirIbu) : null;

    const data = await prisma.pendaftar.create({
      data: {
        ...body,
        noPendaftaran
      }
    });

    return NextResponse.json(data);

  } catch (error) {

    console.log("CREATE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );

  }
}