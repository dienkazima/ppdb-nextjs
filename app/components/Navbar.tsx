"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import DaftarButton from "@/app/components/DaftarButton";
import Image from "next/image";

export default function Navbar() {
  const [bukaPendaftaran, setBukaPendaftaran] = useState(false);
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("beranda");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch("/api/pengaturan")
      .then((res) => res.json())
      .then((data) => {
        if (data.bukaPendaftaran !== undefined) {
          setBukaPendaftaran(data.bukaPendaftaran);
        }
      })
      .catch(console.error);
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Scroll Spy for Home Page Sections
  useEffect(() => {
    if (pathname !== "/") return;

    if (window.location.hash === "#jenjang") {
      setActiveHash("jenjang");
      setTimeout(() => {
        document.getElementById("jenjang")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } else {
      setActiveHash("beranda");
    }

    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const jenjangEl = document.getElementById("jenjang");
      if (jenjangEl && scrollPos >= jenjangEl.offsetTop - 150) {
        setActiveHash("jenjang");
      } else {
        setActiveHash("beranda");
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    setMobileOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      setActiveHash(target);
      if (target === "beranda") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
      } else {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `/#${target}`);
        }
      }
    }
  };

  const getLinkClass = (target: string, isHash: boolean = false) => {
    const base = "transition-all duration-300 border-b-[3px] py-1.5 whitespace-nowrap ";
    if (isHash) {
      const isActive = pathname === "/" && activeHash === target;
      return base + (isActive
        ? "text-green-600 border-green-600 font-extrabold"
        : "text-gray-600 font-semibold border-transparent hover:text-green-600 hover:border-green-600/30");
    }
    const isActive = pathname === target;
    return base + (isActive
      ? "text-green-600 border-green-600 font-extrabold"
      : "text-gray-600 font-semibold border-transparent hover:text-green-600 hover:border-green-600/30");
  };

  const getMobileLinkClass = (target: string, isHash: boolean = false) => {
    const base = "block w-full px-4 py-3.5 rounded-xl font-semibold text-[15px] transition-all duration-200 ";
    if (isHash) {
      const isActive = pathname === "/" && activeHash === target;
      return base + (isActive
        ? "bg-green-50 text-green-700 font-extrabold"
        : "text-gray-700 hover:bg-gray-50 hover:text-green-600");
    }
    const isActive = pathname === target;
    return base + (isActive
      ? "bg-green-50 text-green-700 font-extrabold"
      : "text-gray-700 hover:bg-gray-50 hover:text-green-600");
  };

  return (
    <>
      <header className={`sticky top-0 z-50 w-full flex flex-col transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>
        {/* NAVBAR UTAMA */}
        <nav className="w-full bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-4 flex items-center justify-between gap-4">

            {/* Logo + Nama */}
            <Link href="/" onClick={(e) => handleNavClick(e, "beranda")} className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative w-12 h-12 md:w-14 md:h-14 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 drop-shadow-md">
                <Image 
                  src="/logo.png" 
                  alt="Logo Yayasan Jamaluddin Suralaga" 
                  fill
                  className="object-contain drop-shadow-sm"
                  sizes="(max-width: 768px) 48px, 56px"
                  priority
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base md:text-xl font-bold text-green-700 tracking-wide leading-tight transition-colors duration-300 group-hover:text-green-800">
                  YAYASAN JAMALUDDIN SURALAGA
                </h1>
              </div>
            </Link>

            {/* Menu Tengah — Desktop */}
            <ul className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm xl:text-base">
              <li>
                <Link href="/" onClick={(e) => handleNavClick(e, "beranda")} className={getLinkClass("beranda", true)}>BERANDA</Link>
              </li>
              <li>
                <Link href="/#jenjang" onClick={(e) => handleNavClick(e, "jenjang")} className={getLinkClass("jenjang", true)}>JENJANG</Link>
              </li>
              <li>
                <Link href="/cara-daftar" onClick={(e) => { if (pathname === "/cara-daftar") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className={getLinkClass("/cara-daftar")}>CARA DAFTAR</Link>
              </li>
              <li>
                <Link href="/galeri" onClick={(e) => { if (pathname === "/galeri") { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className={getLinkClass("/galeri")}>GALERI</Link>
              </li>
            </ul>

            {/* Tombol Kanan */}
            <div className="flex items-center gap-2 md:gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex px-4 py-2 rounded-xl border border-purple-400 text-purple-600 font-semibold hover:bg-purple-50 transition text-sm"
              >
                Login
              </Link>

              <DaftarButton className="hidden sm:inline-flex px-4 md:px-6 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-md hover:scale-105 transition duration-300 text-sm" />

              {/* Hamburger — Mobile */}
              <button
                aria-label="Toggle menu"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </nav>

        {/* TOP INFO BAR */}
        <div className="w-full bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-end text-xs sm:text-sm text-gray-700">
            <div className={`flex items-center gap-2 font-semibold ${bukaPendaftaran ? "text-green-600" : "text-red-500"}`}>
              <span className={`w-2 h-2 rounded-full animate-pulse ${bukaPendaftaran ? "bg-green-500" : "bg-red-500"}`}></span>
              {bukaPendaftaran ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup"}
            </div>
          </div>
        </div>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-40 animate-in slide-in-from-top-2 duration-200">
            <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <Link href="/" onClick={(e) => handleNavClick(e, "beranda")} className={getMobileLinkClass("beranda", true)}>🏠 Beranda</Link>
              <Link href="/#jenjang" onClick={(e) => handleNavClick(e, "jenjang")} className={getMobileLinkClass("jenjang", true)}>🎓 Jenjang</Link>
              <Link href="/cara-daftar" onClick={() => setMobileOpen(false)} className={getMobileLinkClass("/cara-daftar")}>📋 Cara Daftar</Link>
              <Link href="/galeri" onClick={() => setMobileOpen(false)} className={getMobileLinkClass("/galeri")}>🖼️ Galeri</Link>

              <div className="border-t border-gray-100 pt-3 mt-3 flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-3 rounded-xl border border-purple-400 text-purple-600 font-semibold hover:bg-purple-50 transition text-sm"
                >
                  Login Admin
                </Link>
                <DaftarButton className="w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-md transition text-sm" />
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Overlay backdrop for mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
