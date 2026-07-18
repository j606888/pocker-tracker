"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { createPreset, type PresetFormState } from "@/lib/actions/presets";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function AddPresetForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<
    PresetFormState,
    FormData
  >(createPreset, undefined);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="名稱" className="w-28">
          <input name="label" required maxLength={10} placeholder="6600" className={inputClass} />
        </Field>
        <Field label="預設買入" className="w-32">
          <input
            name="buyIn"
            inputMode="numeric"
            required
            placeholder="6600"
            className={cn(inputClass, "tnum")}
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "新增中…" : "新增級別"}
        </Button>
      </div>
      {state && !state.ok && (
        <p className="text-sm text-negative">{state.error}</p>
      )}
    </form>
  );
}
