import { requireUserId } from "@/lib/session-user";
import { getLevelPresets } from "@/lib/data/sessions";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  const presets = await getLevelPresets(userId);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell
      presets={presets.map((p) => ({ id: p.id, label: p.label, buyIn: p.buyIn }))}
      today={today}
    >
      {children}
    </AppShell>
  );
}
