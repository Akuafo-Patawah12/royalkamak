import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { qrSvg } from "@/lib/qr";
import { siteUrl } from "@/lib/site-url";
import { PrintButton } from "./print-button";

export const metadata: Metadata = { title: "Menu QR code" };

/** Printable table card: logo, QR code to /menu, and a short line. */
export default function MenuQrPage() {
  return (
    <div className="container-page py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link href="/menu" className="link-arrow text-muted">
          ← Back to the menu
        </Link>
        <PrintButton />
      </div>
      <Suspense fallback={null}>
        <TableCard />
      </Suspense>
      <p className="mt-6 text-center text-xs text-muted print:hidden">
        Tip: print on card, cut along the border and place one on each table.
      </p>
    </div>
  );
}

async function TableCard() {
  const url = `${await siteUrl()}/menu`;
  const svg = await qrSvg(url);
  return (
    <div className="mx-auto max-w-sm border-2 border-accent/50 bg-white px-8 py-10 text-center print:max-w-none print:border-accent">
      <Image src="/royal-kamak-logo.jpg" alt="Royal Kamak Hotel" width={240} height={195} className="mx-auto h-20 w-auto" />
      <p className="eyebrow mt-6">Restaurant &amp; bar</p>
      <h1 className="display mt-3 text-4xl">Scan for our menu</h1>
      <div
        role="img"
        aria-label={`QR code that opens ${url}`}
        className="mx-auto mt-8 w-60 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
        // SVG generated on the server by the qrcode library from our own URL.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="accent-italic mt-6 text-sm text-muted">Point your phone camera at the code.</p>
      <p className="mt-2 break-all text-[11px] text-muted">{url}</p>
    </div>
  );
}
