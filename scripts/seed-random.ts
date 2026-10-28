import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fill random sessions from the day after the existing golden sample
// (2026-05-04) up to today (override with TO=YYYY-MM-DD), for the demo user.
const EMAIL = "demo@pocker.local";
const FROM = "2026-05-05";
const TO = process.env.TO ?? new Date().toISOString().slice(0, 10);
const VENUES = ["俱樂部 A", "俱樂部 B"];

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];
const chance = (p: number) => Math.random() < p;
const round100 = (n: number) => Math.round(n / 100) * 100;

function eachDay(from: string, to: string): string[] {
  const out: string[] = [];
  const d = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

// Cash-out multipliers, weighted toward realistic poker outcomes.
const OUTCOMES: number[] = [
  0, 0, // busts
  0.3, 0.5, 0.7,
  0.9, 1.0, 1.1, 1.2,
  1.4, 1.6, 1.8,
  2.2, 2.6, 3.0,
];

// Roughly: mostly focused/normal, sometimes tired or tilted; some left blank.
const MOODS = [
  "FOCUSED", "FOCUSED", "FOCUSED",
  "NORMAL", "NORMAL",
  "TIRED",
  "TILT",
  null, null,
] as const;

const NOTES = [
  "阿晉的場",
  "禮拜五夜場",
  "手氣不錯",
  "被 cooler",
  "深籌碼",
  null,
  null,
  null,
];

async function main() {
  const user = await prisma.user.findFirst({ where: { email: EMAIL } });
  if (!user) throw new Error(`找不到使用者 ${EMAIL}`);

  const presets = await prisma.levelPreset.findMany({
    where: { userId: user.id },
    orderBy: { sortOrder: "asc" },
  });

  // Make sure the demo user has a couple of venues to pick from.
  for (const [i, name] of VENUES.entries()) {
    const exists = await prisma.venue.findFirst({ where: { userId: user.id, name } });
    if (!exists) {
      await prisma.venue.create({ data: { userId: user.id, name, sortOrder: i } });
    }
  }
  const venues = await prisma.venue.findMany({ where: { userId: user.id } });

  const data: {
    userId: string;
    playedAt: Date;
    levelPresetId: string | null;
    venueId: string | null;
    buyIn: number;
    rebuys: number;
    cashOut: number;
    rake: number;
    mood: (typeof MOODS)[number];
    note: string | null;
  }[] = [];

  for (const day of eachDay(FROM, TO)) {
    // ~45% of days have any play at all.
    if (!chance(0.45)) continue;

    const sessions = pick([1, 1, 2, 2, 3]); // 1-3 sessions that day
    for (let i = 0; i < sessions; i++) {
      // Usually a preset level; sometimes a custom buy-in.
      let levelPresetId: string | null = null;
      let buyIn: number;
      // Occasional rebuys; buyIn is the total put in.
      const rebuys = chance(0.15) ? pick([1, 1, 2]) : 0;
      if (presets.length && chance(0.8)) {
        const preset = pick(presets);
        levelPresetId = preset.id;
        buyIn = preset.buyIn * (1 + rebuys);
      } else {
        buyIn = round100(rand(1000, 8000)) * (1 + rebuys);
      }

      const cashOut = round100(buyIn * pick(OUTCOMES));
      const rake = chance(0.2) ? round100(rand(0, 300)) : 0;

      data.push({
        userId: user.id,
        playedAt: new Date(`${day}T00:00:00.000Z`),
        levelPresetId,
        venueId: venues.length && chance(0.85) ? pick(venues).id : null,
        buyIn,
        rebuys,
        cashOut,
        rake,
        mood: pick([...MOODS]),
        note: pick(NOTES),
      });
    }
  }

  await prisma.session.createMany({ data });

  const net = data.reduce((a, s) => a + (s.cashOut - s.buyIn - s.rake), 0);
  const days = new Set(data.map((s) => s.playedAt.toISOString().slice(0, 10)));
  console.log(
    `新增 ${data.length} 場（${days.size} 天，${FROM} ~ ${TO}），淨利合計 ${net}。`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
