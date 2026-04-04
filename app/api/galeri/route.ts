import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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
      // Validasi ukuran maks 4MB (Batas aman payload Vercel Serverless adalah 4.5MB)
      const MAX_SIZE = 4 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "Ukuran file maksimal 4MB (batas optimal Vercel)" }, { status: 400 });
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
