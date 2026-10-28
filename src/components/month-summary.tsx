import { cn, formatMoney } from "@/lib/utils";

function toneText(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-fg";
}

/** Headline card above the calendar: month net, then sessions / win rate / average. */
export function MonthSummary({
  net,
  count,
  wins,
}: {
  net: number;
  count: number;
  wins: number;
}) {
  const winPct = count ? Math.round((wins / count) * 100) : 0;
  const avg = count ? Math.round(net / count) : 0;

  return (
    <section className="flex flex-col gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3.5 lg:grid lg:grid-cols-4 lg:gap-4 lg:px-6 lg:py-5">
      <div className="flex items-baseline justify-between lg:flex-col lg:items-start lg:justify-start lg:gap-2">
        <span className="text-[13px] text-muted">本月淨利</span>
        <span
          className={cn(
            "tnum font-display text-3xl font-medium leading-none lg:text-[34px]",
            toneText(net)
          )}
        >
          {formatMoney(net, true)}
        </span>
      </div>
      {/* Desktop: the three stats sit beside the net, one column each. */}
      <div className="grid grid-cols-3 gap-2 border-t border-border pt-2.5 lg:col-span-3 lg:gap-4 lg:border-t-0 lg:pt-0">
        <div className="flex flex-col gap-0.5 lg:gap-2">
          <span className="text-xs text-muted lg:text-[13px]">場次</span>
          <span className="tnum text-base font-semibold lg:font-display lg:text-[26px] lg:font-medium lg:leading-tight">{count}</span>
        </div>
        <div className="flex flex-col gap-0.5 lg:gap-2">
          <span className="text-xs text-muted lg:text-[13px]">勝率</span>
          <span className="tnum text-base font-semibold lg:font-display lg:text-[26px] lg:font-medium lg:leading-tight">
            {count ? `${winPct}%` : "—"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 lg:gap-2">
          <span className="text-xs text-muted lg:text-[13px]">平均每場</span>
          <span className={cn("tnum text-base font-semibold lg:font-display lg:text-[26px] lg:font-medium lg:leading-tight", toneText(avg))}>
            {count ? formatMoney(avg, true) : "—"}
          </span>
        </div>
      </div>
    </section>
  );
}
