import type { Stats } from "@/lib/data/stats";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Sparkline } from "@/components/ui/sparkline";
import { WeekdayBreakdown } from "@/components/weekday-breakdown";
import { formatMoney, cn } from "@/lib/utils";

function tone(n: number) {
  return n > 0 ? "positive" : n < 0 ? "negative" : "neutral";
}

// Literal class names so Tailwind's scanner picks them up.
function toneText(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-muted";
}

/** YYYY-MM-DD -> "M/D" */
function shortDate(date: string) {
  const d = new Date(`${date}T00:00:00.000Z`);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function pct(n: number) {
  return `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(Math.round(n * 100))}%`;
}

export function StatsOverview({
  stats,
  scopeLabel,
}: {
  stats: Stats;
  scopeLabel: string;
}) {
  const winPct = Math.round(stats.winRate * 100);

  return (
    <div className="flex flex-col gap-4">
      <StatCard
        label={`${scopeLabel}淨利 · TWD`}
        value={formatMoney(stats.totalNet, true)}
        tone={tone(stats.totalNet)}
        hint={`${stats.count} 場 · 勝率 ${winPct}%`}
        emphasis
      />

      <Card className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase tracking-wider text-muted">
            累積淨利
          </span>
          <span className={cn("tnum text-sm font-semibold", toneText(stats.totalNet))}>
            {formatMoney(stats.totalNet, true)}
          </span>
        </div>
        <Sparkline values={stats.cumulative.map((c) => c.value)} />
      </Card>

      {/* Core poker metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="勝率" value={`${winPct}%`} hint={`${stats.wins}/${stats.count} 場`} />
        <StatCard
          label="ROI"
          value={pct(stats.roi)}
          tone={tone(stats.roi)}
          hint="淨利 / 總買入"
        />
        <StatCard
          label="平均每場"
          value={formatMoney(Math.round(stats.avgNet), true)}
          tone={tone(stats.avgNet)}
        />
        <StatCard label="總買入量" value={formatMoney(stats.totalBuyIn)} />
      </div>

      {/* Extremes & streaks */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="最大單場" value={formatMoney(stats.biggestWin, true)} tone="positive" />
        <StatCard label="最大單敗" value={formatMoney(stats.biggestLoss, true)} tone={stats.biggestLoss < 0 ? "negative" : "neutral"} />
        <StatCard
          label="最佳單日"
          value={stats.bestDay ? formatMoney(stats.bestDay.net, true) : "—"}
          tone="positive"
          hint={stats.bestDay ? shortDate(stats.bestDay.date) : undefined}
        />
        <StatCard
          label="最差單日"
          value={stats.worstDay ? formatMoney(stats.worstDay.net, true) : "—"}
          tone={stats.worstDay && stats.worstDay.net < 0 ? "negative" : "neutral"}
          hint={stats.worstDay ? shortDate(stats.worstDay.date) : undefined}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="最長連勝"
          value={`${stats.longestWinStreak} 場`}
          tone={stats.longestWinStreak > 0 ? "positive" : "neutral"}
        />
        <StatCard
          label="最長連敗"
          value={`${stats.longestLoseStreak} 場`}
          tone={stats.longestLoseStreak > 0 ? "negative" : "neutral"}
        />
        <StatCard label="水費支出" value={formatMoney(stats.totalRake)} />
      </div>

      <WeekdayBreakdown byWeekday={stats.byWeekday} />

      {stats.byLevel.length > 0 && (
        <Card className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-muted">
            依級別
          </span>
          <div className="flex flex-col">
            {stats.byLevel.map((lv) => (
              <div
                key={lv.label}
                className="flex items-center gap-3 border-b border-border/70 py-2 text-sm last:border-b-0"
              >
                <span className="min-w-[3.25rem] rounded-md bg-chip px-2 py-0.5 text-center text-xs font-semibold text-subtle">
                  {lv.label}
                </span>
                <span className="text-muted">{lv.count} 場</span>
                <span
                  className={cn("tnum ml-auto font-semibold", toneText(lv.net))}
                >
                  {formatMoney(lv.net, true)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
