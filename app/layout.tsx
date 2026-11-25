import type { Metadata } from "next";
import { Bodoni_Moda, Geist_Mono, Jost, Libre_Baskerville } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu, FooterAccountLink } from "@/components/account-menu";
import { FaqChat } from "@/components/faq-chat";
import { HeaderLinks, MobileMenu } from "@/components/site-nav";
import { SITE_LINKS } from "@/lib/venues";
import "./globals.css";

// Body, labels and buttons: Jost (same family the reference site uses).
const bodySans = Jost({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Headings: Bodoni Moda, the closest free match to the reference site's
// licensed Helene Hess display serif.
const displaySerif = Bodoni_Moda({
  variable: "--font-display-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Accent: Libre Baskerville Italic, as on the reference site, for lead lines
// under headings (the .accent-italic class).
const accentSerif = Libre_Baskerville({
  variable: "--font-accent-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export const metadata: Metadata = {
  title: { default: "Royal Kamak Hotel · Book your stay", template: "%s · Royal Kamak" },
  description: "Book rooms at Royal Kamak Hotel directly, or as a Royal Kamak partner.",
};

// Public hotel address the FAQ chat offers when it can't answer (optional).
const contactEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(process.env.ROYALKAMAK_CONTACT_EMAIL ?? "")
  ? process.env.ROYALKAMAK_CONTACT_EMAIL!
  : null;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodySans.variable} ${geistMono.variable} ${displaySerif.variable} ${accentSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* White so the logo's white JPEG background blends in. Logo left, links centred, booking right. */}
        <header className="sticky top-0 z-30 border-b border-line bg-white text-foreground print:hidden">
          <div className="container-page relative grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Link href="/" className="block justify-self-start">
              <Image
                src="/royal-kamak-logo.jpg"
                alt="Royal Kamak Hotel"
                width={240}
                height={195}
                preload
                className="h-16 w-auto sm:h-[76px]"
              />
            </Link>
            <HeaderLinks />
            <div className="col-start-3 flex items-center justify-end gap-3 sm:gap-6">
              <div className="hidden xl:block">
                <Suspense fallback={null}>
                  <AccountMenu />
                </Suspense>
              </div>
              <Link
                href="/reservations"
                className="hidden whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.2em] hover:text-accent lg:inline"
              >
                My bookings
              </Link>
              <Link href="/book" className="btn whitespace-nowrap px-3 py-2.5 sm:px-5">
                Book now
              </Link>
              <MobileMenu />
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <FaqChat contactEmail={contactEmail} />

        <footer className="mt-24 border-t border-line bg-ink text-ink-foreground print:hidden">
          <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="display text-2xl tracking-[0.25em] text-brand">ROYAL KAMAK</p>
              <p className="accent-italic mt-3 max-w-xs text-sm leading-relaxed text-muted">
                Book your stay direct, or sign in as a partner to reserve rooms for your guests.
              </p>
            </div>
            <div className="space-y-3 text-sm">
              <p className="eyebrow">The hotel</p>
              {SITE_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="block text-muted hover:text-brand">
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="space-y-3 text-sm">
              <p className="eyebrow">Bookings</p>
              <Link href="/rooms" className="block text-muted hover:text-brand">
                Rooms &amp; availability
              </Link>
              <Link href="/reservations" className="block text-muted hover:text-brand">
                My bookings
              </Link>
              <Suspense
                fallback={
                  <Link href="/login" className="block text-muted hover:text-brand">
                    Partner sign in
                  </Link>
                }
              >
                <FooterAccountLink />
              </Suspense>
            </div>
            <div className="space-y-3 text-sm">
              <p className="eyebrow">Need help?</p>
              <p className="text-muted">
                Contact the Royal Kamak reservations team for group bookings, partner rates or changes to a
                confirmed stay.
              </p>
            </div>
          </div>
          <div className="border-t border-line">
            <p className="container-page py-6 text-[11px] uppercase tracking-[0.2em] text-muted">
              Royal Kamak Hotel · Reservations
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
