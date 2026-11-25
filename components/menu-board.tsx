"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { MENU_DAYS } from "@/components/daily-menu";
import { formatMoney, menuImageUrl } from "@/lib/format";
import type { MenuDay, MenuItem } from "@/lib/types";

type View = "ALL" | MenuDay;

/** Which days an item is served, e.g. "Every day", "Weekends", "Mon · Wed · Fri". */
function daysLabel(days: MenuDay[]) {
  if (days.length === 7) return "Every day";
  const set = new Set(days);
  const weekdays: MenuDay[] = ["MON", "TUE", "WED", "THU", "FRI"];
  if (days.length === 5 && weekdays.every((d) => set.has(d))) return "Weekdays";
  if (days.length === 2 && set.has("SAT") && set.has("SUN")) return "Weekends";
  return MENU_DAYS.filter((d) => set.has(d.day)).map((d) => d.short).join(" · ");
}

/** The whole menu: all week (with each item's days) or one day, food and drinks side by side. */
export function MenuBoard({ items, today, currency }: { items: MenuItem[]; today: MenuDay; currency: string }) {
  const [view, setView] = useState<View>("ALL");
  const baseId = useId();
  const shown = view === "ALL" ? items : items.filter((i) => i.days.includes(view));
  const food = shown.filter((i) => i.kind === "food");
  const drinks = shown.filter((i) => i.kind === "drink");
  const dayName = view === "ALL" ? null : MENU_DAYS.find((d) => d.day === view)!.long;
  const tabs: { view: View; label: string; sub?: string }[] = [
    { view: "ALL", label: "All week" },
    ...MENU_DAYS.map((d) => ({ view: d.day as View, label: d.short, sub: d.day === today ? "Today" : undefined })),
  ];

  return (
    <div>
      <div role="tablist" aria-label="Show the menu for" className="flex flex-wrap justify-center gap-1 sm:gap-2 print:hidden">
        {tabs.map((t) => {
          const selected = t.view === view;
          return (
            <button
              key={t.view}
              type="button"
              role="tab"
              id={`${baseId}-${t.view}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              onClick={() => setView(t.view)}
              className={`min-w-12 border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition sm:min-w-16 ${
                selected ? "border-brand bg-brand text-brand-foreground" : "border-line hover:border-brand hover:text-brand"
              }`}
            >
              {t.label}
              {t.sub && <span className="block text-[9px] tracking-[0.12em] opacity-80">{t.sub}</span>}
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-${view}`} className="mt-12">
        {dayName && (
          <p className="display mb-10 text-center text-3xl">
            {dayName}
            {view === today && <span className="accent-italic ml-3 text-base text-muted">today</span>}
          </p>
        )}
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <MenuColumn
            title="Food"
            items={food}
            showDays={view === "ALL"}
            currency={currency}
            empty={dayName ? `No food listed for ${dayName} yet. Ask our team what's cooking.` : "The kitchen menu is coming soon."}
          />
          <MenuColumn
            title="Drinks"
            items={drinks}
            showDays={view === "ALL"}
            currency={currency}
            empty={dayName ? `No drinks listed for ${dayName} yet. Ask the bar team.` : "The drinks list is coming soon."}
          />
        </div>
      </div>
    </div>
  );
}

function MenuColumn({
  title,
  items,
  showDays,
  currency,
  empty,
}: {
  title: string;
  items: MenuItem[];
  showDays: boolean;
  currency: string;
  empty: string;
}) {
  return (
    <section className="min-w-0">
      <div className="flex items-center gap-4">
        <h2 className="display text-3xl">{title}</h2>
        <span aria-hidden="true" className="h-px flex-1 bg-accent/40" />
      </div>
      {items.length === 0 ? (
        <p className="accent-italic mt-6 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="mt-6 divide-y divide-line">
          {items.map((item) => (
            <li key={item.id} className="flex min-w-0 gap-4 py-5 [overflow-wrap:anywhere]">
              {item.images.length > 0 && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-ink sm:h-20 sm:w-20 print:hidden">
                  <Image src={menuImageUrl(item.id, item.images[0])} alt={item.name} fill sizes="80px" className="object-cover" />
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
                {showDays && (
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-accent">{daysLabel(item.days)}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
