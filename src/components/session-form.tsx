"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveSession, type SessionFormState } from "@/lib/actions/sessions";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type Preset = { id: string; label: string; buyIn: number };

export type SessionFormInitial = {
  id: string;
  playedAt: string; // YYYY-MM-DD
  levelPresetId: string | null;
  buyIn: number;
  cashOut: number;
  rake: number;
  note: string | null;
};

function localToday() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function SessionForm({
  presets,
  defaultDate,
  initial,
  onSuccess,
}: {
  presets: Preset[];
  defaultDate: string;
  initial?: SessionFormInitial;
  /** Called after a successful save (e.g. to close a modal). */
  onSuccess?: () => void;
}) {
  const isEdit = Boolean(initial);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState<
    SessionFormState,
    FormData
  >(saveSession, undefined);

  const [buyIn, setBuyIn] = useState(
    initial ? String(initial.buyIn) : ""
  );
  const [presetId, setPresetId] = useState<string | null>(
    initial?.levelPresetId ?? null
  );

  // Correct the date default to the viewer's local day (create mode only).
  const [date, setDate] = useState(initial?.playedAt ?? defaultDate);
  useEffect(() => {
    if (!isEdit) setDate(localToday());
  }, [isEdit]);

  // After a successful save: reset (create) or go home (edit).
  useEffect(() => {
    if (state?.ok) {
      if (isEdit) {
        router.push("/");
      } else {
        formRef.current?.reset();
        setBuyIn("");
        setPresetId(null);
        setDate(localToday());
      }
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function pickPreset(p: Preset) {
    setBuyIn(String(p.buyIn));
    setPresetId(p.id);
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}
      <input type="hidden" name="levelPresetId" value={presetId ?? ""} />

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Chip
            key={p.id}
            active={presetId === p.id}
            onClick={() => pickPreset(p)}
          >
            {p.label}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="買入">
          <input
            name="buyIn"
            inputMode="numeric"
            required
            value={buyIn}
            onChange={(e) => {
              setBuyIn(e.target.value);
              setPresetId(null); // manual edit breaks the preset link
            }}
            placeholder="6600"
            className={cn(inputClass, "tnum")}
          />
        </Field>
        <Field label="帶出">
          <input
            name="cashOut"
            inputMode="numeric"
            required
            defaultValue={initial?.cashOut}
            placeholder="7100"
            className={cn(inputClass, "tnum")}
          />
        </Field>
        <Field label="水費">
          <input
            name="rake"
            inputMode="numeric"
            defaultValue={initial?.rake ?? 0}
            placeholder="0"
            className={cn(inputClass, "tnum")}
          />
        </Field>
        <Field label="日期">
          <input
            name="playedAt"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={cn(inputClass, "tnum")}
          />
        </Field>
      </div>

      <Field label="備註（選填）">
        <input
          name="note"
          type="text"
          defaultValue={initial?.note ?? ""}
          placeholder="例如：禮拜五、阿晉的場"
          className={inputClass}
        />
      </Field>

      {state && !state.ok && (
        <p className="text-sm text-negative">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "儲存中…" : isEdit ? "儲存變更" : "記一筆"}
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/")}
          >
            取消
          </Button>
        )}
      </div>
    </form>
  );
}
