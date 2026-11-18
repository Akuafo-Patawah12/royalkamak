import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cancelGuestReservationAction, forgetGuestBookingAction } from "@/app/actions";
import { CancelButton } from "@/components/cancel-button";
import { Notice } from "@/components/notice";
import { ReservationView } from "@/components/reservation-view";
import { FormCardSkeleton, TitleSkeleton } from "@/components/skeletons";
import { getGuestBookingKey, lookupGuestReservation } from "@/lib/api";
import { FindBookingForm } from "./find-booking-form";

export const metadata: Metadata = { title: "My booking" };

export default function MyBookingPage(props: PageProps<"/my-booking">) {
  return (
    <div className="container-page space-y-8 py-14">
      <Suspense
        fallback={
          <div className="mx-auto max-w-md space-y-8">
            <TitleSkeleton center />
            <FormCardSkeleton />
          </div>
        }
      >
        <GuestBooking searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function GuestBooking({ searchParams }: { searchParams: PageProps<"/my-booking">["searchParams"] }) {
  const { created } = await searchParams;
  const key = await getGuestBookingKey();
  const res = key ? await lookupGuestReservation(key) : null;

  if (!res?.ok) {
    return (
      <div className="mx-auto max-w-md space-y-8">
        <div className="space-y-3 text-center">
          <p className="eyebrow">Manage booking</p>
          <h1 className="display text-4xl sm:text-5xl">Find your booking</h1>
          <p className="text-sm text-muted">
            Enter the reference from your booking confirmation and the email address you booked with.
          </p>
        </div>
        {res && res.httpStatus !== 404 && <Notice tone="error">{res.message}</Notice>}
        <FindBookingForm />
        <p className="text-center text-sm text-muted">
          Royal Kamak partner?{" "}
          <Link href="/login?next=/reservations" className="text-brand underline-offset-4 hover:underline">
            Sign in to see all your reservations
          </Link>
        </p>
      </div>
    );
  }

  const r = res.reservation;
  return (
    <div className="space-y-6">
      {created === "1" && (
        <Notice tone="success">
          Thank you, your booking has been received. Your reference is{" "}
          <strong className="font-mono">{r.reference}</strong>. Keep it safe: with your email address it lets you
          find this booking again. The hotel will confirm it shortly.
        </Notice>
      )}

      <ReservationView reservation={r} />

      <div className="flex flex-wrap items-start justify-between gap-6 border-t border-line pt-6">
        {r.cancellable ? <CancelButton cancel={cancelGuestReservationAction} /> : <span />}
        <form action={forgetGuestBookingAction}>
          <button type="submit" className="link-arrow text-muted">
            Look up a different booking
          </button>
        </form>
      </div>
    </div>
  );
}
