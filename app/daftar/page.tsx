"use client";

import { useState, useRef, useEffect } from "react";
import { User, Users, MapPin, Upload, FileText, Check, ArrowLeft } from "lucide-react";
import SuccessRegistration from "@/app/components/SuccessRegistration";
import Link from "next/link";

export default function Daftar() {

  const initialForm = {
    jenjang: "",
    nama: "",
    jenisKelamin: "",
    tempatLahir: "",
    tanggalLahir: "",
    nik: "",
    anakKe: "",
    jumlahSaudara: "",
    agama: "",
    tinggiBadan: "",
    beratBadan: "",
    alamat: "",
    dusun: "",
    desa: "",
    kecamatan: "",
    kabupaten: "",
    noHpOrtu: "",
    sekolahAsal: "",
    transportasi: "",
    namaAyah: "",
    alamatAyah: "",
    tahunLahirAyah: "",
    pendidikanAyah: "",
    pekerjaanAyah: "",
    penghasilanAyah: "",
    namaIbu: "",
    alamatIbu: "",
    tahunLahirIbu: "",
    pendidikanIbu: "",
    pekerjaanIbu: "",
    penghasilanIbu: "",

    ijazah: "",
    kk: "",
    akta: "",
    ktp: "",
  };

  const [form, setForm] = useState(initialForm);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<any>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // step3Errors hanya diset saat klik "Kirim Pendaftaran", TIDAK saat navigasi
  const [step3Errors, setStep3Errors] = useState<any>({});
  const [files, setFiles] = useState({
    ijazah: { file: null as File | null, loading: false, success: false },
    kk: { file: null as File | null, loading: false, success: false },
    akta: { file: null as File | null, loading: false, success: false },
    ktp: { file: null as File | null, loading: false, success: false },
  });
  const formRef = useRef<HTMLFormElement>(null);

  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [availableJenjangs, setAvailableJenjangs] = useState<string[]>([]);
  const [tahunAjaran, setTahunAjaran] = useState("...");

  // Fetch pengaturan (jenjangTerbuka) + daftar jenjang dari DB
  useEffect(() => {
    Promise.all([
      fetch("/api/pengaturan").then(r => r.json()),
      fetch("/api/jenjang").then(r => r.json()),
    ])
      .then(([pengaturan, jenjangData]) => {
        const terbuka: string[] = (pengaturan.jenjangTerbuka || "")
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);

        const semuaNama: string[] = Array.isArray(jenjangData)
          ? jenjangData.map((j: any) => j.nama)
          : [];

        const aktif = semuaNama.filter(nama => terbuka.includes(nama));
        setAvailableJenjangs(aktif);

        let dynamicTahun = "2026/2027";
        if (pengaturan.modeTahunAjaran === "MANUAL" && pengaturan.tahunAjaranManual) {
          dynamicTahun = pengaturan.tahunAjaranManual;
        } else {
          const date = new Date();
          const y = date.getFullYear();
          const m = date.getMonth();
          dynamicTahun = (m >= 11) ? `${y + 1}/${y + 2}` : `${y}/${y + 1}`;
        }
        setTahunAjaran(dynamicTahun);
      })
      .catch(console.error);
  }, []);

  // Digunakan oleh tombol Selanjutnya (step 1 & 2) — hanya cek, tidak set errors step 3
  function validateStep(currentStep: number) {
    let newErrors: any = {};

    // ================= STEP 1 =================
    if (currentStep === 1) {
      if (!form.jenjang) {
        newErrors.jenjang = "Pilih jenjang pendidikan";
      }

      if (!form.nama) {
        newErrors.nama = "Nama lengkap wajib diisi";
      }

      if (!form.jenisKelamin) {
        newErrors.jenisKelamin = "Pilih jenis kelamin";
      }

      if (!form.tempatLahir) {
        newErrors.tempatLahir = "Tempat lahir wajib diisi";
      }

      if (!form.tanggalLahir) {
        newErrors.tanggalLahir = "Tanggal lahir wajib diisi";
      }

      if (!form.nik) {
        newErrors.nik = "NIK wajib diisi";
      } else if (form.nik.length !== 16) {
        newErrors.nik = "NIK harus 16 digit";
      }
    }

    // ================= STEP 2 =================
    if (currentStep === 2) {
      if (!form.namaAyah) {
        newErrors.namaAyah = "Nama ayah wajib diisi";
      }

      if (!form.namaIbu) {
        newErrors.namaIbu = "Nama ibu wajib diisi";
      }
    }

    // Step 3 TIDAK divalidasi di sini — hanya divalidasi saat submit
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];

      const element = formRef.current?.querySelector(
        `[name="${firstErrorField}"]`
      ) as HTMLElement | null;

      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      return false;
    }

    return true;
  }

  // Digunakan hanya saat tombol "Kirim Pendaftaran" ditekan
  function validateStep3(): boolean {
    const newErrors: any = {};
    const isTK = form.jenjang?.toLowerCase().includes("tk") || form.jenjang?.toLowerCase().includes("paud");

    if (!isTK && !form.ijazah) {
      newErrors.ijazah = "Ijazah / SKL wajib diupload";
    }
    if (!form.kk) newErrors.kk = "KK wajib diupload";
    if (!form.akta) newErrors.akta = "Akta kelahiran wajib diupload";
    if (!form.ktp) newErrors.ktp = "KTP orang tua wajib diupload";

    setStep3Errors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function resetForm() {
    setForm(initialForm);
    setStep(1);
    setErrors({});
    setStep3Errors({});

    setFiles({
      ijazah: { file: null, loading: false, success: false },
      kk: { file: null, loading: false, success: false },
      akta: { file: null, loading: false, success: false },
      ktp: { file: null, loading: false, success: false },
    });
  }
  const incomeOptions = [
    "Kurang dari Rp 500.000",
    "Rp 500.000 - Rp 999.999",
    "Rp 1.000.000 - Rp 1.999.999",
    "Rp 2.000.000 - Rp 4.999.999",
    "Rp 5.000.000 - Rp 20.000.000",
    "Lebih dari Rp 20.000.000",
  ];

  const inputStyle = "w-full h-11 px-4 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 bg-gray-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 shadow-sm";
  const selectStyle = `${inputStyle} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20%2F%3E%3C%2Fsvg%3E')] bg-[position:calc(100%-12px)_center] bg-no-repeat pr-10`;
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Field angka saja
    if (
      [
        "anakKe",
        "jumlahSaudara",
        "tinggiBadan",
        "beratBadan",
        "tahunLahirAyah",
        "tahunLahirIbu",
      ].includes(name)
    ) {
      finalValue = value.replace(/[^0-9]/g, "");
    }

    setForm((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // ðŸ”¥ HAPUS ERROR SAAT USER MENGISI
    setErrors((prev: any) => ({
      ...prev,
      [name]: "",
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("STEP SAAT SUBMIT:", step);
    console.log("DATA YANG DIKIRIM:", form);
    try {
      const res = await fetch("/api/pendaftar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan data");
      }
      const result = await res.json();
      setSuccessData(result);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan data");
    }
  }

  const progressWidth =
    step === 1 ? "0%" : step === 2 ? "50%" : "100%";
  const nextButtonStyle =
    "px-6 sm:px-7 py-3 sm:py-2.5 w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 active:scale-95 cursor-pointer text-center";

  const prevButtonStyle =
    "px-5 sm:px-6 py-3 sm:py-2.5 w-full sm:w-auto bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium shadow-sm hover:bg-gray-100 hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer text-center";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof files;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("File harus berupa PDF");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2MB");
      return;
    }

    // 📄 Set loading dulu, baru jalankan upload async
    setFiles((prev) => ({
      ...prev,
      [name]: { file: null, loading: true, success: false },
    }));

    // Beri waktu React render loading state sebelum fetch mulai
    setTimeout(() => {
      const doUpload = async () => {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          const result = await res.json();
          if (!res.ok) throw new Error("Upload gagal");

          // ✅ Simpan filePath ke form state
          setForm((prev) => ({ ...prev, [name]: result.filePath }));

          // ✅ Update ke success
          setFiles((prev) => ({
            ...prev,
            [name]: { file, loading: false, success: true },
          }));

          setErrors((prev: any) => ({ ...prev, [name]: "" }));
          setStep3Errors((prev: any) => ({ ...prev, [name]: "" }));
        } catch {
          alert("Upload gagal");
          setFiles((prev) => ({
            ...prev,
            [name]: { file: null, loading: false, success: false },
          }));
        }
      };
      doUpload();
    }, 50);
  };
  if (isSuccess && successData) {
    return <SuccessRegistration data={successData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR / BACK TO HOME */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors">
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      {/* HEADER */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 py-10 sm:py-14 text-center text-white px-4">
        <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎓</div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Formulir Pendaftaran SPMB
        </h1>
        <p className="text-white/90 mt-2 text-sm sm:text-base">
          Tahun Pelajaran {tahunAjaran}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 -mt-8 sm:-mt-10">

        {/* STEP INDICATOR */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-10 w-full overflow-x-auto custom-scrollbar">
          <div className="relative z-10 w-full min-w-[300px] flex flex-col">

            {/* CONTAINER STEP & ICON */}
            <div className="relative flex justify-between w-full">

              {/* GARIS PENGHUBUNG (Membentang Penuh di Belakang) */}
              <div className="absolute top-5 sm:top-6 left-0 w-full h-[3px] sm:h-[4px] bg-gray-200 z-0" />
              <div
                className="absolute top-5 sm:top-6 left-0 h-[3px] sm:h-[4px] bg-emerald-500 z-0 transition-all duration-700 ease-in-out"
                style={{ width: progressWidth }}
              />

              {/* LIST STEP */}
              {["Data Siswa", "Data Orang Tua", "Dokumen"].map(
                (item, index) => {
                  const isCompleted = step > index + 1;
                  const isActive = step === index + 1;

                  return (
                    <div key={index} className="flex flex-col items-center w-24 sm:w-32 z-10">

                      {/* ICON CIRCLE */}
                      <div
                        className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm transition-all duration-500 ease-in-out rounded-full ring-4 ring-white
                  ${isCompleted
                            ? "bg-emerald-500 text-white shadow-sm"
                            : isActive
                              ? "bg-emerald-100 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                              : "bg-gray-100 text-gray-400"
                          }`}
                      >
                        {isCompleted ? (
                          <Check size={20} className="text-white scale-110 transition-transform" />
                        ) : index === 0 ? (
                          <User size={18} className={isActive ? "text-emerald-600 scale-110 transition-transform" : "text-gray-400"} />
                        ) : index === 1 ? (
                          <Users size={18} className={isActive ? "text-emerald-600 scale-110 transition-transform" : "text-gray-400"} />
                        ) : (
                          <FileText size={18} className={isActive ? "text-emerald-600 scale-110 transition-transform" : "text-gray-400"} />
                        )}
                      </div>

                      {/* LABEL TEXT */}
                      <p
                        className={`mt-3 sm:mt-4 text-xs sm:text-sm transition-colors duration-500 text-center
                  ${isActive
                            ? "text-emerald-600 font-bold"
                            : isCompleted
                              ? "text-slate-700 font-semibold"
                              : "text-gray-400 font-medium"
                          }`}
                      >
                        {item}
                      </p>
                    </div>
                  )
                }
              )}
            </div>

            {/* PROGRESS BAR BAWAH */}
            <div className="w-full bg-gray-200 h-2 sm:h-2.5 rounded-full mt-7 sm:mt-9 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gray-900 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: progressWidth }}
              />
            </div>

          </div>
        </div>

        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 3) {
              if (validateStep3()) {
                handleSubmit(e);
              }
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 space-y-8 sm:space-y-10">


            {/* ================= STEP 1 ================= */}
            {step === 1 && (
              <>
                {/* ================= CARD DATA SISWA ================= */}
                <div id="step-1-container" className="rounded-2xl shadow-[0_6px_25px_rgba(0,0,0,0.08)] p-8 space-y-2 transition-all duration-300">

                  <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-800">
                    <User size={22} className="text-green-600" />
                    Data Pribadi Siswa
                  </h2>
                  <p className="text-sm text-gray-500">
                    Lengkapi data calon siswa dengan benar
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">

                    {/* Jenjang */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Jenjang Pendidikan <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="jenjang"
                        value={form.jenjang}
                        onChange={handleChange}
                        className={`${selectStyle} ${errors.jenjang ? "!border-red-500 focus:!ring-0 !ring-0" : ""}`}
                      >
                        {/* Placeholder */}
                        <option value="" disabled hidden>
                          Pilih jenjang pendidikan
                        </option>

                        {/* Option dinamis dari DB — hanya yang dicentang admin */}
                        {availableJenjangs.map(nama => (
                          <option key={nama} value={nama}>{nama}</option>
                        ))}
                        {availableJenjangs.length === 0 && (
                          <option value="" disabled>Tidak ada jenjang yang dibuka saat ini</option>
                        )}
                      </select>

                      {errors.jenjang && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.jenjang}
                        </p>
                      )}
                    </div>

                    {/* Nama Lengkap */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="nama"
                        value={form.nama}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap sesuai akta"
                        className={`${inputStyle} ${errors.nama ? "!border-red-500 focus:!ring-0 !ring-0" : ""
                          }`}
                      />

                      {errors.nama && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.nama}
                        </p>
                      )}
                    </div>

                    {/* Jenis Kelamin */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>

                      <select
                        name="jenisKelamin"
                        value={form.jenisKelamin}
                        onChange={handleChange}
                        className={`${selectStyle} ${errors.jenisKelamin ? "!border-red-500 focus:!ring-0 !ring-0" : ""}`}
                      >
                        <option value="" disabled hidden>
                          Pilih jenis kelamin
                        </option>

                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>

                      {errors.jenisKelamin && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.jenisKelamin}
                        </p>
                      )}
                    </div>

                    {/* Tempat Lahir */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Tempat Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="tempatLahir"
                        value={form.tempatLahir}
                        onChange={handleChange}
                        placeholder="Masukkan tempat lahir"
                        className={`${inputStyle} ${errors.tempatLahir ? "!border-red-500 focus:!ring-0 !ring-0" : ""
                          }`}
                      />

                      {errors.tempatLahir && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tempatLahir}
                        </p>
                      )}
                    </div>
                    {/* Tanggal Lahir */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Tanggal Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="tanggalLahir"
                        value={form.tanggalLahir}
                        onChange={handleChange}
                        className={`${inputStyle} ${errors.tanggalLahir ? "!border-red-500 focus:!ring-0 !ring-0" : ""
                          }`}
                      />

                      {errors.tanggalLahir && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tanggalLahir}
                        </p>
                      )}
                    </div>
                    {/* NIK */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        NIK (Nomor Induk Kependudukan) <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="nik"
                        value={form.nik}
                        onChange={handleChange}
                        maxLength={16}
                        placeholder="16 digit NIK"
                        className={`${inputStyle} ${errors.nik ? "!border-red-500 focus:!ring-0 !ring-0" : ""
                          }`}
                      />

                      {errors.nik && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.nik}
                        </p>
                      )}
                    </div>

                    {/* Anak Ke */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Anak Ke
                      </label>
                      <input
                        name="anakKe"
                        value={form.anakKe}
                        onChange={handleChange}
                        placeholder="Urutan anak"
                        className={inputStyle}
                      />
                    </div>

                    {/* Jumlah Saudara */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Jumlah Saudara
                      </label>
                      <input
                        name="jumlahSaudara"
                        value={form.jumlahSaudara}
                        onChange={handleChange}
                        placeholder="Total saudara kandung"
                        className={inputStyle}
                      />
                    </div>

                    {/* Agama */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Agama
                      </label>
                      <select
                        name="agama"
                        value={form.agama}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih agama
                        </option>

                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                    </div>

                    {/* Tinggi Badan */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Tinggi Badan (cm)
                      </label>
                      <input
                        name="tinggiBadan"
                        value={form.tinggiBadan}
                        onChange={handleChange}
                        placeholder="Contoh: 120"
                        className={inputStyle}
                      />
                    </div>

                    {/* Berat Badan */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Berat Badan (kg)
                      </label>
                      <input
                        name="beratBadan"
                        value={form.beratBadan}
                        onChange={handleChange}
                        placeholder="Contoh: 25"
                        className={inputStyle}
                      />
                    </div>
                  </div>
                </div>

                {/* ================= CARD ALAMAT TEMPAT TINGGAL ================= */}
                <div className="rounded-2xl shadow-[0_6px_25px_rgba(0,0,0,0.08)] p-8 space-y-8 transition-all duration-300">

                  <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-800">
                    <MapPin size={22} className="text-green-600" />
                    Alamat Tempat Tinggal
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6">

                    {/* Dusun */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Dusun/Lingkungan
                      </label>
                      <input
                        name="dusun"
                        value={form.dusun || ""}
                        onChange={handleChange}
                        placeholder="Nama dusun"
                        className={inputStyle}
                      />
                    </div>

                    {/* Desa */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Desa/Kelurahan
                      </label>
                      <input
                        name="desa"
                        value={form.desa || ""}
                        onChange={handleChange}
                        placeholder="Nama desa/kelurahan"
                        className={inputStyle}
                      />
                    </div>

                    {/* Kecamatan */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Kecamatan
                      </label>
                      <input
                        name="kecamatan"
                        value={form.kecamatan || ""}
                        onChange={handleChange}
                        placeholder="Nama kecamatan"
                        className={inputStyle}
                      />
                    </div>

                    {/* Kabupaten */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Kabupaten/Kota
                      </label>
                      <select
                        name="kabupaten"
                        value={form.kabupaten || ""}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih Kabupaten/Kota
                        </option>
                        <option value="Lombok Barat">Lombok Barat</option>
                        <option value="Lombok Tengah">Lombok Tengah</option>
                        <option value="Lombok Timur">Lombok Timur</option>
                        <option value="Sumbawa">Sumbawa</option>
                        <option value="Dompu">Dompu</option>
                        <option value="Bima">Bima</option>
                        <option value="Sumbawa Barat">Sumbawa Barat</option>
                        <option value="Lombok Utara">Lombok Utara</option>
                        <option value="Kota Mataram">Kota Mataram</option>
                        <option value="Kota Bima">Kota Bima</option>
                      </select>
                    </div>

                    {/* No HP Orang Tua */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        No. HP Orang Tua
                      </label>
                      <input
                        name="noHpOrtu"
                        value={form.noHpOrtu || ""}
                        onChange={handleChange}
                        placeholder="08xxxxxxxxxx"
                        className={inputStyle}
                      />
                    </div>

                    {/* Sekolah Asal */}
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Sekolah Asal
                      </label>
                      <input
                        name="sekolahAsal"
                        value={form.sekolahAsal || ""}
                        onChange={handleChange}
                        placeholder="Nama sekolah sebelumnya"
                        className={inputStyle}
                      />
                    </div>

                    {/* Transportasi */}
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">
                        Transportasi ke Sekolah
                      </label>
                      <select
                        name="transportasi"
                        value={form.transportasi}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih transportasi
                        </option>
                        <option value="Jalan kaki">Jalan kaki</option>
                        <option value="Sepeda">Sepeda</option>
                        <option value="Sepeda Motor">Sepeda Motor</option>
                        <option value="Mobil Pribadi">Mobil Pribadi</option>
                        <option value="Angkutan Umum">Angkutan Umum</option>
                        <option value="Kendaraan Jemputan">Kendaraan Jemputan</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ================= STEP 2 ================= */}
            {step === 2 && (
              <div className="space-y-10">

                {/* ================= DATA AYAH ================= */}
                <div id="step-2-container" className="bg-white rounded-2xl shadow-xl p-8 space-y-8 transition-all duration-300">

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={22} className="text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        Data Ayah
                      </h2>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Lengkapi data ayah kandung/wali
                    </p>
                  </div>

                  {/* Nama */}
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700">
                      Nama Lengkap Ayah <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="namaAyah"
                      value={form.namaAyah}
                      onChange={handleChange}
                      placeholder="Nama lengkap ayah"
                      className={`${inputStyle} ${errors.namaAyah ? "!border-red-500 focus:!ring-0 !ring-0" : ""
                        }`}
                    />

                    {errors.namaAyah && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.namaAyah}
                      </p>
                    )}
                  </div>

                  {/* Alamat */}
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700">
                      Alamat Ayah
                    </label>
                    <input
                      name="alamatAyah"
                      value={form.alamatAyah}
                      onChange={handleChange}
                      placeholder="Alamat lengkap ayah"
                      className={inputStyle}
                    />
                  </div>

                  {/* Tahun Lahir & Pendidikan */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-medium text-gray-700">
                        Tahun Lahir
                      </label>
                      <input
                        name="tahunLahirAyah"
                        value={form.tahunLahirAyah}
                        onChange={handleChange}
                        placeholder="Contoh: 1980"
                        maxLength={4}
                        className={inputStyle}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-gray-700">
                        Pendidikan Terakhir
                      </label>
                      <select
                        name="pendidikanAyah"
                        value={form.pendidikanAyah}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih pendidikan
                        </option>

                        <option value="Tidak sekolah">Tidak sekolah</option>
                        <option value="Putus SD">Putus SD</option>
                        <option value="SD / sederajat">SD / Sederajat</option>
                        <option value="SMP / sederajat">SMP / Sederajat</option>
                        <option value="SMA / sederajat">SMA / Sederajat</option>
                        <option value="D1">D1</option>
                        <option value="D2">D2</option>
                        <option value="D3">D3</option>
                        <option value="D4 / S1">D4 / S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>
                  </div>

                  {/* Pekerjaan & Penghasilan */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-medium text-gray-700">
                        Pekerjaan
                      </label>
                      <select
                        name="pekerjaanAyah"
                        value={form.pekerjaanAyah}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih pekerjaan ayah
                        </option>
                        <option value="Tidak bekerja">Tidak Bekerja</option>
                        <option value="Petani">Petani</option>

                        <option value="Nelayan">Nelayan</option>
                        <option value="Buruh">Buruh</option>
                        <option value="Pedagang">Pedagang</option>
                        <option value="Wiraswasta">Wiraswasta</option>
                        <option value="Karyawan swasta">Karyawan Swasta</option>
                        <option value="PNS">PNS</option>
                        <option value="TNI / POLRI">TNI / POLRI</option>
                        <option value="Guru / Dosen">Guru / Dosen</option>
                        <option value="Tenaga Kesehatan">Tenaga Kesehatan</option>
                        <option value="Pegawai BUMN / BUMD">Pegawai BUMN / BUMD</option>
                        <option value="Pensiunan">Pensiunan</option>
                        <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="font-medium text-gray-700">
                        Penghasilan per Bulan
                      </label>
                      <select
                        name="penghasilanAyah"
                        value={form.penghasilanAyah}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih rentang penghasilan
                        </option>
                        <option value="Kurang dari Rp 500.000">Kurang dari Rp 500.000</option>
                        <option value="Rp 500.000 - Rp 999.99">Rp 500.000 - Rp 999.999</option>
                        <option value="Rp 1.000.000 - Rp 1.999.999">Rp 1.000.000 - Rp 1.999.999</option>
                        <option value="Rp 2.000.000 - Rp 4.999.999">Rp 2.000.000 - Rp 4.999.999</option>
                        <option value="Rp 5.000.000 - Rp 20.000.000">Rp 5.000.000 - Rp 20.000.000</option>
                        <option value="Lebih dari Rp 20.000.000">Lebih dari Rp 20.000.000</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* ================= DATA IBU ================= */}
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8 transition-all duration-300">

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={22} className="text-pink-600" />
                      <h2 className="text-xl font-semibold text-gray-800">
                        Data Ibu
                      </h2>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Lengkapi data ibu kandung/wali
                    </p>
                  </div>

                  {/* Nama */}
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700">
                      Nama Lengkap Ibu <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="namaIbu"
                      value={form.namaIbu}
                      onChange={handleChange}
                      placeholder="Nama lengkap ibu"
                      className={`${inputStyle} ${errors.namaIbu ? "!border-red-500 focus:!ring-0 !ring-0" : ""
                        }`}
                    />

                    {errors.namaIbu && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.namaIbu}
                      </p>
                    )}
                  </div>
                  {/* Alamat */}
                  <div className="space-y-2">
                    <label className="font-medium text-gray-700">
                      Alamat Ibu
                    </label>
                    <input
                      name="alamatIbu"
                      value={form.alamatIbu}
                      onChange={handleChange}
                      placeholder="Alamat lengkap ibu (jika berbeda dengan ayah)"
                      className={inputStyle}
                    />
                  </div>

                  {/* Tahun Lahir & Pendidikan */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-medium text-gray-700">
                        Tahun Lahir
                      </label>
                      <input
                        name="tahunLahirIbu"
                        value={form.tahunLahirIbu}
                        onChange={handleChange}
                        placeholder="Contoh: 1985"
                        maxLength={4}
                        className={inputStyle}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-gray-700">
                        Pendidikan Terakhir
                      </label>
                      <select
                        name="pendidikanIbu"
                        value={form.pendidikanIbu}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih pendidikan
                        </option>
                        <option value="Tidak Sekolah">Tidak Sekolah</option>
                        <option value="Putus SD">Putus SD</option>
                        <option value="SD/Sederajat">SD/Sederajat</option>
                        <option value="SMP/Sederajat">SMP/Sederajat</option>
                        <option value="SMA/Sederajat">SMA/Sederajat</option>
                        <option value="D1">D1</option>
                        <option value="D2">D2</option>
                        <option value="D3">D3</option>
                        <option value="D4/S1">D4/S1</option>
                        <option value="S2">S2</option>
                        <option value="S3">S3</option>
                      </select>
                    </div>
                  </div>

                  {/* Pekerjaan & Penghasilan */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-medium text-gray-700">
                        Pekerjaan
                      </label>
                      <select
                        name="pekerjaanIbu"
                        value={form.pekerjaanIbu}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih pekerjaan ibu
                        </option>
                        <option value="Tidak bekerja">Tidak Bekerja</option>
                        <option value="Petani">Petani</option>
                        <option value="Nelayan">Nelayan</option>
                        <option value="Buruh">Buruh</option>
                        <option value="Pedagang">Pedagang</option>
                        <option value="Wiraswasta">Wiraswasta</option>
                        <option value="Karyawan swasta">Karyawan Swasta</option>
                        <option value="PNS">PNS</option>
                        <option value="TNI / POLRI">TNI / POLRI</option>
                        <option value="Guru / Dosen">Guru / Dosen</option>
                        <option value="Tenaga Kesehatan">Tenaga Kesehatan</option>
                        <option value="Pegawai BUMN / BUMD">Pegawai BUMN / BUMD</option>
                        <option value="Pensiunan">Pensiunan</option>
                        <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-medium text-gray-700">
                        Penghasilan per Bulan
                      </label>
                      <select
                        name="penghasilanIbu"
                        value={form.penghasilanIbu}
                        onChange={handleChange}
                        className={selectStyle}
                      >
                        <option value="" disabled hidden>
                          Pilih rentang penghasilan
                        </option>
                        <option value="Kurang dari Rp 500.000">Kurang dari Rp 500.000</option>
                        <option value="Rp 500.000 - Rp 999.99">Rp 500.000 - Rp 999.999</option>
                        <option value="Rp 1.000.000 - Rp 1.999.999">Rp 1.000.000 - Rp 1.999.999</option>
                        <option value="Rp 2.000.000 - Rp 4.999.999">Rp 2.000.000 - Rp 4.999.999</option>
                        <option value="Rp 5.000.000 - Rp 20.000.000">Rp 5.000.000 - Rp 20.000.000</option>
                        <option value="Lebih dari Rp 20.000.000">Lebih dari Rp 20.000.000</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* ================= STEP 3 ================= */}
            {step === 3 && (
              <div className="space-y-8">

                <div id="step-3-container" className="bg-white rounded-2xl shadow-xl p-8 space-y-6">

                  <div>

                    <h2 className="text-xl font-semibold text-gray-800">
                      Upload Dokumen Persyaratan
                    </h2>
                    <p className="text-sm text-gray-500">
                      Upload semua dokumen dalam format PDF (Maksimal 2MB)
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">

                    {/* IJAZAH */}
                    {!(form.jenjang?.toLowerCase().includes("tk") || form.jenjang?.toLowerCase().includes("paud")) && (
                      <div>
                        <label className="font-medium text-gray-700">
                          Ijazah / Surat Keterangan Lulus *
                        </label>

                        <div className="mt-2">
                          {/* ================= LOADING ================= */}
                          {files.ijazah.loading && (
                            <div className="flex flex-col items-center justify-center h-35 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                              <p className="text-sm text-gray-600">Mengupload...</p>
                              <p className="text-xs text-gray-400">Maksimal 2MB</p>
                            </div>
                          )}

                          {/* ================= SUCCESS ================= */}
                          {!files.ijazah.loading && files.ijazah.success && (
                            <div className="flex items-center justify-between p-4 rounded-xl bg-green-100 border border-green-300">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                                  ✅
                                </div>
                                <div>
                                  <p className="text-green-800 font-medium text-sm">
                                    File berhasil diupload
                                  </p>
                                  <p className="text-xs text-green-700">
                                    {files.ijazah.file?.name}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setFiles((prev) => ({ ...prev, ijazah: { file: null, loading: false, success: false } }));
                                  setForm((prev) => ({ ...prev, ijazah: "" }));
                                }}
                                className="text-red-500 text-sm font-bold hover:bg-red-50 rounded px-2 py-1"
                              >
                                ✕
                              </button>
                            </div>
                          )}

                          {/* ================= DEFAULT ================= */}
                          {!files.ijazah.loading && !files.ijazah.success && (
                            <label className={`flex flex-col items-center justify-center h-25 border-2 border-dashed rounded-xl cursor-pointer transition ${step3Errors.ijazah ? "border-red-500 bg-red-50 hover:border-red-600" : "border-gray-300 bg-gray-50 hover:border-green-500"}`}>
                              <Upload size={32} className={`mb-2 ${step3Errors.ijazah ? "text-red-400" : "text-gray-400"}`} />
                              <p className="text-gray-600 text-sm">
                                Klik untuk upload PDF
                              </p>
                              <p className="text-xs text-gray-400">
                                Maksimal 2MB
                              </p>

                              <input
                                type="file"
                                name="ijazah"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                        {step3Errors.ijazah && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                            <span>⚠</span> {step3Errors.ijazah}
                          </p>
                        )}
                      </div>
                    )}

                    {/* KK */}
                    <div>
                      <label className="font-medium text-gray-700">
                        KK / Kartu Keluarga *
                      </label>
                      <div className="mt-2">

                        {/* ================= LOADING ================= */}
                        {files.kk.loading && (
                          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-gray-600">Mengupload...</p>
                            <p className="text-xs text-gray-400">Maksimal 2MB</p>
                          </div>
                        )}

                        {/* ================= SUCCESS ================= */}
                        {!files.kk.loading && files.kk.success && (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-green-100 border border-green-300">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                                ✅
                              </div>
                              <div>
                                <p className="text-green-800 font-medium text-sm">
                                  File berhasil diupload
                                </p>
                                <p className="text-xs text-green-700">
                                  {files.kk.file?.name}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setFiles((prev) => ({ ...prev, kk: { file: null, loading: false, success: false } }));
                                setForm((prev) => ({ ...prev, kk: "" }));
                              }}
                              className="text-red-500 text-sm font-bold hover:bg-red-50 rounded px-2 py-1"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {/* ================= DEFAULT ================= */}
                        {!files.kk.loading && !files.kk.success && (
                          <label className={`flex flex-col items-center justify-center h-25 border-2 border-dashed rounded-xl cursor-pointer transition ${step3Errors.kk ? "border-red-500 bg-red-50 hover:border-red-600" : "border-gray-300 bg-gray-50 hover:border-green-500"}`}>
                            <Upload size={32} className={`mb-2 ${step3Errors.kk ? "text-red-400" : "text-gray-400"}`} />
                            <p className="text-gray-600 text-sm">
                              Klik untuk upload PDF
                            </p>
                            <p className="text-xs text-gray-400">
                              Maksimal 2MB
                            </p>

                            <input
                              type="file"
                              name="kk"
                              accept="application/pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      {step3Errors.kk && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <span>⚠</span> {step3Errors.kk}
                        </p>
                      )}
                    </div>
                    {/* AKTA */}
                    <div>
                      <label className="font-medium text-gray-700">
                        Akta Kelahiran *
                      </label>

                      <div className="mt-2">
                        {/* ================= LOADING ================= */}
                        {files.akta.loading && (
                          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-gray-600">Mengupload...</p>
                            <p className="text-xs text-gray-400">Maksimal 2MB</p>
                          </div>
                        )}

                        {/* ================= SUCCESS ================= */}
                        {!files.akta.loading && files.akta.success && (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-green-100 border border-green-300">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                                ✅
                              </div>
                              <div>
                                <p className="text-green-800 font-medium text-sm">
                                  File berhasil diupload
                                </p>
                                <p className="text-xs text-green-700">
                                  {files.akta.file?.name}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setFiles((prev) => ({ ...prev, akta: { file: null, loading: false, success: false } }));
                                setForm((prev) => ({ ...prev, akta: "" }));
                              }}
                              className="text-red-500 text-sm font-bold hover:bg-red-50 rounded px-2 py-1"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {/* ================= DEFAULT ================= */}
                        {!files.akta.loading && !files.akta.success && (
                          <label className={`flex flex-col items-center justify-center h-25 border-2 border-dashed rounded-xl cursor-pointer transition ${step3Errors.akta ? "border-red-500 bg-red-50 hover:border-red-600" : "border-gray-300 bg-gray-50 hover:border-green-500"}`}>
                            <Upload size={32} className={`mb-2 ${step3Errors.akta ? "text-red-400" : "text-gray-400"}`} />
                            <p className="text-gray-600 text-sm">
                              Klik untuk upload PDF
                            </p>
                            <p className="text-xs text-gray-400">
                              Maksimal 2MB
                            </p>

                            <input
                              type="file"
                              name="akta"
                              accept="application/pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      {step3Errors.akta && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <span>⚠</span> {step3Errors.akta}
                        </p>
                      )}
                    </div>

                    {/* KTP */}
                    <div>
                      <label className="font-medium text-gray-700">
                        KTP Orang Tua / Wali Murid *
                      </label>

                      <div className="mt-2">
                        {/* ================= LOADING ================= */}
                        {files.ktp.loading && (
                          <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                            <p className="text-sm text-gray-600">Mengupload...</p>
                            <p className="text-xs text-gray-400">Maksimal 2MB</p>
                          </div>
                        )}

                        {/* ================= SUCCESS ================= */}
                        {!files.ktp.loading && files.ktp.success && (
                          <div className="flex items-center justify-between p-4 rounded-xl bg-green-100 border border-green-300">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                                ✅
                              </div>
                              <div>
                                <p className="text-green-800 font-medium text-sm">
                                  File berhasil diupload
                                </p>
                                <p className="text-xs text-green-700">
                                  {files.ktp.file?.name}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setFiles((prev) => ({ ...prev, ktp: { file: null, loading: false, success: false } }));
                                setForm((prev) => ({ ...prev, ktp: "" }));
                              }}
                              className="text-red-500 text-sm font-bold hover:bg-red-50 rounded px-2 py-1"
                            >
                              ✕
                            </button>
                          </div>
                        )}

                        {/* ================= DEFAULT ================= */}
                        {!files.ktp.loading && !files.ktp.success && (
                          <label className={`flex flex-col items-center justify-center h-25 border-2 border-dashed rounded-xl cursor-pointer transition ${step3Errors.ktp ? "border-red-500 bg-red-50 hover:border-red-600" : "border-gray-300 bg-gray-50 hover:border-green-500"}`}>
                            <Upload size={32} className={`mb-2 ${step3Errors.ktp ? "text-red-400" : "text-gray-400"}`} />
                            <p className="text-gray-600 text-sm">
                              Klik untuk upload PDF
                            </p>
                            <p className="text-xs text-gray-400">
                              Maksimal 2MB
                            </p>

                            <input
                              type="file"
                              name="ktp"
                              accept="application/pdf"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      {step3Errors.ktp && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                          <span>⚠</span> {step3Errors.ktp}
                        </p>
                      )}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ================= NAVIGATION ================= */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-5 sm:pt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setErrors({});
                    setStep3Errors({});
                    const prevStep = step - 1;
                    setStep(prevStep);
                    setTimeout(() => {
                      const elId = prevStep === 1 ? "step-1-container" : "step-2-container";
                      const el = document.getElementById(elId);
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 40;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    }, 100);
                  }}
                  className={prevButtonStyle}
                >
                  ← Sebelumnya
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep(step)) {
                      setIsStepTransitioning(true);
                      setErrors({});
                      setStep3Errors({});
                      const nextStep = step + 1;
                      setStep(nextStep);
                      setTimeout(() => {
                        setIsStepTransitioning(false);
                        const elId = nextStep === 2 ? "step-2-container" : "step-3-container";
                        const el = document.getElementById(elId);
                        if (el) {
                          const y = el.getBoundingClientRect().top + window.scrollY - 40;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                      }, 100);
                    }
                  }}
                  className={`${nextButtonStyle} sm:ml-auto`}
                >
                  Selanjutnya →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={Object.values(files).some((f) => f.loading) || isStepTransitioning}
                  className={`${nextButtonStyle} sm:ml-auto ${Object.values(files).some((f) => f.loading) || isStepTransitioning ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                  {Object.values(files).some((f) => f.loading) ? "Mengupload..." : "Kirim Pendaftaran"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


