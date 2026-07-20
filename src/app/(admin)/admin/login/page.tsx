"use client";

import { useActionState } from "react";
import { adminAuthenticate } from "@/lib/actions/admin-auth";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(
    adminAuthenticate,
    undefined
  );

  return (
    <main className="flex min-h-full items-center justify-center bg-bg px-5 py-16 text-fg">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 font-display text-3xl font-medium tracking-tight">
          後台登入
        </h1>
        <p className="mb-8 text-sm text-muted">pocker-tracker · Admin</p>

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
            {pending ? "登入中…" : "登入後台"}
          </Button>
        </form>
      </div>
    </main>
  );
}
