"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireWritableUserId } from "@/lib/session-user";
import { sessionSchema } from "@/lib/validations";
import { dayKey } from "@/lib/data/sessions";

export type SessionFormState =
  | { ok: true; nonce: number }
  | { ok: false; error: string }
  | undefined;

export async function saveSession(
  _prev: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  const userId = await requireWritableUserId();

  const parsed = sessionSchema.safeParse({
    playedAt: formData.get("playedAt"),
    levelPresetId: formData.get("levelPresetId") ?? undefined,
    venueId: formData.get("venueId") ?? undefined,
    buyIn: formData.get("buyIn"),
    rebuys: formData.get("rebuys") || 0,
    cashOut: formData.get("cashOut"),
    rake: formData.get("rake") || 0,
    mood: formData.get("mood") || undefined,
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入有誤" };
  }

  const { playedAt, levelPresetId, venueId, buyIn, rebuys, cashOut, rake, mood, note } =
    parsed.data;

  // Guard: a supplied preset / venue must belong to this user.
  const [ownedPreset, ownedVenue] = await Promise.all([
    levelPresetId
      ? prisma.levelPreset.findFirst({
          where: { id: levelPresetId, userId },
          select: { id: true },
        })
      : null,
    venueId
      ? prisma.venue.findFirst({
          where: { id: venueId, userId },
          select: { id: true },
        })
      : null,
  ]);

  const data = {
    playedAt: new Date(`${playedAt}T00:00:00.000Z`),
    levelPresetId: ownedPreset?.id ?? null,
    venueId: ownedVenue?.id ?? null,
    buyIn,
    rebuys,
    cashOut,
    rake,
    mood,
    note,
  };

  const id = formData.get("id");
  if (typeof id === "string" && id) {
    // Update only if the row is this user's.
    const existing = await prisma.session.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) return { ok: false, error: "找不到這筆紀錄" };
    await prisma.session.update({ where: { id }, data });
  } else {
    await prisma.session.create({ data: { ...data, userId } });
  }

  // Refresh the calendar (/) and report (/report) — layout scope covers both.
  revalidatePath("/", "layout");
  return { ok: true, nonce: Math.random() };
}

/** Delete from the edit page (after an in-page confirm), then back to that day. */
export async function deleteSession(formData: FormData): Promise<void> {
  const userId = await requireWritableUserId();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const existing = await prisma.session.findFirst({
    where: { id, userId },
    select: { playedAt: true },
  });
  if (!existing) redirect("/");

  await prisma.session.delete({ where: { id } });
  revalidatePath("/", "layout");

  const day = dayKey(existing.playedAt);
  redirect(`/?month=${day.slice(0, 7)}&day=${day}`);
}
