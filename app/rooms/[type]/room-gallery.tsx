"use client";

import Image from "next/image";
import { useState } from "react";
import { roomImageUrl } from "@/lib/format";
import type { RoomPhoto } from "@/lib/room-types";

const key = (p: RoomPhoto) => `${p.roomId}/${p.imageId}`;

/** Main photo with clickable thumbnails underneath (photos of every room of the type). */
export function RoomGallery({ name, photos }: { name: string; photos: RoomPhoto[] }) {
  const [active, setActive] = useState(photos[0]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        <Image
          key={key(active)}
          src={roomImageUrl(active.roomId, active.imageId)}
          alt={name}
          fill
          preload
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      </div>
      {photos.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {photos.slice(0, 10).map((photo, i) => (
            <li key={key(photo)}>
              <button
                type="button"
                onClick={() => setActive(photo)}
                aria-label={`Show photo ${i + 1} of ${photos.length}`}
                aria-pressed={key(photo) === key(active)}
                className={`relative block aspect-square w-full overflow-hidden transition ${
                  key(photo) === key(active) ? "ring-2 ring-brand ring-offset-2" : "opacity-75 hover:opacity-100"
                }`}
              >
                <Image src={roomImageUrl(photo.roomId, photo.imageId)} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
