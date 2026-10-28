"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { createVenue, type VenueFormState } from "@/lib/actions/venues";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";

export function AddVenueForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<
    VenueFormState,
    FormData
  >(createVenue, undefined);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="名稱" className="w-40">
          <input name="name" required maxLength={12} placeholder="俱樂部 A" className={inputClass} />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "新增中…" : "新增場子"}
        </Button>
      </div>
      {state && !state.ok && (
        <p className="text-sm text-negative">{state.error}</p>
      )}
    </form>
  );
}
