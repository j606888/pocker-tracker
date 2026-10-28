import { PrismaClient } from "@prisma/client";
import { getStats, getBankroll } from "../src/lib/data/stats";

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
  const s = await getStats(user.id, "all");
  assert(s.totalNet === 10900, "totalNet 10,900");
  assert(s.count === 10, "count 10");
  assert(s.wins === 6 && Math.round(s.winRate * 100) === 60, "winRate 60% (6/10)");
  assert(Math.round(s.avgNet) === 1090, "avgNet 1,090");
  assert(s.biggestLoss === -4200, "biggestLoss -4,200");
  assert(s.stdDev !== null && s.stdDev > 0, "stdDev computed");

  console.log("By level (sorted by net desc):");
  const top = s.byLevel[0];
  assert(top.label === "3400" && top.net === 10900 && top.count === 3, "top level 3400: 3 場 / +10,900");
  const sumLevels = s.byLevel.reduce((a, l) => a + l.net, 0);
  assert(sumLevels === 10900, "level nets sum back to 10,900");

  console.log("Curve + drawdown (per session):");
  assert(s.curve.length === 11 && s.curve[0].value === 0, "curve starts at 0, one point per session");
  assert(s.curve[s.curve.length - 1].value === 10900, "curve ends at 10,900");
  // The two 5/4 losses alone are -7,400 from the high before them.
  assert(s.maxDrawdown !== null && s.maxDrawdown.amount <= -7400, "maxDrawdown at least -7,400");
  const dd = s.maxDrawdown!;
  assert(
    s.curve[dd.troughIndex].value - s.curve[dd.peakIndex].value === dd.amount,
    "drawdown = trough - peak"
  );

  console.log("Mood / venue (seed has none):");
  assert(s.byMood.length === 0 && s.unmarkedMood === 10, "10 sessions without mood");
  assert(s.byVenue.length === 0 && s.unmarkedVenue === 10, "10 sessions without venue");

  console.log("Range scoping:");
  const month = await getStats(user.id, "month");
  const recent = await getStats(user.id, "3m");
  assert(month.count <= recent.count && recent.count <= s.count, "month ⊆ 3m ⊆ all");

  console.log("Bankroll unit:");
  const b = await getBankroll(user.id);
  assert(b.unit === 3400, "most-played buy-in = 3400");

  console.log("\nALL PASSED ✅");
}

main()
  .catch((e) => {
    console.error("\n" + e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
