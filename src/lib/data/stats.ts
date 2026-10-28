import { prisma } from "@/lib/prisma";
import { net, dayKey } from "@/lib/data/sessions";
import { MOODS, type MoodValue } from "@/lib/mood";

export type Range = "month" | "3m" | "all";

export const RANGES: { value: Range; label: string }[] = [
  { value: "month", label: "本月" },
  { value: "3m", label: "近 3 月" },
  { value: "all", label: "全部" },
];

export function normalizeRange(r?: string): Range {
  return r === "3m" || r === "all" ? r : "month";
}

/** Prisma date filter for a range, in UTC like the rest of the app. */
function rangeFilter(range: Range) {
  if (range === "all") return undefined;
  const now = new Date();
  const monthsBack = range === "month" ? 0 : 2;
  const gte = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsBack, 1)
  );
  return { playedAt: { gte } };
}

export type WeekdayStat = { weekday: number; net: number; count: number };
export type GroupStat = { label: string; count: number; net: number };

export type Stats = {
  count: number;
  wins: number;
  winRate: number; // 0..1
  totalNet: number;
  avgNet: number;
  biggestLoss: number;
  longestLoseStreak: number;
  /** Sample standard deviation of per-session net; null below 2 sessions. */
  stdDev: number | null;
  /**
   * Running net after each session, chronological. Point 0 is the start (0),
   * so point i is "after session i".
   */
  curve: { date: string | null; value: number }[];
  /** Deepest peak-to-trough fall of `curve`; null if it never dipped. */
  maxDrawdown: {
    amount: number; // negative
    peakIndex: number;
    troughIndex: number;
  } | null;
  /** Moods with at least one session, in MOODS order. */
  byMood: (GroupStat & { mood: MoodValue })[];
  unmarkedMood: number;
  byVenue: GroupStat[];
  unmarkedVenue: number;
  byLevel: GroupStat[];
  /** Net + count per weekday (index 0=Sun .. 6=Sat), always length 7. */
  byWeekday: WeekdayStat[];
};

/** Per-session buy-in before rebuys, e.g. 13,200 with 1 rebuy -> 6,600. */
const unitBuyIn = (s: { buyIn: number; rebuys: number }) =>
  Math.round(s.buyIn / (1 + s.rebuys));

function addTo(map: Map<string, GroupStat>, label: string, n: number) {
  const g = map.get(label);
  if (g) {
    g.count += 1;
    g.net += n;
  } else {
    map.set(label, { label, count: 1, net: n });
  }
}

export async function getStats(userId: string, range: Range): Promise<Stats> {
  const rows = await prisma.session.findMany({
    where: { userId, ...rangeFilter(range) },
    orderBy: [{ playedAt: "asc" }, { createdAt: "asc" }],
    include: {
      levelPreset: { select: { label: true } },
      venue: { select: { name: true } },
    },
  });

  let totalNet = 0;
  let wins = 0;
  let biggestLoss = 0;
  let loseStreak = 0;
  let longestLoseStreak = 0;

  const curve: Stats["curve"] = [{ date: null, value: 0 }];
  let peak = 0;
  let peakIndex = 0;
  let maxDrawdown: Stats["maxDrawdown"] = null;

  const moodMap = new Map<MoodValue, GroupStat>();
  let unmarkedMood = 0;
  const venueMap = new Map<string, GroupStat>();
  let unmarkedVenue = 0;
  const levelMap = new Map<string, GroupStat>();
  const byWeekday: WeekdayStat[] = Array.from({ length: 7 }, (_, i) => ({
    weekday: i,
    net: 0,
    count: 0,
  }));

  const nets: number[] = [];

  for (const r of rows) {
    const n = net(r);
    nets.push(n);
    totalNet += n;
    if (n > 0) wins += 1;
    if (n < biggestLoss) biggestLoss = n;

    // Losing streak (a win or break-even resets it).
    loseStreak = n < 0 ? loseStreak + 1 : 0;
    if (loseStreak > longestLoseStreak) longestLoseStreak = loseStreak;

    // Running net + deepest fall from a previous high.
    curve.push({ date: dayKey(r.playedAt), value: totalNet });
    const i = curve.length - 1;
    if (totalNet > peak) {
      peak = totalNet;
      peakIndex = i;
    } else if (totalNet - peak < (maxDrawdown?.amount ?? 0)) {
      maxDrawdown = { amount: totalNet - peak, peakIndex, troughIndex: i };
    }

    if (r.mood) {
      const m = moodMap.get(r.mood);
      if (m) {
        m.count += 1;
        m.net += n;
      } else {
        moodMap.set(r.mood, { label: r.mood, count: 1, net: n });
      }
    } else {
      unmarkedMood += 1;
    }

    if (r.venue) addTo(venueMap, r.venue.name, n);
    else unmarkedVenue += 1;

    addTo(levelMap, r.levelPreset?.label ?? String(unitBuyIn(r)), n);

    const wd = byWeekday[r.playedAt.getUTCDay()];
    wd.net += n;
    wd.count += 1;
  }

  const count = rows.length;
  const avgNet = count ? totalNet / count : 0;
  const stdDev =
    count >= 2
      ? Math.sqrt(
          nets.reduce((a, n) => a + (n - avgNet) ** 2, 0) / (count - 1)
        )
      : null;

  const byMood = MOODS.flatMap(({ value, label }) => {
    const m = moodMap.get(value);
    return m ? [{ ...m, label, mood: value }] : [];
  });

  return {
    count,
    wins,
    winRate: count ? wins / count : 0,
    totalNet,
    avgNet,
    biggestLoss,
    longestLoseStreak,
    stdDev,
    curve,
    maxDrawdown,
    byMood,
    unmarkedMood,
    byVenue: [...venueMap.values()].sort((a, b) => b.net - a.net),
    unmarkedVenue,
    byLevel: [...levelMap.values()].sort((a, b) => b.net - a.net),
    byWeekday,
  };
}

/**
 * Bankroll plus the buy-in to measure it in: the user's most-played
 * per-session buy-in (all time), ties going to the bigger one.
 */
export async function getBankroll(
  userId: string
): Promise<{ bankroll: number | null; unit: number | null }> {
  const [user, rows] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { bankroll: true } }),
    prisma.session.findMany({
      where: { userId },
      select: { buyIn: true, rebuys: true },
    }),
  ]);

  const tally = new Map<number, number>();
  for (const r of rows) {
    const u = unitBuyIn(r);
    if (u > 0) tally.set(u, (tally.get(u) ?? 0) + 1);
  }
  let unit: number | null = null;
  let best = 0;
  for (const [u, c] of tally) {
    if (c > best || (c === best && unit !== null && u > unit)) {
      unit = u;
      best = c;
    }
  }

  return { bankroll: user?.bankroll ?? null, unit };
}
