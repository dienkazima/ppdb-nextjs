"use client";

import AdminSidebar, { SidebarProvider, SidebarToggleButton, useSidebar } from "@/app/components/AdminSidebar";
import Link from "next/link";

/* ─── Inner layout (needs context) ─────────────────────────────── */
function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-slate-50">
      {/* SIDEBAR */}
      <AdminSidebar />

      {/* MAIN AREA */}
      <div className="flex flex-col flex-1 min-w-0 transition-all duration-300">

        {/* ─── MOBILE TOP BAR ─── */}
        <header className="md:hidden sticky top-0 z-30 w-full bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center gap-3 shadow-sm">
          <SidebarToggleButton />
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-white font-bold text-sm truncate">JSBS Admin</span>
          </div>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 shrink-0"
          >
            ← Beranda
          </Link>
        </header>

        {/* ─── CONTENT ─── */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 min-h-0">
          {children}
        </main>

      </div>
    </div>
  );
}

/* ─── Exported Layout with Provider ───────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SidebarProvider>
  );
}