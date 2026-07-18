import Link from "next/link";
import type { DayGroup, SessionRow } from "@/lib/data/sessions";
import { deleteSession } from "@/lib/actions/sessions";
import { formatMoney, cn } from "@/lib/utils";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function label(date: string) {
  const d = new Date(`${date}T00:00:00.000Z`);
  const md = `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${md} 週${WEEKDAYS[d.getUTCDay()]}`;
}

function toneClass(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-muted";
}

export function SessionRowItem({ s }: { s: SessionRow }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/70 py-2.5 last:border-b-0">
      <span className="min-w-[3.25rem] rounded-md bg-chip px-2 py-0.5 text-center text-xs font-semibold text-subtle">
        {s.levelLabel ?? s.buyIn}
      </span>
      <span className="tnum text-sm text-subtle">
        入{s.buyIn.toLocaleString("en-US")} → {s.cashOut.toLocaleString("en-US")}
        {s.rake > 0 && (
          <span className="text-muted"> · 水{s.rake}</span>
        )}
      </span>
      {s.note && (
        <span className="hidden truncate text-xs text-muted sm:inline">
          {s.note}
        </span>
      )}

      <span className={cn("tnum ml-auto text-sm font-semibold", toneClass(s.net))}>
        {formatMoney(s.net, true)}
      </span>

      <div className="flex items-center gap-1">
        <Link
          href={`/sessions/${s.id}/edit`}
          className="rounded-md px-2 py-1 text-xs text-muted transition hover:bg-chip hover:text-fg"
        >
          編輯
        </Link>
        <form action={deleteSession}>
          <input type="hidden" name="id" value={s.id} />
          <button
            type="submit"
            className="rounded-md px-2 py-1 text-xs text-muted transition hover:bg-chip hover:text-negative"
          >
            刪除
          </button>
        </form>
      </div>
    </div>
  );
}

export function SessionList({ groups }: { groups: DayGroup[] }) {
  if (groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        還沒有紀錄，用上面的表單記第一筆吧。
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {groups.map((g) => (
        <div key={g.date} className="rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="flex items-baseline gap-2 border-b border-border pb-2">
            <span className="text-sm font-medium">{label(g.date)}</span>
            <span
              className={cn(
                "tnum ml-auto font-display text-base font-medium",
                toneClass(g.dayNet)
              )}
            >
              {formatMoney(g.dayNet, true)}
            </span>
          </div>
          <div className="pt-1">
            {g.sessions.map((s) => (
              <SessionRowItem key={s.id} s={s} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
