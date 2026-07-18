import { prisma } from "@/lib/prisma";
import { net, dayKey, monthFilter } from "@/lib/data/sessions";

export type WeekdayStat = { weekday: number; net: number; count: number };

export type Stats = {
  totalNet: number;
  count: number;
  wins: number;
  winRate: number; // 0..1
  biggestWin: number;
  biggestLoss: number;
  totalRake: number;
  /** Sum of every buy-in — the total volume put on the table. */
  totalBuyIn: number;
  /** Net / total buy-in (0..). */
  roi: number;
  /** Average net per session. */
  avgNet: number;
  bestDay: { date: string; net: number } | null;
  worstDay: { date: string; net: number } | null;
  /** Longest run of consecutive winning / losing sessions (chronological). */
  longestWinStreak: number;
  longestLoseStreak: number;
  byLevel: { label: string; count: number; net: number }[];
  /** Net + count per weekday (index 0=Sun .. 6=Sat), always length 7. */
  byWeekday: WeekdayStat[];
  /** Running cumulative net, one point per day, chronological. */
  cumulative: { date: string; value: number }[];
};

export async function getStats(userId: string, month?: string): Promise<Stats> {
  const rows = await prisma.session.findMany({
    where: { userId, ...monthFilter(month) },
    orderBy: [{ playedAt: "asc" }, { createdAt: "asc" }],
    include: { levelPreset: { select: { label: true } } },
  });

  let totalNet = 0;
  let wins = 0;
  let totalRake = 0;
  let totalBuyIn = 0;
  let biggestWin = 0;
  let biggestLoss = 0;

  let winStreak = 0;
  let loseStreak = 0;
  let longestWinStreak = 0;
  let longestLoseStreak = 0;

  const byLevel = new Map<string, { label: string; count: number; net: number }>();
  const byWeekday: WeekdayStat[] = Array.from({ length: 7 }, (_, i) => ({
    weekday: i,
    net: 0,
    count: 0,
  }));
  const dayNet = new Map<string, number>();
  const dayCum = new Map<string, number>();

  for (const r of rows) {
    const n = net(r);
    totalNet += n;
    totalRake += r.rake;
    totalBuyIn += r.buyIn;
    if (n > 0) wins += 1;
    if (n > biggestWin) biggestWin = n;
    if (n < biggestLoss) biggestLoss = n;

    // Consecutive win / lose streaks (break-even resets both).
    if (n > 0) {
      winStreak += 1;
      loseStreak = 0;
    } else if (n < 0) {
      loseStreak += 1;
      winStreak = 0;
    } else {
      winStreak = 0;
      loseStreak = 0;
    }
    if (winStreak > longestWinStreak) longestWinStreak = winStreak;
    if (loseStreak > longestLoseStreak) longestLoseStreak = loseStreak;

    const key = r.levelPreset?.label ?? String(r.buyIn);
    const lv = byLevel.get(key);
    if (lv) {
      lv.count += 1;
      lv.net += n;
    } else {
      byLevel.set(key, { label: key, count: 1, net: n });
    }

    const wd = byWeekday[r.playedAt.getUTCDay()];
    wd.net += n;
    wd.count += 1;

    const dk = dayKey(r.playedAt);
    dayNet.set(dk, (dayNet.get(dk) ?? 0) + n);
    dayCum.set(dk, totalNet); // cumulative value at the end of each day
  }

  // Best / worst single day.
  let bestDay: { date: string; net: number } | null = null;
  let worstDay: { date: string; net: number } | null = null;
  for (const [date, n] of dayNet) {
    if (!bestDay || n > bestDay.net) bestDay = { date, net: n };
    if (!worstDay || n < worstDay.net) worstDay = { date, net: n };
  }

  return {
    totalNet,
    count: rows.length,
    wins,
    winRate: rows.length ? wins / rows.length : 0,
    biggestWin,
    biggestLoss,
    totalRake,
    totalBuyIn,
    roi: totalBuyIn ? totalNet / totalBuyIn : 0,
    avgNet: rows.length ? totalNet / rows.length : 0,
    bestDay,
    worstDay,
    longestWinStreak,
    longestLoseStreak,
    byLevel: [...byLevel.values()].sort((a, b) => b.net - a.net),
    byWeekday,
    cumulative: [...dayCum.entries()].map(([date, value]) => ({ date, value })),
  };
}

/** Distinct months (YYYY-MM) that have sessions, newest first. */
export async function getAvailableMonths(userId: string): Promise<string[]> {
  const rows = await prisma.session.findMany({
    where: { userId },
    select: { playedAt: true },
    orderBy: { playedAt: "desc" },
  });
  const months = new Set<string>();
  for (const r of rows) months.add(dayKey(r.playedAt).slice(0, 7));
  return [...months];
}
