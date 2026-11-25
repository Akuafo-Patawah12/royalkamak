"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { formatMoney, menuImageUrl } from "@/lib/format";
import type { MenuDay, MenuItem } from "@/lib/types";

export const MENU_DAYS: { day: MenuDay; short: string; long: string }[] = [
  { day: "MON", short: "Mon", long: "Monday" },
  { day: "TUE", short: "Tue", long: "Tuesday" },
  { day: "WED", short: "Wed", long: "Wednesday" },
  { day: "THU", short: "Thu", long: "Thursday" },
  { day: "FRI", short: "Fri", long: "Friday" },
  { day: "SAT", short: "Sat", long: "Saturday" },
  { day: "SUN", short: "Sun", long: "Sunday" },
];

/** Menu for one day, with tabs to look at the other days of the week. */
export function DailyMenu({
  items,
  today,
  currency,
  emptyText,
}: {
  items: MenuItem[];
  today: MenuDay;
  currency: string;
  emptyText: string;
}) {
  const [day, setDay] = useState<MenuDay>(today);
  const baseId = useId();
  const shown = items.filter((item) => item.days.includes(day));
  const dayName = MENU_DAYS.find((d) => d.day === day)!.long;

  return (
    <div>
      <div role="tablist" aria-label="Day of the week" className="flex flex-wrap justify-center gap-1 sm:gap-2">
        {MENU_DAYS.map((d) => {
          const selected = d.day === day;
          return (
            <button
              key={d.day}
              type="button"
              role="tab"
              id={`${baseId}-${d.day}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              onClick={() => setDay(d.day)}
              className={`min-w-12 border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition sm:min-w-16 ${
                selected ? "border-brand bg-brand text-brand-foreground" : "border-line hover:border-brand hover:text-brand"
              }`}
            >
              {d.short}
              {d.day === today && <span className="block text-[9px] tracking-[0.12em] opacity-80">Today</span>}
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${day}`} className="mt-10">
        {shown.length === 0 ? (
          <p className="accent-italic text-center text-muted">
            {emptyText.replace("{day}", dayName)}
          </p>
        ) : (
          <ul className="grid gap-x-14 gap-y-8 md:grid-cols-2">
            {shown.map((item) => (
              <li key={item.id} className="flex min-w-0 gap-5 [overflow-wrap:anywhere]">
                {item.images.length > 0 && (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-ink sm:h-24 sm:w-24">
                    <Image
                      src={menuImageUrl(item.id, item.images[0])}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-3">
                    <h3 className="display text-xl">{item.name}</h3>
                    <span aria-hidden="true" className="mb-1 flex-1 border-b border-dotted border-line" />
                    {item.price > 0 && (
                      <span className="whitespace-nowrap text-sm font-medium text-brand">{formatMoney(item.price, currency)}</span>
                    )}
                  </div>
                  {item.description && <p className="mt-1.5 text-sm leading-relaxed text-muted">{item.description}</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
