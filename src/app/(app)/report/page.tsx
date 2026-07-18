import { requireUserId } from "@/lib/session-user";
import { getStats, getAvailableMonths } from "@/lib/data/stats";
import { StatsOverview } from "@/components/stats-overview";
import { MonthFilter } from "@/components/month-filter";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const userId = await requireUserId();

  const [stats, months] = await Promise.all([
    getStats(userId, month),
    getAvailableMonths(userId),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-medium">報表</h1>
      <MonthFilter months={months} active={month} basePath="/report" />
      <StatsOverview stats={stats} scopeLabel={month ? "當月" : "總"} />
    </div>
  );
}
