import { prisma } from "@/lib/prisma";

export type SessionRow = {
  id: string;
  playedAt: Date;
  buyIn: number;
  cashOut: number;
  rake: number;
  note: string | null;
  levelLabel: string | null;
  net: number;
};

export type DayGroup = {
  /** YYYY-MM-DD */
  date: string;
  sessions: SessionRow[];
  dayNet: number;
};

export const net = (s: { buyIn: number; cashOut: number; rake: number }) =>
  s.cashOut - s.buyIn - s.rake;

/** Format a @db.Date (stored at UTC midnight) as YYYY-MM-DD. */
export const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/** "2026-05" -> a Prisma date filter for that whole month (UTC). */
export function monthFilter(month?: string) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return undefined;
  const [y, m] = month.split("-").map(Number);
  const gte = new Date(Date.UTC(y, m - 1, 1));
  const lt = new Date(Date.UTC(y, m, 1));
  return { playedAt: { gte, lt } };
}

export async function getLevelPresets(userId: string) {
  return prisma.levelPreset.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  });
}

/** All sessions for a user, newest day first, grouped by day with day nets. */
export async function getSessionsGroupedByDay(
  userId: string,
  month?: string
): Promise<DayGroup[]> {
  const rows = await prisma.session.findMany({
    where: { userId, ...monthFilter(month) },
    orderBy: [{ playedAt: "desc" }, { createdAt: "asc" }],
    include: { levelPreset: { select: { label: true } } },
  });

  const groups = new Map<string, DayGroup>();
  for (const r of rows) {
    const key = dayKey(r.playedAt);
    const row: SessionRow = {
      id: r.id,
      playedAt: r.playedAt,
      buyIn: r.buyIn,
      cashOut: r.cashOut,
      rake: r.rake,
      note: r.note,
      levelLabel: r.levelPreset?.label ?? null,
      net: net(r),
    };
    const g = groups.get(key);
    if (g) {
      g.sessions.push(row);
      g.dayNet += row.net;
    } else {
      groups.set(key, { date: key, sessions: [row], dayNet: row.net });
    }
  }
  return [...groups.values()];
}

export async function getSessionById(userId: string, id: string) {
  return prisma.session.findFirst({ where: { id, userId } });
}
