import type { NextRequest } from "next/server";
import { fetchRoomImage } from "@/lib/api";

// Streams a room photo from Kamakz, so the backend address stays private.
// Kamakz only serves photos of this company's bookable rooms.
export async function GET(_req: NextRequest, ctx: RouteContext<"/room-images/[roomId]/[imageId]">) {
  const { roomId, imageId } = await ctx.params;
  if (!/^\d+$/.test(roomId) || !/^\d+$/.test(imageId)) {
    return new Response("Not found", { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetchRoomImage(roomId, imageId);
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
