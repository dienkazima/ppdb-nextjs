const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const count = await p.jamPelayanan.count();
  if (count === 0) {
    await p.jamPelayanan.createMany({
      data: [
        { hari: "Senin - Jumat", jam: "08.00 - 16.00", urutan: 1 },
        { hari: "Sabtu", jam: "08.00 - 12.00", urutan: 2 },
      ],
    });
    console.log("✅ Seeded Jam Pelayanan: 2 records inserted.");
  } else {
    console.log(`ℹ️  Jam Pelayanan already has ${count} records. Skipping seed.`);
  }
}

main().finally(() => p.$disconnect());
