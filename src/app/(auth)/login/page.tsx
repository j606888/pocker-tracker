"use client";

import Link from "next/link";
import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(authenticate, undefined);

  return (
    <main className="flex min-h-full items-center justify-center bg-bg px-5 py-16 text-fg">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-3xl font-medium tracking-tight">
          登入
        </h1>
        <p className="mb-8 text-sm text-muted">pocker-tracker · 記錄你的每一場</p>

        <form action={formAction} className="flex flex-col gap-4">
          <Field label="Email">
            <Input name="email" type="email" required autoComplete="email" />
          </Field>
          <Field label="密碼">
            <Input
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </Field>

          {state?.error && <p className="text-sm text-negative">{state.error}</p>}

          <Button type="submit" disabled={pending} className="mt-1">
            {pending ? "登入中…" : "登入"}
          </Button>
        </form>

        <p className="mt-6 text-sm text-muted">
          還沒有帳號？{" "}
          <Link href="/register" className="font-medium text-accent hover:underline">
            註冊
          </Link>
        </p>
      </div>
    </main>
  );
}
