"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  MonthGrid,
  NavButton,
  addDays,
  fmt,
  monthIndex,
  monthOf,
  nightsBetween,
  shiftMonth,
  useTwoUp,
  type Month,
} from "@/components/calendar";
import { formatMoney } from "@/lib/format";

type Field = "checkIn" | "checkOut";

type TypeRoom = { id: number; pricePerNight: number; bookedDates: string[] };

/**
 * Inline availability calendar for a room type. A night is crossed out only
 * when every room of the type is booked. A stay must fit in one room (guests
 * don't change rooms mid-stay), and it may end (depart) on a booked night.
 */
export function RoomAvailability({
  typeSlug,
  currency,
  rooms,
  from,
  to,
  defaultCheckIn,
  defaultCheckOut,
}: {
  typeSlug: string;
  currency: string;
  /** The type's rooms, cheapest first, with each room's booked nights. */
  rooms: TypeRoom[];
  /** First selectable day (today). */
  from: string;
  /** End of the known calendar (exclusive): no stay can go past it. */
  to: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
}) {
  const roomBooked = useMemo(
    () => rooms.map((r) => ({ ...r, booked: new Set(r.bookedDates), sorted: [...r.bookedDates].sort() })),
    [rooms],
  );
  // Nights with no room of this type left.
  const booked = useMemo(
    () => new Set(roomBooked[0]?.sorted.filter((d) => roomBooked.every((r) => r.booked.has(d))) ?? []),
    [roomBooked],
  );

  /** Rooms free every night of the stay, cheapest first. */
  const freeRooms = (inDate: string, outDate: string) =>
    roomBooked.filter((r) => !r.sorted.some((d) => d >= inDate && d < outDate));

  // Only keep preselected dates if that stay is actually free.
  const validDefault =
    defaultCheckIn >= from &&
    defaultCheckOut > defaultCheckIn &&
    defaultCheckOut <= to &&
    freeRooms(defaultCheckIn, defaultCheckOut).length > 0;

  const [checkIn, setCheckIn] = useState(validDefault ? defaultCheckIn : "");
  const [checkOut, setCheckOut] = useState(validDefault ? defaultCheckOut : "");
  const [field, setField] = useState<Field>(validDefault ? "checkOut" : "checkIn");
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState<Month>(() => monthOf(validDefault ? defaultCheckIn : from));
  const [focusDate, setFocusDate] = useState(validDefault ? defaultCheckIn : from);
  const gridRef = useRef<HTMLDivElement>(null);
  const moveFocus = useRef(false);
  const twoUp = useTwoUp();
  const months = twoUp ? [view, shiftMonth(view, 1)] : [view];

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus();
  }, [focusDate, view]);

  // Latest possible departure: the furthest any room free on arrival night stays free.
  const lastDeparture = useMemo(() => {
    if (!checkIn) return to;
    let latest = checkIn;
    for (const r of roomBooked) {
      if (r.booked.has(checkIn)) continue;
      const next = r.sorted.find((d) => d > checkIn);
      const end = next && next < to ? next : to;
      if (end > latest) latest = end;
    }
    return latest;
  }, [checkIn, roomBooked, to]);

  function isDisabled(iso: string) {
    if (iso > to) return true;
    if (field === "checkOut" && checkIn && iso > checkIn) return iso > lastDeparture;
    // Arrival (or restarting the stay): that night must be free and inside the calendar.
    return booked.has(iso) || iso >= to;
  }

  function pick(iso: string) {
    if (field === "checkIn" || !checkIn || iso <= checkIn) {
      setCheckIn(iso);
      setCheckOut("");
      setField("checkOut");
      setFocusDate(iso);
      return;
    }
    setCheckOut(iso);
    setHover(null);
    setField("checkIn");
  }

  function visible(iso: string, v: Month) {
    const idx = monthIndex(monthOf(iso));
    return idx >= monthIndex(v) && idx < monthIndex(v) + (twoUp ? 2 : 1);
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (!(e.key in steps)) return;
    e.preventDefault();
    let next = addDays(focusDate, steps[e.key]);
    if (next < from) next = from;
    if (next > to) next = to;
    setFocusDate(next);
    setView((v) => {
      if (visible(next, v)) return v;
      const t = monthOf(next);
      return monthIndex(t) < monthIndex(v) ? t : shiftMonth(t, twoUp ? -1 : 0);
    });
    moveFocus.current = true;
  }

  const lastMonth = monthOf(addDays(to, -1));
  const canGoBack = monthIndex(view) > monthIndex(monthOf(from));
  const canGoForward = monthIndex(view) + (twoUp ? 1 : 0) < monthIndex(lastMonth);
  const rangeEnd =
    checkOut ||
    (field === "checkOut" && hover && checkIn && hover > checkIn && hover <= lastDeparture ? hover : "");
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const bookHref = `/book?${new URLSearchParams({ type: typeSlug, checkIn, checkOut })}`;
  const stayRooms = nights > 0 ? freeRooms(checkIn, checkOut) : [];

  return (
    <div className="card p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Availability</p>
          <p className="mt-2 text-sm text-muted">
            {checkIn && checkOut
              ? "Your stay is selected. Pick another arrival date to change it."
              : field === "checkIn" || !checkIn
                ? "Choose your arrival date"
                : "Now choose your departure date"}
          </p>
        </div>
        <div className="flex gap-1">
          <NavButton label="Previous month" disabled={!canGoBack} onClick={() => setView((v) => shiftMonth(v, -1))}>
            ‹
          </NavButton>
          <NavButton label="Next month" disabled={!canGoForward} onClick={() => setView((v) => shiftMonth(v, 1))}>
            ›
          </NavButton>
        </div>
      </div>

      <div
        ref={gridRef}
        onKeyDown={onGridKeyDown}
        onPointerLeave={() => setHover(null)}
        className="grid gap-8 sm:grid-cols-2"
      >
        {months.map((month) => (
          <MonthGrid
            key={monthIndex(month)}
            month={month}
            min={from}
            checkIn={checkIn}
            rangeEnd={rangeEnd}
            focusDate={focusDate}
            onPick={pick}
            onHover={setHover}
            isDisabled={isDisabled}
            booked={booked}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
        <Legend swatch="border border-line bg-card" label="Available" />
        <Legend swatch="bg-line/50 line-through" label="Fully booked" />
        <Legend swatch="bg-brand" label="Your stay" />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
        {nights > 0 ? (
          <div>
            <p className="text-sm">
              {fmt(checkIn, { weekday: "short", day: "numeric", month: "short" })} —{" "}
              {fmt(checkOut, { weekday: "short", day: "numeric", month: "short" })}
              <span className="text-muted">
                {" "}
                · {nights} night{nights === 1 ? "" : "s"}
              </span>
            </p>
            <p className="display mt-1 text-2xl">
              {stayRooms.length > 1 && <span className="text-base text-muted">From </span>}
              {formatMoney((stayRooms[0]?.pricePerNight ?? 0) * nights, currency)}
            </p>
            <p className="mt-1 text-xs text-muted">
              {stayRooms.length} room{stayRooms.length === 1 ? "" : "s"} free for these dates
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">
            {booked.size === 0
              ? `Free every night until ${fmt(addDays(to, -1), { day: "numeric", month: "short", year: "numeric" })}.`
              : "Crossed-out nights are fully booked."}
          </p>
        )}
        <div className="flex w-full items-center justify-end gap-5 sm:w-auto">
          {checkIn && (
            <button
              type="button"
              className="link-arrow text-muted"
              onClick={() => {
                setCheckIn("");
                setCheckOut("");
                setField("checkIn");
              }}
            >
              Clear
            </button>
          )}
          {nights > 0 ? (
            <Link href={bookHref} className="btn flex-1 sm:flex-none">
              Reserve
            </Link>
          ) : (
            <span aria-disabled="true" className="btn flex-1 cursor-not-allowed opacity-50 sm:flex-none">
              Reserve
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span aria-hidden="true" className={`h-3.5 w-3.5 ${swatch}`} />
      {label}
    </span>
  );
}
