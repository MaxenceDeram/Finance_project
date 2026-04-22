import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/portfolios",
  "/orders",
  "/assets",
  "/settings",
  "/profile"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieName = process.env.SESSION_COOKIE_NAME || "sim_session";
  const hasSession = Boolean(request.cookies.get(cookieName)?.value);
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portfolios/:path*",
    "/orders/:path*",
    "/assets/:path*",
    "/settings/:path*",
    "/profile/:path*"
  ]
};
