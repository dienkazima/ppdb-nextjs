import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import DetailTabs from "./DetailTabs";

export default async function DetailPendaftar({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await prisma.pendaftar.findUnique({
    where: { id },
    include: {
      riwayatPembayaran: {
        orderBy: { nomorCicilan: "asc" }
      }
    }
  });

  if (!data) return notFound();

  // Ambil seluruh data jenjang dari database untuk mencegah masalah exact string match ("TK" vs "Taman Kanak-Kanak (TK)")
  const semuaJenjang = await prisma.jenjangPendidikan.findMany({
    include: {
      persyaratan: {
        orderBy: { createdAt: "asc" }
      }
    },
  });

  // Cari yang namanya mengandung string jenjang dari pendaftaran, case insensitive
  let dJenjangTarget = data.jenjang.toLowerCase();
  
  // Custom mapping if needed (TK -> Taman Kanak-Kanak)
  const jenjangData = semuaJenjang.find(j => {
    const dbNama = j.nama.toLowerCase();
    return dbNama === dJenjangTarget || 
           dbNama.includes(dJenjangTarget) || 
           dJenjangTarget.includes(dbNama);
  });

  if (!jenjangData || jenjangData.persyaratan.length === 0) {
    console.warn(`[WARNING] Data syarat pendaftaran kosong untuk pendaftar JENJANG: ${data.jenjang}`);
  }

  const fullData = {
    ...data,
    persyaratan: jenjangData?.persyaratan || [],
  };

  return <DetailTabs data={fullData} />;
}