/**
 * DigiShop AI — Real Auth & Domain Resolution Middleware
 *
 * Replaces the static domain table with DB-backed resolution and
 * adds Supabase session verification for protected routes.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { resolveDomainToVendor } from "@/lib/storefront/domainResolver";

// ─── Route Classification ────────────────────────────────────────────────────

const STATIC_PATHS = ["/_next", "/api", "/images", "/favicon.ico"];

const VENDOR_PROTECTED = [
  "/vendor/dashboard",
  "/vendor/onboarding",
  "/vendor/stores",
  "/vendor/products",
  "/vendor/categories",
  "/vendor/inventory",
  "/vendor/orders",
  "/vendor/customers",
  "/vendor/analytics",
  "/vendor/ai-builder",
  "/vendor/domains",
  "/vendor/payments",
  "/vendor/couriers",
  "/vendor/marketing",
  "/vendor/complaints",
  "/vendor/notifications",
  "/vendor/settings",
  // (vendor) route group pages
  "/dashboard",
  "/orders",
  "/inventory",
  "/products",
  "/onboarding",
  "/settings",
  "/billing",
  "/customers",
  "/campaigns",
  "/email",
];

const CUSTOMER_PROTECTED = [
  "/account",
  "/checkout",
];

const AUTH_PAGES = [
  "/vendor/login",
  "/vendor/register",
  "/vendor/forgot-password",
  "/vendor/reset-password",
  "/vendor/verify",
  "/login",
  "/register",
  "/forgot-password",
  "/auth",
];

const PUBLIC_PAGES = [
  "/",
  "/demo",
  "/showroom",
  "/preview",
  "/store",
  "/cart",
  "/order-success",
];

// System domains that should NOT trigger tenant rewrite
const SYSTEM_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "altrivo-admin.vercel.app",
  "altrivo.vercel.app",
  "altrivo.com",
  "www.altrivo.com",
];

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const hostname = req.headers.get("host") || "";
  const pathname = req.nextUrl?.pathname || "";
  const hostLower = hostname.toLowerCase();

  // 1. Skip static assets
  if (STATIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Create a Supabase client that can read/write cookies for session refresh
  let response = NextResponse.next({
    request: { headers: new Headers(req.headers) },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          // Set cookies on both the request (for downstream) and response (for browser)
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: new Headers(req.headers) },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // 3. Refresh session (this keeps the session alive)
    const { data: { user } } = await supabase.auth.getUser();

    // 4. Route protection
    const isVendorRoute = VENDOR_PROTECTED.some((p) => pathname.startsWith(p));
    const isCustomerRoute = CUSTOMER_PROTECTED.some((p) => pathname.startsWith(p));
    const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

    if (isVendorRoute && !user) {
      // Unauthenticated user trying to access vendor routes → redirect to login
      const loginUrl = new URL("/vendor/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isCustomerRoute && !user) {
      // Unauthenticated customer → redirect to login (preserve checkout intent)
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If already authenticated and visiting an auth page, redirect appropriately
    if (isAuthPage && user) {
      const role = user.user_metadata?.role;
      if (role === "vendor" && (pathname.startsWith("/vendor/login") || pathname.startsWith("/vendor/register"))) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      if (pathname === "/login" || pathname === "/register") {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    // 5. Set user context headers for downstream use
    if (user) {
      response.headers.set("x-user-id", user.id);
      response.headers.set("x-user-role", user.user_metadata?.role || "customer");
    }
  }

  // 6. Multi-Tenant Domain Resolution
  const hostWithoutPort = hostLower.split(":")[0];
  const isSystemHost = SYSTEM_HOSTS.some(
    (h) => hostWithoutPort === h || hostLower === h || hostLower.startsWith(h + ":") || hostLower.includes("run.app") || hostLower.includes("google")
  );

  // Check for tenant subdomain (e.g. codex-watch.altrivo.vercel.app or codex-watch.altrivo.com or codex-watch.localhost)
  let tenantSubdomain: string | null = null;
  if (!isSystemHost) {
    if (hostWithoutPort.endsWith(".altrivo.vercel.app")) {
      tenantSubdomain = hostWithoutPort.replace(".altrivo.vercel.app", "");
    } else if (hostWithoutPort.endsWith(".altrivo.com")) {
      tenantSubdomain = hostWithoutPort.replace(".altrivo.com", "");
    } else if (hostWithoutPort.endsWith(".localhost")) {
      tenantSubdomain = hostWithoutPort.replace(".localhost", "");
    }

    if (tenantSubdomain && ["www", "admin", "api", "app"].includes(tenantSubdomain)) {
      tenantSubdomain = null;
    }
  }

  // Handle subdomain rewriting to /store/[subdomain]
  if (tenantSubdomain && !pathname.startsWith("/api") && !pathname.startsWith("/_next")) {
    if (pathname === "/" || pathname === "") {
      const url = req.nextUrl.clone();
      url.pathname = `/store/${tenantSubdomain}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }
    if (["/about", "/contact", "/products", "/shop"].includes(pathname)) {
      const tab = pathname.replace("/", "");
      const url = req.nextUrl.clone();
      url.pathname = `/store/${tenantSubdomain}/${tab}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }
    if (pathname.startsWith("/product/")) {
      const prodId = pathname.replace("/product/", "");
      const url = req.nextUrl.clone();
      url.pathname = `/store/${tenantSubdomain}/product/${prodId}`;
      return NextResponse.rewrite(url, { headers: response.headers });
    }
  }

  const isSystemPath =
    pathname === "/" ||
    PUBLIC_PAGES.some((p) => pathname.startsWith(p)) ||
    AUTH_PAGES.some((p) => pathname.startsWith(p)) ||
    VENDOR_PROTECTED.some((p) => pathname.startsWith(p)) ||
    CUSTOMER_PROTECTED.some((p) => pathname.startsWith(p));

  // For non-system domains, resolve to a store via domain resolver
  if (!isSystemHost && !tenantSubdomain) {
    const domainResult = resolveDomainToVendor(hostWithoutPort || hostname);
    if (!domainResult.vendorId) {
      return new NextResponse("Store Not Found", { status: 404 });
    }
    response.headers.set("x-vendor-id", domainResult.vendorId);
    if (domainResult.storeId) {
      response.headers.set("x-store-id", domainResult.storeId);
    }
  }

  response.headers.set("x-vendor-host", hostname);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except static files
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
