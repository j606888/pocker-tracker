import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session-user";
import { getLevelPresets } from "@/lib/data/sessions";
import { AppShell } from "@/components/app-shell";
import { ImpersonationBanner } from "@/components/impersonation-banner";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await requireUserId();
  const [presets, session] = await Promise.all([
    getLevelPresets(userId),
    auth(),
  ]);
  const today = new Date().toISOString().slice(0, 10);

  const readOnly = !!session?.actingAdminId;
  // The token carries the admin's email, not the impersonated user's — look it up.
  const impersonated = readOnly
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      })
    : null;

  return (
    <AppShell
      presets={presets.map((p) => ({ id: p.id, label: p.label, buyIn: p.buyIn }))}
      today={today}
      readOnly={readOnly}
      banner={
        readOnly ? (
          <ImpersonationBanner email={impersonated?.email ?? null} />
        ) : null
      }
    >
      {children}
    </AppShell>
  );
}
