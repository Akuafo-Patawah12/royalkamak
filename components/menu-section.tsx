import Link from "next/link";
import { connection } from "next/server";
import { DailyMenu } from "@/components/daily-menu";
import { currency, getMenu } from "@/lib/api";
import type { MenuDay } from "@/lib/types";

const DAY_CODES: MenuDay[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** Today's day of the week at the hotel (Ghana is on UTC all year). */
export function todayAtHotel(): MenuDay {
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "Africa/Accra" })
    .format(new Date())
    .toUpperCase()
    .slice(0, 3);
  return (DAY_CODES.find((d) => d === weekday) ?? "MON") as MenuDay;
}

/**
 * Daily menu for the restaurant (food) or bar (drink), from the items staff
 * put on the menu in Kamakz. Renders nothing until there is a menu.
 */
export async function MenuSection({ kind }: { kind: "food" | "drink" }) {
  // The menu changes by day: read it (and the clock) at request time.
  await connection();
  // Items without a name (e.g. half-filled in Kamakz) are left out.
  const items = (await getMenu()).filter((item) => item.kind === kind && item.name?.trim());
  if (items.length === 0) return null;

  return (
    <section className="container-page mt-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{kind === "food" ? "Daily menu" : "At the bar today"}</p>
        <h2 className="display mt-4 text-4xl leading-tight sm:text-5xl">
          {kind === "food" ? "Today's menu" : "Today's drinks"}
        </h2>
        <div className="mx-auto mt-6 h-px w-16 bg-accent/60" />
        <p className="accent-italic mt-6 leading-loose text-muted">
          {kind === "food"
            ? "Freshly prepared by our kitchen. Pick a day to see what's cooking."
            : "What's being poured this week. Pick a day to see the list."}
        </p>
      </div>
      <div className="mt-10 border-y border-line py-10">
        <DailyMenu
          items={items}
          today={todayAtHotel()}
          currency={currency}
          emptyText={
            kind === "food"
              ? "Nothing on the menu for {day} yet. Ask our team what's cooking."
              : "No drinks listed for {day} yet. Ask the bar team."
          }
        />
      </div>
      <p className="mt-8 text-center">
        <Link href="/menu" className="link-arrow">
          See the full menu <span aria-hidden>→</span>
        </Link>
      </p>
    </section>
  );
}
