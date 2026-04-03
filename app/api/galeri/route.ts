import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const galleryImages = await prisma.gallery.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(galleryImages);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data galeri" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;

    if (!title || !category) {
      return NextResponse.json({ error: "Judul dan kategori harus diisi" }, { status: 400 });
    }

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      
      const uploadDir = join(process.cwd(), "public", "uploads", "galeri");
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {}
      
      const filePath = join(uploadDir, filename);
      await writeFile(filePath, buffer);
      
      imageUrl = `/uploads/galeri/${filename}`;
    }

    if (!imageUrl) {
      return NextResponse.json({ error: "File atau URL gambar harus diisi" }, { status: 400 });
    }

    const newImage = await prisma.gallery.create({
      data: {
        title,
        category,
        imageUrl,
      },
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error("Gallery POST Error:", error);
    return NextResponse.json({ error: "Gagal menambahkan foto" }, { status: 500 });
  }
}
