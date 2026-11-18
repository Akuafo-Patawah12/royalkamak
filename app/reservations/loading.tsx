import { ReservationTableSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <div className="container-page space-y-8 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <p className="eyebrow">Your account</p>
          <h1 className="display text-4xl sm:text-5xl">My reservations</h1>
        </div>
      </div>
      <ReservationTableSkeleton />
    </div>
  );
}
