import { requireUserId } from "@/lib/session-user";
import { getSessionsGroupedByDay } from "@/lib/data/sessions";
import { normalizeMonth } from "@/lib/date-grid";
import { MonthCalendar, type DayAgg } from "@/components/month-calendar";
import { DayDetail } from "@/components/day-detail";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; day?: string }>;
}) {
  const { month: monthParam, day: dayParam } = await searchParams;
  const userId = await requireUserId();

  const month = normalizeMonth(monthParam);
  const today = new Date().toISOString().slice(0, 10);
  // Default to today's detail when the displayed month contains today.
  const selectedDay =
    dayParam ?? (today.startsWith(month) ? today : undefined);

  const groups = await getSessionsGroupedByDay(userId, month);

  const days: Record<string, DayAgg> = {};
  let monthNet = 0;
  for (const g of groups) {
    days[g.date] = { net: g.dayNet, count: g.sessions.length };
    monthNet += g.dayNet;
  }

  const selectedGroup = selectedDay
    ? groups.find((g) => g.date === selectedDay)
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <MonthCalendar
        month={month}
        monthNet={monthNet}
        days={days}
        selectedDay={selectedDay}
        today={today}
      />

      {selectedDay && <DayDetail date={selectedDay} group={selectedGroup} />}
    </div>
  );
}
