"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Lightweight modal. Portals to <body>, closes on ESC or backdrop click.
 * Deliberately avoids native alert/confirm (those block browser automation).
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    // Lock background scroll while open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Move focus into the panel.
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full max-w-lg rounded-t-3xl border border-border bg-bg p-5 outline-none",
          "max-h-[90vh] overflow-y-auto sm:rounded-3xl"
        )}
      >
        <div className="mb-4 flex items-center gap-3">
          {title && (
            <h2 className="font-display text-lg font-medium">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="ml-auto rounded-lg px-2 py-1 text-sm text-muted transition hover:bg-chip hover:text-fg"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
