/** Title band of the /rooms page (also shown while it loads). */
export function RoomsIntro() {
  return (
    <section
      className="pb-28 pt-20 text-center sm:pb-32 sm:pt-24"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 30% 20%, rgba(201,162,39,.16), transparent 55%), linear-gradient(160deg, #fbf8f3, #efe8dc)",
      }}
    >
      <div className="container-page">
        <p className="eyebrow">Stay</p>
        <h1 className="display mx-auto mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">Rooms &amp; suites</h1>
        <div className="mx-auto mt-7 h-px w-16 bg-accent/60" />
        <p className="accent-italic mx-auto mt-7 max-w-xl text-sm leading-loose text-muted sm:text-base">
          Rest, refresh and wake up to the pool. Choose your dates to see what&apos;s free and book direct.
        </p>
      </div>
    </section>
  );
}
