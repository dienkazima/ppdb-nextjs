import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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

        finalFoto = publicUrlData.publicUrl;
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
