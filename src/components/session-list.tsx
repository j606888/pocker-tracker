import Link from "next/link";
import type { SessionRow } from "@/lib/data/sessions";
import { moodLabel } from "@/lib/mood";
import { formatMoney, cn } from "@/lib/utils";

function toneClass(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-muted";
}

const num = (n: number) => n.toLocaleString("en-US");

/**
 * One session in the day detail. Tapping opens the edit page, where delete
 * lives behind a confirm — nothing destructive sits on the row itself.
 */
export function SessionRowItem({
  s,
  readOnly = false,
}: {
  s: SessionRow;
  readOnly?: boolean;
}) {
  const unit = Math.round(s.buyIn / (1 + s.rebuys));
  const meta = [
    s.venueName,
    moodLabel(s.mood),
    s.rake > 0 ? `水 ${num(s.rake)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const body = (
    <>
      <span className="tnum min-w-[3.25rem] rounded-md bg-chip px-2 py-0.5 text-center text-xs font-semibold text-subtle">
        {s.levelLabel ?? num(unit)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="tnum text-[13px] text-fg">
          入 {num(s.buyIn)}
          {s.rebuys > 0 && `（加買 ${s.rebuys}）`} → {num(s.cashOut)}
        </span>
        {meta && <span className="truncate text-xs text-muted">{meta}</span>}
        {s.note && <span className="truncate text-xs text-muted">{s.note}</span>}
      </div>
      <span className={cn("tnum text-base font-semibold", toneClass(s.net))}>
        {formatMoney(s.net, true)}
      </span>
    </>
  );

  const rowClass =
    "flex items-center gap-3 border-b border-border/70 py-3 last:border-b-0";

  if (readOnly) return <div className={rowClass}>{body}</div>;

  return (
    <Link
      href={`/sessions/${s.id}/edit`}
      className={cn(rowClass, "-mx-2 rounded-lg px-2 transition hover:bg-chip")}
    >
      {body}
      <span className="text-lg text-muted" aria-hidden>
        ›
      </span>
    </Link>
  );
}
