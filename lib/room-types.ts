import type { Room, RoomTypeInfo } from "./types";

/*
 * Rooms are shown to guests by type, not one by one.
 *
 * The types are the ones set up in Kamakz under Hotel > Room Type (inventory
 * sub-categories of the hotel's room category); each room's inventory item
 * says which type it belongs to. Every type is listed, even one with no
 * bookable rooms yet (it shows as not available online).
 *
 * A room with no room type set falls back to a type taken from its name:
 * everything before the room number ("Standard Room 101" -> "Standard Room").
 */

export type RoomPhoto = { roomId: number; imageId: number };

export type RoomType = {
  slug: string;
  name: string;
  /** The type's bookable rooms, cheapest first. Empty: none bookable online yet. */
  rooms: Room[];
  fromPrice: number;
  description: string | null;
  features: string | null;
  photos: RoomPhoto[];
  // Only when the rooms were requested for specific dates:
  /** How many rooms of this type are free for the whole stay. */
  available?: number;
  /** Price of the stay in the cheapest free room. */
  fromStayPrice?: number;
};

export function roomTypeName(roomName: string) {
  const name = roomName.trim().replace(/\s+/g, " ");
  // Cut at the first standalone number (optionally written "No. 5" or "#5").
  const match = /^(.*?)[\s,-]*(?:\bno\.?\s*|#)?\b\d+\b/i.exec(name);
  const type = (match ? match[1] : name).replace(/[\s,#-]+$/, "");
  return type || "Room";
}

export function roomTypeSlug(typeName: string) {
  return (
    typeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "room"
  );
}

/** Kamakz room types (by id) -> URL slug; two types with the same name get the id appended. */
function slugsFor(types: { id: number; name: string }[]) {
  const byId = new Map<number, string>();
  const used = new Set<string>();
  for (const t of [...types].sort((a, b) => a.id - b.id)) {
    if (byId.has(t.id)) continue;
    let slug = roomTypeSlug(t.name.trim());
    if (used.has(slug)) slug = `${slug}-${t.id}`;
    used.add(slug);
    byId.set(t.id, slug);
  }
  return byId;
}

/** Room types known from the catalogue and from the rooms themselves. */
function knownTypes(rooms: Room[], catalog: RoomTypeInfo[]) {
  const types = new Map<number, RoomTypeInfo>(catalog.map((t) => [t.id, t]));
  for (const r of rooms) {
    if (r.roomTypeId != null && !types.has(r.roomTypeId)) {
      types.set(r.roomTypeId, { id: r.roomTypeId, name: r.roomType ?? "Room", pricePerNight: r.pricePerNight });
    }
  }
  return types;
}

/** The URL slug of the type a room belongs to. */
export function roomTypeOf(room: Room, catalog: RoomTypeInfo[] = []) {
  if (room.roomTypeId != null) return slugsFor([...knownTypes([room], catalog).values()]).get(room.roomTypeId)!;
  return roomTypeSlug(roomTypeName(room.name));
}

/**
 * Groups rooms into types. Types with bookable rooms come first (cheapest
 * first), then types with none yet.
 */
export function groupRoomTypes(rooms: Room[], catalog: RoomTypeInfo[] = []): RoomType[] {
  const types = knownTypes(rooms, catalog);
  const slugs = slugsFor([...types.values()]);
  const hasDates = rooms.some((r) => r.available !== undefined);

  const groups = new Map<string, { name: string; rooms: Room[]; price?: number }>();
  for (const t of types.values()) {
    groups.set(slugs.get(t.id)!, { name: t.name.trim(), rooms: [], price: t.pricePerNight });
  }
  for (const room of rooms) {
    let slug: string;
    let name: string;
    if (room.roomTypeId != null) {
      slug = slugs.get(room.roomTypeId)!;
      name = types.get(room.roomTypeId)!.name.trim();
    } else {
      name = roomTypeName(room.name);
      slug = roomTypeSlug(name);
      // Don't merge an untyped room into a Kamakz type that happens to share its name.
      if (groups.has(slug) && [...slugs.values()].includes(slug)) slug = `${slug}-untyped`;
    }
    const group = groups.get(slug) ?? { name, rooms: [] };
    group.rooms.push(room);
    groups.set(slug, group);
  }

  const result: RoomType[] = [];
  for (const [slug, { name, rooms: members, price }] of groups) {
    const sorted = [...members].sort((a, b) => a.pricePerNight - b.pricePerNight || a.id - b.id);
    const free = sorted.filter((r) => (r.available ?? 0) > 0);
    result.push({
      slug,
      name,
      rooms: sorted,
      fromPrice: sorted[0]?.pricePerNight ?? price ?? 0,
      description: sorted.find((r) => r.description)?.description ?? null,
      features: sorted.find((r) => r.features)?.features ?? null,
      photos: sorted.flatMap((r) => (r.images ?? []).map((imageId) => ({ roomId: r.id, imageId }))),
      ...(hasDates && {
        available: free.length,
        fromStayPrice: free[0]?.stayPrice,
      }),
    });
  }
  return result.sort(
    (a, b) =>
      Number(b.rooms.length > 0) - Number(a.rooms.length > 0) ||
      a.fromPrice - b.fromPrice ||
      a.name.localeCompare(b.name),
  );
}
