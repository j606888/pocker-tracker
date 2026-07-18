"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { presetSchema } from "@/lib/validations";

export type PresetFormState =
  | { ok: true; nonce: number }
  | { ok: false; error: string }
  | undefined;

function refresh() {
  // Layout scope so the bottom-nav quick-add (fed by the shared (app) layout)
  // and every page pick up preset changes.
  revalidatePath("/", "layout");
}

export async function createPreset(
  _prev: PresetFormState,
  formData: FormData
): Promise<PresetFormState> {
  const userId = await requireUserId();
  const parsed = presetSchema.safeParse({
    label: formData.get("label"),
    buyIn: formData.get("buyIn"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入有誤" };
  }

  const count = await prisma.levelPreset.count({ where: { userId } });
  await prisma.levelPreset.create({
    data: { userId, ...parsed.data, sortOrder: count },
  });

  refresh();
  return { ok: true, nonce: Math.random() };
}

export async function updatePreset(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const parsed = presetSchema.safeParse({
    label: formData.get("label"),
    buyIn: formData.get("buyIn"),
  });
  if (!parsed.success) return;

  await prisma.levelPreset.updateMany({
    where: { id, userId },
    data: parsed.data,
  });
  refresh();
}

export async function deletePreset(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  // Sessions referencing it keep their own buyIn (levelPresetId -> null via SetNull).
  await prisma.levelPreset.deleteMany({ where: { id, userId } });
  refresh();
}

export async function movePreset(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const id = formData.get("id");
  const dir = formData.get("dir");
  if (typeof id !== "string" || (dir !== "up" && dir !== "down")) return;

  const presets = await prisma.levelPreset.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  });
  const i = presets.findIndex((p) => p.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= presets.length) return;

  [presets[i], presets[j]] = [presets[j], presets[i]];
  // Renormalize sortOrder to 0..n-1 so ordering stays clean.
  await prisma.$transaction(
    presets.map((p, idx) =>
      prisma.levelPreset.update({ where: { id: p.id }, data: { sortOrder: idx } })
    )
  );
  refresh();
}
