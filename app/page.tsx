import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AvailabilitySearch } from "@/components/availability-search";
import { HeroVideo } from "@/components/hero-video";
import { Notice } from "@/components/notice";
import { RoomSearchSkeleton } from "@/components/skeletons";
import { currency, getRooms } from "@/lib/api";
import { formatDate, formatMoney, isIsoDate, roomImageUrl, todayIso } from "@/lib/format";
import type { Room } from "@/lib/types";

// Hero background, in order of preference: public/hero.mp4 (muted looping
// video, with public/hero-poster.jpg shown while it loads), then the photo
// public/hero.jpg, then a plain light gradient.
const inPublic = (file: string) => existsSync(path.join(process.cwd(), "public", file));
const HERO_VIDEO = inPublic("hero.mp4") ? "/hero.mp4" : null;
const HERO_POSTER = inPublic("hero-poster.jpg") ? "/hero-poster.jpg" : null;
const HERO_IMAGE = inPublic("hero.jpg") ? "/hero.jpg" : HERO_POSTER;

export default function Home(props: PageProps<"/">) {
  return (
    <>
      <Hero />
      <Suspense fallback={<RoomSearchSkeleton />}>
        <RoomSearch searchParams={props.searchParams} />
      </Suspense>
      <Benefits />
    </>
  );
}

function Hero() {
  return (
    <section
      className={`relative flex min-h-[560px] items-center justify-center overflow-hidden bg-ink py-16 sm:min-h-[680px] sm:py-28 ${
        HERO_IMAGE ? "text-white" : "text-foreground"
      }`}
      style={
        HERO_IMAGE
          ? undefined
          : {
              backgroundImage:
                "radial-gradient(ellipse at 30% 20%, rgba(201,162,39,.16), transparent 55%), linear-gradient(160deg, #fbf8f3, #efe8dc)",
            }
      }
    >
      {HERO_IMAGE && !HERO_VIDEO && (
        // Resized per screen by next/image, so phones don't download the full photo.
        <Image src={HERO_IMAGE} alt="" fill preload sizes="100vw" className="object-cover object-center" />
      )}
      {/* playbackRate: 0.5 = half speed. Raise towards 1 for faster, lower for slower. */}
      {HERO_VIDEO && <HeroVideo src={HERO_VIDEO} poster={HERO_POSTER ?? undefined} playbackRate={0.5} />}
      {/* No dark wash over the photo/video: a soft text shadow keeps the white text readable. */}
      <div
        className={`container-page relative pb-24 pt-16 text-center ${
          HERO_IMAGE ? "[text-shadow:0_1px_2px_rgba(0,0,0,.25),0_2px_28px_rgba(0,0,0,.35)]" : ""
        }`}
      >
        <p className={`eyebrow ${HERO_IMAGE ? "text-white" : ""}`}>Royal Kamak Hotel</p>
        <h1 className="display mx-auto mt-6 max-w-3xl text-4xl leading-[1.1] sm:text-7xl">
          Stays your guests will remember
        </h1>
        <div className={`mx-auto mt-8 h-px w-16 ${HERO_IMAGE ? "bg-white/80" : "bg-accent/60"}`} />
        <p className={`accent-italic mx-auto mt-8 max-w-xl text-sm leading-loose sm:text-base ${HERO_IMAGE ? "text-white" : "text-muted"}`}>
          Check live availability and reserve your room in minutes. No account needed. Partners can sign in to book for their guests.
        </p>
      </div>
    </section>
  );
}

async function RoomSearch({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const params = await searchParams;
  // Reading the clock must happen at request time, not during prerendering.
  await connection();
  const today = todayIso();
  const checkIn = isIsoDate(params.checkIn) ? params.checkIn : "";
  const checkOut = isIsoDate(params.checkOut) ? params.checkOut : "";
  const hasDates = Boolean(checkIn && checkOut);

  const res = await getRooms(hasDates ? checkIn : undefined, hasDates ? checkOut : undefined);

  return (
    <>
      <div className="container-page relative z-10 -mt-14">
        <AvailabilitySearch
          key={`${checkIn}|${checkOut}`}
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
        ) : res.rooms.length === 0 ? (
          <Notice>No rooms have been set up yet.</Notice>
        ) : (
          <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {res.rooms.map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} checkIn={checkIn} checkOut={checkOut} />
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

function RoomCard({ room, index, checkIn, checkOut }: { room: Room; index: number; checkIn: string; checkOut: string }) {
  const hasDates = Boolean(checkIn && checkOut);
  const soldOut = hasDates && (room.available ?? 0) <= 0;
  const bookHref = `/book?${new URLSearchParams({ room: String(room.id), checkIn, checkOut })}`;
  // Room page with its own availability calendar (carries the searched dates, if any).
  const roomHref = `/rooms/${room.id}${hasDates ? `?${new URLSearchParams({ checkIn, checkOut })}` : ""}`;

  return (
    <li className="group flex min-w-0 flex-col [overflow-wrap:anywhere]">
      <Link
        href={roomHref}
        aria-label={`${room.name}: view availability`}
        className="relative flex aspect-[3/4] items-center justify-center overflow-hidden"
        style={{ backgroundImage: PANEL_TONES[index % PANEL_TONES.length] }}
      >
        {room.images?.length ? (
          <Image
            src={roomImageUrl(room.id, room.images[0])}
            alt=""
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <span className="display select-none text-[7rem] leading-none text-brand/15 transition duration-700 group-hover:scale-110">
            {room.name.charAt(0)}
          </span>
        )}
        {hasDates && (
          <span
            className={`absolute left-4 top-4 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em] ${
              soldOut ? "bg-white/90 text-muted line-through" : "bg-white text-foreground"
            }`}
          >
            {soldOut ? "Booked for these dates" : "Available"}
          </span>
        )}
      </Link>
      <p className="eyebrow mt-6">
        From {formatMoney(room.pricePerNight, currency)} / night
      </p>
      <h3 className="display mt-2 text-3xl">
        <Link href={roomHref} className="transition hover:text-brand">
          {room.name}
        </Link>
      </h3>
      {room.description && <p className="mt-3 text-sm leading-relaxed text-muted">{room.description}</p>}
      {room.features && <p className="mt-2 text-xs leading-relaxed text-muted">{room.features}</p>}
      <div className="mt-auto flex items-center justify-between gap-4 pt-6">
        {hasDates && room.stayPrice !== undefined ? (
          <span className="text-sm">
            {formatMoney(room.stayPrice, currency)} <span className="text-muted">this stay</span>
          </span>
        ) : (
          <span className="text-xs text-muted">See when it&apos;s free</span>
        )}
        {hasDates && !soldOut ? (
          <Link href={bookHref} className="link-arrow">
            Reserve <span aria-hidden>→</span>
          </Link>
        ) : (
          <Link href={roomHref} className="link-arrow">
            {soldOut ? "Other dates" : "View availability"} <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </li>
  );
}

function Benefits() {
  const items = [
    { title: "Live availability", text: "See which rooms are free for your exact dates before you book." },
    { title: "Instant reference", text: "Every booking gets a reference straight away, with no account needed." },
    { title: "Manage anytime", text: "Find your booking with its reference and email, or cancel an unconfirmed stay online." },
  ];
  return (
    <section className="container-page mt-28">
      <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="bg-card px-8 py-12 text-center">
            <p className="eyebrow">Book direct</p>
            <h3 className="display mt-4 text-2xl">{item.title}</h3>
            <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
