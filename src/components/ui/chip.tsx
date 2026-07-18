"use client";

import { cn } from "@/lib/utils";

export function Chip({
  active = false,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        active
          ? "border-accent bg-accent-soft text-accent"
          : "border-border bg-surface text-subtle hover:border-accent/40",
        className
      )}
      {...props}
    />
  );
}
