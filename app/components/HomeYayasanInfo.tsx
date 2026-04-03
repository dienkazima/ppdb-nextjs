"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Info,
  Phone,
  ExternalLink,
  Navigation2,
} from "lucide-react";

/* ─── Kontak shape ─── */
interface KontakItem {
  id: string;
  nama: string;
  nomor: string;
}

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" as const, delay },
  }),
};

export default function HomeYayasanInfo() {
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [embedMap, setEmbedMap] = useState<string>("");
  const [kontakList, setKontakList] = useState<KontakItem[]>([]);
  const [jamLayanan, setJamLayanan] = useState<
    { id: string; hari: string; jam: string }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/profil-yayasan")
        .then((r) => r.json())
        .then((d) => {
          if (d) {
            setDeskripsi(d.deskripsi || "");
          }
        }),
      fetch("/api/kontak-panitia")
        .then((r) => r.json())
        .then((d) => setKontakList(Array.isArray(d) ? d : [])),
      fetch("/api/jam-pelayanan")
        .then((r) => r.json())
        .then((d) => setJamLayanan(Array.isArray(d) ? d : [])),
    ]).finally(() => setLoaded(true));
  }, []);

  /* ── map src hardcoded ── */
  const mapSrc = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d447.0142322312!2d116.5208877!3d-8.5944598!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dcc4982502e6cff%3A0x5f35cc038e7833f4!2sSMPS%20ISLAM%20TERPADU%20ANNUR%20SURALAGA!5e1!3m2!1sen!2sid!4v1714000000000!5m2!1sen!2sid";

  const hasContent = true;

  if (!loaded || !hasContent) return null;

  return (
    <section className="relative bg-[#F0FDF4] overflow-hidden">
      {/* ── background blobs ── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full bg-green-200/20 blur-[120px]" />
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] rounded-full bg-emerald-200/25 blur-[100px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-14 sm:py-20 md:py-28">

        {/* ═══════════════════════════════════════════════
            1. DESKRIPSI YAYASAN
        ════════════════════════════════════════════════ */}
        {deskripsi && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={0}
            className="max-w-4xl mx-auto mb-16 md:mb-20"
          >
            <div className="
              group relative bg-white/80 backdrop-blur-md
              border border-green-100 rounded-3xl p-8 md:p-10
              shadow-[0_8px_40px_rgba(21,128,61,0.08)]
              hover:shadow-[0_18px_55px_rgba(21,128,61,0.16)]
              hover:scale-[1.02]
              transition-all duration-300 ease-in-out
              overflow-hidden
            ">
              {/* glass glint */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-green-50/30 rounded-3xl pointer-events-none" />

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#16A34A] to-[#22C55E] rounded-2xl mb-6 shadow-lg shadow-green-300/40">
                  <Info className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#111827] mb-5 tracking-tight">
                  Mengenal{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15803D] to-[#22C55E]">
                    Yayasan Kami
                  </span>
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-300 rounded-full mx-auto mb-6" />
                <p className="text-gray-600 text-base md:text-lg leading-[1.9] max-w-3xl mx-auto">
                  {deskripsi}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════
            2 + 3. MAP  &  JAM PELAYANAN (2-col desktop)
        ════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-10 md:mb-14">

          {/* ── 2. LOKASI / MAP ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={0.1}
          >
            <div className="
              group relative bg-white/80 backdrop-blur-md
              border border-green-100 rounded-3xl overflow-hidden
              shadow-[0_8px_40px_rgba(21,128,61,0.08)]
              hover:shadow-[0_18px_50px_rgba(21,128,61,0.14)]
              transition-all duration-300
            ">
              {/* card header */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#1d4ed8] to-[#3b82f6] rounded-xl flex items-center justify-center shadow-md shadow-blue-200/60">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Lokasi Kami</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Yayasan Jamaluddin Suralaga</p>
                </div>
              </div>

              {/* map iframe */}
              <div className="relative mx-3 sm:mx-4 mb-3 sm:mb-4 rounded-2xl overflow-hidden h-56 sm:h-64 md:h-80 bg-slate-100 shadow-inner">
                {mapSrc ? (
                  <iframe
                    src={mapSrc}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                    <MapPin className="w-8 h-8 opacity-40" />
                    <span className="text-sm">Peta belum tersedia</span>
                  </div>
                )}

                {/* Google-Maps-style overlay */}
                {mapSrc && (
                  <div className="
                    absolute top-3 left-3
                    bg-white/95 backdrop-blur-sm
                    rounded-xl shadow-lg
                    px-4 py-3
                    flex flex-col gap-1
                    max-w-[200px]
                    border border-gray-100
                  ">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#1d4ed8] shrink-0" />
                      <span className="text-xs font-bold text-gray-800 truncate">
                        Lokasi Kami
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      SMPS ISLAM TERPADU ANNUR<br />SURALAGA
                    </p>
                    <div className="flex gap-2 mt-1">
                      <a
                        href="https://www.google.com/maps/place/SMPS+ISLAM+TERPADU+ANNUR+SURALAGA/@-8.5944598,116.5208877,447m/data=!3m1!1e3!4m6!3m5!1s0x2dcc4982502e6cff:0x5f35cc038e7833f4!8m2!3d-8.5945817!4d116.5220643!16s%2Fg%2F11g6xr74dn?entry=ttu"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] text-[#1d4ed8] font-semibold hover:underline"
                      >
                        <ExternalLink className="w-2.5 h-2.5" /> Buka
                      </a>
                      <a
                        href="https://www.google.com/maps/place/SMPS+ISLAM+TERPADU+ANNUR+SURALAGA/@-8.5944598,116.5208877,447m/data=!3m1!1e3!4m6!3m5!1s0x2dcc4982502e6cff:0x5f35cc038e7833f4!8m2!3d-8.5945817!4d116.5220643!16s%2Fg%2F11g6xr74dn?entry=ttu"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] text-[#1d4ed8] font-semibold hover:underline"
                      >
                        <Navigation2 className="w-2.5 h-2.5" /> Arahkan
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* ── 3. JAM PELAYANAN ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={0.2}
          >
            <div className="
              relative h-full
              bg-gradient-to-br from-[#7C3AED] via-[#5B21B6] to-[#16A34A]
              rounded-3xl overflow-hidden
              shadow-[0_8px_40px_rgba(109,40,217,0.2)]
              hover:shadow-[0_18px_50px_rgba(109,40,217,0.3)]
              transition-all duration-300
            ">
              {/* bg glows */}
              <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-400/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

              <div className="relative z-10 p-6 md:p-8 h-full flex flex-col">
                {/* header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
                      Jam Pelayanan
                    </h3>
                    <p className="text-purple-200/80 text-sm mt-0.5">
                      Jadwal operasional panitia PPDB
                    </p>
                  </div>
                </div>

                {/* list */}
                <div className="space-y-3 flex-1">
                  {jamLayanan.length > 0 ? (
                    jamLayanan.map((jam, i) => (
                      <div
                        key={jam.id || i}
                        className="
                          flex items-center justify-between
                          bg-white/10 hover:bg-white/18
                          border border-white/10 rounded-2xl
                          px-5 py-3.5
                          transition-colors duration-200
                        "
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2 h-2 rounded-full bg-green-300 shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
                          <h4 className="font-semibold text-white text-sm md:text-base">
                            {jam.hari}
                          </h4>
                        </div>
                        <div className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white font-bold text-sm rounded-xl border border-white/20">
                          {jam.jam}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-60">
                      <Clock className="w-10 h-10 text-white/50" />
                      <p className="text-white/70 text-sm">Jadwal belum tersedia</p>
                    </div>
                  )}
                </div>

                {jamLayanan.length > 0 && (
                  <p className="text-purple-200/50 text-xs mt-6 text-center">
                    * Waktu menggunakan zona WITA
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ═══════════════════════════════════════════════
            4. KONTAK PANITIA — WhatsApp capsule buttons
        ════════════════════════════════════════════════ */}
        {kontakList.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={0.3}
          >
            {/* heading */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 border border-green-200 rounded-full text-[#15803D] text-sm font-semibold mb-3">
                <Phone className="w-4 h-4" />
                Kontak Panitia
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#111827] tracking-tight">
                Ada Pertanyaan?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#15803D] to-[#22C55E]">
                  Hubungi Kami
                </span>
              </h3>
            </div>

            {/* capsule grid */}
            <div className={`flex flex-col sm:flex-row flex-wrap justify-center gap-4 ${kontakList.length === 1 ? "max-w-sm mx-auto" : "max-w-2xl mx-auto"}`}>
              {kontakList.map((k) => {
                const cleanNum = k.nomor.replace(/\D/g, "");
                const display =
                  k.nomor.startsWith("+") || k.nomor.startsWith("08")
                    ? k.nomor
                    : `+${cleanNum}`;

                return (
                  <a
                    key={k.id}
                    href={`https://wa.me/${cleanNum}`}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      group relative flex items-center
                      rounded-full overflow-hidden
                      shadow-[0_8px_24px_rgba(22,163,74,0.25)]
                      hover:shadow-[0_14px_36px_rgba(22,163,74,0.45)]
                      hover:scale-[1.04]
                      transition-all duration-300 ease-in-out
                      w-full sm:min-w-[240px] sm:w-auto
                      wa-pulse
                    "
                  >
                    {/* left white panel — WA icon */}
                    <div className="relative z-10 flex items-center justify-center bg-white pl-4 pr-6 py-4 shrink-0">
                      {/* angled divider */}
                      <div className="absolute right-0 top-0 h-full w-5 bg-[#22C55E] skew-x-[-6deg] origin-top-right translate-x-2 z-0" />
                      {/* WA SVG icon */}
                      <svg
                        viewBox="0 0 48 48"
                        className="w-10 h-10 relative z-10 drop-shadow-sm"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="24" cy="24" r="24" fill="#25D366" />
                        <path
                          d="M34.3 13.68A14.5 14.5 0 0 0 9.5 27.7L8 40l12.6-3.3a14.5 14.5 0 1 0 13.7-23.02Z"
                          fill="white"
                          fillOpacity="0.15"
                        />
                        <path
                          d="M33.42 28.27c-.52-.26-3.07-1.52-3.55-1.69-.47-.17-.81-.26-1.15.26s-1.32 1.69-1.62 2.04c-.3.35-.6.39-1.12.13-.52-.26-2.2-.81-4.19-2.59-1.55-1.38-2.59-3.09-2.9-3.61-.3-.52-.03-.8.23-1.06.24-.23.52-.6.78-.9.26-.3.35-.52.52-.87.18-.35.09-.65-.04-.9-.13-.27-1.15-2.77-1.57-3.79-.42-1-.84-.86-1.15-.88h-.98c-.34 0-.9.13-1.37.65-.47.52-1.8 1.76-1.8 4.28s1.84 4.97 2.1 5.31c.26.35 3.62 5.53 8.78 7.76 1.23.53 2.19.85 2.94 1.09 1.23.38 2.35.33 3.24.2.99-.15 3.04-1.24 3.47-2.44.43-1.2.43-2.22.3-2.44-.13-.22-.47-.35-.99-.61Z"
                          fill="white"
                        />
                      </svg>
                    </div>

                    {/* right green panel */}
                    <div className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-5 py-4 flex flex-col justify-center">
                      <p className="text-green-50/80 text-xs font-medium leading-none mb-1.5">
                        {k.nama}
                      </p>
                      <p className="text-white font-bold text-base md:text-lg tracking-wide leading-none">
                        {display}
                      </p>
                    </div>

                    {/* hover ring glow */}
                    <div className="absolute inset-0 rounded-full ring-2 ring-green-400/0 group-hover:ring-green-400/60 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all duration-300" />
                  </a>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes wa-pulse {
          0%, 100% { box-shadow: 0 8px 24px rgba(22,163,74,0.25); }
          50%       { box-shadow: 0 8px 30px rgba(22,163,74,0.45); }
        }
        .wa-pulse { animation: wa-pulse 2.5s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
