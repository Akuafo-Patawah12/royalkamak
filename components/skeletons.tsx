/*
 * Loading skeletons shaped like the real pages, so nothing jumps when the
 * content arrives. Used by each route's loading.tsx (shown automatically by
 * Next.js while a page loads) and by the in-page <Suspense> fallbacks.
 */

/** One shimmering placeholder block. */
export function Bone({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`skeleton block ${className}`} />;
}

/** Screen-reader announcement + aria-busy wrapper. */
function Busy({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div aria-busy="true" className={className}>
      <span className="sr-only" role="status">
        Loading…
      </span>
      {children}
    </div>
  );
}

function Lines({ count = 2, last = "w-2/3" }: { count?: number; last?: string }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }, (_, i) => (
        <Bone key={i} className={`h-3 ${i === count - 1 ? last : "w-full"}`} />
      ))}
    </div>
  );
}

/** Page title block: eyebrow + serif heading. */
export function TitleSkeleton({ center = false }: { center?: boolean }) {
  return (
    <div className={`space-y-4 ${center ? "flex flex-col items-center" : ""}`}>
      <Bone className="h-2.5 w-28" />
      <Bone className="h-10 w-72 max-w-full sm:h-12" />
    </div>
  );
}

// ---------- home ----------

export function HeroSkeleton() {
  return (
    <section className="flex min-h-[560px] items-center justify-center bg-ink sm:min-h-[680px]">
      <div className="container-page flex flex-col items-center gap-6 pb-24">
        <Bone className="h-2.5 w-32" />
        <Bone className="h-12 w-full max-w-2xl sm:h-16" />
        <Bone className="h-12 w-3/4 max-w-xl sm:h-16" />
        <Bone className="mt-4 h-3 w-80 max-w-full" />
      </div>
    </section>
  );
}

export function RoomCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="space-y-4">
          <Bone className="aspect-[3/4] w-full" />
          <Bone className="mt-6 h-2.5 w-40" />
          <Bone className="h-8 w-3/4" />
          <Lines count={2} />
          <div className="flex justify-between pt-4">
            <Bone className="h-3 w-24" />
            <Bone className="h-3 w-28" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** The arrival / departure search bar. */
export function SearchBarSkeleton() {
  return (
    <div aria-hidden="true" className="grid gap-px border border-line bg-line sm:grid-cols-[1fr_1fr_auto]">
      {[0, 1].map((i) => (
        <div key={i} className="space-y-2 bg-card px-5 py-3.5">
          <Bone className="h-2 w-16" />
          <Bone className="h-6 w-36" />
        </div>
      ))}
      <div className="min-h-14 bg-brand/80 sm:w-56" />
    </div>
  );
}

/** Search bar + rooms section (everything below the hero). */
export function RoomSearchSkeleton() {
  return (
    <Busy>
      <div className="container-page relative z-10 -mt-14">
        <SearchBarSkeleton />
      </div>
      <section className="container-page pt-20">
        <div className="mb-12 flex flex-col items-center gap-4">
          <Bone className="h-2.5 w-28" />
          <Bone className="h-10 w-80 max-w-full" />
          <Bone className="h-3 w-64 max-w-full" />
        </div>
        <RoomCardsSkeleton />
      </section>
    </Busy>
  );
}

export function HomeSkeleton() {
  return (
    <Busy>
      <HeroSkeleton />
      <div className="container-page relative z-10 -mt-14">
        <SearchBarSkeleton />
      </div>
      <div className="container-page flex flex-col items-center gap-5 pt-28">
        <Bone className="h-2.5 w-24" />
        <Bone className="h-14 w-full max-w-xl" />
        <div className="w-full max-w-xl">
          <Lines count={3} last="w-1/2" />
        </div>
      </div>
    </Busy>
  );
}

// ---------- room page ----------

export function RoomCalendarSkeleton() {
  return (
    <div className="card p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-3">
          <Bone className="h-2.5 w-24" />
          <Bone className="h-3 w-44" />
        </div>
        <div className="flex gap-1">
          <Bone className="h-9 w-9" />
          <Bone className="h-9 w-9" />
        </div>
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        {[0, 1].map((m) => (
          <div key={m} className={m === 1 ? "hidden sm:block" : ""}>
            <Bone className="mx-auto mb-5 h-6 w-36" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => (
                <Bone key={i} className="mx-auto h-8 w-8" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
        <Bone className="h-3 w-48" />
        <Bone className="h-11 w-44" />
      </div>
    </div>
  );
}

export function RoomBodySkeleton() {
  return (
    <Busy className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="space-y-5">
        <Bone className="aspect-[4/3] w-full" />
        <Bone className="h-2.5 w-40" />
        <Bone className="h-11 w-3/4" />
        <Lines count={3} />
      </div>
      <RoomCalendarSkeleton />
    </Busy>
  );
}

// ---------- booking ----------

export function BookingBodySkeleton() {
  return (
    <Busy className="space-y-4">
      <div className="card flex items-center justify-between px-4 py-3.5">
        <Bone className="h-3.5 w-64 max-w-[60%]" />
        <Bone className="h-3 w-24" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <Bone className="h-2.5 w-16" />
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-line pb-4 last:border-0">
                <div className="space-y-2">
                  <Bone className="h-6 w-44" />
                  <Bone className="h-3 w-24" />
                </div>
                <Bone className="h-10 w-20" />
              </div>
            ))}
          </div>
          <div className="card grid gap-5 p-6 sm:grid-cols-2">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className={`space-y-2 ${i === 0 ? "sm:col-span-2" : ""}`}>
                <Bone className="h-2.5 w-20" />
                <Bone className="h-11 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="card h-fit space-y-5 p-6">
          <Bone className="h-7 w-32" />
          <Lines count={3} last="w-full" />
          <Bone className="h-11 w-full" />
          <Bone className="h-11 w-full" />
        </div>
      </div>
    </Busy>
  );
}

// ---------- reservations ----------

export function ReservationTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Busy className="card overflow-hidden">
      <div className="grid grid-cols-[1.2fr_2fr_0.6fr_1.4fr_1fr_1fr] gap-4 border-b border-line px-4 py-3.5">
        {Array.from({ length: 6 }, (_, i) => (
          <Bone key={i} className="h-2.5 w-3/4" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="grid grid-cols-[1.2fr_2fr_0.6fr_1.4fr_1fr_1fr] items-center gap-4 border-b border-line px-4 py-4 last:border-0"
        >
          <Bone className="h-3 w-full" />
          <Bone className="h-3 w-5/6" />
          <Bone className="h-3 w-6" />
          <Bone className="h-3 w-4/5" />
          <Bone className="h-3 w-full" />
          <Bone className="h-6 w-20" />
        </div>
      ))}
    </Busy>
  );
}

export function ReservationDetailSkeleton() {
  return (
    <Busy className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <TitleSkeleton />
        <Bone className="h-8 w-24" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card space-y-3 p-4">
            <Bone className="h-2.5 w-20" />
            <Bone className="h-6 w-32" />
          </div>
        ))}
      </div>
      <div className="card space-y-4 p-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex justify-between gap-6">
            <Bone className="h-3 w-48" />
            <Bone className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card space-y-3 p-4">
          <Bone className="h-2.5 w-24" />
          <Lines count={3} />
        </div>
      </div>
    </Busy>
  );
}

// ---------- small form pages (sign in, find booking) ----------

export function FormCardSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <Busy className="card space-y-5 p-6 sm:p-8">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <Bone className="h-2.5 w-28" />
          <Bone className="h-11 w-full" />
        </div>
      ))}
      <Bone className="h-12 w-full" />
    </Busy>
  );
}
