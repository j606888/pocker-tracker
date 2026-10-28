"use client";

import { useState } from "react";
import { deleteSession } from "@/lib/actions/sessions";
import { Button } from "@/components/ui/button";

/** Two-step delete: the first tap only asks; the second one actually deletes. */
export function DeleteSessionButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="self-start rounded-lg px-2 py-2 text-sm font-medium text-negative transition hover:bg-chip"
      >
        刪除這筆紀錄
      </button>
    );
  }

  return (
    <form
      action={deleteSession}
      className="flex flex-col gap-3 rounded-2xl border border-negative/30 bg-neg-1 p-4"
    >
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-fg">確定要刪除這筆紀錄嗎？刪除後無法復原。</p>
      <div className="flex gap-2">
        <Button type="submit" variant="danger">
          確定刪除
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setConfirming(false)}
        >
          取消
        </Button>
      </div>
    </form>
  );
}
