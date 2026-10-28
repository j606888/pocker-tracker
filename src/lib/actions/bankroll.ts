"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireWritableUserId } from "@/lib/session-user";
import { bankrollSchema } from "@/lib/validations";

export type BankrollFormState =
  | { ok: true; nonce: number }
  | { ok: false; error: string }
  | undefined;

export async function updateBankroll(
  _prev: BankrollFormState,
  formData: FormData
): Promise<BankrollFormState> {
  const userId = await requireWritableUserId();
  const parsed = bankrollSchema.safeParse({
    bankroll: formData.get("bankroll") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "輸入有誤" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { bankroll: parsed.data.bankroll },
  });
  revalidatePath("/", "layout");
  return { ok: true, nonce: Math.random() };
}
