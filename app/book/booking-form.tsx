"use client";

import { useActionState, useState } from "react";
import { createReservationAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { formatMoney } from "@/lib/format";
import type { RoomType } from "@/lib/room-types";
import { PAY_ONLINE } from "@/lib/types";

export function BookingForm({
  types,
  nights,
  checkIn,
  checkOut,
  preselectedType,
  currency,
  payOnline,
  partnerName,
  signInHref,
}: {
  /** Every room type; those with available 0 are shown as fully booked. */
  types: RoomType[];
  nights: number;
  checkIn: string;
  checkOut: string;
  preselectedType: string;
  currency: string;
  /** Paystack is switched on in Kamakz. */
  payOnline: boolean;
  /** Null when booking as a guest (not signed in). */
  partnerName: string | null;
  signInHref: string;
}) {
  const isGuest = partnerName === null;
  const [state, action, pending] = useActionState(createReservationAction, undefined);
  // Refill text fields after an error (React clears the form when an action finishes).
  const v = (name: string) => state?.fields?.[name];
  const [method, setMethod] = useState(() => v("paymentMethod") ?? (payOnline ? PAY_ONLINE : "Pay at hotel"));
  const paying = method === PAY_ONLINE;
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      types.map((t) => {
        const open = (t.available ?? 0) > 0;
        const onlyOpen = types.filter((x) => (x.available ?? 0) > 0).length === 1;
        return [t.slug, open && (t.slug === preselectedType || (!preselectedType && onlyOpen)) ? 1 : 0];
      }),
    ),
  );

  // The cheapest free rooms of each type are assigned, so the total adds up their stay prices.
  const freeRooms = (t: RoomType) => t.rooms.filter((r) => (r.available ?? 0) > 0);
  const selectedRooms = types.reduce((n, t) => n + (quantities[t.slug] ?? 0), 0);
  const total = types.reduce(
    (sum, t) =>
      sum + freeRooms(t).slice(0, quantities[t.slug] ?? 0).reduce((s, r) => s + (r.stayPrice ?? 0), 0),
    0,
  );

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />

      <div className="space-y-6">
        <fieldset className="card space-y-4 p-6">
          <legend className="eyebrow px-2">Rooms</legend>
          {types.map((type) => {
            const free = type.available ?? 0;
            if (type.rooms.length === 0) {
              // A Kamakz room type with no bookable rooms yet.
              return (
                <div
                  key={type.slug}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 text-muted last:border-0 last:pb-0"
                >
                  <div>
                    <p className="display text-xl">{type.name}</p>
                    <p className="text-xs">
                      From {formatMoney(type.fromPrice, currency)} / night · Not bookable online yet. Please contact the hotel.
                    </p>
                  </div>
                </div>
              );
            }
            if (free === 0) {
              // Shown so guests see every room type; nothing to select for these dates.
              return (
                <div
                  key={type.slug}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 text-muted last:border-0 last:pb-0"
                >
                  <div>
                    <p className="display text-xl">{type.name}</p>
                    <p className="text-xs">
                      From {formatMoney(type.fromPrice, currency)} / night · Fully booked for these dates
                    </p>
                  </div>
                  <a href={`/rooms/${type.slug}`} className="link-arrow">
                    See free dates <span aria-hidden>→</span>
                  </a>
                </div>
              );
            }
            return (
              <div
                key={type.slug}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="display text-xl">{type.name}</p>
                  <p className="text-xs text-muted">
                    From {formatMoney(freeRooms(type)[0]?.pricePerNight ?? type.fromPrice, currency)} / night
                    {" · "}
                    {free} free
                  </p>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span className="text-muted">Rooms</span>
                  <select
                    name={`qty_${type.slug}`}
                    value={quantities[type.slug] ?? 0}
                    onChange={(e) => setQuantities((q) => ({ ...q, [type.slug]: Number(e.target.value) }))}
                    className="input w-20"
                  >
                    {Array.from({ length: Math.min(free, 20) + 1 }, (_, n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            );
          })}
        </fieldset>

        <fieldset className="card grid gap-5 p-6 sm:grid-cols-2">
          <legend className="eyebrow px-2">{isGuest ? "Your details" : "Lead guest"}</legend>
          {/* Honeypot: hidden from people, filled in by simple bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="guestName" className="label">
              Full name
            </label>
            <input id="guestName" name="guestName" required maxLength={120} defaultValue={v("guestName")} autoComplete={isGuest ? "name" : "off"} className="input" />
          </div>
          <div>
            <label htmlFor="guestPhone" className="label">
              Phone{!isGuest && <span className="font-normal normal-case tracking-normal"> (optional)</span>}
            </label>
            <input
              id="guestPhone"
              name="guestPhone"
              defaultValue={v("guestPhone")}
              type="tel"
              required={isGuest}
              maxLength={40}
              autoComplete={isGuest ? "tel" : "off"}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="guestEmail" className="label">
              Email{!isGuest && <span className="font-normal normal-case tracking-normal"> (optional)</span>}
            </label>
            <input
              id="guestEmail"
              name="guestEmail"
              defaultValue={v("guestEmail")}
              type="email"
              required={isGuest}
              maxLength={120}
              autoComplete={isGuest ? "email" : "off"}
              className="input"
            />
          </div>
          <div>
            <label htmlFor="adults" className="label">
              Adults
            </label>
            <input id="adults" name="adults" type="number" min={1} max={99} defaultValue={v("adults") ?? 2} required className="input" />
          </div>
          <div>
            <label htmlFor="children" className="label">
              Children
            </label>
            <input id="children" name="children" type="number" min={0} max={99} defaultValue={v("children") ?? 0} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="specialRequest" className="label">
              Special requests <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="specialRequest"
              name="specialRequest"
              rows={3}
              maxLength={255}
              defaultValue={v("specialRequest")}
              className="input"
            />
          </div>
        </fieldset>
      </div>

      <aside className="card h-fit space-y-5 p-6 lg:sticky lg:top-24">
        <h2 className="display text-2xl">Summary</h2>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Rooms</dt>
            <dd>{selectedRooms}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Nights</dt>
            <dd>{nights || "—"}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatMoney(total, currency)}</dd>
          </div>
        </dl>
        <div>
          <label htmlFor="paymentMethod" className="label">
            Payment method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="input"
          >
            {payOnline && <option value={PAY_ONLINE}>Pay now: card or Mobile Money (Paystack)</option>}
            <option>Pay at hotel</option>
            {/* With Paystack on, card and Mobile Money are paid online above. */}
            {!payOnline && <option>Mobile Money</option>}
            <option>Bank Transfer</option>
            {!payOnline && <option>Card</option>}
            {!isGuest && <option>Invoice to partner</option>}
          </select>
        </div>
        {state?.error && <Notice tone="error">{state.error}</Notice>}
        <button type="submit" disabled={pending || selectedRooms === 0} className="btn w-full">
          {pending ? (paying ? "Opening secure payment…" : "Reserving…") : paying ? "Continue to payment" : "Confirm reservation"}
        </button>
        {isGuest ? (
          <div className="space-y-2 text-xs text-muted">
            <p>
              No account needed. You&apos;ll get a booking reference to manage your stay.{" "}
              {paying
                ? "Next, you'll pay securely on Paystack; your booking is confirmed as soon as the payment goes through."
                : "The hotel confirms the reservation; payment is pending until then."}
            </p>
            <p>
              Royal Kamak partner?{" "}
              <a href={signInHref} className="text-brand underline-offset-4 hover:underline">
                Sign in to book on your account
              </a>
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Booking as {partnerName}.{" "}
            {paying
              ? "Next, you'll pay securely on Paystack; the booking is confirmed as soon as the payment goes through."
              : "The hotel confirms the reservation; payment is pending until then."}
          </p>
        )}
      </aside>
    </form>
  );
}
