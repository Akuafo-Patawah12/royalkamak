"use client";

import Form from "next/form";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  MonthGrid,
  NavButton,
  addDays,
  fmt,
  monthIndex,
  monthOf,
  nightsBetween,
  shiftMonth,
  toIso,
  toUtc,
  useTwoUp,
  type Month,
} from "@/components/calendar";

/*
 * Arrival / departure search bar with a custom range calendar.
 * Dates are handled as yyyy-MM-dd strings and computed in UTC so the
 * calendar never shifts a day because of the visitor's timezone.
 */

type Field = "checkIn" | "checkOut";

export function AvailabilitySearch({
  min,
  defaultCheckIn,
  defaultCheckOut,
}: {
  min: string;
  defaultCheckIn: string;
  defaultCheckOut: string;
}) {
  const valid = defaultCheckIn >= min && defaultCheckOut > defaultCheckIn;
  const [checkIn, setCheckIn] = useState(valid ? defaultCheckIn : "");
  const [checkOut, setCheckOut] = useState(valid ? defaultCheckOut : "");
  const [open, setOpen] = useState(false);
  const [field, setField] = useState<Field>("checkIn");
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState<Month>(() => monthOf(valid ? defaultCheckIn : min));
  const [focusDate, setFocusDate] = useState(valid ? defaultCheckIn : min);

  const twoUp = useTwoUp();
  const months = twoUp ? [view, shiftMonth(view, 1)] : [view];
  const dialogRef = useRef<HTMLDialogElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const triggerRefs = { checkIn: useRef<HTMLButtonElement>(null), checkOut: useRef<HTMLButtonElement>(null) };
  const dialogId = useId();
  const moveFocus = useRef(false);

  // Show / hide the native modal <dialog> (top layer, focus trapped, Esc closes)
  // and stop the page behind it from scrolling.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [open]);

  // Move keyboard focus to the active day after opening or arrow-key navigation.
  useEffect(() => {
    if (!open || !moveFocus.current) return;
    moveFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus();
  }, [open, focusDate, view]);

  function openAt(next: Field, focusGrid = false) {
    const target = next === "checkOut" && checkIn ? (checkOut || addDays(checkIn, 1)) : checkIn || min;
    setField(next);
    setFocusDate(target);
    setView((v) => (visible(target, v) ? v : monthOf(target)));
    moveFocus.current = focusGrid;
    setOpen(true);
  }

  function visible(iso: string, v: Month) {
    const idx = monthIndex(monthOf(iso));
    return idx >= monthIndex(v) && idx < monthIndex(v) + (twoUp ? 2 : 1);
  }

  function pick(iso: string) {
    if (field === "checkIn" || !checkIn || iso <= checkIn) {
      setCheckIn(iso);
      if (checkOut && checkOut <= iso) setCheckOut("");
      setField("checkOut");
      setFocusDate(iso);
      return;
    }
    // Both dates chosen: keep the modal open so they can check availability from it.
    setCheckOut(iso);
    setHover(null);
  }

  function onGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    let next: string | null = null;
    if (e.key in steps) next = addDays(focusDate, steps[e.key]);
    else if (e.key === "PageUp" || e.key === "PageDown") {
      const d = toUtc(focusDate);
      d.setUTCMonth(d.getUTCMonth() + (e.key === "PageUp" ? -1 : 1));
      next = toIso(d);
    }
    if (!next) return;
    e.preventDefault();
    if (next < min) next = min;
    const target = next;
    setFocusDate(target);
    setView((v) => {
      if (visible(target, v)) return v;
      const t = monthOf(target);
      return monthIndex(t) < monthIndex(v) ? t : shiftMonth(t, twoUp ? -1 : 0);
    });
    moveFocus.current = true;
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    if (checkIn && checkOut) {
      setOpen(false);
      return;
    }
    e.preventDefault();
    openAt(checkIn ? "checkOut" : "checkIn", true);
  }

  const canGoBack = monthIndex(view) > monthIndex(monthOf(min));
  const rangeEnd = checkOut || (field === "checkOut" && hover && checkIn && hover > checkIn ? hover : "");
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  const dateLabel = (f: Field) => (f === "checkIn" ? "Arrival" : "Departure");

  return (
    <Form
      action="/#rooms"
      onSubmit={onSubmit}
      className="grid gap-px border border-line bg-line shadow-[0_20px_50px_-24px_rgba(60,40,20,.18)] sm:grid-cols-[1fr_1fr_auto]"
    >
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />
      {(["checkIn", "checkOut"] as const).map((f) => (
        <button
          key={f}
          ref={triggerRefs[f]}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={dialogId}
          onClick={() => openAt(f, true)}
          className="flex flex-col items-start justify-center bg-card px-5 py-3 text-left transition hover:bg-ink"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted">{dateLabel(f)}</span>
          <DateValue iso={f === "checkIn" ? checkIn : checkOut} />
        </button>
      ))}
      <button type="submit" className="btn h-full min-h-14 border-0 px-10">
        Check availability
      </button>

      {/* Inside the form, so its submit button runs the search. */}
      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={`${dialogId}-title`}
        onClose={() => setOpen(false)}
        // A click on the dialog element itself (not its content) is a click on the backdrop.
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-card p-0 text-foreground shadow-[0_30px_80px_-30px_rgba(60,40,20,.35)] transition-[opacity,translate] duration-200 backdrop:bg-[#f5f1ea]/75 backdrop:backdrop-blur-sm starting:open:translate-y-3 starting:open:opacity-0 sm:m-auto sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[calc(100%-2rem)] sm:max-w-[760px] sm:border sm:border-line"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-8 sm:py-6">
            <div>
              <p className="eyebrow">Book your stay</p>
              <h2 id={`${dialogId}-title`} className="display mt-2 text-3xl">
                Select your dates
              </h2>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center border border-line text-xl leading-none transition hover:border-brand hover:text-brand"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
            <div className="grid grid-cols-2 gap-px border border-line bg-line">
              {(["checkIn", "checkOut"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  disabled={f === "checkOut" && !checkIn}
                  onClick={() => openAt(f, true)}
                  className={`flex flex-col items-start bg-card px-4 py-3 text-left transition disabled:cursor-not-allowed ${
                    field === f ? "shadow-[inset_0_-2px_0_var(--brand)]" : "hover:bg-ink"
                  }`}
                >
                  <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted">{dateLabel(f)}</span>
                  <DateValue iso={f === "checkIn" ? checkIn : checkOut} />
                </button>
              ))}
            </div>

            <div className="mb-4 mt-6 flex items-center justify-between">
              <p className="eyebrow">{field === "checkIn" ? "Select arrival" : "Select departure"}</p>
              <div className="flex gap-1">
                <NavButton label="Previous month" disabled={!canGoBack} onClick={() => setView((v) => shiftMonth(v, -1))}>
                  ‹
                </NavButton>
                <NavButton label="Next month" onClick={() => setView((v) => shiftMonth(v, 1))}>
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
                  min={min}
                  checkIn={checkIn}
                  rangeEnd={rangeEnd}
                  focusDate={focusDate}
                  onPick={pick}
                  onHover={setHover}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-4 sm:px-8">
            <p className="text-sm text-muted">
              {nights > 0 ? (
                <>
                  <span className="text-foreground">
                    {fmt(checkIn, { day: "numeric", month: "short" })} — {fmt(checkOut, { day: "numeric", month: "short" })}
                  </span>
                  {" · "}
                  {nights} night{nights === 1 ? "" : "s"}
                </>
              ) : checkIn ? (
                "Now choose your departure date"
              ) : (
                "Choose your arrival date"
              )}
            </p>
            <div className="flex w-full items-center justify-end gap-5 sm:w-auto">
              {(checkIn || checkOut) && (
                <button
                  type="button"
                  className="link-arrow text-muted"
                  onClick={() => {
                    setCheckIn("");
                    setCheckOut("");
                    setField("checkIn");
                    setFocusDate(min);
                  }}
                >
                  Clear
                </button>
              )}
              <button type="submit" disabled={nights === 0} className="btn flex-1 px-6 sm:flex-none">
                Check availability
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </Form>
  );
}

function DateValue({ iso }: { iso: string }) {
  return iso ? (
    <span className="mt-1 flex items-baseline gap-2">
      <span className="display text-2xl leading-none">{fmt(iso, { day: "numeric" })}</span>
      <span className="text-sm">
        {fmt(iso, { month: "short", year: "numeric" })}
        <span className="ml-1.5 text-muted">{fmt(iso, { weekday: "short" })}</span>
      </span>
    </span>
  ) : (
    <span className="mt-1 text-base text-muted">Select date</span>
  );
}

