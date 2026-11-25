import { roomTypeAbout, roomTypeFacilities, type RoomType } from "@/lib/room-types";

/*
 * Room details set in Kamakz under Hotel > Room Type: bed size, room size,
 * facilities and entitlements. Anything not filled in is simply left out.
 */

/** "King bed · 34 m²", or null when neither is set. */
export function roomSummary(type: Pick<RoomType, "bedSize" | "roomSize">) {
  const parts = [
    type.bedSize ? `${type.bedSize} bed` : null,
    type.roomSize ? `${formatArea(type.roomSize)} m²` : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

const formatArea = (m2: number) => (Number.isInteger(m2) ? String(m2) : m2.toFixed(1));

/**
 * Labelled details for the room type page, one row each, top to bottom:
 * (about,) bed size, facilities, entitlements, room size.
 */
export function RoomFeatures({ type }: { type: RoomType }) {
  const about = roomTypeAbout(type);
  const facilities = roomTypeFacilities(type);

  return (
    <section className="max-w-4xl">
      <h2 className="display text-3xl">Room details</h2>
      <dl className="mt-6 divide-y divide-line border-y border-line">
        {about && (
          <Row label="About this room" icon={<InfoIcon />}>
            <p className="accent-italic leading-loose text-muted">{about}</p>
          </Row>
        )}

        <Row label="Bed size" icon={<BedIcon />}>
          {type.bedSize ? <p className="display text-xl">{type.bedSize}</p> : <NotSet />}
        </Row>

        <Row label="Facilities" icon={<BellIcon />}>
          {facilities.length > 0 ? (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {facilities.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <CheckIcon />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : (
            <NotSet />
          )}
        </Row>

        <Row label="Entitlements" icon={<GiftIcon />}>
          {type.entitlements.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {type.entitlements.map((e) => (
                <li
                  key={e}
                  className="flex items-center gap-2 border border-accent/40 bg-ink/60 px-3 py-2 text-xs font-medium uppercase tracking-[0.14em]"
                >
                  <StarIcon />
                  {e}
                </li>
              ))}
            </ul>
          ) : (
            <NotSet />
          )}
        </Row>

        <Row label="Room size" icon={<AreaIcon />}>
          {type.roomSize ? <p className="display text-xl">{formatArea(type.roomSize)} m²</p> : <NotSet />}
        </Row>
      </dl>
    </section>
  );
}

/** Shown for a detail not filled in on the room type in Kamakz. */
function NotSet() {
  return <p className="accent-italic text-sm text-muted">Ask the hotel</p>;
}

/** Compact labelled list for room cards: bed size, facilities, entitlements, room size (top to bottom). */
export function RoomFeatureList({ type }: { type: RoomType }) {
  const facilities = roomTypeFacilities(type);
  const rows = [
    { label: "Bed size", icon: <BedIcon />, value: type.bedSize },
    { label: "Facilities", icon: <BellIcon />, value: facilities.length ? facilities.join(", ") : null },
    { label: "Entitlements", icon: <GiftIcon />, value: type.entitlements.length ? type.entitlements.join(", ") : null },
    { label: "Room size", icon: <AreaIcon />, value: type.roomSize ? `${formatArea(type.roomSize)} m²` : null },
  ];
  return (
    <dl className="mt-4 divide-y divide-line border-y border-line text-sm">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[136px_minmax(0,1fr)] gap-3 py-2.5">
          <dt className="flex items-center gap-2 pt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-accent">
            <span className="[&>svg]:h-4 [&>svg]:w-4">{row.icon}</span>
            {row.label}
          </dt>
          <dd className={`min-w-0 ${row.value ? "text-foreground" : "accent-italic text-muted"}`}>
            {row.value ?? "Ask the hotel"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/** One labelled row: label (with optional icon) on the left, value on the right; stacked on phones. */
function Row({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 py-5 sm:grid-cols-[200px_minmax(0,1fr)] sm:items-center sm:gap-8">
      <dt className="flex items-center gap-3">
        {icon && <span className="text-accent">{icon}</span>}
        <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-accent">{label}</span>
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

const iconProps = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function BedIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 15h18M3 18v2M21 18v2M6 9V6.5A1.5 1.5 0 0 1 7.5 5h3A1.5 1.5 0 0 1 12 6.5V9M12 9V6.5A1.5 1.5 0 0 1 13.5 5h3A1.5 1.5 0 0 1 18 6.5V9" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M4 4h16v16H4zM4 9h3M4 14h3M9 4v3M14 4v3M10 14l4-4M14 14v-4h-4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M4 17h16M5.5 17a6.5 6.5 0 0 1 13 0M12 10.5V9M10.5 9h3M3 20h18" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <path d="M4 11h16v9H4zM3 7h18v4H3zM12 7v13M12 7c-1.5-3-5-3.5-5-1.5S10 7 12 7zM12 7c1.5-3 5-3.5 5-1.5S14 7 12 7z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg {...iconProps} className="h-6 w-6">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.75v.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...iconProps} className="h-4 w-4 shrink-0 text-accent" strokeWidth={2}>
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg {...iconProps} className="h-3.5 w-3.5 shrink-0 text-accent">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.8L12 16.9l-5.25 2.7 1-5.8L3.5 9.7l5.9-.9z" />
    </svg>
  );
}
