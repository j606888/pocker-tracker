"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QuickAdd } from "@/components/quick-add";
import { CalendarIcon, ChartIcon, SettingsIcon } from "@/components/nav-icons";
import { type Preset, type VenueOption } from "@/components/session-form";
import { cn } from "@/lib/utils";

function SideLink({
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
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] transition",
        active
          ? "bg-accent-soft font-semibold text-accent"
          : "font-medium text-subtle hover:bg-chip hover:text-fg"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

/** Desktop (lg+) replacement for the bottom nav: brand, 記一筆, then the pages. */
export function SideNav({
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
    <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col gap-6 border-r border-border bg-surface-2 px-4 py-7 lg:flex">
      <Link href="/" className="px-3 font-display text-[22px] font-medium">
        撲克戰績
      </Link>

      {/* Read-only impersonation: no quick-add. */}
      {!readOnly && (
        <QuickAdd
          presets={presets}
          venues={venues}
          defaultDate={defaultDate}
          variant="sidebar"
        />
      )}

      <nav aria-label="主選單" className="flex flex-col gap-1">
        <SideLink
          href="/"
          active={pathname === "/"}
          icon={<CalendarIcon />}
          label="日曆"
        />
        <SideLink
          href="/report"
          active={pathname.startsWith("/report")}
          icon={<ChartIcon />}
          label="報表"
        />
        <SideLink
          href="/settings"
          active={pathname.startsWith("/settings")}
          icon={<SettingsIcon />}
          label="設定"
        />
      </nav>
    </aside>
  );
}
