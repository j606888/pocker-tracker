import { requireUserId, getActingAdminId } from "@/lib/session-user";
import { getSessionsGroupedByDay } from "@/lib/data/sessions";
import { normalizeMonth } from "@/lib/date-grid";
import { MonthCalendar, type DayAgg } from "@/components/month-calendar";
import { MonthSummary } from "@/components/month-summary";
import { DayDetail } from "@/components/day-detail";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  const { month: monthParam, day: dayParam } = await searchParams;
  const userId = await requireUserId();
  const readOnly = !!(await getActingAdminId());

  const month = normalizeMonth(monthParam);
  const today = new Date().toISOString().slice(0, 10);
  // Default to today's detail when the displayed month contains today.
  const selectedDay =
    dayParam ?? (today.startsWith(month) ? today : undefined);

  const groups = await getSessionsGroupedByDay(userId, month);

  const days: Record<string, DayAgg> = {};
  let monthNet = 0;
  let count = 0;
  let wins = 0;
  for (const g of groups) {
    days[g.date] = { net: g.dayNet, count: g.sessions.length };
    monthNet += g.dayNet;
    count += g.sessions.length;
    wins += g.sessions.filter((s) => s.net > 0).length;
  }

  const selectedGroup = selectedDay
    ? groups.find((g) => g.date === selectedDay)
    : undefined;

  return (
    <MonthCalendar
      month={month}
      days={days}
      selectedDay={selectedDay}
      today={today}
      summary={<MonthSummary net={monthNet} count={count} wins={wins} />}
      aside={
        selectedDay && (
          <DayDetail
            date={selectedDay}
            group={selectedGroup}
            readOnly={readOnly}
          />
        )
      }
    />
  );
}
