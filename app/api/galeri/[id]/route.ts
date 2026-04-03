import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const imageId = params.id;
    
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const file = formData.get("file") as File | null;
    let imageUrl = formData.get("imageUrl") as string | null;

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

    const updateData: any = { title, category };
    if (imageUrl) updateData.imageUrl = imageUrl; 

    const updatedImage = await prisma.gallery.update({
      where: { id: imageId },
      data: updateData,
    });

    return NextResponse.json(updatedImage);
  } catch (error) {
    console.error("Gallery PUT Error:", error);
    return NextResponse.json({ error: "Gagal mengupdate foto" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const imageId = params.id;
    
    await prisma.gallery.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: "Foto berhasil dihapus" });
  } catch (error) {
    console.error("Gallery DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus foto" }, { status: 500 });
  }
}
