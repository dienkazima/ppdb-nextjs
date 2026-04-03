const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Pengaturan awal
  await prisma.pengaturan.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      bukaPendaftaran: true,
      jenjangTerbuka: 'TK,SD,SMP,SMA',
      modeTahunAjaran: 'AUTO',
      updatedAt: new Date(),
    },
  });
  console.log('✅ Pengaturan selesai');

  // Profil Yayasan
  await prisma.profilYayasan.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      deskripsi: 'Yayasan Pendidikan Islam',
      embedMap: '',
      nomorWa: '08123456789',
      updatedAt: new Date(),
    },
  });
  console.log('✅ Profil Yayasan selesai');

  // Visi Sekolah
  await prisma.visiSekolah.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      konten: 'Menjadi lembaga pendidikan Islam yang unggul dan berdaya saing.',
      updatedAt: new Date(),
    },
  });
  console.log('✅ Visi Sekolah selesai');

  console.log('\n🎉 Semua data awal berhasil dimuat!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
