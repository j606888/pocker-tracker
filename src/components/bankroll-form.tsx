"use client";

import { useActionState } from "react";
import { updateBankroll, type BankrollFormState } from "@/lib/actions/bankroll";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function BankrollForm({ bankroll }: { bankroll: number | null }) {
  const [state, formAction, pending] = useActionState<
    BankrollFormState,
    FormData
  >(updateBankroll, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="金額（留空 = 不顯示）" className="w-44">
          <input
            name="bankroll"
            inputMode="numeric"
            defaultValue={bankroll ?? ""}
            placeholder="120000"
            className={cn(inputClass, "tnum")}
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "儲存中…" : "儲存"}
        </Button>
        {state?.ok && !pending && (
          <span className="pb-2.5 text-sm text-accent">已儲存</span>
        )}
      </div>
      {state && !state.ok && (
        <p className="text-sm text-negative">{state.error}</p>
      )}
    </form>
  );
}
