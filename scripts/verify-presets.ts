import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error("ASSERT FAILED: " + msg);
  console.log("  ✓ " + msg);
}

async function main() {
  const user = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@pocker.local" },
  });

  console.log("1) Baseline presets:");
  const base = await prisma.levelPreset.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });
  assert(
    base.map((p) => p.label).join(",") === "1100,3300,6600",
    "1100,3300,6600 in order"
  );

  console.log("2) Create temp preset + a session that references it:");
  const temp = await prisma.levelPreset.create({
    data: { userId: user.id, label: "TEST", buyIn: 5000, sortOrder: base.length },
  });
  const sess = await prisma.session.create({
    data: {
      userId: user.id,
      levelPresetId: temp.id,
      playedAt: new Date("2026-07-18T00:00:00.000Z"),
      buyIn: 5000,
      cashOut: 5000,
      rake: 0,
    },
  });
  assert(sess.levelPresetId === temp.id, "session linked to temp preset");

  console.log("3) Delete the preset — session must survive with levelPresetId=null (SetNull):");
  await prisma.levelPreset.deleteMany({ where: { id: temp.id, userId: user.id } });
  const after = await prisma.session.findUnique({ where: { id: sess.id } });
  assert(after !== null, "session NOT deleted");
  assert(after!.levelPresetId === null, "levelPresetId set to null");
  assert(after!.buyIn === 5000, "session keeps its own buyIn (5000)");

  console.log("4) Reorder algorithm (swap + renormalize):");
  const arr = [...base];
  const i = 2, j = 1; // move 6600 up
  [arr[i], arr[j]] = [arr[j], arr[i]];
  const order = arr.map((p, idx) => ({ label: p.label, sortOrder: idx }));
  assert(
    JSON.stringify(order.map((o) => o.label)) === JSON.stringify(["1100", "6600", "3300"]),
    "6600 moves above 3300"
  );
  assert(
    order.every((o, idx) => o.sortOrder === idx),
    "sortOrder renormalized to 0..n-1"
  );

  console.log("5) Cleanup:");
  await prisma.session.delete({ where: { id: sess.id } });
  const finalPresets = await prisma.levelPreset.count({ where: { userId: user.id } });
  const finalSessions = await prisma.session.count({ where: { userId: user.id } });
  assert(finalPresets === 3, "back to 3 presets");
  assert(finalSessions === 10, "back to 10 sessions");

  console.log("\nALL PASSED ✅");
}

main()
  .catch((e) => {
    console.error("\n" + e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
