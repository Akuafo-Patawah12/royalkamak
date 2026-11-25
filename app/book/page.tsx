import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AvailabilitySearch } from "@/components/availability-search";
import { Notice } from "@/components/notice";
import { BookingBodySkeleton } from "@/components/skeletons";
import { currency, getCurrentPartner, getPaymentConfig, getRoomTypes } from "@/lib/api";
import { formatDate, formatMoney, isIsoDate, roomImageUrl, todayIso } from "@/lib/format";
import { roomTypeOf, type RoomType } from "@/lib/room-types";
import { RoomFeatureList } from "@/components/room-features";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = { title: "Book your stay" };

/*
 * "Book now" lands here.
 *   No dates yet: pick dates and see every room type (choosing one carries it
 *   through the date search).
 *   With dates: the booking form with the room types free for those dates.
 */
export default function BookPage(props: PageProps<"/book">) {
  return (
    <div className="container-page space-y-8 py-14">
      <div className="space-y-3">
        <p className="eyebrow">Reservation</p>
        <h1 className="display text-4xl sm:text-5xl">Book your stay</h1>
      </div>
      <Suspense fallback={<BookingBodySkeleton />}>
        <Booking searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Booking({ searchParams }: { searchParams: PageProps<"/book">["searchParams"] }) {
  const params = await searchParams;
  // Reading the clock must happen at request time, not during prerendering.
  await connection();
  const today = todayIso();
  const checkIn = isIsoDate(params.checkIn) && params.checkIn >= today ? params.checkIn : "";
  const checkOut = isIsoDate(params.checkOut) && checkIn && params.checkOut > checkIn ? params.checkOut : "";
  const typeParam = typeof params.type === "string" && /^[a-z0-9-]{1,80}$/.test(params.type) ? params.type : "";

  if (!checkIn || !checkOut) return <ChooseRoom selected={typeParam} today={today} />;

  // Signed-out visitors book as guests; partners book on their account.
  const partner = await getCurrentPartner();
  const here = `/book?${new URLSearchParams({ type: typeParam, checkIn, checkOut })}`;
  const signInHref = `/login?${new URLSearchParams({ next: here })}`;

  const [res, payments] = await Promise.all([getRoomTypes(checkIn, checkOut), getPaymentConfig()]);
  if (!res.ok) return <Notice tone="error">{res.message}</Notice>;

  // Every room type, including those fully booked for these dates (shown greyed out).
  const types = res.types;
  const anyFree = types.some((t) => (t.available ?? 0) > 0);
  // Older links name a single room: preselect that room's type.
  const oldRoom = typeof params.room === "string" ? res.rooms.find((r) => String(r.id) === params.room) : undefined;
  const preselected = typeParam || (oldRoom ? roomTypeOf(oldRoom, res.catalog) : "");

  return (
    <div className="space-y-6">
      <AvailabilitySearch
        key={`${checkIn}|${checkOut}`}
        action="/book"
        hidden={preselected ? { type: preselected } : undefined}
        min={today}
        defaultCheckIn={checkIn}
        defaultCheckOut={checkOut}
      />
      <p className="text-sm text-muted">
        {formatDate(checkIn)} → {formatDate(checkOut)} · {res.nights} night{res.nights === 1 ? "" : "s"}. Change the
        dates above to see other availability.
      </p>
      {!anyFree && types.length > 0 && (
        <Notice>Every room is booked for these dates. Try different dates, or see when each room type is free below.</Notice>
      )}
      {types.length === 0 ? (
        <Notice>No rooms have been set up yet.</Notice>
      ) : (
        <BookingForm
          types={types}
          nights={res.nights ?? 0}
          checkIn={checkIn}
          checkOut={checkOut}
          preselectedType={preselected}
          currency={currency}
          payOnline={payments.enabled}
          partnerName={partner ? (partner.fullName ?? partner.email ?? "your account") : null}
          signInHref={signInHref}
        />
      )}
    </div>
  );
}

/** Step 1: dates + room types. */
async function ChooseRoom({ selected, today }: { selected: string; today: string }) {
  const res = await getRoomTypes();
  const types = res.ok ? res.types : [];
  const chosen = types.find((t) => t.slug === selected);

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <p className="text-sm text-muted">
          {chosen ? (
            <>
              <strong className="text-foreground">{chosen.name}</strong> selected. Now choose your arrival and departure
              dates.
            </>
          ) : (
            "Choose your arrival and departure dates to see which rooms are free and book."
          )}
        </p>
        <AvailabilitySearch
          action="/book"
          hidden={chosen ? { type: chosen.slug } : undefined}
          min={today}
          defaultCheckIn=""
          defaultCheckOut=""
        />
      </section>

      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Room types</p>
            <h2 className="display mt-3 text-3xl sm:text-4xl">Choose your room</h2>
          </div>
          <Link href="/rooms" className="link-arrow text-muted">
            Compare rooms <span aria-hidden>→</span>
          </Link>
        </div>
        {!res.ok ? (
          <Notice tone="error">{res.message}</Notice>
        ) : types.length === 0 ? (
          <Notice>No rooms have been set up yet.</Notice>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {types.map((type) => (
              <RoomTypeOption key={type.slug} type={type} selected={type.slug === chosen?.slug} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function RoomTypeOption({ type, selected }: { type: RoomType; selected: boolean }) {
  const photo = type.photos[0];
  const count = type.rooms.length;
  return (
    <li
      className={`card flex min-w-0 flex-col p-4 transition [overflow-wrap:anywhere] ${
        selected ? "border-brand ring-1 ring-brand" : "hover:border-accent/60"
      }`}
    >
      <div className="flex min-w-0 gap-5">
        <div
          className="relative flex aspect-square w-28 shrink-0 items-center justify-center overflow-hidden bg-ink sm:w-32"
          style={photo ? undefined : { backgroundImage: "linear-gradient(160deg, #faf6f0, #ede3d3)" }}
        >
          {photo ? (
            <Image src={roomImageUrl(photo.roomId, photo.imageId)} alt="" fill sizes="128px" className="object-cover" />
          ) : (
            <span className="display select-none text-6xl leading-none text-brand/15">{type.name.charAt(0)}</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="eyebrow">From {formatMoney(type.fromPrice, currency)} / night</p>
          <h3 className="display mt-2 text-2xl">{type.name}</h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
            {count === 0 ? "Not yet bookable online" : `${count} room${count === 1 ? "" : "s"}`}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-4">
            {count === 0 ? (
              <span className="text-xs text-muted">Contact the hotel to book</span>
            ) : selected ? (
              <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-brand">✓ Selected</span>
            ) : (
              <Link href={`/book?${new URLSearchParams({ type: type.slug })}`} scroll={false} className="link-arrow text-brand">
                Choose <span aria-hidden>→</span>
              </Link>
            )}
            <Link href={`/rooms/${type.slug}`} className="link-arrow text-muted">
              See calendar
            </Link>
          </div>
        </div>
      </div>
      {/* Bed size, facilities, entitlements, room size (as on the room page). */}
      <RoomFeatureList type={type} />
    </li>
  );
}
