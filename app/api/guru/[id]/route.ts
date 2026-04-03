import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const prisma = new PrismaClient();

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const contentType = req.headers.get("content-type") || "";
    
    let updateData: any = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      updateData.nama = formData.get("nama") as string;
      updateData.jabatan = formData.get("jabatan") as string;
      
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
        updateData.foto = `/uploads/guru/${filename}`;
      } else if (fotoUrl) {
        updateData.foto = fotoUrl;
      } else if (formData.has("foto") && fotoUrl === "") {
         updateData.foto = ""; // clear action
      }
    } else {
      const json = await req.json();
      updateData.nama = json.nama;
      updateData.jabatan = json.jabatan;
      if (json.foto !== undefined) updateData.foto = json.foto;
    }

    const item = await prisma.tenagaPendidik.update({
      where: { id: params.id },
      data: updateData,
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update guru" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    await prisma.tenagaPendidik.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete guru" }, { status: 500 });
  }
}
