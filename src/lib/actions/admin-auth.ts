"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export type FormState = { error: string } | undefined;

export async function adminAuthenticate(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await signIn("admin-credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "帳號或密碼錯誤" };
    }
    throw error; // let redirect (NEXT_REDIRECT) propagate
  }
}
