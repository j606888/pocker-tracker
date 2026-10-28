import Link from "next/link";
import { requireUserId } from "@/lib/session-user";
import {
  getStats,
  getBankroll,
  normalizeRange,
  RANGES,
} from "@/lib/data/stats";
import { StatsOverview } from "@/components/stats-overview";
import { cn } from "@/lib/utils";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeParam } = await searchParams;
  const range = normalizeRange(rangeParam);
  const userId = await requireUserId();

  const [stats, bankroll] = await Promise.all([
    getStats(userId, range),
    getBankroll(userId),
  ]);
  const scopeLabel = RANGES.find((r) => r.value === range)!.label;

  return (
    <div className="flex flex-col gap-3.5 lg:gap-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-[26px] font-medium lg:text-[30px]">報表</h1>
        <nav
          aria-label="期間"
          className="flex gap-0.5 rounded-[10px] bg-chip p-[3px]"
        >
          {RANGES.map((r) => (
            <Link
              key={r.value}
              href={r.value === "month" ? "/report" : `/report?range=${r.value}`}
              aria-current={r.value === range ? "page" : undefined}
              className={cn(
                "flex h-8 items-center rounded-lg px-2.5 text-[13px] font-semibold transition",
                r.value === range
                  ? "bg-surface text-fg shadow-sm"
                  : "text-subtle hover:text-fg"
              )}
            >
              {r.label}
            </Link>
          ))}
        </nav>
      </div>
      <StatsOverview stats={stats} scopeLabel={scopeLabel} bankroll={bankroll} />
    </div>
  );
}
