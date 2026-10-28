/** Mirrors the Prisma `Mood` enum; kept Prisma-free so client components can import it. */
export type MoodValue = "FOCUSED" | "NORMAL" | "TIRED" | "TILT";

/** Display order for chips and the report. */
export const MOODS: { value: MoodValue; label: string }[] = [
  { value: "FOCUSED", label: "專注" },
  { value: "NORMAL", label: "普通" },
  { value: "TIRED", label: "疲累" },
  { value: "TILT", label: "上頭" },
];

export function moodLabel(m: MoodValue | null | undefined): string | null {
  return MOODS.find((x) => x.value === m)?.label ?? null;
}
