"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { SessionForm, type Preset } from "@/components/session-form";

/**
 * The center "+" of the bottom nav. Opens a modal with the shared SessionForm.
 * Date defaults to today (SessionForm's own localToday effect); the user can
 * change it in the picker.
 */
export function QuickAdd({
  presets,
  defaultDate,
}: {
  presets: Preset[];
  defaultDate: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="快速新增場次"
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl font-light text-white shadow-lg shadow-accent/30 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        +
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title="記一筆">
        <SessionForm
          presets={presets}
          defaultDate={defaultDate}
          onSuccess={() => setOpen(false)}
        />
      </Dialog>
    </>
  );
}
