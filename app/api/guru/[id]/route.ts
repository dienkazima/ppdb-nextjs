import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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
        // Validasi ukuran maks 2MB
        const MAX_SIZE = 2 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
        }

        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Upload ke Supabase
        const { data, error } = await supabase.storage
          .from("dokumen-ppdb")
          .upload(`guru/${filename}`, file, {
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

        updateData.foto = publicUrlData.publicUrl;
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
    
    // Temukan existing guru untuk menghapus fotonya
    const existingGuru = await prisma.tenagaPendidik.findUnique({
      where: { id: params.id }
    });

    if (existingGuru?.foto?.includes("supabase.co")) {
      const paths = existingGuru.foto.split("/dokumen-ppdb/");
      if (paths.length > 1) {
        const filePath = paths[1];
        await supabase.storage.from("dokumen-ppdb").remove([filePath]);
      }
    }

    await prisma.tenagaPendidik.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete guru" }, { status: 500 });
  }
}
