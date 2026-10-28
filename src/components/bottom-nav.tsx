"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QuickAdd } from "@/components/quick-add";
import { CalendarIcon, ChartIcon, SettingsIcon } from "@/components/nav-icons";
import { type Preset, type VenueOption } from "@/components/session-form";
import { cn } from "@/lib/utils";

function NavLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition",
        active ? "text-accent" : "text-muted hover:text-subtle"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

export function BottomNav({
  presets,
  venues,
  defaultDate,
  readOnly = false,
}: {
  presets: Preset[];
  venues: VenueOption[];
  defaultDate: string;
  readOnly?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex w-full max-w-3xl items-center px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="flex flex-1 items-center">
          <NavLink
            href="/"
            active={pathname === "/"}
            icon={<CalendarIcon />}
            label="日曆"
          />
          <NavLink
            href="/report"
            active={pathname.startsWith("/report")}
            icon={<ChartIcon />}
            label="報表"
          />
        </div>

        {readOnly ? (
          // Read-only impersonation: no quick-add.
          <div className="w-14 shrink-0" aria-hidden />
        ) : (
          <QuickAdd presets={presets} venues={venues} defaultDate={defaultDate} />
        )}

        <div className="flex flex-1 items-center">
          <NavLink
            href="/settings"
            active={pathname.startsWith("/settings")}
            icon={<SettingsIcon />}
            label="設定"
          />
        </div>
      </div>
    </nav>
  );
}
