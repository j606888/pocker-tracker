import Link from "next/link";
import type { Stats } from "@/lib/data/stats";
import { Card } from "@/components/ui/card";
import { CumulativeChart } from "@/components/cumulative-chart";
import { WeekdayBreakdown } from "@/components/weekday-breakdown";
import { formatMoney, cn } from "@/lib/utils";

// Literal class names so Tailwind's scanner picks them up.
function toneText(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-fg";
}

/** Card heading, matching the design's 15px bold section titles. */
function Heading({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 className="text-[15px] font-bold">{children}</h2>
      {aside}
    </div>
  );
}

function StatRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex justify-between gap-3 border-t border-border py-2.5 text-sm">
      <span className="text-subtle">{label}</span>
      <span className={cn("tnum font-semibold", tone)}>{value}</span>
    </div>
  );
}

/** One hero stat; on desktop they sit in a row, split by thin rules. */
function HeroStat({
  label,
  value,
  tone,
  className,
}: {
  label: string;
  value: string;
  tone?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5 lg:gap-1 lg:border-l lg:border-border lg:pl-4", className)}>
      <span className="text-xs text-muted">{label}</span>
      <span className={cn("tnum font-display text-[22px] font-medium lg:text-[26px]", tone)}>
        {value}
      </span>
    </div>
  );
}

/** "Common guideline" range for a cash-game bankroll, in buy-ins. */
const BANKROLL_MIN = 20;
const BANKROLL_MAX = 30;

function BankrollCard({
  bankroll,
  unit,
}: {
  bankroll: number | null;
  unit: number | null;
}) {
  if (bankroll === null || !unit) {
    return (
      <p className="mt-1.5 rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-subtle">
        在
        <Link href="/settings" className="text-accent hover:underline">
          設定
        </Link>
        填入資金池，就能看到夠撐幾個買入。
      </p>
    );
  }

  const buyIns = Math.floor(bankroll / unit);
  const status =
    buyIns < BANKROLL_MIN
      ? { label: "略低於建議", cls: "bg-warn-bg text-warn-fg" }
      : buyIns <= BANKROLL_MAX
        ? { label: "在建議範圍", cls: "bg-accent-soft text-accent" }
        : { label: "很充足", cls: "bg-accent-soft text-accent" };
  const fill = Math.min(buyIns / BANKROLL_MAX, 1) * 100;
  const guideLeft = (BANKROLL_MIN / BANKROLL_MAX) * 100;

  return (
    <div className="mt-1.5 flex flex-col gap-2.5 rounded-xl bg-surface-2 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="tnum text-[13px] font-semibold">
          資金池 {formatMoney(bankroll)}
        </span>
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", status.cls)}>
          {status.label}
        </span>
      </div>
      <span className="tnum font-display text-2xl font-medium">
        {buyIns} 個買入{" "}
        <span className="font-sans text-[13px] font-normal text-muted">
          （以 {unit.toLocaleString("en-US")} 計）
        </span>
      </span>
      <div className="relative h-2 rounded-full bg-border" aria-hidden>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          style={{ width: `${fill}%` }}
        />
        <div
          className="absolute -top-[3px] right-0 h-3.5 rounded-md border-[1.5px] border-dashed border-warn-fg"
          style={{ left: `${guideLeft}%` }}
        />
      </div>
      <span className="text-xs leading-relaxed text-subtle">
        虛線框是常見建議：準備 {BANKROLL_MIN}–{BANKROLL_MAX} 個買入，比較撐得過正常的下風期。
      </span>
    </div>
  );
}

export function StatsOverview({
  stats,
  scopeLabel,
  bankroll,
}: {
  stats: Stats;
  scopeLabel: string;
  bankroll: { bankroll: number | null; unit: number | null };
}) {
  if (stats.count === 0) {
    return (
      <Card className="py-10 text-center text-sm text-muted">
        這段期間還沒有紀錄。
      </Card>
    );
  }

  const winPct = Math.round(stats.winRate * 100);
  const avg = Math.round(stats.avgNet);
  const roi =
    stats.roi === null
      ? "—"
      : `${stats.roi > 0 ? "+" : stats.roi < 0 ? "−" : ""}${Math.abs(stats.roi * 100).toFixed(1)}%`;

  const maxMood = Math.max(...stats.byMood.map((m) => Math.abs(m.net)), 1);
  const rough = stats.byMood.filter(
    (m) => m.mood === "TIRED" || m.mood === "TILT"
  );
  const roughCount = rough.reduce((a, m) => a + m.count, 0);
  const roughNet = rough.reduce((a, m) => a + m.net, 0);

  return (
    <div className="flex flex-col gap-3.5 lg:gap-5">
      {/* Hero */}
      <section className="flex flex-col gap-3.5 rounded-2xl border border-border bg-surface px-4 py-[18px] lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-12 lg:gap-y-6 lg:px-7 lg:py-6">
        <div className="flex flex-col gap-3.5 lg:flex-[1_1_260px] lg:gap-3">
          <span className="text-[13px] text-muted">{scopeLabel}淨利 · TWD</span>
          <span
            className={cn(
              "tnum font-display text-[46px] font-medium leading-none lg:text-[60px]",
              toneText(stats.totalNet)
            )}
          >
            {formatMoney(stats.totalNet, true)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-border pt-3 lg:flex-[2_1_440px] lg:grid-cols-4 lg:gap-4 lg:border-t-0 lg:pt-0">
          <HeroStat label="場次" value={String(stats.count)} />
          <HeroStat label="勝率" value={`${winPct}%`} />
          <HeroStat label="平均每場" value={formatMoney(avg, true)} tone={toneText(avg)} />
          {/* Desktop only: no room for a fourth column on a phone. */}
          <HeroStat
            label="ROI"
            value={roi}
            tone={stats.roi === null ? undefined : toneText(stats.roi)}
            className="hidden lg:flex"
          />
        </div>
      </section>

      <Card className="flex flex-col gap-2.5 p-4">
        <Heading
          aside={
            <span className={cn("tnum text-sm font-semibold", toneText(stats.totalNet))}>
              {formatMoney(stats.totalNet, true)}
            </span>
          }
        >
          累積淨利
        </Heading>
        <CumulativeChart curve={stats.curve} maxDrawdown={stats.maxDrawdown} />
      </Card>

      <div className="flex flex-col gap-3.5 lg:grid lg:grid-cols-2 lg:items-start lg:gap-5">
        <div className="flex flex-col gap-3.5 lg:gap-5">
          <Card className="flex flex-col gap-1 p-4">
            <Heading
              aside={
                stats.unmarkedMood > 0 ? (
                  <span className="text-xs text-muted">
                    {stats.unmarkedMood} 場未標記
                  </span>
                ) : null
              }
            >
              依心態
            </Heading>
            {stats.byMood.length === 0 ? (
              <p className="py-3 text-[13px] text-muted">
                記一筆時點選心態，這裡就會看出不同狀態下的輸贏。
              </p>
            ) : (
              <>
                {stats.byMood.map((m) => (
                  <div
                    key={m.mood}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-border py-2.5 text-sm last:border-b-0"
                  >
                    <span>{m.label}</span>
                    <div className="h-2 rounded-full bg-chip" aria-hidden>
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          m.net >= 0 ? "bg-positive" : "bg-negative"
                        )}
                        style={{ width: `${(Math.abs(m.net) / maxMood) * 100}%` }}
                      />
                    </div>
                    <span className={cn("tnum min-w-[7rem] text-right font-semibold", toneText(m.net))}>
                      {m.count} 場 · {formatMoney(m.net, true)}
                    </span>
                  </div>
                ))}
                {roughCount > 0 && roughNet < 0 && (
                  <p className="mt-1.5 rounded-xl bg-surface-2 px-3 py-2.5 text-[13px] leading-relaxed text-subtle">
                    疲累或上頭的 {roughCount} 場合計 {formatMoney(roughNet, true)}
                    。狀態不好時，考慮早點離桌。
                  </p>
                )}
              </>
            )}
          </Card>

          {stats.byVenue.length > 0 && (
            <Card className="flex flex-col p-4 pb-1.5">
              <Heading
                aside={
                  stats.unmarkedVenue > 0 ? (
                    <span className="text-xs text-muted">
                      {stats.unmarkedVenue} 場未標記
                    </span>
                  ) : null
                }
              >
                依場子
              </Heading>
              <div className="mt-1.5">
                {stats.byVenue.map((v) => (
                  <StatRow
                    key={v.label}
                    label={v.label}
                    value={`${v.count} 場 · ${formatMoney(v.net, true)}`}
                    tone={toneText(v.net)}
                  />
                ))}
              </div>
            </Card>
          )}

          <WeekdayBreakdown byWeekday={stats.byWeekday} />
        </div>

        <div className="flex flex-col gap-3.5 lg:gap-5">
          <Card className="flex flex-col p-4">
            <Heading>風險與波動</Heading>
            <div className="mt-1.5">
              <StatRow
                label="最大回撤"
                value={
                  stats.maxDrawdown ? formatMoney(stats.maxDrawdown.amount, true) : "—"
                }
                tone={stats.maxDrawdown ? "text-negative" : undefined}
              />
              <StatRow
                label="每場標準差"
                value={
                  stats.stdDev === null
                    ? "—"
                    : `±${formatMoney(Math.round(stats.stdDev / 10) * 10)}`
                }
              />
              <StatRow
                label="最大單敗"
                value={stats.biggestLoss < 0 ? formatMoney(stats.biggestLoss, true) : "—"}
                tone={stats.biggestLoss < 0 ? "text-negative" : undefined}
              />
              <StatRow label="最長連敗" value={`${stats.longestLoseStreak} 場`} />
            </div>
            <BankrollCard {...bankroll} />
          </Card>

          {stats.byLevel.length > 0 && (
            <Card className="flex flex-col gap-1.5 p-4">
              <Heading>依級別</Heading>
              <table className="tnum w-full border-collapse text-sm">
                <thead>
                  <tr className="text-xs text-muted">
                    <th className="border-b border-border py-1.5 text-left font-semibold">級別</th>
                    <th className="border-b border-border py-1.5 text-right font-semibold">場次</th>
                    <th className="border-b border-border py-1.5 text-right font-semibold">淨利</th>
                    <th className="border-b border-border py-1.5 text-right font-semibold">平均</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.byLevel.map((lv) => {
                    const lvAvg = Math.round(lv.net / lv.count);
                    return (
                      <tr key={lv.label} className="border-b border-border last:border-b-0">
                        <td className="py-2.5">
                          <span className="rounded-md bg-chip px-2 py-0.5 text-xs font-semibold text-subtle">
                            {lv.label}
                          </span>
                        </td>
                        <td className="py-2.5 text-right">{lv.count}</td>
                        <td className={cn("py-2.5 text-right font-semibold", toneText(lv.net))}>
                          {formatMoney(lv.net, true)}
                        </td>
                        <td className={cn("py-2.5 text-right font-semibold", toneText(lvAvg))}>
                          {formatMoney(lvAvg, true)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
