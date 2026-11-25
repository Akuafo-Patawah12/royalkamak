import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { AvailabilitySearch } from "@/components/availability-search";
import { Notice } from "@/components/notice";
import { currency, getRoomTypes } from "@/lib/api";
import { formatDate, formatMoney, isIsoDate, roomImageUrl, todayIso } from "@/lib/format";
import { RoomFeatureList } from "@/components/room-features";
import { roomTypeAbout, type RoomType } from "@/lib/room-types";

/**
 * Availability search bar + room type cards. Used by the home page and /rooms;
 * \`action\` is where the search form goes (it reloads the same page with the dates).
 */
export async function RoomSearch({
  searchParams,
  action,
  overlap = true,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  action: string;
  /** Pull the search bar up over the section above (the home hero). */
  overlap?: boolean;
}) {
  const params = await searchParams;
  // Reading the clock must happen at request time, not during prerendering.
  await connection();
  const today = todayIso();
  const checkIn = isIsoDate(params.checkIn) ? params.checkIn : "";
  const checkOut = isIsoDate(params.checkOut) ? params.checkOut : "";
  const hasDates = Boolean(checkIn && checkOut);

  const res = await getRoomTypes(hasDates ? checkIn : undefined, hasDates ? checkOut : undefined);
  const types = res.ok ? res.types : [];

  return (
    <>
      <div className={`container-page relative z-10 ${overlap ? "-mt-14" : ""}`}>
        <AvailabilitySearch
          key={`${checkIn}|${checkOut}`}
          action={action}
          min={today}
          defaultCheckIn={checkIn}
          defaultCheckOut={checkOut}
        />
      </div>

      <section id="rooms" className="container-page scroll-mt-24 pt-20">
        <div className="mb-12 text-center">
          <p className="eyebrow">Rooms &amp; suites</p>
          <h2 className="display mt-4 text-4xl sm:text-5xl">
            {hasDates ? "Available for your dates" : "Choose your dates"}
          </h2>
          <p className="accent-italic mt-4 text-sm text-muted">
            {hasDates
              ? `${formatDate(checkIn)} — ${formatDate(checkOut)} · ${res.ok ? res.nights : "?"} night${
                  res.ok && res.nights === 1 ? "" : "s"
                }`
              : "Select arrival and departure above to see live availability and book."}
          </p>
        </div>

        {!res.ok ? (
          <Notice tone="error">{res.message}</Notice>
        ) : types.length === 0 ? (
          <Notice>No rooms have been set up yet.</Notice>
        ) : (
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {types.map((type, i) => (
              <RoomTypeCard key={type.slug} type={type} index={i} checkIn={checkIn} checkOut={checkOut} />
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

const PANEL_TONES = [
  "linear-gradient(160deg, #faf6f0, #ede3d3)",
  "linear-gradient(160deg, #f7f3ec, #e6ddd0)",
  "linear-gradient(160deg, #fbf7f2, #efe2dc)",
];

export function RoomTypeCard({
  type,
  index,
  checkIn,
  checkOut,
}: {
  type: RoomType;
  index: number;
  checkIn: string;
  checkOut: string;
}) {
  const hasDates = Boolean(checkIn && checkOut);
  const available = type.available ?? 0;
  const soldOut = hasDates && available <= 0 && type.rooms.length > 0;
  const bookHref = `/book?${new URLSearchParams({ type: type.slug, checkIn, checkOut })}`;
  // Type page with its availability calendar (carries the searched dates, if any).
  const typeHref = `/rooms/${type.slug}${hasDates ? `?${new URLSearchParams({ checkIn, checkOut })}` : ""}`;
  const count = type.rooms.length;
  // A room type set up in Kamakz with no bookable rooms yet.
  const empty = count === 0;
  const photo = type.photos[0];

  return (
    <li className="group flex min-w-0 flex-col [overflow-wrap:anywhere]">
      <Link
        href={typeHref}
        aria-label={`${type.name}: view availability`}
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
        style={{ backgroundImage: PANEL_TONES[index % PANEL_TONES.length] }}
      >
        {photo ? (
          <Image
            src={roomImageUrl(photo.roomId, photo.imageId)}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="display select-none text-[5rem] leading-none text-brand/15 transition duration-700 group-hover:scale-110">
            {type.name.charAt(0)}
          </span>
        )}
        {hasDates && !empty && (
          <span
            className={`absolute left-4 top-4 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] ${
              soldOut ? "bg-white/90 text-muted line-through" : "bg-white text-foreground"
            }`}
          >
            {soldOut ? "Fully booked" : `${available} available`}
          </span>
        )}
      </Link>
      <p className="eyebrow mt-6">
        From {formatMoney(type.fromPrice, currency)} / night
      </p>
      <h3 className="display mt-2 text-3xl">
        <Link href={typeHref} className="transition hover:text-brand">
          {type.name}
        </Link>
      </h3>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
        {empty ? "Not yet bookable online" : `${count} room${count === 1 ? "" : "s"}`}
      </p>
      {roomTypeAbout(type) && <p className="mt-3 text-sm leading-relaxed text-muted">{roomTypeAbout(type)}</p>}
      <RoomFeatureList type={type} />
      <div className="mt-auto flex items-center justify-between gap-4 pt-6">
        {empty ? (
          <span className="text-xs text-muted">Contact the hotel to book</span>
        ) : hasDates && type.fromStayPrice !== undefined ? (
          <span className="text-sm">
            From {formatMoney(type.fromStayPrice, currency)} <span className="text-muted">this stay</span>
          </span>
        ) : (
          <span className="text-xs text-muted">See when it&apos;s free</span>
        )}
        {hasDates && !soldOut && !empty ? (
          <Link href={bookHref} className="link-arrow">
            Reserve <span aria-hidden>→</span>
          </Link>
        ) : (
          <Link href={typeHref} className="link-arrow">
            {empty ? "Details" : soldOut ? "Other dates" : "View availability"} <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </li>
  );
}
