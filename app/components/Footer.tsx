"use client";

import Link from "next/link";
import { Facebook, Youtube, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-green-900 to-green-950 text-white pt-12 sm:pt-16 pb-6 sm:pb-8 overflow-hidden">
      {/* Decorative top divider */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400 opacity-50"></div>

      {/* Background blobs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 sm:w-96 sm:h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-75 pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-80 h-80 sm:w-96 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">

          {/* Kolom 1: Informasi */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 md:col-span-1">
            <h3 className="text-lg sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200">
              Yayasan Jamaluddin Suralaga
            </h3>
            <p className="text-green-100/80 leading-relaxed text-sm">
              Membangun generasi cerdas, berakhlak mulia, dan siap menyongsong masa depan yang gemilang.
            </p>
          </div>

          {/* Kolom 2: Kontak */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-green-300 mb-3 sm:mb-4">Hubungi Kami</h4>
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-start gap-2.5 sm:gap-3 group">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mt-0.5 group-hover:scale-110 group-hover:text-white transition-transform duration-300 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-green-100/90 group-hover:text-white transition-colors duration-300 leading-relaxed">
                  Jln. Jurusan Suralaga Lenek, Gubuk Puntik Desa Suralaga, Kec. Suralaga Kab. Lombok Timur NTB
                </span>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 group">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:scale-110 group-hover:text-white transition-transform duration-300 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-green-100/90 group-hover:text-white transition-colors duration-300">
                  +62 878-1021-9214
                </span>
              </div>
              <div className="flex items-center gap-2.5 sm:gap-3 group">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 group-hover:scale-110 group-hover:text-white transition-transform duration-300 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-green-100/90 group-hover:text-white transition-colors duration-300 break-all">
                  yyjmldsuralaga@gmail.com
                </span>
              </div>
            </div>
          </div>

          {/* Kolom 3: Sosial Media */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-base sm:text-lg font-semibold text-green-300 mb-3 sm:mb-4">Media Sosial</h4>
            <p className="text-xs sm:text-sm text-green-100/80 mb-3 sm:mb-4">
              Ikuti kami untuk mendapatkan informasi terbaru seputar kegiatan sekolah.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <a href="#" className="p-2.5 sm:p-3 bg-white/5 rounded-full hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300 group">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 group-hover:text-white group-hover:scale-110 transition-transform duration-300" />
              </a>
              <a href="#" className="p-2.5 sm:p-3 bg-white/5 rounded-full hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300 group">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 group-hover:text-white group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
              <a href="#" className="p-2.5 sm:p-3 bg-white/5 rounded-full hover:bg-emerald-500 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-300 group">
                <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-green-200 group-hover:text-white group-hover:scale-110 transition-transform duration-300" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider & Copyright */}
        <div className="pt-6 sm:pt-8 border-t border-green-800/50 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-green-200/60 text-center sm:text-left">
            &copy; 2026 Yayasan Jamaluddin Suralaga. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-green-200/60">
            <Link href="#" className="hover:text-white transition-colors duration-300 relative group">
              Privacy Policy
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="hover:text-white transition-colors duration-300 relative group">
              Terms of Service
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
