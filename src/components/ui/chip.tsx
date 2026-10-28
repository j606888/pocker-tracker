"use client";

import { cn } from "@/lib/utils";

export function Chip({
  active = false,
  block = false,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  /** Tall, square-ish tap target that grows to fill its row (form pickers). */
  block?: boolean;
}) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "border font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        block
          ? "h-11 min-w-16 flex-1 rounded-xl px-2 text-[15px]"
          : "rounded-full px-3.5 py-1.5 text-sm",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border bg-surface text-subtle hover:border-accent/40",
        className
      )}
      {...props}
    />
  );
}
