import { BottomNav } from "@/components/bottom-nav";
import { type Preset } from "@/components/session-form";

export function AppShell({
  presets,
  today,
  readOnly = false,
  banner,
  children,
}: {
  presets: Preset[];
  today: string;
  readOnly?: boolean;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      {banner}
      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-4">{children}</main>

      <BottomNav presets={presets} defaultDate={today} readOnly={readOnly} />
    </div>
  );
}
