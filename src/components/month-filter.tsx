import Link from "next/link";
import { cn } from "@/lib/utils";

function monthLabel(m: string) {
  const [y, mm] = m.split("-");
  return `${y}/${mm}`;
}

const base =
  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition";
const on = "border-accent bg-accent-soft text-accent";
const off = "border-border bg-surface text-subtle hover:border-accent/40";

export function MonthFilter({
  months,
  active,
  basePath = "/",
}: {
  months: string[];
  active?: string;
  /** Route the pills point at (e.g. "/report"). Defaults to "/". */
  basePath?: string;
}) {
  if (months.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={basePath} className={cn(base, active ? off : on)}>
        全期
      </Link>
      {months.map((m) => (
        <Link
          key={m}
          href={`${basePath}?month=${m}`}
          className={cn(base, active === m ? on : off)}
        >
          {monthLabel(m)}
        </Link>
      ))}
    </div>
  );
}
