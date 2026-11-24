import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Notice } from "@/components/notice";
import { TitleSkeleton } from "@/components/skeletons";
import { getCurrentPartner, verifyPayment } from "@/lib/api";

export const metadata: Metadata = { title: "Payment" };

/*
 * Paystack sends the visitor back here as /payment/callback?reference=…
 * Kamakz checks the payment with Paystack itself (the query string proves
 * nothing), marks the booking paid and confirmed, then we show the booking.
 */
export default function PaymentCallbackPage(props: PageProps<"/payment/callback">) {
  return (
    <div className="container-page mx-auto max-w-xl space-y-6 py-20 text-center">
      <Suspense
        fallback={
          <div aria-busy="true" className="flex flex-col items-center gap-6">
            <TitleSkeleton center />
            <p className="text-sm text-muted" role="status">
              Confirming your payment…
            </p>
          </div>
        }
      >
        <PaymentResult searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function PaymentResult({ searchParams }: { searchParams: PageProps<"/payment/callback">["searchParams"] }) {
  const params = await searchParams;
  const reference = typeof params.reference === "string" ? params.reference : typeof params.trxref === "string" ? params.trxref : "";
  if (!reference) redirect("/my-booking");

  const res = await verifyPayment(reference);
  if (res.ok && res.paid && res.reservation) {
    if (res.partnerBooking && (await getCurrentPartner())) redirect(`/reservations/${res.reservation.id}?paid=1`);
    redirect("/my-booking?paid=1");
  }

  const abandoned = res.ok && !res.paid;
  return (
    <>
      <p className="eyebrow">Payment</p>
      <h1 className="display text-4xl sm:text-5xl">{abandoned ? "Payment not completed" : "We couldn't confirm your payment"}</h1>
      <Notice tone={abandoned ? "info" : "error"}>
        {abandoned
          ? "No money was taken. Your booking is still saved: you can pay from your booking page, or pay at the hotel."
          : `${res.ok ? "" : res.message} If money left your account, please contact the hotel with this payment reference: ${reference}.`}
      </Notice>
      <div className="flex flex-wrap justify-center gap-6">
        <Link href="/my-booking" className="link-arrow">
          My booking <span aria-hidden>→</span>
        </Link>
        <Link href="/reservations" className="link-arrow text-muted">
          Partner reservations
        </Link>
      </div>
    </>
  );
}
