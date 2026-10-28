"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWritableUserId } from "@/lib/session-user";
import { venueSchema } from "@/lib/validations";

export type VenueFormState =
  | { ok: true; nonce: number }
  | { ok: false; error: string }
  | undefined;

function refresh() {
  // Layout scope so the bottom-nav quick-add (fed by the shared (app) layout)
  // and every page pick up venue changes.
  revalidatePath("/", "layout");
}

async function insertVenue(userId: string, name: string) {
  const count = await prisma.venue.count({ where: { userId } });
  return prisma.venue.create({
    data: { userId, name, sortOrder: count },
    select: { id: true },
  });
}

export async function createVenue(
  _prev: VenueFormState,
  formData: FormData
): Promise<VenueFormState> {
  const userId = await requireWritableUserId();
  const parsed = venueSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入有誤" };
  }

  await insertVenue(userId, parsed.data.name);
  refresh();
  return { ok: true, nonce: Math.random() };
}

/** Inline "+ 場子" from the session form: create and hand back the id to select. */
export async function quickCreateVenue(
  name: string
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const userId = await requireWritableUserId();
  const parsed = venueSchema.safeParse({ name });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入有誤" };
  }

  // Re-use an existing venue with the same name instead of duplicating it.
  const existing = await prisma.venue.findFirst({
    where: { userId, name: parsed.data.name },
    select: { id: true },
  });
  const venue = existing ?? (await insertVenue(userId, parsed.data.name));
  refresh();
  return { ok: true, id: venue.id };
}

export async function updateVenue(formData: FormData): Promise<void> {
  const userId = await requireWritableUserId();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  const parsed = venueSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return;

  await prisma.venue.updateMany({
    where: { id, userId },
    data: parsed.data,
  });
  refresh();
}

export async function deleteVenue(formData: FormData): Promise<void> {
  const userId = await requireWritableUserId();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) return;

  // Sessions keep their record; venueId -> null via SetNull.
  await prisma.venue.deleteMany({ where: { id, userId } });
  refresh();
}

export async function moveVenue(formData: FormData): Promise<void> {
  const userId = await requireWritableUserId();
  const id = formData.get("id");
  const dir = formData.get("dir");
  if (typeof id !== "string" || (dir !== "up" && dir !== "down")) return;

  const venues = await prisma.venue.findMany({
    where: { userId },
    orderBy: { sortOrder: "asc" },
  });
  const i = venues.findIndex((v) => v.id === id);
  const j = dir === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= venues.length) return;

  [venues[i], venues[j]] = [venues[j], venues[i]];
  // Renormalize sortOrder to 0..n-1 so ordering stays clean.
  await prisma.$transaction(
    venues.map((v, idx) =>
      prisma.venue.update({ where: { id: v.id }, data: { sortOrder: idx } })
    )
  );
  refresh();
}
