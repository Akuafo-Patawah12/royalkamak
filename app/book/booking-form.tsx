"use client";

import { useActionState, useState } from "react";
import { createReservationAction } from "@/app/actions";
import { Notice } from "@/components/notice";
import { formatMoney } from "@/lib/format";
import type { Room } from "@/lib/types";

export function BookingForm({
  rooms,
  checkIn,
  checkOut,
  preselectedRoomId,
  currency,
  partnerName,
  signInHref,
}: {
  rooms: Room[];
  checkIn: string;
  checkOut: string;
  preselectedRoomId: number | null;
  currency: string;
  /** Null when booking as a guest (not signed in). */
  partnerName: string | null;
  signInHref: string;
}) {
  const isGuest = partnerName === null;
  const [state, action, pending] = useActionState(createReservationAction, undefined);
  // Refill text fields after an error (React clears the form when an action finishes).
  const v = (name: string) => state?.fields?.[name];
  const [quantities, setQuantities] = useState<Record<number, number>>(() =>
    Object.fromEntries(
      rooms.map((r) => [r.id, r.id === preselectedRoomId || (preselectedRoomId === null && rooms.length === 1) ? 1 : 0]),
    ),
  );

  const selectedRooms = rooms.reduce((n, r) => n + (quantities[r.id] ?? 0), 0);
  const total = rooms.reduce((sum, r) => sum + (quantities[r.id] ?? 0) * (r.stayPrice ?? 0), 0);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <input type="hidden" name="checkIn" value={checkIn} />
      <input type="hidden" name="checkOut" value={checkOut} />

      <div className="space-y-6">
        <fieldset className="card space-y-4 p-6">
          <legend className="eyebrow px-2">Rooms</legend>
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="display text-xl">{room.name}</p>
                <p className="text-xs text-muted">
                  {formatMoney(room.pricePerNight, currency)} / night
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-muted">Rooms</span>
                <select
                  name={`qty_${room.id}`}
                  value={quantities[room.id] ?? 0}
                  onChange={(e) => setQuantities((q) => ({ ...q, [room.id]: Number(e.target.value) }))}
                  className="input w-20"
                >
                  {Array.from({ length: Math.min(room.available ?? 0, 20) + 1 }, (_, n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}
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
            <dd>{rooms[0]?.nights ?? "—"}</dd>
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
          <select id="paymentMethod" name="paymentMethod" defaultValue={v("paymentMethod") ?? "Pay at hotel"} className="input">
            <option>Pay at hotel</option>
            <option>Mobile Money</option>
            <option>Bank Transfer</option>
            <option>Card</option>
            {!isGuest && <option>Invoice to partner</option>}
          </select>
        </div>
        {state?.error && <Notice tone="error">{state.error}</Notice>}
        <button type="submit" disabled={pending || selectedRooms === 0} className="btn w-full">
          {pending ? "Reserving…" : "Confirm reservation"}
        </button>
        {isGuest ? (
          <div className="space-y-2 text-xs text-muted">
            <p>No account needed. You&apos;ll get a booking reference to manage your stay. The hotel confirms the reservation; payment is pending until then.</p>
            <p>
              Royal Kamak partner?{" "}
              <a href={signInHref} className="text-brand underline-offset-4 hover:underline">
                Sign in to book on your account
              </a>
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted">
            Booking as {partnerName}. The hotel confirms the reservation; payment is pending until then.
          </p>
        )}
      </aside>
    </form>
  );
}
