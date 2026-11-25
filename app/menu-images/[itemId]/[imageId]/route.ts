import type { NextRequest } from "next/server";
import { fetchMenuImage } from "@/lib/api";

// Streams a menu item photo from Kamakz, so the backend address stays private.
// Kamakz only serves photos of items currently on the menu.
export async function GET(_req: NextRequest, ctx: RouteContext<"/menu-images/[itemId]/[imageId]">) {
  const { itemId, imageId } = await ctx.params;
  if (!/^\d+$/.test(itemId) || !/^\d+$/.test(imageId)) {
    return new Response("Not found", { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetchMenuImage(itemId, imageId);
  } catch {
    return new Response("Image service unavailable", { status: 503 });
  }
  const type = upstream.headers.get("content-type") ?? "";
  if (!upstream.ok || !type.startsWith("image/") || !upstream.body) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
