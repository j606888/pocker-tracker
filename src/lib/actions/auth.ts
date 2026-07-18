"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export type FormState = { error: string } | undefined;

export async function authenticate(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "帳號或密碼錯誤" };
    }
    throw error; // let redirect (NEXT_REDIRECT) propagate
  }
}

export async function register(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "輸入有誤" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "此 email 已經註冊過了" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      // Sensible starter presets for a brand-new account.
      levelPresets: {
        create: [
          { label: "1100", buyIn: 1100, sortOrder: 0 },
          { label: "3300", buyIn: 3300, sortOrder: 1 },
          { label: "6600", buyIn: 6600, sortOrder: 2 },
        ],
      },
    },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "註冊成功但自動登入失敗，請手動登入" };
    }
    throw error;
  }
}
