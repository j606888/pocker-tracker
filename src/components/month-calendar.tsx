import Link from "next/link";
import { cn, formatMoney } from "@/lib/utils";
import {
  buildMonthGrid,
  monthLabel,
  prevMonth,
  nextMonth,
} from "@/lib/date-grid";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export type DayAgg = { net: number; count: number };

/** A day at or past this size gets the stronger tint. */
const STRONG = 5000;

/** 2400 -> "+2.4k", -600 -> "−0.6k", 0 -> "0". */
function compact(n: number) {
  if (n === 0) return "0";
  const sign = n > 0 ? "+" : "−";
  const abs = Math.abs(n);
  return abs < 1000 ? `${sign}${abs}` : `${sign}${(abs / 1000).toFixed(1)}k`;
}

// Literal class names so Tailwind's scanner picks them up.
function tint(n: number) {
  if (n > 0) return n >= STRONG ? "bg-pos-2" : "bg-pos-1";
  if (n < 0) return n <= -STRONG ? "bg-neg-2" : "bg-neg-1";
  return "bg-chip";
}
function amountText(n: number) {
  return n > 0
    ? "text-positive-strong"
    : n < 0
      ? "text-negative-strong"
      : "text-muted";
}

const arrowClass =
  "flex h-11 w-11 items-center justify-center rounded-full border border-border text-xl text-subtle transition hover:bg-chip";

export function MonthCalendar({
  month,
  days,
  selectedDay,
  today,
  summary,
  aside,
}: {
  month: string;
  /** date (YYYY-MM-DD) -> aggregates for that day */
  days: Record<string, DayAgg>;
  selectedDay?: string;
  today: string;
  /** Rendered between the month header and the grid. */
  summary?: React.ReactNode;
  /** Below the grid on phones; beside it on desktop (the selected day). */
  aside?: React.ReactNode;
}) {
  // Drop a trailing week that belongs entirely to the next month.
  const grid = buildMonthGrid(month);
  const cells = grid.slice(35).some((c) => c.inMonth) ? grid : grid.slice(0, 35);

  return (
    <div className="flex flex-col gap-3 lg:gap-5">
      <div className="flex items-center justify-between lg:justify-start lg:gap-2">
        <Link href={`/?month=${prevMonth(month)}`} aria-label="上個月" className={arrowClass}>
          ‹
        </Link>
        <span className="font-display text-xl font-medium tnum lg:order-first lg:mr-2 lg:text-[30px]">
          {monthLabel(month)}
        </span>
        <Link href={`/?month=${nextMonth(month)}`} aria-label="下個月" className={arrowClass}>
          ›
        </Link>
      </div>

      {summary}

      <div
        className={cn(
          "flex flex-col gap-4 lg:grid lg:items-start lg:gap-5",
          !!aside && "lg:grid-cols-[minmax(0,1fr)_340px]"
        )}
      >
        <div className="flex flex-col gap-1 lg:gap-2 lg:rounded-2xl lg:border lg:border-border lg:bg-surface lg:p-4">
          <div className="grid grid-cols-7 text-center text-xs text-muted lg:gap-1.5 lg:text-left">
            {WEEKDAYS.map((w) => (
              <span key={w} className="py-1 lg:px-2.5">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 lg:gap-1.5">
            {cells.map((c) => {
              const agg = days[c.date];
              const isToday = c.date === today;
              const isSelected = c.date === selectedDay;
              const cellMonth = c.date.slice(0, 7);
              return (
                <Link
                  key={c.date}
                  href={`/?month=${cellMonth}&day=${c.date}`}
                  // 35–42 cells would each prefetch a full month render; fetch on click instead.
                  prefetch={false}
                  aria-label={
                    agg
                      ? `${c.date}，${agg.count} 場，${compact(agg.net)}`
                      : c.date
                  }
                  aria-current={isSelected ? "date" : undefined}
                  className={cn(
                    "flex h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl border text-sm transition",
                    // Desktop: taller cells, date top-left, full amount at the bottom.
                    "lg:h-[92px] lg:items-stretch lg:justify-between lg:p-2.5",
                    agg ? tint(agg.net) : "hover:bg-chip",
                    isSelected
                      ? "border-2 border-fg"
                      : isToday
                        ? "border-accent"
                        : "border-transparent",
                    !c.inMonth && "opacity-35"
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "tnum leading-none",
                        isToday ? "font-bold text-accent" : "font-medium",
                        isSelected && !isToday && "font-bold"
                      )}
                    >
                      {Number(c.date.slice(8, 10))}
                    </span>
                    {isToday && (
                      <span className="hidden text-[11px] font-semibold leading-none text-accent lg:inline">
                        今天
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "tnum min-h-[13px] text-[10.5px] font-semibold leading-none lg:hidden",
                      agg && amountText(agg.net)
                    )}
                  >
                    {agg ? compact(agg.net) : ""}
                  </span>
                  <span className="hidden min-w-0 flex-col gap-1 lg:flex">
                    <span
                      className={cn(
                        "tnum min-h-[15px] truncate text-[15px] font-semibold leading-none",
                        agg && amountText(agg.net)
                      )}
                    >
                      {agg ? formatMoney(agg.net, true) : ""}
                    </span>
                    <span className="min-h-[11px] text-[11px] leading-none text-subtle">
                      {agg && agg.count > 1 ? `${agg.count} 場` : ""}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {aside}
      </div>
    </div>
  );
}
