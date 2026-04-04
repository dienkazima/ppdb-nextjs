import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });
    }

    // Validasi tipe file: PDF atau Gambar
    const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "File harus berupa PDF, JPG, atau PNG" }, { status: 400 });
    }

    // Validasi ukuran maks 2MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 2MB" }, { status: 400 });
    }

    const uniqueName = Date.now() + "-" + file.name.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Upload ke Supabase
    const { data, error } = await supabase.storage
      .from("dokumen-ppdb")
      .upload(uniqueName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      return NextResponse.json({ error: "Supabase Error: " + error.message }, { status: 500 });
    }

    // Dapatkan Public URL
    const { data: publicUrlData } = supabase.storage
      .from("dokumen-ppdb")
      .getPublicUrl(data.path);

    return NextResponse.json({
      filePath: publicUrlData.publicUrl,
    });
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Server Error: " + (error?.message || "Unknown") }, { status: 500 });
  }
}