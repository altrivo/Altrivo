import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveDomainToVendor } from "@/lib/storefront/domainResolver";

export function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const pathname = req.nextUrl?.pathname || "";

  // 1. Exclude static assets, next files, api calls, and favicon
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // 2. Resolve subdomains or custom domains
  // Primary system domains & portal paths
  const hostLower = hostname.toLowerCase();
  const isSystemDomain =
    hostLower === "localhost:3000" ||
    hostLower.startsWith("localhost") ||
    hostLower.startsWith("127.0.0.1") ||
    hostLower.includes("run.app") ||
    hostLower.includes("google") ||
    hostLower === "altrivo-admin.vercel.app" ||
    hostLower === "altrivo.com" ||
    pathname === "/" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/vendor") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/order-success") ||
    pathname.startsWith("/auth");

  if (isSystemDomain) {
    return NextResponse.next();
  }

  // 3. Multi-Tenant Rewrite:
  // For vendor custom domains (e.g. www.brandxyz.com) or subdomains (e.g. crafts.localhost:3000)
  // We resolve the domain and return 404 if it is not verified/active.
  const { vendorId } = resolveDomainToVendor(hostname);
  if (!vendorId) {
    return new NextResponse("Store Not Found", { status: 404 });
  }

  // 4. Attach custom headers to the request representing the resolved vendor details
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-vendor-id", vendorId);
  requestHeaders.set("x-vendor-host", hostname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
