"use client";

import { useSyncExternalStore, type ReactNode } from "react";

/*
 * Shared range-calendar pieces (search modal + room availability page).
 * Dates are yyyy-MM-dd strings computed in UTC, so the calendar never shifts
 * a day because of the visitor's timezone.
 */

export type Month = { y: number; m: number }; // m is 0-based

export const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function toUtc(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function toIso(date: Date) {
  return date.toISOString().slice(0, 10);
}
export function addDays(iso: string, n: number) {
  const d = toUtc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
}
export function nightsBetween(a: string, b: string) {
  return Math.round((toUtc(b).getTime() - toUtc(a).getTime()) / 86_400_000);
}
export function monthOf(iso: string): Month {
  const d = toUtc(iso);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
}
export function shiftMonth({ y, m }: Month, n: number): Month {
  const d = new Date(Date.UTC(y, m + n, 1));
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
}
export function monthIndex({ y, m }: Month) {
  return y * 12 + m;
}
export function fmt(iso: string, options: Intl.DateTimeFormatOptions) {
  return toUtc(iso).toLocaleDateString("en-GB", { ...options, timeZone: "UTC" });
}

// Two months side by side from the `sm` breakpoint, one month on phones.
export function useTwoUp() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(min-width: 640px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 640px)").matches,
    () => true,
  );
}

export function NavButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center border border-line text-lg leading-none transition hover:border-brand hover:text-brand disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function MonthGrid({
  month,
  min,
  checkIn,
  rangeEnd,
  focusDate,
  onPick,
  onHover,
  isDisabled,
  booked,
}: {
  month: Month;
  min: string;
  /** Extra rule for unselectable days (e.g. a stay can't run across a booked night). */
  isDisabled?: (iso: string) => boolean;
  /** Nights that are already booked: shown crossed out. */
  booked?: Set<string>;
  checkIn: string;
  rangeEnd: string;
  focusDate: string;
  onPick: (iso: string) => void;
  onHover: (iso: string | null) => void;
}) {
  const first = new Date(Date.UTC(month.y, month.m, 1));
  const lead = (first.getUTCDay() + 6) % 7; // Monday-first
  const days = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: days }, (_, i) => toIso(new Date(Date.UTC(month.y, month.m, i + 1)))),
  ];

  return (
    <div>
      <p className="display mb-4 text-center text-xl">{fmt(toIso(first), { month: "long", year: "numeric" })}</p>
      <div className="grid grid-cols-7 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="pb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-muted">
            {w}
          </span>
        ))}
        {cells.map((iso, i) => {
          if (!iso) return <span key={`blank-${i}`} />;
          const isBooked = booked?.has(iso) ?? false;
          const disabled = iso < min || (isDisabled?.(iso) ?? false);
          const isStart = iso === checkIn;
          const isEnd = iso === rangeEnd;
          const inRange = Boolean(checkIn && rangeEnd && iso > checkIn && iso < rangeEnd);
          const today = iso === min;
          return (
            <div
              key={iso}
              className={`py-0.5 ${
                inRange
                  ? "bg-accent-bright/15"
                  : isStart && rangeEnd
                    ? "bg-[linear-gradient(90deg,transparent_50%,color-mix(in_srgb,var(--accent-bright)_15%,transparent)_50%)]"
                    : isEnd && checkIn
                      ? "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--accent-bright)_15%,transparent)_50%,transparent_50%)]"
                      : ""
              }`}
            >
              <button
                type="button"
                data-date={iso}
                tabIndex={iso === focusDate ? 0 : -1}
                disabled={disabled}
                aria-pressed={isStart || isEnd}
                aria-label={`${fmt(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${isBooked ? ", booked" : ""}`}
                title={isBooked ? (disabled ? "Booked" : "Booked night: available as departure day") : undefined}
                onClick={() => onPick(iso)}
                onPointerEnter={() => onHover(iso)}
                className={`mx-auto flex h-10 w-10 items-center justify-center text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-accent-bright focus-visible:ring-offset-1 ${
                  isStart || isEnd
                    ? "bg-brand font-medium text-brand-foreground"
                    : disabled
                      ? isBooked && iso >= min
                        ? "cursor-not-allowed bg-line/50 text-muted/60 line-through decoration-brand/40"
                        : "cursor-not-allowed text-muted/40 line-through decoration-muted/30"
                      : "hover:border hover:border-brand hover:text-brand"
                } ${today && !isStart && !isEnd ? "underline decoration-accent underline-offset-4" : ""}`}
              >
                {Number(iso.slice(8))}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
