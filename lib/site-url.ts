import "server-only";

import { headers } from "next/headers";

/**
 * Public address of this site, e.g. https://royalkamak.com (no trailing slash).
 * ROYALKAMAK_SITE_URL when set (recommended in production); otherwise the
 * address the visitor used, taken from the request.
 */
export async function siteUrl() {
  const configured = process.env.ROYALKAMAK_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto")?.split(",")[0] ?? (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}
