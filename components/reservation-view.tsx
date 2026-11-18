import { currency } from "@/lib/api";
import { formatDate, formatMoney, statusTone } from "@/lib/format";
import type { Reservation } from "@/lib/types";

/** Reservation details shared by the partner and guest pages. */
export function ReservationView({ reservation: r }: { reservation: Reservation }) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Reservation</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl">{r.reference ?? `#${r.id}`}</h1>
        </div>
        <span className={`px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] ${statusTone(r.status)}`}>{r.status ?? "New"}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Fact label="Check-in" value={formatDate(r.checkInDate)} />
        <Fact label="Check-out" value={formatDate(r.checkOutDate)} />
        <Fact
          label="Guests"
          value={`${r.noOfGuest ?? 0} adult${r.noOfGuest === 1 ? "" : "s"}${
            r.noOfChildren ? `, ${r.noOfChildren} child${r.noOfChildren === 1 ? "" : "ren"}` : ""
          }`}
        />
        <Fact label="Payment" value={`${r.paymentStatus ?? "Pending"} · ${r.paymentMethod ?? "—"}`} />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Room</th>
              <th className="px-4 py-3 text-right font-medium">Rooms</th>
              <th className="px-4 py-3 text-right font-medium">Price per room</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {(r.rooms ?? []).map((line) => (
              <tr key={line.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{line.roomName ?? "—"}</td>
                <td className="px-4 py-3 text-right">{line.quantity}</td>
                <td className="px-4 py-3 text-right">{formatMoney(line.unitPrice, currency)}</td>
                <td className="px-4 py-3 text-right">{formatMoney(line.total, currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line font-semibold">
              <td className="px-4 py-3" colSpan={3}>
                Total
              </td>
              <td className="px-4 py-3 text-right">{formatMoney(r.totalPrice, currency)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {(r.notes || r.specialRequest) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {r.notes && (
            <div className="card p-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-muted">Guest details</p>
              <p className="text-sm whitespace-pre-line">{r.notes}</p>
            </div>
          )}
          {r.specialRequest && (
            <div className="card p-4">
              <p className="mb-1 text-xs uppercase tracking-wide text-muted">Special requests</p>
              <p className="text-sm whitespace-pre-line">{r.specialRequest}</p>
            </div>
          )}
        </div>
      )}

    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted">{label}</p>
      <p className="display mt-2 text-xl">{value}</p>
    </div>
  );
}
