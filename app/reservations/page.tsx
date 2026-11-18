import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Notice } from "@/components/notice";
import { ReservationTableSkeleton } from "@/components/skeletons";
import { currency, getCurrentPartner, listReservations } from "@/lib/api";
import { formatDate, formatMoney, statusTone } from "@/lib/format";

export const metadata: Metadata = { title: "My reservations" };

export default function ReservationsPage() {
  return (
    <div className="container-page space-y-8 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="eyebrow">Your account</p>
          <h1 className="display text-4xl sm:text-5xl">My reservations</h1>
        </div>
        <Link href="/" className="btn">
          New reservation
        </Link>
      </div>
      <Suspense fallback={<ReservationTableSkeleton />}>
        <ReservationList />
      </Suspense>
    </div>
  );
}

async function ReservationList() {
  // Guests (not signed in) manage their booking by reference + email instead.
  if (!(await getCurrentPartner())) redirect("/my-booking");

  const res = await listReservations();
  if (!res.ok) return <Notice tone="error">{res.message}</Notice>;
  if (res.reservations.length === 0) {
    return <Notice>You haven&apos;t made any reservations yet.</Notice>;
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Reference</th>
            <th className="px-4 py-3 font-medium">Stay</th>
            <th className="px-4 py-3 font-medium">Rooms</th>
            <th className="px-4 py-3 font-medium">Guest</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {res.reservations.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0 hover:bg-line/30">
              <td className="px-4 py-3 font-mono text-xs">
                <Link href={`/reservations/${r.id}`} className="text-brand hover:underline">
                  {r.reference ?? `#${r.id}`}
                </Link>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {formatDate(r.checkInDate)} → {formatDate(r.checkOutDate)}
              </td>
              <td className="px-4 py-3">{r.noOfRooms ?? "—"}</td>
              <td className="px-4 py-3">{guestName(r.notes)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">{formatMoney(r.totalPrice, currency)}</td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] ${statusTone(r.status)}`}>
                  {r.status ?? "New"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function guestName(notes: string | null) {
  const match = notes?.match(/^Guest: (.+)$/m);
  return match ? match[1] : "—";
}
