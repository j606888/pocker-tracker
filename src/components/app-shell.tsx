import { BottomNav } from "@/components/bottom-nav";
import { SideNav } from "@/components/side-nav";
import { type Preset, type VenueOption } from "@/components/session-form";

export function AppShell({
  presets,
  venues,
  today,
  readOnly = false,
  banner,
  children,
}: {
  presets: Preset[];
  venues: VenueOption[];
  today: string;
  readOnly?: boolean;
  banner?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      {banner}
      {/* Phone: bottom nav. Desktop (lg+): sidebar on the left, wider content. */}
      <div className="lg:flex">
        <SideNav
          presets={presets}
          venues={venues}
          defaultDate={today}
          readOnly={readOnly}
        />
        <main className="mx-auto w-full max-w-3xl px-5 pb-28 pt-4 lg:min-w-0 lg:max-w-[1160px] lg:flex-1 lg:px-10 lg:pb-10 lg:pt-7">
          {children}
        </main>
      </div>

      <BottomNav
        presets={presets}
        venues={venues}
        defaultDate={today}
        readOnly={readOnly}
      />
    </div>
  );
}
