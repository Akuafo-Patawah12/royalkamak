import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { AvailabilitySearch } from "@/components/availability-search";
import { HeroVideo } from "@/components/hero-video";
import { Notice } from "@/components/notice";
import { Bone, SearchBarSkeleton } from "@/components/skeletons";
import { available as venuePhotos } from "@/components/venue-page";
import { currency, getRoomTypes } from "@/lib/api";
import { formatMoney, roomImageUrl, todayIso } from "@/lib/format";
import { VENUES } from "@/lib/venues";

// Hero background, in order of preference: public/hero.mp4 (muted looping
// video, with public/hero-poster.jpg shown while it loads), then the photo
// public/hero.jpg, then a plain light gradient.
const inPublic = (file: string) => existsSync(path.join(process.cwd(), "public", file));
const HERO_VIDEO = inPublic("hero.mp4") ? "/hero.mp4" : null;
const HERO_POSTER = inPublic("hero-poster.jpg") ? "/hero-poster.jpg" : null;
const HERO_IMAGE = inPublic("hero.jpg") ? "/hero.jpg" : HERO_POSTER;

// Photos used on this page (files in /public/home; missing ones are skipped).
const photo = (src: string, alt: string) => (inPublic(src.slice(1)) ? { src, alt } : null);
// Only the hotel's own photos here (no photos copied from booking sites).
const WELCOME_PHOTOS = [
  photo("/venues/restaurant-hero.jpg", "The covered terrace and balcony of Royal Kamak Hotel"),
  photo("/venues/swimming-2.jpg", "Loungers under a blue canopy beside the pool"),
  photo("/venues/bars-hero.jpg", "The poolside bar beside the pool"),
].filter((p) => p !== null);

const SAND = "radial-gradient(ellipse at 30% 20%, rgba(201,162,39,.16), transparent 55%), linear-gradient(160deg, #fbf8f3, #efe8dc)";

export default function Home() {
  return (
    <>
      <Hero />
      <div className="container-page relative z-10 -mt-14">
        <Suspense fallback={<SearchBarSkeleton />}>
          <HomeSearch />
        </Suspense>
      </div>
      <Welcome />
      <Suspense fallback={<RoomsShowcaseSkeleton />}>
        <RoomsShowcase />
      </Suspense>
      <Experiences />
      <LessonsBand />
      <Benefits />
    </>
  );
}

function Hero() {
  return (
    <section
      className={`relative flex min-h-[560px] items-center justify-center overflow-hidden bg-ink py-16 sm:min-h-[720px] sm:py-28 ${
        HERO_IMAGE ? "text-white" : "text-foreground"
      }`}
      style={HERO_IMAGE ? undefined : { backgroundImage: SAND }}
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
        <p className={`eyebrow ${HERO_IMAGE ? "text-white" : ""}`}>Royal Kamak Hotel · Tema</p>
        <h1 className="display mx-auto mt-6 max-w-3xl text-4xl leading-[1.1] sm:text-7xl">
          Stays your guests will remember
        </h1>
        <div className={`mx-auto mt-8 h-px w-16 ${HERO_IMAGE ? "bg-white/80" : "bg-accent/60"}`} />
        <p className={`accent-italic mx-auto mt-8 max-w-xl text-sm leading-loose sm:text-base ${HERO_IMAGE ? "text-white" : "text-muted"}`}>
          Comfortable rooms, a sunlit pool and warm Ghanaian hospitality. Choose your dates and book direct.
        </p>
      </div>
    </section>
  );
}

/** Date search: goes straight to booking with the room types free for those dates. */
async function HomeSearch() {
  // Reading the clock must happen at request time, not during prerendering.
  await connection();
  return <AvailabilitySearch action="/book" min={todayIso()} defaultCheckIn="" defaultCheckOut="" />;
}

function Welcome() {
  const mosaic = WELCOME_PHOTOS;
  return (
    <section className="container-page pt-28">
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow">Welcome</p>
        <h2 className="display mt-5 text-4xl leading-tight sm:text-6xl">A warm welcome in Tema</h2>
        <div className="mx-auto mt-7 h-px w-16 bg-accent/60" />
        <p className="accent-italic mt-7 text-base leading-loose text-muted sm:text-lg">
          Royal Kamak Hotel is a calm retreat in Community 25, Tema: comfortable rooms, a pool in the heart of the
          hotel, a restaurant and a bar, all a few steps from one another.
        </p>
        <p className="mt-6 leading-relaxed text-muted">
          Come for business or a weekend away, relax by the water, learn to swim with us, and let our team take care
          of the rest.
        </p>
      </div>

      {mosaic.length > 0 && (
        <div className="mt-16 grid gap-4 sm:grid-cols-[1.6fr_1fr] sm:grid-rows-2">
          {mosaic.map((p, i) => (
            <div
              key={p.src}
              className={`relative overflow-hidden bg-ink ${i === 0 ? "aspect-[4/3] sm:row-span-2 sm:aspect-auto" : "aspect-[4/3]"}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes={i === 0 ? "(min-width: 640px) 60vw, 100vw" : "(min-width: 640px) 38vw, 100vw"}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

async function RoomsShowcase() {
  const res = await getRoomTypes();
  const types = res.ok ? res.types : [];
  // Room photos uploaded in Kamakz (inventory images of the bookable rooms).
  const roomPhotos = types
    .flatMap((t) => t.photos.map((p) => ({ src: roomImageUrl(p.roomId, p.imageId), alt: `${t.name} at Royal Kamak Hotel` })))
    .slice(0, 3);
  const [main, ...small] = roomPhotos;

  return (
    <section className="mt-28 py-24" style={{ backgroundImage: SAND }}>
      <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
        <div className="grid grid-cols-2 gap-4">
          {!main && (
            <div
              className="col-span-2 flex aspect-[16/10] items-center justify-center"
              style={{ backgroundImage: "linear-gradient(160deg, #faf6f0, #ede3d3)" }}
            >
              <span className="display select-none text-[10rem] leading-none text-brand/15">R</span>
            </div>
          )}
          {main && (
            <div className="relative col-span-2 aspect-[16/10] overflow-hidden bg-ink">
              <Image src={main.src} alt={main.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          )}
          {small.map((p) => (
            <div key={p.src} className={`relative aspect-[4/3] overflow-hidden bg-ink ${small.length === 1 ? "col-span-2" : ""}`}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div>
          <p className="eyebrow">Stay</p>
          <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">Rooms &amp; suites</h2>
          <div className="mt-6 h-px w-16 bg-accent/60" />
          <p className="accent-italic mt-6 leading-loose text-muted">
            Air-conditioned rooms with a comfortable bed, a work desk and a TV. Pick a room type to see when it&apos;s
            free.
          </p>

          {!res.ok ? (
            <div className="mt-8">
              <Notice tone="error">{res.message}</Notice>
            </div>
          ) : (
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {types.map((type) => (
                <li key={type.slug}>
                  <Link href={`/rooms/${type.slug}`} className="group flex items-center justify-between gap-6 py-5">
                    <span>
                      <span className="display block text-2xl transition group-hover:text-brand">{type.name}</span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.18em] text-muted">
                        {type.rooms.length === 0
                          ? `From ${formatMoney(type.fromPrice, currency)} / night · ask the hotel`
                          : `${type.rooms.length} room${type.rooms.length === 1 ? "" : "s"} · from ${formatMoney(type.fromPrice, currency)} / night`}
                      </span>
                    </span>
                    <span aria-hidden className="text-accent transition group-hover:translate-x-1 group-hover:text-brand">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-8">
            <Link href="/book" className="btn">
              Book now
            </Link>
            <Link href="/rooms" className="link-arrow">
              All rooms <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoomsShowcaseSkeleton() {
  return (
    <section aria-busy="true" className="mt-28 py-24" style={{ backgroundImage: SAND }}>
      <div className="container-page grid items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-20">
        <Bone className="aspect-[16/10] w-full" />
        <div className="space-y-5">
          <Bone className="h-2.5 w-20" />
          <Bone className="h-12 w-72 max-w-full" />
          {Array.from({ length: 4 }, (_, i) => (
            <Bone key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Pool, restaurant and bar: alternating photo + text, like a hotel's "experiences" section. */
function Experiences() {
  return (
    <section className="container-page mt-28 space-y-24 sm:space-y-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">At the hotel</p>
        <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">Eat, drink and unwind</h2>
      </div>
      {VENUES.map((venue, i) => {
        const [cover] = venuePhotos(venue);
        const flip = i % 2 === 1;
        return (
          <article key={venue.slug} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
            <Link
              href={`/${venue.slug}`}
              tabIndex={-1}
              aria-hidden="true"
              className={`group relative flex items-center justify-center overflow-hidden bg-ink ${
                cover?.small ? "mx-auto aspect-[4/5] w-full max-w-[420px]" : "aspect-[4/3]"
              } ${flip ? "lg:order-2" : ""}`}
              style={cover ? undefined : { backgroundImage: SAND }}
            >
              {cover ? (
                <Image
                  src={cover.src}
                  alt=""
                  fill
                  sizes={cover.small ? "420px" : "(min-width: 1024px) 50vw, 100vw"}
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <span className="display select-none text-[10rem] leading-none text-brand/15 transition duration-700 group-hover:scale-110">
                  {venue.label.charAt(0)}
                </span>
              )}
            </Link>
            <div className={flip ? "lg:order-1" : ""}>
              <p className="eyebrow">{venue.eyebrow}</p>
              <h3 className="display mt-4 text-4xl sm:text-5xl">{venue.title}</h3>
              <div className="mt-6 h-px w-16 bg-accent/60" />
              <p className="accent-italic mt-6 leading-loose text-muted">{venue.lead}</p>
              <p className="mt-4 leading-relaxed text-muted">{venue.intro[0]}</p>
              <Link href={`/${venue.slug}`} className="link-arrow mt-8">
                Discover {venue.label.toLowerCase()} <span aria-hidden>→</span>
              </Link>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function LessonsBand() {
  return (
    <section className="mt-28 bg-ink py-24 text-center">
      <div className="container-page mx-auto max-w-3xl">
        <p className="eyebrow">Swimming lessons</p>
        <p className="display mt-6 text-3xl leading-snug sm:text-5xl">
          &ldquo;It&apos;s never too early, or too late, to learn to swim.&rdquo;
        </p>
        <p className="accent-italic mx-auto mt-6 max-w-xl leading-loose text-muted">
          We teach people how to swim at our pool, from first splashes for complete beginners to more confident
          swimmers.
        </p>
        <Link href="/swimming#swimming-lessons" className="btn mt-10">
          About lessons
        </Link>
      </div>
    </section>
  );
}

function Benefits() {
  const items = [
    { title: "Live availability", text: "See which rooms are free for your exact dates before you book." },
    { title: "Pay your way", text: "Pay online by card or Mobile Money, or pay at the hotel when you arrive." },
    { title: "Manage anytime", text: "Find your booking with its reference and email, and cancel an unpaid stay online." },
  ];
  return (
    <section className="container-page mt-28">
      <p className="eyebrow text-center">Why book direct</p>
      <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
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
