import { prisma } from "@/lib/prisma";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  sessionCount: number;
  /** Sum of (cashOut - buyIn - rake) across all the user's sessions. */
  net: number;
  lastPlayedAt: Date | null;
};

export type ImpersonationLogRow = {
  id: string;
  adminEmail: string;
  userEmail: string;
  createdAt: Date;
};

/** Most recent impersonation events, newest first. */
export async function getRecentImpersonationLogs(
  limit = 20
): Promise<ImpersonationLogRow[]> {
  return prisma.impersonationLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, adminEmail: true, userEmail: true, createdAt: true },
  });
}

/** Every user with headline stats. NOT scoped to a single userId (admin view). */
export async function getAllUsersWithStats(): Promise<AdminUserRow[]> {
  const [users, grouped] = await Promise.all([
    prisma.user.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.session.groupBy({
      by: ["userId"],
      _sum: { buyIn: true, cashOut: true, rake: true },
      _count: { _all: true },
      _max: { playedAt: true },
    }),
  ]);

  const byUser = new Map(grouped.map((g) => [g.userId, g]));

  return users.map((u) => {
    const g = byUser.get(u.id);
    const net = g
      ? (g._sum.cashOut ?? 0) - (g._sum.buyIn ?? 0) - (g._sum.rake ?? 0)
      : 0;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt,
      sessionCount: g?._count._all ?? 0,
      net,
      lastPlayedAt: g?._max.playedAt ?? null,
    };
  });
}
