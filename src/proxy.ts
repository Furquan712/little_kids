import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

function dashboardPathForRole(role: string): string {
  if (role === "NANNY") return "/baba";
  if (role === "FAMILY") return "/familia";
  return "/admin";
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  const requiredRole = pathname.startsWith("/baba")
    ? "NANNY"
    : pathname.startsWith("/familia")
      ? "FAMILY"
      : pathname.startsWith("/admin")
        ? "ADMIN"
        : null;

  if (!requiredRole) {
    return NextResponse.next();
  }

  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (user.role !== requiredRole) {
    return NextResponse.redirect(new URL(dashboardPathForRole(user.role), req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/baba/:path*", "/familia/:path*", "/admin/:path*"],
};
