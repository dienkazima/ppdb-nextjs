import jsPDF from "jspdf";
import { getCurrentTahunAjaranServer } from "./tahunAjaran";

function toTitleCase(str: string): string {
  if (!str) return "";
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}

function getJenjangFullName(j: string | undefined): string {
  if (!j) return "SEKOLAH ...";
  switch (j.toUpperCase()) {
    case "TK":
      return "TAMAN KANAK-KANAK (TK)";
    case "SD":
      return "SEKOLAH DASAR (SD)";
    case "SMP":
      return "SEKOLAH MENENGAH PERTAMA (SMP)";
    case "SMA":
      return "SEKOLAH MENENGAH ATAS (SMA)";
    case "SMK":
      return "SEKOLAH MENENGAH KEJURUAN (SMK)";
    case "MTS":
      return "MADRASAH TSANAWIYAH (MTS)";
    case "MA":
      return "MADRASAH ALIYAH (MA)";
    case "MI":
      return "MADRASAH IBTIDAIYAH (MI)";
    default:
      return j;
  }
}

// Helper untuk merender 1 halaman utuh pendaftar (sehingga bisa dilooping)
const renderPage = (doc: jsPDF, data: any, tahunAjaran: string, isBlank: boolean = false) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin + 5;

  doc.setFont("times", "bold");

  // 1. HEADER
  doc.setFontSize(14);
  doc.text("YAYASAN JAMALUDDIN SURALAGA", pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setFontSize(14);
  const jenjangText = getJenjangFullName(data.jenjang).toUpperCase();
  doc.text(jenjangText, pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setFontSize(12);
  doc.text(`SISTEM PENERIMAAN MURID BARU ${tahunAjaran}`, pageWidth / 2, y, { align: "center" });

  // Nomor pendaftaran pojok kanan atas
  doc.setFontSize(9);
  doc.setFont("times", "normal");
  doc.text(`No. Pend: ${data.noPendaftaran || ".................."}`, pageWidth - margin, margin, { align: "right" });

  y += 12;

  // Helper function untuk isian baris teks dinamis (3 kolom sejajar)
  const drawRow = (label: string, value: string | undefined | null, yPos: number, indent = 0) => {
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    
    // 1. Label
    doc.text(label, margin + indent, yPos);
    
    // 2. Colon (Fixed position)
    const colonX = margin + 60; // 75mm dari kiri kertas, jarak yang sangat lega
    doc.text(":", colonX, yPos);
    
    // 3. Value
    const valueX = colonX + 3;
    let textValue = "...........................................................................";
    if (value && value.toString().trim() !== "") {
      textValue = value.toString().startsWith(".") 
        ? value.toString() // if it's explicitly a dotted template
        : toTitleCase(value.toString().trim()); 
    }
    
    // Because Times is proportional, ensure explicit templates don't wrap unexpectedly
    const splitText = doc.splitTextToSize(textValue, pageWidth - valueX - margin);
    doc.text(splitText, valueX, yPos);
    
    return yPos + (splitText.length * 5) + 1; // Spacing vertikal yang ringkas (compact)
  };

  const drawSectionTitle = (title: string, yPos: number) => {
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(title, margin, yPos);
    return yPos + 6;
  };

  // ================= A. IDENTITAS PESERTA DIDIK =================
  y = drawSectionTitle("A. IDENTITAS PESERTA DIDIK", y);

  const formatDate = (date: any) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  };

  const tptLahir = data.tempatLahir ? toTitleCase(data.tempatLahir.trim()) : "............................";
  const ttl = data.tanggalLahir ? `${tptLahir}, ${formatDate(data.tanggalLahir)}` : (data.tempatLahir ? tptLahir : "");
  
  y = drawRow("1. Nama Lengkap", data.nama, y, 5);
  y = drawRow("2. Jenis Kelamin", data.jenisKelamin, y, 5);
  y = drawRow("3. Tempat Tanggal Lahir", ttl, y, 5);
  y = drawRow("4. NIK", data.nik, y, 5);

  let strAnak = "";
  if (!data.anakKe && !data.jumlahSaudara) {
    strAnak = "......... dari ......... Bersaudara";
  } else {
    const anakKe = data.anakKe ? data.anakKe.toString() : ".....";
    const dari = data.jumlahSaudara ? data.jumlahSaudara.toString() : ".....";
    strAnak = `${anakKe} dari ${dari} Bersaudara`;
  }
  y = drawRow("5. Anak Ke", strAnak, y, 5);

  y = drawRow("6. Agama", data.agama, y, 5);

  let strBadan = "";
  if (!data.tinggiBadan && !data.beratBadan) {
    strBadan = ".......... cm / Berat badan ......... kg";
  } else {
    const tb = data.tinggiBadan ? data.tinggiBadan.toString() : ".....";
    const bb = data.beratBadan ? data.beratBadan.toString() : ".....";
    strBadan = `${tb} cm / Berat Badan ${bb} kg`;
  }
  y = drawRow("7. Tinggi Badan", strBadan, y, 5);

  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text("8. Alamat", margin + 5, y);
  doc.text(":", margin + 60, y);
  y += 6;
  y = drawRow("o Dusun", data.dusun, y, 10);
  y = drawRow("o Desa", data.desa, y, 10);
  y = drawRow("o Kecamatan", data.kecamatan, y, 10);
  y = drawRow("o Kabupaten", data.kabupaten, y, 10);

  y = drawRow("9. Nomor HP", data.noHpOrtu, y, 5);
  y = drawRow("10. Sekolah Asal", data.sekolahAsal, y, 5);
  y = drawRow("11. Alat Transportasi ke Sekolah", data.transportasi, y, 5);

  y += 4;

  // ================= B. IDENTITAS ORANG TUA/WALI MURID =================
  y = drawSectionTitle("B. IDENTITAS ORANG TUA/WALI MURID", y);

  doc.setFont("times", "bold");
  doc.text("1. Identitas Ayah Kandung", margin + 5, y);
  y += 6;
  y = drawRow("o Nama", data.namaAyah, y, 10);
  y = drawRow("o Alamat", data.alamatAyah, y, 10);
  y = drawRow("o Tahun Lahir", data.tahunLahirAyah?.toString(), y, 10);
  y = drawRow("o Pendidikan Terakhir", data.pendidikanAyah, y, 10);
  y = drawRow("o Pekerjaan", data.pekerjaanAyah, y, 10);
  y = drawRow("o Penghasilan", data.penghasilanAyah, y, 10);

  y += 2;
  doc.setFont("times", "bold");
  doc.text("2. Identitas Ibu Kandung", margin + 5, y);
  y += 6;
  y = drawRow("o Nama", data.namaIbu, y, 10);
  y = drawRow("o Alamat", data.alamatIbu, y, 10);
  y = drawRow("o Tahun Lahir", data.tahunLahirIbu?.toString(), y, 10);
  y = drawRow("o Pendidikan Terakhir", data.pendidikanIbu, y, 10);
  y = drawRow("o Pekerjaan", data.pekerjaanIbu, y, 10);
  y = drawRow("o Penghasilan", data.penghasilanIbu, y, 10);

  y += 4;

  // ================= C. SYARAT PENDAFTARAN =================
  y = drawSectionTitle("C. SYARAT PENDAFTARAN", y);
  doc.setFont("times", "normal");

  if (!data.persyaratan || data.persyaratan.length === 0) {
    console.warn("[WARNING] PDF Generator: Data syarat pendaftaran kosong untuk pendaftar jenjang " + data.jenjang);
    
    // Fallback Layout
    for (let i = 1; i <= 3; i++) {
        doc.text(`${i}. ......................................................................................................`, margin + 5, y);
        y += 6;
    }
  } else {
    data.persyaratan.forEach((syarat: any, idx: number) => {
      const text = `${idx + 1}. ${syarat.deskripsi || syarat.teks}`;
      const splitText = doc.splitTextToSize(text, pageWidth - margin * 2 - 5);
      doc.text(splitText, margin + 5, y);
      y += (splitText.length * 5) + 1; // Rapatkan list
    });
  }

  y += 15;

  // ================= TANDA TANGAN =================
  const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  doc.setFont("times", "normal");
  
  // Tanggal 
  doc.text(`Suralaga, ${today}`, pageWidth - margin - 50, y);
  
  y += 10;
  
  doc.text("Orang Tua/Wali Murid", margin + 25, y, { align: "center" });
  doc.text("Calon Peserta Didik", pageWidth / 2, y, { align: "center" });
  doc.text("Panitia", pageWidth - margin - 25, y, { align: "center" });

  y += 20; // Ruang kosong untuk tanda tangan manual

  doc.setLineWidth(0.3);
  doc.line(margin + 5, y, margin + 45, y);
  doc.line(pageWidth / 2 - 20, y, pageWidth / 2 + 20, y);
  doc.line(pageWidth - margin - 45, y, pageWidth - margin - 5, y);
};

export const generateFormulirPDF = async (data: any) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [210, 330], // F4 (Folio) Paper Size
  });

  const tahunAjaran = await getCurrentTahunAjaranServer();
  renderPage(doc, data, tahunAjaran);

  doc.save(`Formulir-${data.noPendaftaran || data.nama || "Pendaftaran"}-F4.pdf`);
};

export const generateMultipleFormulirPDF = async (dataArray: any[], baseFilename: string = "Data-Pendaftar-Massal") => {
  if (!dataArray || dataArray.length === 0) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [210, 330], // F4 Size
  });

  const tahunAjaran = await getCurrentTahunAjaranServer();

  for (let i = 0; i < dataArray.length; i++) {
    renderPage(doc, dataArray[i], tahunAjaran);
    if (i < dataArray.length - 1) {
      doc.addPage();
    }
  }

  doc.save(`${baseFilename}-F4.pdf`);
};

export const generateBlankFormulirPDF = async (jenjang: string, persyaratanData: any[]) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [210, 330],
  });

  const tahunAjaran = await getCurrentTahunAjaranServer();

  const mockData = {
    jenjang: jenjang,
    persyaratan: persyaratanData,
    // Sisanya kosong biar auto keisi titik-titik sama drawRow()
    nama: "", jenisKelamin: "", tempatLahir: "", tanggalLahir: "", nik: "",
    anakKe: "", jumlahSaudara: "", agama: "", tinggiBadan: "", beratBadan: "",
    dusun: "", desa: "", kecamatan: "", kabupaten: "", noHpOrtu: "", sekolahAsal: "", transportasi: "",
    namaAyah: "", alamatAyah: "", tahunLahirAyah: "", pendidikanAyah: "", pekerjaanAyah: "", penghasilanAyah: "",
    namaIbu: "", alamatIbu: "", tahunLahirIbu: "", pendidikanIbu: "", pekerjaanIbu: "", penghasilanIbu: ""
  };

  renderPage(doc, mockData, tahunAjaran, true);
  doc.save(`Formulir-Kosong-${jenjang.toUpperCase()}-F4.pdf`);
};
