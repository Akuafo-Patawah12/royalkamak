import Link from "next/link";
import { logoutAction } from "@/app/actions";
import { getCurrentPartner } from "@/lib/api";

export async function AccountMenu() {
  const partner = await getCurrentPartner();
  // Signed-out partners reach sign-in from "Book now" (booking requires it),
  // My reservations, or the footer link.
  if (!partner) return null;
  return (
    <form action={logoutAction} className="hidden items-center gap-4 sm:flex">
      <span className="hidden text-[11px] uppercase tracking-[0.2em] text-muted md:inline">
        {partner.fullName ?? partner.email}
      </span>
      <button type="submit" className="link-arrow">
        Sign out
      </button>
    </form>
  );
}

/** Footer link: sign in when signed out, sign out when signed in (works on phones too). */
export async function FooterAccountLink() {
  const partner = await getCurrentPartner();
  const style = "block text-muted hover:text-brand";
  if (!partner) {
    return (
      <Link href="/login" className={style}>
        Partner sign in
      </Link>
    );
  }
  return (
    <form action={logoutAction}>
      <button type="submit" className={style}>
        Sign out
      </button>
    </form>
  );
}
