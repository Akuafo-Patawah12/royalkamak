"use client";

import Image from "next/image";
import { useState } from "react";
import { roomImageUrl } from "@/lib/format";

/** Main photo with clickable thumbnails underneath. */
export function RoomGallery({ roomId, roomName, images }: { roomId: number; roomName: string; images: number[] }) {
  const [active, setActive] = useState(images[0]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink">
        <Image
          key={active}
          src={roomImageUrl(roomId, active)}
          alt={roomName}
          fill
          preload
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <ul className="grid grid-cols-5 gap-2">
          {images.slice(0, 10).map((id, i) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setActive(id)}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                aria-pressed={id === active}
                className={`relative block aspect-square w-full overflow-hidden transition ${
                  id === active ? "ring-2 ring-brand ring-offset-2" : "opacity-75 hover:opacity-100"
                }`}
              >
                <Image src={roomImageUrl(roomId, id)} alt="" fill sizes="96px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
