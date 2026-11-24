import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import { getVenue, VENUES, type Venue } from "@/lib/venues";

/** Only photos whose file is actually in /public (missing ones are skipped). */
export const available = (venue: Venue) =>
  venue.photos.filter((p) => existsSync(path.join(process.cwd(), "public", p.src.replace(/^\//, ""))));

const PANEL = "radial-gradient(ellipse at 30% 20%, rgba(201,162,39,.16), transparent 55%), linear-gradient(160deg, #fbf8f3, #efe8dc)";

/** Shared design of the Swimming, Restaurant and Bars pages. */
export function VenuePage({ slug }: { slug: Venue["slug"] }) {
  const venue = getVenue(slug);
  const photos = available(venue);
  const [cover, ...more] = photos;
  const others = VENUES.filter((v) => v.slug !== slug);

  return (
    <>
      {/* Hero: the first photo, or a sand panel until there is one. */}
      <section
        className={`relative flex min-h-[460px] items-end overflow-hidden bg-ink sm:min-h-[600px] ${cover ? "text-white" : ""}`}
        style={cover ? undefined : { backgroundImage: PANEL }}
      >
        {cover ? (
          <Image src={cover.src} alt={cover.alt} fill preload sizes="100vw" className="object-cover" />
        ) : (
          <span
            aria-hidden="true"
            className="display pointer-events-none absolute right-[-0.08em] top-1/2 -translate-y-1/2 select-none text-[16rem] leading-none text-brand/[0.07] sm:text-[26rem]"
          >
            {venue.label.charAt(0)}
          </span>
        )}
        {cover && (
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/45 to-transparent" />
        )}
        <div className="container-page relative pb-14 pt-24 sm:pb-20">
          <p className={`eyebrow ${cover ? "text-white" : ""}`}>{venue.eyebrow}</p>
          <h1 className="display mt-4 text-5xl leading-[1.05] sm:text-7xl">{venue.title}</h1>
          <p className={`accent-italic mt-5 max-w-xl text-sm leading-loose sm:text-base ${cover ? "text-white/90" : "text-muted"}`}>
            {venue.lead}
          </p>
        </div>
      </section>

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

      {venue.feature && <FeatureSection feature={venue.feature} />}

      {/* More photos */}
      {more.length > 0 && (
        <section className="container-page mt-20">
          <ul className={`grid gap-4 ${more.length === 1 ? "" : "sm:grid-cols-2"}`}>
            {more.map((p) => (
              <li key={p.src} className="relative aspect-[4/3] overflow-hidden bg-ink">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
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
            { href: "/rooms", label: "Rooms & suites", eyebrow: "Stay", photo: undefined }].map((card, i) => (
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
