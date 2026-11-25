export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GH", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && ISO_DATE.test(value);
}

/** Today as yyyy-MM-dd in the server's timezone. */
export function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** Site URL of a room photo (proxied from Kamakz by app/room-images). */
export function roomImageUrl(roomId: number, imageId: number) {
  return `/room-images/${roomId}/${imageId}`;
}

/** Site URL of a menu item photo (proxied from Kamakz by app/menu-images). */
export function menuImageUrl(itemId: number, imageId: number) {
  return `/menu-images/${itemId}/${imageId}`;
}

/** Only allow same-site relative redirects. */
export function safeNext(value: unknown, fallback = "/reservations") {
  // Browsers read a backslash as "/", so a next value like "/\evil.com" would leave the site.
  if (typeof value !== "string" || !value.startsWith("/") || /[\\\u0000-\u001f]/.test(value)) {
    return fallback;
  }
  try {
    const base = "http://same-site.invalid";
    const url = new URL(value, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export function statusTone(status: string | null) {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
    case "booked":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
    case "cancelled":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";
    case "closed":
      return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
  }
}
