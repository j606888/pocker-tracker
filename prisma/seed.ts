import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Golden sample from the original LINE screenshot (year assumed 2025).
// rake = 0 so nets match the raw 入/出 numbers.
const SESSIONS: { day: string; buyIn: number; cashOut: number }[] = [
  { day: "2026-05-01", buyIn: 6600, cashOut: 7100 },
  { day: "2026-05-01", buyIn: 3400, cashOut: 3800 },
  { day: "2026-05-01", buyIn: 2200, cashOut: 4600 },
  { day: "2026-05-02", buyIn: 3400, cashOut: 10000 },
  { day: "2026-05-02", buyIn: 6600, cashOut: 5200 },
  { day: "2026-05-02", buyIn: 3400, cashOut: 7300 },
  { day: "2026-05-03", buyIn: 10500, cashOut: 18600 },
  { day: "2026-05-03", buyIn: 2200, cashOut: 0 },
  { day: "2026-05-04", buyIn: 6400, cashOut: 2200 },
  { day: "2026-05-04", buyIn: 3200, cashOut: 0 },
];

async function main() {
  const email = "demo@pocker.local";
  const passwordHash = await bcrypt.hash("password", 10);

  // Idempotent: wipe demo user's data and recreate.
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      name: "Demo",
      passwordHash,
      levelPresets: {
        create: [
          { label: "1100", buyIn: 1100, sortOrder: 0 },
          { label: "3300", buyIn: 3300, sortOrder: 1 },
          { label: "6600", buyIn: 6600, sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.session.createMany({
    data: SESSIONS.map((s) => ({
      userId: user.id,
      playedAt: new Date(s.day),
      buyIn: s.buyIn,
      cashOut: s.cashOut,
      rake: 0,
    })),
  });

  const net = SESSIONS.reduce((a, s) => a + (s.cashOut - s.buyIn), 0);
  console.log(
    `Seeded ${email} (password: "password") with ${SESSIONS.length} sessions, net ${net}.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
