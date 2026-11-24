import { BookingBodySkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="container-page space-y-8 py-14">
      <div className="space-y-3">
        <p className="eyebrow">Reservation</p>
        <h1 className="display text-4xl sm:text-5xl">Book your stay</h1>
      </div>
      <BookingBodySkeleton />
    </div>
  );
}
