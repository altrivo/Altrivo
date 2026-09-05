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
  // Primary system domains
  const systemDomains = ["localhost:3000", "altrivo-admin.vercel.app", "altrivo.com"];
  const isSystemDomain = systemDomains.some((d) => hostname.toLowerCase() === d);

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
