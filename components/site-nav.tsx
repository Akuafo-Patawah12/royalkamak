"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { SITE_LINKS } from "@/lib/venues";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/*
 * The current address (usePathname) is only known per request, so the parts
 * that read it render inside <Suspense>: the fallback is the same markup with
 * no link marked as current, then the real one replaces it.
 */

/** Centre links of the header (large screens). */
export function HeaderLinks() {
  return (
    <Suspense fallback={<Links pathname="" />}>
      <CurrentLinks />
    </Suspense>
  );
}

function CurrentLinks() {
  return <Links pathname={usePathname()} />;
}

function Links({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Main" className="hidden items-center gap-6 lg:flex xl:gap-10">
      {SITE_LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative py-2 text-[11px] font-medium uppercase tracking-[0.22em] transition hover:text-accent ${
              active ? "text-brand after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-brand" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Menu button + drop-down panel (phones and tablets). */
export function MobileMenu() {
  return (
    <Suspense fallback={<Menu pathname="" />}>
      <CurrentMenu />
    </Suspense>
  );
}

function CurrentMenu() {
  return <Menu pathname={usePathname()} />;
}

function Menu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [openedOn, setOpenedOn] = useState(pathname);

  // Close after navigating to another page.
  if (open && openedOn !== pathname) setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => {
          setOpenedOn(pathname);
          setOpen((o) => !o);
        }}
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] hover:text-accent"
      >
        <span className={`h-px w-5 bg-current transition ${open ? "translate-y-[6px] rotate-45" : ""}`} />
        <span className={`h-px w-5 bg-current transition ${open ? "opacity-0" : ""}`} />
        <span className={`h-px w-5 bg-current transition ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
      </button>

      {open && (
        <div id="mobile-menu" className="absolute inset-x-0 top-full border-b border-line bg-white shadow-[0_24px_40px_-24px_rgba(60,40,20,.25)]">
          <nav aria-label="Main" className="container-page divide-y divide-line py-4">
            {[...SITE_LINKS, { href: "/reservations", label: "My bookings" }].map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between py-4 transition hover:text-brand ${active ? "text-brand" : ""}`}
                >
                  <span className="display text-2xl">{link.label}</span>
                  <span aria-hidden className="text-accent">
                    →
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
