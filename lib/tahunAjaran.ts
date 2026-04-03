export function hitungTahunAjaranAuto(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 11 = Dec

  // Jika pendaftaran dilakukan pada bulan Desember atau setelahnya, 
  // maka itu termasuk pendaftaran untuk Tahun Ajaran berikutnya (misal pendaftar Desember 2025 -> masuk tahun 2026/2027)
  // Tapi kalau pendaftar ada di bulan Jan - Nov 2026, itu juga 2026/2027.
  
  if (month >= 11) {
    // Desember tahun berjalan -> pendaftaran untuk tahun ajaran tahun depan / tahun depannya lagi
    return `${year + 1}/${year + 2}`;
  }
  
  // Januari hingga November tahun berjalan -> pendaftaran untuk tahun ajaran tahun ini / tahun depan
  return `${year}/${year + 1}`;
}

export async function getCurrentTahunAjaranServer(): Promise<string> {
  try {
    const base = typeof window !== 'undefined' ? "" : (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
    const res = await fetch(base + "/api/pengaturan", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    const settings = await res.json();
    return getTahunAjaranFromSettings(settings);
  } catch (error) {
    console.warn("Gagal fetch tahun ajaran, memakai fallback AUTO.");
    return hitungTahunAjaranAuto();
  }
}

export function getTahunAjaranFromSettings(settings: any): string {
  if (settings?.modeTahunAjaran === "MANUAL" && settings?.tahunAjaranManual) {
    return settings.tahunAjaranManual;
  }
  return hitungTahunAjaranAuto();
}
