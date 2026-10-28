import type { Stats } from "@/lib/data/stats";
import { formatMoney } from "@/lib/utils";

const W = 320;
const H = 140;
const PAD = 8;

/** YYYY-MM-DD -> "M/D" */
function shortDate(date: string) {
  const d = new Date(`${date}T00:00:00.000Z`);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

/**
 * Running net after each session, with the deepest drawdown shaded so a bad
 * stretch reads as "normal variance of this size" rather than a surprise.
 */
export function CumulativeChart({
  curve,
  maxDrawdown,
}: {
  curve: Stats["curve"];
  maxDrawdown: Stats["maxDrawdown"];
}) {
  if (curve.length < 3) {
    return (
      <div className="grid h-24 place-items-center text-xs text-muted">
        資料還太少，畫不出走勢
      </div>
    );
  }

  const values = curve.map((p) => p.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const x = (i: number) => (i / (curve.length - 1)) * (W - PAD * 2) + PAD;
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);

  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const last = values[values.length - 1];
  const dd = maxDrawdown;
  const first = curve[1].date!;
  const end = curve[curve.length - 1].date!;

  return (
    <div className="flex flex-col gap-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`累積淨利走勢，目前 ${formatMoney(last, true)}${
          dd ? `，最大回撤 ${formatMoney(dd.amount, true)}` : ""
        }`}
      >
        {dd && (
          <rect
            x={x(dd.peakIndex)}
            y={0}
            width={x(dd.troughIndex) - x(dd.peakIndex)}
            height={H}
            fill="var(--negative)"
            fillOpacity={0.1}
          />
        )}
        <line
          x1={PAD}
          x2={W - PAD}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <polyline
          points={line}
          fill="none"
          stroke={last >= 0 ? "var(--positive)" : "var(--negative)"}
          strokeWidth={2.2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {dd && (
          <>
            <circle
              cx={x(dd.peakIndex)}
              cy={y(values[dd.peakIndex])}
              r={3.5}
              fill="var(--surface)"
              stroke="var(--negative)"
              strokeWidth={1.6}
            />
            <circle
              cx={x(dd.troughIndex)}
              cy={y(values[dd.troughIndex])}
              r={3.5}
              fill="var(--surface)"
              stroke="var(--negative)"
              strokeWidth={1.6}
            />
          </>
        )}
        <circle
          cx={x(values.length - 1)}
          cy={y(last)}
          r={4}
          fill={last >= 0 ? "var(--positive)" : "var(--negative)"}
        />
      </svg>

      <div className="tnum flex justify-between text-[11px] text-muted">
        <span>{shortDate(first)}</span>
        <span>{shortDate(end)}</span>
      </div>

      {dd && (
        <div className="flex items-center gap-2 text-xs text-subtle">
          <span className="h-2.5 w-3.5 rounded-sm bg-negative/20" aria-hidden />
          最大回撤 {formatMoney(dd.amount, true)}（
          {curve[dd.peakIndex].date
            ? `${shortDate(curve[dd.peakIndex].date!)} 高點`
            : "起點"}{" "}
          → {shortDate(curve[dd.troughIndex].date!)}）
        </div>
      )}
    </div>
  );
}
