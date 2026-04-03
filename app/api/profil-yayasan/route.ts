import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    let profil = await prisma.profilYayasan.findUnique({
      where: { id: "1" },
    });

    if (!profil) {
      profil = await prisma.profilYayasan.create({
        data: {
          id: "1",
          deskripsi: "Yayasan Jamaluddin Suralaga merupakan yayasan yang bergerak di bidang pendidikan. Yayasan Jamaluddin Suralaga saat ini memiliki 4 jenjang pendidikan, yaitu TK IT, SD IT, dan SMP IT. Kurikulum yang diterapkan di Yayasan Jamaluddin Suralaga merupakan perpaduan antara kurikulum pemerintah (KEMENDIKBUDRISTEK) dan kurikulum yayasan. Hal ini bertujuan untuk mencetak generasi yang berwawasan global dan berakhlak mulia sesuai dengan Al-Qur'an dan As-Sunnah.",
          embedMap: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1419.8272990632313!2d116.53609804153926!3d-8.58434685323214!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4ebaec0fffff%3A0xcaf7e32da970ceab!2sYayasan%20Jamaluddin%20Suralaga!5e1!3m2!1sid!2sid!4v1743003444040!5m2!1sid!2sid",
          nomorWa: "6287810219214",
        },
      });
    }

    return NextResponse.json(profil);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { deskripsi, embedMap, nomorWa } = await req.json();

    const profil = await prisma.profilYayasan.upsert({
      where: { id: "1" },
      update: { deskripsi, embedMap, nomorWa },
      create: {
        id: "1",
        deskripsi,
        embedMap,
        nomorWa,
      },
    });

    return NextResponse.json(profil);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
