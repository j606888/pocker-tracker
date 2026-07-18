import { PrismaClient } from "@prisma/client";
import { getStats, getAvailableMonths } from "../src/lib/data/stats";

const prisma = new PrismaClient();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("ASSERT FAILED: " + msg);
  console.log("  ✓ " + msg);
}

async function main() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@pocker.local" },
  });

  console.log("All-time stats:");
  const s = await getStats(user.id);
  assert(s.totalNet === 10900, "totalNet 10,900");
  assert(s.count === 10, "count 10");
  assert(s.wins === 6 && Math.round(s.winRate * 100) === 60, "winRate 60% (6/10)");
  assert(s.biggestWin === 8100, "biggestWin 8,100");
  assert(s.biggestLoss === -4200, "biggestLoss -4,200");
  assert(s.totalRake === 0, "totalRake 0");

  console.log("By level (sorted by net desc):");
  const top = s.byLevel[0];
  assert(top.label === "3400" && top.net === 10900 && top.count === 3, "top level 3400: 3 場 / +10,900");
  const sumLevels = s.byLevel.reduce((a, l) => a + l.net, 0);
  assert(sumLevels === 10900, "level nets sum back to 10,900");

  console.log("Cumulative series (daily):");
  const cum = s.cumulative.map((c) => c.value);
  assert(JSON.stringify(cum) === JSON.stringify([3300, 12400, 18300, 10900]), "cumulative [3300,12400,18300,10900]");

  console.log("Months + month scoping:");
  const months = await getAvailableMonths(user.id);
  assert(JSON.stringify(months) === JSON.stringify(["2026-05"]), "months = [2026-05]");
  const may = await getStats(user.id, "2026-05");
  assert(may.totalNet === 10900 && may.count === 10, "2026-05 scope = full data");
  const jul = await getStats(user.id, "2026-07");
  assert(jul.totalNet === 0 && jul.count === 0, "2026-07 scope = empty");

  console.log("\nALL PASSED ✅");
}

main()
  .catch((e) => {
    console.error("\n" + e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
