"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import {
  SessionForm,
  type Preset,
  type VenueOption,
} from "@/components/session-form";

/**
 * The center "+" of the bottom nav. Opens a modal with the shared SessionForm.
 * Date defaults to today (SessionForm's own localToday effect); the user can
 * change it in the picker.
 */
export function QuickAdd({
  presets,
  venues,
  defaultDate,
}: {
  presets: Preset[];
  venues: VenueOption[];
  defaultDate: string;
}) {
  const pathname = usePathname();
  // Remember which page the sheet was opened on, so following a link out of
  // it (e.g. "到設定新增級別") closes it instead of floating over the new page.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const close = () => setOpenedOn(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenedOn(pathname)}
        aria-label="記一筆"
        className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-3xl font-light text-white shadow-lg shadow-accent/30 transition hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        +
      </button>

      <Dialog open={open} onClose={close} title="記一筆">
        <SessionForm
          presets={presets}
          venues={venues}
          defaultDate={defaultDate}
          onSuccess={close}
        />
      </Dialog>
    </>
  );
}
