import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { supabase } from "@/lib/supabase";

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
      // Validasi ukuran maks 2MB
      const MAX_SIZE = 2 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
      }

      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Upload ke Supabase
      const { data, error } = await supabase.storage
        .from("dokumen-ppdb")
        .upload(`galeri/${filename}`, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Supabase Upload Error:", error);
        return NextResponse.json({ error: "Gagal upload gambar" }, { status: 500 });
      }

      // Dapatkan Public URL
      const { data: publicUrlData } = supabase.storage
        .from("dokumen-ppdb")
        .getPublicUrl(data.path);

      imageUrl = publicUrlData.publicUrl;
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
    
    const existingImage = await prisma.gallery.findUnique({
      where: { id: imageId }
    });

    if (existingImage?.imageUrl?.includes("supabase.co")) {
      const paths = existingImage.imageUrl.split("/dokumen-ppdb/");
      if (paths.length > 1) {
        const filePath = paths[1];
        await supabase.storage.from("dokumen-ppdb").remove([filePath]);
      }
    }

    await prisma.gallery.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: "Foto berhasil dihapus" });
  } catch (error) {
    console.error("Gallery DELETE Error:", error);
    return NextResponse.json({ error: "Gagal menghapus foto" }, { status: 500 });
  }
}
