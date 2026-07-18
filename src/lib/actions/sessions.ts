"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { sessionSchema } from "@/lib/validations";

export type SessionFormState =
  | { ok: true; nonce: number }
  | { ok: false; error: string }
  | undefined;

export async function saveSession(
  _prev: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  const userId = await requireUserId();

  const parsed = sessionSchema.safeParse({
    playedAt: formData.get("playedAt"),
    levelPresetId: formData.get("levelPresetId") ?? undefined,
    buyIn: formData.get("buyIn"),
    cashOut: formData.get("cashOut"),
    rake: formData.get("rake") ?? 0,
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入有誤" };
  }

  const { playedAt, levelPresetId, buyIn, cashOut, rake, note } = parsed.data;

  // Guard: a supplied preset must belong to this user.
  let presetId: string | null = levelPresetId;
  if (presetId) {
    const owned = await prisma.levelPreset.findFirst({
      where: { id: presetId, userId },
      select: { id: true },
    });
    if (!owned) presetId = null;
  }

  const data = {
    playedAt: new Date(`${playedAt}T00:00:00.000Z`),
    levelPresetId: presetId,
    buyIn,
    cashOut,
    rake,
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

export async function deleteSession(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  // deleteMany with userId scope = safe no-op if not owned.
  await prisma.session.deleteMany({ where: { id, userId } });
  revalidatePath("/", "layout");
}
