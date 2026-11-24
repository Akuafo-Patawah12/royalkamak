import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Notice } from "@/components/notice";
import { RoomBodySkeleton } from "@/components/skeletons";
import { currency, getRoomAvailability, getRoomTypes } from "@/lib/api";
import { formatMoney, isIsoDate } from "@/lib/format";
import { roomTypeOf } from "@/lib/room-types";
import { RoomAvailability } from "./room-availability";
import { RoomGallery } from "./room-gallery";

export const metadata: Metadata = { title: "Room availability" };

export default function RoomTypePage(props: PageProps<"/rooms/[type]">) {
  return (
    <div className="container-page space-y-8 py-14">
      <Link href="/rooms" className="link-arrow text-muted">
        ← All rooms
      </Link>
      <Suspense fallback={<RoomBodySkeleton />}>
        <RoomTypeView params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function RoomTypeView({ params, searchParams }: Pick<PageProps<"/rooms/[type]">, "params" | "searchParams">) {
  const { type: slug } = await params;
  const { checkIn, checkOut } = await searchParams;
  const dates = isIsoDate(checkIn) && isIsoDate(checkOut) ? { checkIn, checkOut } : null;

  const res = await getRoomTypes();
  if (!res.ok) return <Notice tone="error">{res.message}</Notice>;

  // Older links point at a single room by id: send them to that room's type.
  if (/^\d+$/.test(slug)) {
    const room = res.rooms.find((r) => r.id === Number(slug));
    if (!room) notFound();
    redirect(`/rooms/${roomTypeOf(room, res.catalog)}${dates ? `?${new URLSearchParams(dates)}` : ""}`);
  }

  const type = res.types.find((t) => t.slug === slug);
  if (!type) notFound();

  // The backend uses today (its clock) .. +180 days when no range is given.
  const calendars = await Promise.all(type.rooms.map((room) => getRoomAvailability(String(room.id))));
  const failed = calendars.find((c) => !c.ok);
  if (failed && !failed.ok) return <Notice tone="error">{failed.message}</Notice>;
  const ok = calendars.flatMap((c) => (c.ok ? [c] : []));
  const count = type.rooms.length;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="min-w-0 space-y-5 [overflow-wrap:anywhere]">
        {type.photos.length ? (
          <RoomGallery name={type.name} photos={type.photos} />
        ) : (
          <div
            className="flex aspect-[4/3] items-center justify-center"
            style={{ backgroundImage: "linear-gradient(160deg, #faf6f0, #ede3d3)" }}
          >
            <span className="display select-none text-[8rem] leading-none text-brand/15">{type.name.charAt(0)}</span>
          </div>
        )}
        <p className="eyebrow">From {formatMoney(type.fromPrice, currency)} / night</p>
        <h1 className="display text-4xl sm:text-5xl">{type.name}</h1>
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          {count === 0 ? "Not yet bookable online" : `${count} room${count === 1 ? "" : "s"} of this type`}
        </p>
        {type.description && <p className="accent-italic text-sm leading-loose text-muted">{type.description}</p>}
        {type.features && <p className="text-xs leading-relaxed text-muted">{type.features}</p>}
      </div>

      {count === 0 ? (
        <div className="card h-fit space-y-4 p-6 sm:p-8">
          <p className="eyebrow">Availability</p>
          <p className="display text-2xl">Not bookable online yet</p>
          <p className="text-sm leading-relaxed text-muted">
            This room type can&apos;t be booked on the website yet. Please contact the hotel to reserve it, or choose
            another room type.
          </p>
          <Link href="/book" className="btn">
            See other rooms
          </Link>
        </div>
      ) : (
      <RoomAvailability
        typeSlug={type.slug}
        currency={currency}
        rooms={ok.map((c) => ({ id: c.room.id, pricePerNight: c.room.pricePerNight, bookedDates: c.bookedDates }))}
        from={ok[0].from}
        to={ok[0].to}
        defaultCheckIn={dates?.checkIn ?? ""}
        defaultCheckOut={dates?.checkOut ?? ""}
      />
      )}
    </div>
  );
}
