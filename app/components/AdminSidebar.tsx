"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome, FiUsers, FiLogOut, FiImage, FiLayers,
  FiBookOpen, FiTarget, FiInfo, FiDollarSign, FiCreditCard,
  FiChevronLeft, FiChevronRight, FiMenu, FiX, FiShield, FiFileText
} from "react-icons/fi";
import { useEffect, useState, createContext, useContext } from "react";

/* ─── Sidebar Context ──────────────────────────────────────────── */
interface SidebarCtx {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}
export const SidebarContext = createContext<SidebarCtx>({
  collapsed: false,
  setCollapsed: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});
export const useSidebar = () => useContext(SidebarContext);

/* ─── Provider (dipakai di layout) ────────────────────────────── */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

/* ─── Hamburger Button (rendered in topbar / layout) ──────────── */
export function SidebarToggleButton() {
  const { mobileOpen, setMobileOpen } = useSidebar();
  return (
    <button
      onClick={() => setMobileOpen(!mobileOpen)}
      className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition"
      aria-label="Toggle sidebar"
    >
      {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
    </button>
  );
}

/* ─── Main Sidebar Component ───────────────────────────────────── */
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [count, setCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  useEffect(() => {
    fetch("/api/me")
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) setUser(data.user);
      })
      .catch(() => {});

    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => setCount(data.menunggu || 0))
      .catch(() => setCount(0));
  }, []);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const logout = async () => {
    localStorage.removeItem("isLogin");
    try { await fetch("/api/logout", { method: "POST" }); } catch (e) {}
    router.push("/login");
  };

  // Menus for Panitia are filtered out if they don't have access
  const allMenus = [
    { name: "Dashboard",         path: "/admin",                icon: <FiHome size={20} />, adminOnly: false },
    { name: "Pendaftar",         path: "/admin/pendaftar",      icon: <FiUsers size={20} />, badge: count, adminOnly: false },
    { name: "Metode Pembayaran", path: "/admin/pembayaran",     icon: <FiCreditCard size={20} />, adminOnly: false },
    { name: "Galeri",            path: "/admin/galeri",         icon: <FiImage size={20} />, adminOnly: true },
    { name: "Jenjang",           path: "/admin/jenjang",        icon: <FiLayers size={20} />, adminOnly: true },
    { name: "Biaya Pendidikan",  path: "/admin/biaya-pendidikan", icon: <FiDollarSign size={20} />, adminOnly: true },
    { name: "Panduan Daftar",    path: "/admin/cara-daftar",    icon: <FiBookOpen size={20} />, adminOnly: true },
    { name: "Tata Tertib",       path: "/admin/tata-tertib",    icon: <FiFileText size={20} />, adminOnly: true },
    { name: "Visi & Misi",       path: "/admin/visi-misi",      icon: <FiTarget size={20} />, adminOnly: true },
    { name: "Profil Yayasan",    path: "/admin/profil-yayasan", icon: <FiInfo size={20} />, adminOnly: true },
    { name: "Akun Pengguna",     path: "/admin/pengguna",       icon: <FiShield size={20} />, adminOnly: true },
  ];

  const menu = allMenus.filter(m => !m.adminOnly || user?.role === "ADMIN");

  /* ── Shared sidebar JSX ── */
  const sidebarContent = (isMobile = false) => (
    <div
      className={`
        flex flex-col h-full bg-slate-900 border-r border-slate-800 justify-between
        transition-all duration-300 ease-in-out overflow-y-auto
        ${!isMobile && (collapsed ? "w-[72px]" : "w-64")}
        ${isMobile ? "w-72" : ""}
      `}
    >
      <div className="flex flex-col flex-1">
        {/* LOGO */}
        <div className={`flex items-center gap-3 px-4 pt-6 pb-8 ${collapsed && !isMobile ? "justify-center" : ""}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          {(!collapsed || isMobile) && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-white tracking-wide leading-tight truncate">JSBS</h1>
              <p className="text-xs text-slate-400 font-medium truncate">Panel Admin</p>
            </div>
          )}
        </div>

        {/* MENU */}
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {(!collapsed || isMobile) && (
            <p className="text-[10px] font-bold text-slate-500 mb-2 px-2 tracking-widest uppercase">Menu Utama</p>
          )}

          {menu.map((item, index) => {
            const active = pathname === item.path ||
              (item.path !== "/admin" && pathname.startsWith(item.path));

            return (
              <Link
                key={index}
                href={item.path}
                title={collapsed && !isMobile ? item.name : undefined}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${collapsed && !isMobile ? "justify-center" : "justify-between"}
                  ${active
                    ? "bg-blue-500/15 text-blue-400 font-semibold border border-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent"
                  }
                `}
              >
                <div className={`flex items-center gap-3 ${collapsed && !isMobile ? "" : ""}`}>
                  <span className={`shrink-0 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-110"}`}>
                    {item.icon}
                  </span>
                  {(!collapsed || isMobile) && (
                    <span className="text-sm truncate">{item.name}</span>
                  )}
                </div>

                {(!collapsed || isMobile) && item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-blue-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-sm shadow-blue-500/30">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip when collapsed */}
                {collapsed && !isMobile && (
                  <div className="
                    absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium
                    rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity
                    whitespace-nowrap z-50 pointer-events-none border border-slate-700
                  ">
                    {item.name}
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER */}
      <div className={`mt-auto pt-4 pb-5 px-3 border-t border-slate-800 space-y-3`}>
        {/* Profile */}
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-3 px-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${user?.role === 'ADMIN' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
              {user ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user ? user.name : "Admin PPDB"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role === "ADMIN" ? "Administrator" : `Panitia ${user?.jenjang || ""}`}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={logout}
          title={collapsed && !isMobile ? "Logout" : undefined}
          className={`
            flex items-center gap-2 text-sm text-slate-400 hover:text-red-400
            bg-slate-800/40 hover:bg-red-500/10 transition-all duration-200
            px-3 py-2.5 rounded-xl w-full border border-slate-800 hover:border-red-500/20 font-medium
            ${collapsed && !isMobile ? "justify-center" : ""}
          `}
        >
          <FiLogOut size={18} />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>

        {/* Collapse toggle — desktop only */}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 px-3 py-2 w-full rounded-xl hover:bg-slate-800/40 transition-all duration-200"
          >
            {collapsed ? (
              <FiChevronRight size={16} />
            ) : (
              <>
                <FiChevronLeft size={16} />
                <span>Ciutkan Menu</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (sticky) ── */}
      <aside className="hidden md:flex flex-col self-start sticky top-0 h-screen bg-slate-900 border-r border-slate-800 overflow-hidden">
        {sidebarContent(false)}
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── MOBILE DRAWER ── */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Close button xtra */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-[-44px] w-9 h-9 bg-slate-800/80 text-white rounded-full flex items-center justify-center z-50 border border-slate-700"
        >
          <FiX size={18} />
        </button>

        {sidebarContent(true)}
      </aside>
    </>
  );
}