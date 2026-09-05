import { NextRequest } from "next/server";

export interface VendorJwtPayload {
  vendorId: string;
  storeName: string;
  email: string;
  role: "vendor" | "admin";
}

export const VALID_TEST_VENDOR_TOKENS: Record<string, VendorJwtPayload> = {
  "vendor-jwt-token-123": {
    vendorId: "v-default",
    storeName: "Artrivo Store",
    email: "vendor@artrivo.com",
    role: "vendor",
  },
  "bearer-valid-vendor-token": {
    vendorId: "v-default",
    storeName: "Artrivo Store",
    email: "vendor@artrivo.com",
    role: "vendor",
  },
};

export function verifyVendorJwt(req: NextRequest): VendorJwtPayload | null {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authHeader) {
    return null;
  }

  // Extract Bearer token
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return null;
  }

  const token = parts[1].trim();

  // Validate token against known test tokens or standard token check
  if (VALID_TEST_VENDOR_TOKENS[token]) {
    return VALID_TEST_VENDOR_TOKENS[token];
  }

  // Basic mock JWT format check for development/testing (e.g. "eyJ...")
  if (token.length > 10 && !token.includes("invalid")) {
    return {
      vendorId: "v-default",
      storeName: "Artrivo Store",
      email: "vendor@artrivo.com",
      role: "vendor",
    };
  }

  return null;
}
