import { PrismaClient } from "@prisma/client";
import { sessionSchema } from "../src/lib/validations";
import { getSessionsGroupedByDay, net } from "../src/lib/data/sessions";

const prisma = new PrismaClient();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("ASSERT FAILED: " + msg);
  console.log("  ✓ " + msg);
}

async function main() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@pocker.local" },
  });
  const preset = await prisma.levelPreset.findFirstOrThrow({
    where: { userId: user.id, label: "3300" },
  });

  console.log("1) Zod parses form-like strings (chip 3300 → buyIn, cashOut 9000):");
  const parsed = sessionSchema.parse({
    playedAt: "2026-07-18",
    levelPresetId: preset.id,
    buyIn: "3300",
    cashOut: "9000",
    rake: "0",
    note: "",
  });
  assert(parsed.buyIn === 3300 && parsed.cashOut === 9000, "coerced to numbers");
  assert(parsed.note === null, "empty note → null");
  assert(net(parsed) === 5700, "net 9000-3300-0 = 5700");

  console.log("2) Zod rejects bad input:");
  assert(!sessionSchema.safeParse({ ...parsed, buyIn: "-5" }).success, "negative buyIn rejected");
  assert(!sessionSchema.safeParse({ ...parsed, cashOut: "abc" }).success, "non-numeric rejected");

  const before = await getSessionsGroupedByDay(user.id);
  const beforeTotal = before.reduce((a, g) => a + g.dayNet, 0);
  const beforeCount = before.reduce((a, g) => a + g.sessions.length, 0);
  console.log(`3) Baseline: ${beforeCount} sessions, total ${beforeTotal}`);
  assert(beforeTotal === 10900 && beforeCount === 10, "seed = +10,900 / 10 場");

  console.log("4) CREATE (3300 入 → 9000 出, rake 0) on 2026-07-18:");
  const created = await prisma.session.create({
    data: {
      userId: user.id,
      levelPresetId: preset.id,
      playedAt: new Date("2026-07-18T00:00:00.000Z"),
      buyIn: 3300,
      cashOut: 9000,
      rake: 0,
    },
  });
  let groups = await getSessionsGroupedByDay(user.id);
  let total = groups.reduce((a, g) => a + g.dayNet, 0);
  const newDay = groups.find((g) => g.date === "2026-07-18");
  assert(total === 16600, "total 10900 + 5700 = 16600");
  assert(!!newDay && newDay.sessions[0].net === 5700, "new day group net 5700");
  assert(newDay!.sessions[0].levelLabel === "3300", "level label 3300 shown");
  assert(groups[0].date === "2026-07-18", "newest day sorts first");

  console.log("5) UPDATE (rake 300 → net drops by 300):");
  await prisma.session.update({
    where: { id: created.id },
    data: { rake: 300 },
  });
  groups = await getSessionsGroupedByDay(user.id);
  total = groups.reduce((a, g) => a + g.dayNet, 0);
  assert(total === 16300, "total now 16300 (rake 300 applied)");

  console.log("6) DELETE (back to baseline):");
  await prisma.session.deleteMany({ where: { id: created.id, userId: user.id } });
  groups = await getSessionsGroupedByDay(user.id);
  total = groups.reduce((a, g) => a + g.dayNet, 0);
  const count = groups.reduce((a, g) => a + g.sessions.length, 0);
  assert(total === 10900 && count === 10, "restored to +10,900 / 10 場");

  console.log("7) Ownership guard (deleteMany scoped by userId is a safe no-op):");
  const other = await prisma.session.deleteMany({
    where: { id: "does-not-exist", userId: user.id },
  });
  assert(other.count === 0, "deleting unknown id affects 0 rows");

  console.log("\nALL PASSED ✅");
}

main()
  .catch((e) => {
    console.error("\n" + e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
