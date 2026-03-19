import type { NextConfig } from "next";

// next-auth/react parses NEXTAUTH_URL at module evaluation time.
// An empty-string value causes `new URL('')` → ERR_INVALID_URL during prerendering.
// Remove it here so next-auth falls back to VERCEL_URL (on Vercel) or localhost:3000.
if (!process.env.NEXTAUTH_URL) {
  delete process.env.NEXTAUTH_URL;
}
if (!process.env.NEXTAUTH_URL_INTERNAL) {
  delete process.env.NEXTAUTH_URL_INTERNAL;
}

const nextConfig: NextConfig = {};

export default nextConfig;
