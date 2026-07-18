import type { WeekdayStat } from "@/lib/data/stats";
import { Card } from "@/components/ui/card";
import { cn, formatMoney } from "@/lib/utils";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function toneText(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-muted";
}

export function WeekdayBreakdown({ byWeekday }: { byWeekday: WeekdayStat[] }) {
  const played = byWeekday.filter((w) => w.count > 0);
  if (played.length === 0) return null;

  const maxAbs = Math.max(...byWeekday.map((w) => Math.abs(w.net)), 1);
  const bestIdx = played.reduce((a, b) => (b.net > a.net ? b : a)).weekday;
  const worstIdx = played.reduce((a, b) => (b.net < a.net ? b : a)).weekday;

  return (
    <Card className="flex flex-col gap-3">
      <span className="text-xs uppercase tracking-wider text-muted">
        週幾分析
      </span>
      <div className="grid grid-cols-7 gap-1.5">
        {byWeekday.map((w) => {
          const h = Math.round((Math.abs(w.net) / maxAbs) * 100);
          const isBest = w.count > 0 && w.weekday === bestIdx;
          const isWorst = w.count > 0 && w.weekday === worstIdx;
          return (
            <div key={w.weekday} className="flex flex-col items-center gap-1">
              <div className="flex h-20 w-full flex-col">
                <div className="flex flex-1 items-end justify-center">
                  {w.net > 0 && (
                    <div
                      className="w-2.5 rounded-t bg-positive"
                      style={{ height: `${h}%` }}
                    />
                  )}
                </div>
                <div className="h-px w-full bg-border" />
                <div className="flex flex-1 items-start justify-center">
                  {w.net < 0 && (
                    <div
                      className="w-2.5 rounded-b bg-negative"
                      style={{ height: `${h}%` }}
                    />
                  )}
                </div>
              </div>
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                  isBest && "bg-positive/15 font-semibold text-positive",
                  isWorst && "bg-negative/15 font-semibold text-negative",
                  !isBest && !isWorst && "text-subtle"
                )}
              >
                {WEEKDAYS[w.weekday]}
              </span>
              <span className={cn("tnum text-[10px]", toneText(w.net))}>
                {w.count ? formatMoney(w.net, true) : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
