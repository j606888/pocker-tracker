/**
 * Calendar-grid helpers. All in UTC to match `dayKey` in data/sessions.ts,
 * which formats @db.Date (stored at UTC midnight) via toISOString().slice(0,10).
 */

export type GridCell = {
  /** YYYY-MM-DD */
  date: string;
  /** false for leading/trailing days that spill from adjacent months */
  inMonth: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Current month as "YYYY-MM" in UTC. */
export function currentMonth(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
}

/** Validate/normalize a "YYYY-MM" input, falling back to the current month. */
export function normalizeMonth(month?: string): string {
  return month && /^\d{4}-\d{2}$/.test(month) ? month : currentMonth();
}

function parse(month: string): [number, number] {
  const [y, m] = month.split("-").map(Number);
  return [y, m]; // m is 1-based
}

export function prevMonth(month: string): string {
  const [y, m] = parse(month);
  return m === 1 ? `${y - 1}-12` : `${y}-${pad(m - 1)}`;
}

export function nextMonth(month: string): string {
  const [y, m] = parse(month);
  return m === 12 ? `${y + 1}-01` : `${y}-${pad(m + 1)}`;
}

/** "2026-07" -> "2026 / 07" label. */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-");
  return `${y} / ${m}`;
}

/**
 * 6 weeks x 7 days (Sun-first) covering the given month, with spill days
 * from the neighbouring months filled in.
 */
export function buildMonthGrid(month: string): GridCell[] {
  const [y, m] = parse(month);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const start = new Date(first);
  start.setUTCDate(1 - first.getUTCDay()); // back up to the Sunday of week 1

  const cells: GridCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    cells.push({ date, inMonth: d.getUTCMonth() === m - 1 });
  }
  return cells;
}
