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

function toneText(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-muted";
}
function dotColor(n: number) {
  return n > 0 ? "bg-positive" : n < 0 ? "bg-negative" : "bg-muted";
}

const arrowClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border text-lg text-subtle transition hover:bg-chip";

export function MonthCalendar({
  month,
  monthNet,
  days,
  selectedDay,
  today,
}: {
  month: string;
  monthNet: number;
  /** date (YYYY-MM-DD) -> aggregates for that day */
  days: Record<string, DayAgg>;
  selectedDay?: string;
  today: string;
}) {
  const cells = buildMonthGrid(month);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Link href={`/?month=${prevMonth(month)}`} aria-label="上個月" className={arrowClass}>
          ‹
        </Link>
        <div className="flex flex-col items-center leading-tight">
          <span className="font-display text-lg font-medium tnum">
            {monthLabel(month)}
          </span>
          <span className={cn("tnum text-sm font-semibold", toneText(monthNet))}>
            {formatMoney(monthNet, true)}
          </span>
        </div>
        <Link href={`/?month=${nextMonth(month)}`} aria-label="下個月" className={arrowClass}>
          ›
        </Link>
      </div>

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
              // 42 cells would each prefetch a full month render; fetch on click instead.
              prefetch={false}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-sm transition",
                isSelected
                  ? "border-accent bg-accent-soft"
                  : "border-transparent hover:bg-chip",
                isToday && !isSelected && "border-accent/50",
                !c.inMonth && "opacity-35"
              )}
            >
              <span className={cn("tnum", isToday && "font-semibold text-accent")}>
                {Number(c.date.slice(8, 10))}
              </span>
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  agg ? dotColor(agg.net) : "bg-transparent"
                )}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
