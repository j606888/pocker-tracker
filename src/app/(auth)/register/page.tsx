"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <main className="flex min-h-full items-center justify-center bg-bg px-5 py-16 text-fg">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-3xl font-medium tracking-tight">
          建立帳號
        </h1>
        <p className="mb-8 text-sm text-muted">開始記錄你的撲克戰績</p>

        <form action={formAction} className="flex flex-col gap-4">
          <Field label="暱稱">
            <Input name="name" type="text" required autoComplete="nickname" />
          </Field>
          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="密碼" hint="至少 6 個字">
            <Input
              name="password"
              type="password"
              required
              autoComplete="new-password"
              minLength={6}
            />
          </Field>

          {state?.error && <p className="text-sm text-negative">{state.error}</p>}

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "建立中…" : "註冊並登入"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          已經有帳號？{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            登入
          </Link>
        </p>
      </div>
    </main>
  );
}
