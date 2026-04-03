import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueName = Date.now() + "-" + file.name;

    const uploadDir = path.join(process.cwd(), "public/uploads");
    const { existsSync, mkdirSync } = require("fs");
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    const uploadPath = path.join(uploadDir, uniqueName);

    await writeFile(uploadPath, buffer);

    return NextResponse.json({
      filePath: `/uploads/${uniqueName}`,
    });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Upload gagal" }, { status: 500 });
  }
}