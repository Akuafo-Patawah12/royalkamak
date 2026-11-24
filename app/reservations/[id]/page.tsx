import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Notice } from "@/components/notice";
import { cancelReservationAction, payReservationAction } from "@/app/actions";
import { CancelButton } from "@/components/cancel-button";
import { PayButton } from "@/components/pay-button";
import { ReservationView } from "@/components/reservation-view";
import { ReservationDetailSkeleton } from "@/components/skeletons";
import { currency, getCurrentPartner, getReservation } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Reservation" };

export default function ReservationPage(props: PageProps<"/reservations/[id]">) {
  return (
    <div className="container-page space-y-8 py-14">
      <Link href="/reservations" className="link-arrow text-muted">
        ← All reservations
      </Link>
      <Suspense fallback={<ReservationDetailSkeleton />}>
        <ReservationDetail params={props.params} searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function ReservationDetail({
  params,
  searchParams,
}: Pick<PageProps<"/reservations/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const { created, paid, payment } = await searchParams;
  if (!/^\d+$/.test(id)) notFound();
  if (!(await getCurrentPartner())) redirect(`/login?next=/reservations/${id}`);

  const res = await getReservation(id);
  if (!res.ok) {
    if (res.httpStatus === 404) notFound();
    return <Notice tone="error">{res.message}</Notice>;
  }
  const r = res.reservation;

  return (
    <div className="space-y-6">
      {paid === "1" && (
        <Notice tone="success">
          Thank you, your payment has been received and your booking is confirmed.
        </Notice>
      )}
      {payment === "error" && (
        <Notice tone="error">
          Your booking is saved, but we couldn&apos;t open the payment page. Use the Pay button below to try again,
          or pay at the hotel.
        </Notice>
      )}
      {created === "1" && !paid && (
        <Notice tone="success">
          Reservation received. Your reference is <strong className="font-mono">{r.reference}</strong>. The hotel
          will confirm it shortly.
        </Notice>
      )}

      <ReservationView reservation={r} />

      {r.payable && <PayButton pay={payReservationAction} id={r.id} amount={formatMoney(r.totalPrice, currency)} />}

      {r.cancellable && <CancelButton cancel={cancelReservationAction} id={r.id} />}
    </div>
  );
}
