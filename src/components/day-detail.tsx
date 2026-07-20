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

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl bg-chip px-3 py-2">
      <span className="text-[11px] text-muted">{label}</span>
      <span className={cn("tnum text-sm font-semibold", tone)}>{value}</span>
    </div>
  );
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
  const winPct = count ? Math.round((wins / count) * 100) : 0;
  const totalBuyIn = sessions.reduce((a, s) => a + s.buyIn, 0);
  const totalCashOut = sessions.reduce((a, s) => a + s.cashOut, 0);
  const totalRake = sessions.reduce((a, s) => a + s.rake, 0);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-baseline gap-2 border-b border-border pb-2">
        <span className="font-display text-base font-medium">{label(date)}</span>
        {count > 0 && (
          <span
            className={cn(
              "tnum ml-auto font-display text-lg font-medium",
              toneText(net)
            )}
          >
            {formatMoney(net, true)}
          </span>
        )}
      </div>

      {count === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          這天還沒有紀錄，用下方「＋」記一筆。
        </p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="場次" value={`${count}`} />
            <Stat label="勝率" value={`${winPct}%`} />
            <Stat label="水費" value={formatMoney(totalRake)} />
            <Stat label="總買入" value={formatMoney(totalBuyIn)} />
            <Stat label="總帶出" value={formatMoney(totalCashOut)} />
            <Stat
              label="淨利"
              value={formatMoney(net, true)}
              tone={toneText(net)}
            />
          </div>

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
