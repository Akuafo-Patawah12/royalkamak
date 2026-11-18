import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Notice } from "@/components/notice";
import { BookingBodySkeleton } from "@/components/skeletons";
import { currency, getCurrentPartner, getRooms } from "@/lib/api";
import { formatDate, isIsoDate } from "@/lib/format";
import { BookingForm } from "./booking-form";

export const metadata: Metadata = { title: "New reservation" };

export default function BookPage(props: PageProps<"/book">) {
  return (
    <div className="container-page space-y-8 py-14">
      <div className="space-y-3">
        <p className="eyebrow">Reservation</p>
        <h1 className="display text-4xl sm:text-5xl">Complete your booking</h1>
      </div>
      <Suspense fallback={<BookingBodySkeleton />}>
        <Booking searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Booking({ searchParams }: { searchParams: PageProps<"/book">["searchParams"] }) {
  const params = await searchParams;
  const checkIn = isIsoDate(params.checkIn) ? params.checkIn : "";
  const checkOut = isIsoDate(params.checkOut) ? params.checkOut : "";
  const roomId = typeof params.room === "string" ? Number(params.room) : NaN;

  if (!checkIn || !checkOut) redirect("/");

  // Signed-out visitors book as guests; partners book on their account.
  const partner = await getCurrentPartner();
  const here = `/book?${new URLSearchParams({ room: String(params.room ?? ""), checkIn, checkOut })}`;
  const signInHref = `/login?${new URLSearchParams({ next: here })}`;

  const res = await getRooms(checkIn, checkOut);
  if (!res.ok) return <Notice tone="error">{res.message}</Notice>;

  const rooms = res.rooms.filter((r) => (r.available ?? 0) > 0);
  const changeDates = `/?${new URLSearchParams({ checkIn, checkOut })}`;

  return (
    <div className="space-y-4">
      <div className="card flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
        <span>
          <strong>{formatDate(checkIn)}</strong> → <strong>{formatDate(checkOut)}</strong> · {res.nights} night
          {res.nights === 1 ? "" : "s"}
        </span>
        <Link href={changeDates} className="link-arrow">
          Change dates
        </Link>
      </div>
      {rooms.length === 0 ? (
        <Notice>No rooms are available for these dates. Try different dates.</Notice>
      ) : (
        <BookingForm
          rooms={rooms}
          checkIn={checkIn}
          checkOut={checkOut}
          preselectedRoomId={Number.isFinite(roomId) ? roomId : null}
          currency={currency}
          partnerName={partner ? (partner.fullName ?? partner.email ?? "your account") : null}
          signInHref={signInHref}
        />
      )}
    </div>
  );
}
