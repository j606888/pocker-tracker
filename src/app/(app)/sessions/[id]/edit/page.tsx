import { notFound, redirect } from "next/navigation";
import { requireUserId, getActingAdminId } from "@/lib/session-user";
import {
  getLevelPresets,
  getVenues,
  getSessionById,
  dayKey,
} from "@/lib/data/sessions";
import { Card } from "@/components/ui/card";
import { SessionForm } from "@/components/session-form";
import { DeleteSessionButton } from "@/components/delete-session-button";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  // Impersonation is read-only: no editing another user's sessions.
  if (await getActingAdminId()) redirect("/");

  const [presets, venues, session] = await Promise.all([
    getLevelPresets(userId),
    getVenues(userId),
    getSessionById(userId, id),
  ]);
  if (!session) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="font-display text-xl font-medium">編輯場次</h1>
      <Card>
        <SessionForm
          presets={presets.map((p) => ({
            id: p.id,
            label: p.label,
            buyIn: p.buyIn,
          }))}
          venues={venues.map((v) => ({ id: v.id, name: v.name }))}
          defaultDate={dayKey(session.playedAt)}
          initial={{
            id: session.id,
            playedAt: dayKey(session.playedAt),
            levelPresetId: session.levelPresetId,
            venueId: session.venueId,
            buyIn: session.buyIn,
            rebuys: session.rebuys,
            cashOut: session.cashOut,
            rake: session.rake,
            mood: session.mood,
            note: session.note,
          }}
        />
      </Card>
      <DeleteSessionButton id={session.id} />
    </div>
  );
}
