import { cn } from "@/lib/utils";

const W = 300;
const H = 64;
const PAD = 6;

/** Cumulative-net sparkline: faint zero line, area fill, emphasized endpoint. */
export function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div className="grid h-16 place-items-center text-xs text-muted">
        資料還太少，畫不出走勢
      </div>
    );
  }

  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;

  const x = (i: number) => (i / (values.length - 1)) * (W - PAD * 2) + PAD;
  const y = (v: number) => H - PAD - ((v - min) / span) * (H - PAD * 2);

  const line = values.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${W - PAD},${H - PAD}`;
  const last = values[values.length - 1];
  const tone = last >= 0 ? "text-positive" : "text-negative";
  const zeroY = y(0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn("h-16 w-full", tone)}
      role="img"
      aria-label="累積淨利走勢"
    >
      <polygon points={area} fill="currentColor" fillOpacity={0.1} />
      {min < 0 && max > 0 && (
        <line
          x1={PAD}
          x2={W - PAD}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--border)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={x(values.length - 1)} cy={y(last)} r={3} fill="currentColor" />
    </svg>
  );
}
