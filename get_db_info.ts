import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function main() {
  const data = {
    jenjangs: await prisma.jenjangPendidikan.findMany({ select: { nama: true } }),
    users: await prisma.user.findMany({ select: { username: true, role: true, jenjang: true } }),
    pendaftars: await prisma.pendaftar.findMany({ select: { id: true, nama: true, jenjang: true } })
  };
  fs.writeFileSync("db_data.json", JSON.stringify(data, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
