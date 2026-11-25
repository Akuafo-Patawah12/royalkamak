import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { getVenue, VENUES, type Dish, type Venue } from "@/lib/venues";

/** Only photos whose file is actually in /public (missing ones are skipped). */
export const available = (venue: Venue) =>
  venue.photos.filter((p) => existsSync(path.join(process.cwd(), "public", p.src.replace(/^\//, ""))));

// A Royal Kamak guest room, for the "Rooms & suites" card (skipped if the file is missing).
const ROOMS_PHOTO = existsSync(path.join(process.cwd(), "public", "home", "room-3.jpg"))
  ? { src: "/home/room-3.jpg", alt: "A guest room at Royal Kamak Hotel" }
  : undefined;

const PANEL = "radial-gradient(ellipse at 30% 20%, rgba(201,162,39,.16), transparent 55%), linear-gradient(160deg, #fbf8f3, #efe8dc)";

/** Shared design of the Swimming, Restaurant and Bars pages. */
export function VenuePage({ slug }: { slug: Venue["slug"] }) {
  const venue = getVenue(slug);
  const photos = available(venue);
  const [cover, ...more] = photos;
  const others = VENUES.filter((v) => v.slug !== slug);

  return (
    <>
      {/* Hero: a large photo full width; a small photo beside the title on sand; or sand alone. */}
      {cover && !cover.small ? (
        <section className="relative flex min-h-[460px] items-end overflow-hidden bg-ink text-white sm:min-h-[600px]">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            preload
            sizes="100vw"
            className="object-cover"
            style={cover.focus ? { objectPosition: cover.focus } : undefined}
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="container-page relative pb-14 pt-24 sm:pb-20">
            <p className="eyebrow text-white">{venue.eyebrow}</p>
            <h1 className="display mt-4 text-5xl leading-[1.05] sm:text-7xl">{venue.title}</h1>
            <p className="accent-italic mt-5 max-w-xl text-sm leading-loose text-white/90 sm:text-base">{venue.lead}</p>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden" style={{ backgroundImage: PANEL }}>
          <span
            aria-hidden="true"
            className="display pointer-events-none absolute right-[-0.08em] top-1/2 -translate-y-1/2 select-none text-[16rem] leading-none text-brand/[0.07] sm:text-[26rem]"
          >
            {venue.label.charAt(0)}
          </span>
          <div
            className={`container-page relative grid items-center gap-10 py-16 sm:py-20 ${
              cover ? "min-h-[460px] md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:min-h-[560px]" : "min-h-[460px] sm:min-h-[600px]"
            }`}
          >
            <div className={cover ? "" : "self-end"}>
              <p className="eyebrow">{venue.eyebrow}</p>
              <h1 className="display mt-4 text-5xl leading-[1.05] sm:text-7xl">{venue.title}</h1>
              <p className="accent-italic mt-5 max-w-xl text-sm leading-loose text-muted sm:text-base">{venue.lead}</p>
            </div>
            {cover && (
              <div className="relative mx-auto aspect-[4/5] w-full max-w-[400px] overflow-hidden bg-ink shadow-[0_30px_60px_-30px_rgba(60,40,20,.45)]">
                <Image src={cover.src} alt={cover.alt} fill preload sizes="400px" className="object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Intro + at a glance */}
      <section className="container-page grid gap-12 py-20 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
        <div className="space-y-6">
          <p className="eyebrow">Royal Kamak Hotel</p>
          <div className="h-px w-16 bg-accent/60" />
          {venue.intro.map((p, i) => (
            <p key={i} className={i === 0 ? "display text-2xl leading-snug sm:text-3xl" : "leading-relaxed text-muted"}>
              {p}
            </p>
          ))}
        </div>
        <aside className="h-fit border border-line bg-ink/60 p-8">
          <p className="eyebrow">At a glance</p>
          <dl className="mt-6 divide-y divide-line">
            {venue.details.map((d) => (
              <div key={d.label} className="flex items-baseline justify-between gap-6 py-3.5 text-sm">
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{d.label}</dt>
                <dd className={`text-right ${d.value ? "" : "accent-italic text-muted"}`}>{d.value ?? "Ask at reception"}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </section>

      {/* Highlights */}
      <section className="container-page">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
          {venue.highlights.map((h, i) => (
            <div key={h.title} className="bg-card px-8 py-12 text-center">
              <p className="display text-sm text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="display mt-4 text-2xl">{h.title}</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted">{h.text}</p>
            </div>
          ))}
        </div>
      </section>

      {venue.dishes && venue.dishes.length > 0 && <DishesSection dishes={venue.dishes} />}

      {venue.feature && <FeatureSection feature={venue.feature} />}

      {/* More photos */}
      {more.length > 0 && (
        <section className="container-page mt-20">
          <ul className={`grid gap-4 ${more.some((p) => p.small) ? "grid-cols-2 lg:grid-cols-3" : more.length === 1 ? "" : "sm:grid-cols-2"}`}>
            {more.map((p) => (
              <li key={p.src} className={`relative overflow-hidden bg-ink ${p.small ? "aspect-[3/4]" : "aspect-[4/3]"}`}>
                <Image src={p.src} alt={p.alt} fill sizes={p.small ? "(min-width: 1024px) 33vw, 50vw" : "(min-width: 640px) 50vw, 100vw"} className="object-cover" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Stay with us */}
      <section className="container-page mt-24">
        <div className="bg-ink px-6 py-16 text-center sm:px-16">
          <p className="eyebrow">Stay with us</p>
          <h2 className="display mx-auto mt-4 max-w-2xl text-3xl sm:text-5xl">Make it part of your stay</h2>
          <p className="accent-italic mx-auto mt-5 max-w-lg text-sm leading-loose text-muted">
            Check live availability and reserve your room in minutes. No account needed.
          </p>
          <Link href="/rooms" className="btn mt-8">
            Book a room
          </Link>
        </div>
      </section>

      {/* Discover more */}
      <section className="container-page mt-24">
        <p className="eyebrow text-center">Discover more</p>
        <ul className="mt-8 grid gap-8 sm:grid-cols-3">
          {[...others.map((v) => ({ href: `/${v.slug}`, label: v.title, eyebrow: v.eyebrow, photo: available(v)[0] })),
            { href: "/rooms", label: "Rooms & suites", eyebrow: "Stay", photo: ROOMS_PHOTO }].map((card, i) => (
            <li key={card.href}>
              <Link href={card.href} className="group block">
                <div
                  className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
                  style={card.photo ? undefined : { backgroundImage: i % 2 ? "linear-gradient(160deg, #f7f3ec, #e6ddd0)" : PANEL }}
                >
                  {card.photo ? (
                    <Image
                      src={card.photo.src}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <span className="display select-none text-[6rem] leading-none text-brand/15 transition duration-700 group-hover:scale-110">
                      {card.label.replace(/^The /, "").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="eyebrow mt-5">{card.eyebrow}</p>
                <p className="display mt-2 text-2xl transition group-hover:text-brand">{card.label}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

/** Extra section of a venue (e.g. swimming lessons): text and points beside a details card. */
function FeatureSection({ feature }: { feature: NonNullable<Venue["feature"]> }) {
  return (
    <section id={feature.eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="mt-24 scroll-mt-24 bg-ink py-20">
      <div className="container-page grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="eyebrow">{feature.eyebrow}</p>
          <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">{feature.title}</h2>
          <div className="mt-6 h-px w-16 bg-accent/60" />
          <div className="mt-6 space-y-4">
            {feature.text.map((p, i) => (
              <p key={i} className={i === 0 ? "accent-italic leading-loose" : "leading-relaxed text-muted"}>
                {p}
              </p>
            ))}
          </div>
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {feature.points.map((point, i) => (
              <li key={point.title} className="border-t border-accent/40 pt-5">
                <p className="display text-sm text-accent">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="display mt-2 text-xl">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{point.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <aside className="h-fit border border-line bg-card p-8">
          <p className="eyebrow">Lesson details</p>
          <dl className="mt-6 divide-y divide-line">
            {feature.details.map((d) => (
              <div key={d.label} className="flex items-baseline justify-between gap-6 py-3.5 text-sm">
                <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{d.label}</dt>
                <dd className={`text-right ${d.value ? "" : "accent-italic text-muted"}`}>{d.value ?? "Ask at reception"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 border-t border-line pt-6 text-sm leading-relaxed">{feature.action}</p>
        </aside>
      </div>
    </section>
  );
}

/** Photo grid of dishes, with the photo credits their licences require. */
function DishesSection({ dishes }: { dishes: Dish[] }) {
  const featured = dishes.filter((d) => d.featured);
  const grid = dishes.filter((d) => !d.featured);
  return (
    <section className="container-page mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">A taste of Ghana</p>
        <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">Ghanaian favourites</h2>
        <div className="mx-auto mt-6 h-px w-16 bg-accent/60" />
        <p className="accent-italic mt-6 leading-loose text-muted">
          Hearty, generous plates from across Ghana. Ask our team for today&apos;s menu.
        </p>
      </div>
      {featured.map((dish) => (
        <div key={dish.name} className="mt-12 grid items-center gap-8 border border-line bg-ink/40 p-5 sm:p-8 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-12">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[320px] overflow-hidden bg-ink">
            <Image src={dish.src} alt={dish.name} fill sizes="320px" className="object-cover" />
          </div>
          <div>
            <p className="eyebrow">From our kitchen</p>
            <h3 className="display mt-3 text-3xl sm:text-4xl">{dish.name}</h3>
            <p className="accent-italic mt-4 leading-loose text-muted">{dish.text}</p>
          </div>
        </div>
      ))}
      <ul className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {grid.map((dish) => (
          <li key={dish.name} className="group">
            <div className="relative aspect-[4/3] overflow-hidden bg-ink">
              <Image
                src={dish.src}
                alt={dish.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <h3 className="display mt-5 text-2xl">{dish.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{dish.text}</p>
            {dish.credit && (
              <p className="mt-2 text-[10px] text-muted/80">
                Photo:{" "}
                <a href={dish.credit.source} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                  {dish.credit.author}
                </a>
                ,{" "}
                <a href={dish.credit.licenseUrl} target="_blank" rel="noreferrer license" className="underline-offset-2 hover:underline">
                  {dish.credit.license}
                </a>
                , via Wikimedia Commons
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
