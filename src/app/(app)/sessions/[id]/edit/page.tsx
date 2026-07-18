import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/session-user";
import { getLevelPresets, getSessionById, dayKey } from "@/lib/data/sessions";
import { Card } from "@/components/ui/card";
import { SessionForm } from "@/components/session-form";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();

  const [presets, session] = await Promise.all([
    getLevelPresets(userId),
    getSessionById(userId, id),
  ]);
  if (!session) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-medium">編輯場次</h1>
      <Card>
        <SessionForm
          presets={presets.map((p) => ({
            id: p.id,
            label: p.label,
            buyIn: p.buyIn,
          }))}
          defaultDate={dayKey(session.playedAt)}
          initial={{
            id: session.id,
            playedAt: dayKey(session.playedAt),
            levelPresetId: session.levelPresetId,
            buyIn: session.buyIn,
            cashOut: session.cashOut,
            rake: session.rake,
            note: session.note,
          }}
        />
      </Card>
    </div>
  );
}
