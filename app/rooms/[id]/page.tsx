import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Notice } from "@/components/notice";
import { RoomBodySkeleton } from "@/components/skeletons";
import { currency, getRoomAvailability } from "@/lib/api";
import { formatMoney, isIsoDate } from "@/lib/format";
import { RoomAvailability } from "./room-availability";
import { RoomGallery } from "./room-gallery";

export const metadata: Metadata = { title: "Room availability" };

export default function RoomPage(props: PageProps<"/rooms/[id]">) {
  return (
    <div className="container-page space-y-8 py-14">
      <Link href="/#rooms" className="link-arrow text-muted">
        ← All rooms
      </Link>
      <Suspense fallback={<RoomBodySkeleton />}>
        <Room params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Room({ params, searchParams }: Pick<PageProps<"/rooms/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const { checkIn, checkOut } = await searchParams;
  if (!/^\d+$/.test(id)) notFound();

  // The backend uses today (its clock) .. +180 days when no range is given.
  const res = await getRoomAvailability(id);
  if (!res.ok) {
    if (res.httpStatus === 404) notFound();
    return <Notice tone="error">{res.message}</Notice>;
  }
  const { room } = res;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="min-w-0 space-y-5 [overflow-wrap:anywhere]">
        {room.images?.length ? (
          <RoomGallery roomId={room.id} roomName={room.name} images={room.images} />
        ) : (
          <div
            className="flex aspect-[4/3] items-center justify-center"
            style={{ backgroundImage: "linear-gradient(160deg, #faf6f0, #ede3d3)" }}
          >
            <span className="display select-none text-[8rem] leading-none text-brand/15">{room.name.charAt(0)}</span>
          </div>
        )}
        <p className="eyebrow">From {formatMoney(room.pricePerNight, currency)} / night</p>
        <h1 className="display text-4xl sm:text-5xl">{room.name}</h1>
        {room.description && <p className="accent-italic text-sm leading-loose text-muted">{room.description}</p>}
        {room.features && <p className="text-xs leading-relaxed text-muted">{room.features}</p>}
      </div>

      <RoomAvailability
        roomId={room.id}
        pricePerNight={room.pricePerNight}
        currency={currency}
        bookedDates={res.bookedDates}
        from={res.from}
        to={res.to}
        defaultCheckIn={isIsoDate(checkIn) ? checkIn : ""}
        defaultCheckOut={isIsoDate(checkOut) ? checkOut : ""}
      />
    </div>
  );
}
