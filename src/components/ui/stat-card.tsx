import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  tone = "neutral",
  hint,
  emphasis = false,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  hint?: string;
  emphasis?: boolean;
}) {
  const toneClass =
    tone === "positive"
      ? "text-positive"
      : tone === "negative"
        ? "text-negative"
        : "text-fg";

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface px-4 py-3.5">
      <span className="text-xs uppercase tracking-wider text-muted">
        {label}
      </span>
      <span
        className={cn(
          "font-display tnum leading-none",
          emphasis ? "text-4xl font-medium" : "text-2xl",
          toneClass
        )}
      >
        {value}
      </span>
      {hint && <span className="text-xs text-muted">{hint}</span>}
    </div>
  );
}
