const BASE_URL = "http://localhost:3000";

const visi = {
    konten: "Menjadi lembaga pendidikan pesantren modern yang unggul dalam pembentukan generasi Qurani, berakhlak mulia, berwawasan luas, dan mampu menjadi pemimpin umat yang amanah di tengah masyarakat global yang terus berkembang."
};

const misi = [
    { teks: "Menyelenggarakan pendidikan berbasis Al-Quran dan Sunnah yang terintegrasi dengan ilmu pengetahuan modern.", urutan: 1 },
    { teks: "Membentuk karakter santri yang disiplin, mandiri, dan bertanggung jawab melalui kehidupan pesantren yang terstruktur.", urutan: 2 },
    { teks: "Mengembangkan potensi akademik, spiritual, dan kreativitas santri secara menyeluruh dan berimbang.", urutan: 3 },
    { teks: "Membangun lingkungan belajar yang kondusif, aman, dan menyenangkan berbasis nilai-nilai Islam.", urutan: 4 },
    { teks: "Meningkatkan mutu tenaga pendidik secara berkesinambungan melalui pelatihan dan pengembangan kompetensi.", urutan: 5 }
];

const tujuan = [
    { teks: "Menghasilkan lulusan yang hafal Al-Quran dan mampu mengamalkannya dalam kehidupan sehari-hari.", urutan: 1 },
    { teks: "Mencetak generasi muda yang berakhlak mulia, toleran, dan berkontribusi positif bagi masyarakat luas.", urutan: 2 },
    { teks: "Mempersiapkan santri untuk melanjutkan studi ke perguruan tinggi terkemuka di dalam maupun luar negeri.", urutan: 3 },
    { teks: "Mengembangkan jiwa kepemimpinan dan kewirausahaan santri yang berlandaskan nilai-nilai Islam.", urutan: 4 }
];

async function seed() {
    console.log("Menyimpan Visi...");
    const vRes = await fetch(`${BASE_URL}/api/visi-misi/visi`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(visi)
    }).then(r => r.json());
    console.log("Visi tersimpan:", vRes.id);

    console.log("Menyimpan Misi...");
    for (const m of misi) {
        await fetch(`${BASE_URL}/api/visi-misi/misi`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(m)
        });
    }

    console.log("Menyimpan Tujuan...");
    for (const t of tujuan) {
        await fetch(`${BASE_URL}/api/visi-misi/tujuan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(t)
        });
    }
    console.log("Semua data berhasil dibuat otomatis!");
}

seed().catch(console.error);
