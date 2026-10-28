import Link from "next/link";
import { cn } from "@/lib/utils";
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
}: {
  month: string;
  /** date (YYYY-MM-DD) -> aggregates for that day */
  days: Record<string, DayAgg>;
  selectedDay?: string;
  today: string;
  /** Rendered between the month header and the grid. */
  summary?: React.ReactNode;
}) {
  // Drop a trailing week that belongs entirely to the next month.
  const grid = buildMonthGrid(month);
  const cells = grid.slice(35).some((c) => c.inMonth) ? grid : grid.slice(0, 35);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href={`/?month=${prevMonth(month)}`} aria-label="上個月" className={arrowClass}>
          ‹
        </Link>
        <span className="font-display text-xl font-medium tnum">
          {monthLabel(month)}
        </span>
        <Link href={`/?month=${nextMonth(month)}`} aria-label="下個月" className={arrowClass}>
          ›
        </Link>
      </div>

      {summary}

      <div className="flex flex-col gap-1">
        <div className="grid grid-cols-7 text-center text-xs text-muted">
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-1">
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
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
                  agg ? tint(agg.net) : "hover:bg-chip",
                  isSelected
                    ? "border-2 border-fg"
                    : isToday
                      ? "border-accent"
                      : "border-transparent",
                  !c.inMonth && "opacity-35"
                )}
              >
                <span
                  className={cn(
                    "tnum leading-none",
                    isToday ? "font-bold text-accent" : "font-medium",
                    isSelected && !isToday && "font-bold"
                  )}
                >
                  {Number(c.date.slice(8, 10))}
                </span>
                <span
                  className={cn(
                    "tnum min-h-[13px] text-[10.5px] font-semibold leading-none",
                    agg && amountText(agg.net)
                  )}
                >
                  {agg ? compact(agg.net) : ""}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
