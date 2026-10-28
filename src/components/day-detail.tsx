import type { DayGroup } from "@/lib/data/sessions";
import { SessionRowItem } from "@/components/session-list";
import { cn, formatMoney } from "@/lib/utils";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function label(date: string) {
  const d = new Date(`${date}T00:00:00.000Z`);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} 週${WEEKDAYS[d.getUTCDay()]}`;
}

function toneText(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-muted";
}

export function DayDetail({
  date,
  group,
  readOnly = false,
}: {
  date: string;
  group?: DayGroup;
  readOnly?: boolean;
}) {
  const sessions = group?.sessions ?? [];
  const net = group?.dayNet ?? 0;
  const count = sessions.length;
  const wins = sessions.filter((s) => s.net > 0).length;
  const losses = sessions.filter((s) => s.net < 0).length;

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-surface px-4 pb-1 pt-3.5">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[17px] font-medium">{label(date)}</span>
        {count > 0 && (
          <span
            className={cn(
              "tnum ml-auto font-display text-xl font-medium",
              toneText(net)
            )}
          >
            {formatMoney(net, true)}
          </span>
        )}
      </div>

      {count === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          {readOnly ? "這天沒有紀錄。" : "這天還沒有紀錄，用下方「＋」記一筆。"}
        </p>
      ) : (
        <>
          <span className="border-b border-border pb-2.5 pt-0.5 text-[13px] text-muted">
            {count} 場 · 勝 {wins} 敗 {losses}
          </span>
          <div className="flex flex-col">
            {sessions.map((s) => (
              <SessionRowItem key={s.id} s={s} readOnly={readOnly} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
