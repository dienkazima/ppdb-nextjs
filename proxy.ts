import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login");
  const isAdminDashboard = req.nextUrl.pathname.startsWith("/admin");

  // Protect Admin Dashboard UI
  if (isAdminDashboard) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      const secret = process.env.JWT_SECRET || "B4HAs14_R4h4514_PPDB_2026_S3cur3!";
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch (e) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect authenticated user away from login
  if (isAuthPage) {
    if (token) {
      try {
        const secret = process.env.JWT_SECRET || "B4HAs14_R4h4514_PPDB_2026_S3cur3!";
        await jwtVerify(token, new TextEncoder().encode(secret));
        return NextResponse.redirect(new URL("/admin", req.url));
      } catch (e) {
        return NextResponse.next();
      }
    }
  }

  // Protect sensitive API routes (Panitia shouldn't manage users, settings, etc.)
  if (req.nextUrl.pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    try {
      const secret = process.env.JWT_SECRET || "B4HAs14_R4h4514_PPDB_2026_S3cur3!";
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      
      if (payload.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.next();
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/api/admin/:path*"],
};
