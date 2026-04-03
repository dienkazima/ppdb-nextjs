import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let finalFoto: string | null = null;
    let jenjangPendidikanId = "";
    let nama = "";
    let jabatan = "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      jenjangPendidikanId = formData.get("jenjangPendidikanId") as string;
      nama = formData.get("nama") as string;
      jabatan = formData.get("jabatan") as string;
      
      const file = formData.get("file") as File | null;
      const fotoUrl = formData.get("foto") as string | null;

      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        
        const uploadDir = join(process.cwd(), "public", "uploads", "guru");
        try { await mkdir(uploadDir, { recursive: true }); } catch (err) {}
        
        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);
        finalFoto = `/uploads/guru/${filename}`;
      } else if (fotoUrl) {
        finalFoto = fotoUrl;
      }
    } else {
      const json = await req.json();
      jenjangPendidikanId = json.jenjangPendidikanId;
      nama = json.nama;
      jabatan = json.jabatan;
      finalFoto = json.foto || null;
    }

    const item = await prisma.tenagaPendidik.create({
      data: {
        jenjangPendidikanId,
        nama,
        jabatan,
        foto: finalFoto,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create guru" }, { status: 500 });
  }
}
