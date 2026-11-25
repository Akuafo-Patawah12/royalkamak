import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { MenuBoard } from "@/components/menu-board";
import { todayAtHotel } from "@/components/menu-section";
import { Bone } from "@/components/skeletons";
import { currency, getMenu } from "@/lib/api";
import { qrSvg } from "@/lib/qr";
import { siteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Menu",
  description: "Food and drinks at Royal Kamak Hotel, day by day.",
};

const SAND = "radial-gradient(ellipse at 30% 20%, rgba(201,162,39,.16), transparent 55%), linear-gradient(160deg, #fbf8f3, #efe8dc)";

export default function MenuPage() {
  return (
    <>
      <section className="pb-16 pt-20 text-center sm:pt-24" style={{ backgroundImage: SAND }}>
        <div className="container-page">
          <p className="eyebrow">Restaurant &amp; bar</p>
          <h1 className="display mx-auto mt-5 max-w-3xl text-5xl leading-[1.05] sm:text-7xl">Our menu</h1>
          <div className="mx-auto mt-7 h-px w-16 bg-accent/60" />
          <p className="accent-italic mx-auto mt-7 max-w-xl text-sm leading-loose text-muted sm:text-base">
            Food from our kitchen and drinks from the bar, for every day of the week.
          </p>
        </div>
      </section>

      <div className="container-page mt-14">
        <Suspense fallback={<MenuSkeleton />}>
          <FullMenu />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <MenuQr />
      </Suspense>
    </>
  );
}

async function FullMenu() {
  // The menu and "today" are read at request time.
  await connection();
  const items = (await getMenu()).filter((item) => item.name?.trim());
  return <MenuBoard items={items} today={todayAtHotel()} currency={currency} />;
}

/** QR code that opens this page, for guests to scan with their phone. */
async function MenuQr() {
  const url = `${await siteUrl()}/menu`;
  const svg = await qrSvg(url);
  return (
    <section className="container-page mt-24">
      <div className="grid items-center gap-10 border border-line bg-ink/50 p-8 sm:grid-cols-[auto_minmax(0,1fr)] sm:p-12">
        <div
          role="img"
          aria-label={`QR code that opens ${url}`}
          className="mx-auto w-44 bg-white p-2 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full sm:w-52"
          // SVG generated on the server by the qrcode library from our own URL.
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <div className="text-center sm:text-left">
          <p className="eyebrow">Scan for the menu</p>
          <h2 className="display mt-4 text-3xl sm:text-4xl">The menu on your phone</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-muted">
            Point your phone camera at the code to open this menu. Hotel staff can print it as a table card for the
            restaurant and bar.
          </p>
          <p className="mt-3 break-all text-xs text-muted">{url}</p>
          <Link href="/menu/qr" className="btn mt-6">
            Print table card
          </Link>
        </div>
      </div>
    </section>
  );
}

function MenuSkeleton() {
  return (
    <div aria-busy="true" className="space-y-10">
      <div className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Bone key={i} className="h-10 w-16" />
        ))}
      </div>
      <div className="grid gap-14 lg:grid-cols-2">
        {[0, 1].map((c) => (
          <div key={c} className="space-y-5">
            <Bone className="h-8 w-32" />
            {Array.from({ length: 4 }, (_, i) => (
              <Bone key={i} className="h-12 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
