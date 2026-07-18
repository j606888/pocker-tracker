import { BottomNav } from "@/components/bottom-nav";
import { type Preset } from "@/components/session-form";

export function AppShell({
  presets,
  today,
  children,
}: {
  presets: Preset[];
  today: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-4">{children}</main>

      <BottomNav presets={presets} defaultDate={today} />
    </div>
  );
}
