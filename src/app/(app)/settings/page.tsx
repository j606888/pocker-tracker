import Link from "next/link";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requireUserId, getActingAdminId } from "@/lib/session-user";
import { getLevelPresets, getVenues } from "@/lib/data/sessions";
import { updatePreset, deletePreset, movePreset } from "@/lib/actions/presets";
import { updateVenue, deleteVenue, moveVenue } from "@/lib/actions/venues";
import { Card } from "@/components/ui/card";
import { AddPresetForm } from "@/components/add-preset-form";
import { AddVenueForm } from "@/components/add-venue-form";
import { BankrollForm } from "@/components/bankroll-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { inputClass } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const [presets, venues, owner, session, actingAdminId] = await Promise.all([
    getLevelPresets(userId),
    getVenues(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { bankroll: true } }),
    auth(),
    getActingAdminId(),
  ]);
  const bankroll = owner?.bankroll ?? null;
  const readOnly = !!actingAdminId;
  // While impersonating, the token holds the admin's email — look up the
  // impersonated user so the account label reflects who we're viewing.
  const impersonated = readOnly
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      })
    : null;
  const userLabel = readOnly
    ? impersonated?.name ?? impersonated?.email ?? ""
    : session?.user?.name ?? session?.user?.email ?? "";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex items-baseline gap-3">
        <h1 className="font-display text-xl font-medium">設定</h1>
        <Link href="/" className="ml-auto text-sm text-accent hover:underline">
          ← 回總覽
        </Link>
      </div>

      <Card className="flex items-center gap-3">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold text-subtle">帳號</span>
          {userLabel ? (
            <span className="truncate text-sm text-muted">{userLabel}</span>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {!readOnly && (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-subtle transition hover:bg-chip"
              >
                登出
              </button>
            </form>
          )}
        </div>
      </Card>

      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-lg font-medium">級別預設</h2>
      </div>
      <p className="text-sm text-muted">
        新增場次時點一下級別 chip，就會自動帶入「預設買入」。改動不會影響已記錄的場次。
      </p>

      <Card className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-subtle">目前的級別</h2>

        {presets.length === 0 ? (
          <p className="text-sm text-muted">
            {readOnly ? "這位使用者還沒有級別。" : "還沒有級別，用下面的表單新增一個。"}
          </p>
        ) : readOnly ? (
          <div className="flex flex-col divide-y divide-border">
            {presets.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-3">
                <span className="min-w-[3.25rem] rounded-md bg-chip px-2 py-0.5 text-center text-xs font-semibold text-subtle">
                  {p.label}
                </span>
                <span className="tnum text-sm text-subtle">
                  預設買入 {p.buyIn.toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {presets.map((p, i) => (
              <div key={p.id} className="flex flex-wrap items-center gap-2 py-3">
                {/* Inline edit */}
                <form action={updatePreset} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={p.id} />
                  <input
                    name="label"
                    defaultValue={p.label}
                    maxLength={10}
                    required
                    className={cn(inputClass, "w-24 py-2")}
                  />
                  <input
                    name="buyIn"
                    inputMode="numeric"
                    defaultValue={p.buyIn}
                    required
                    className={cn(inputClass, "tnum w-28 py-2")}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-subtle transition hover:bg-chip"
                  >
                    儲存
                  </button>
                </form>

                <div className="ml-auto flex items-center gap-1">
                  <form action={movePreset}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label="上移"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-chip disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={movePreset}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button
                      type="submit"
                      disabled={i === presets.length - 1}
                      aria-label="下移"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-chip disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={deletePreset}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      aria-label="刪除"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-chip hover:text-negative"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {!readOnly && (
        <Card className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-subtle">新增級別</h2>
          <AddPresetForm />
        </Card>
      )}

      <div id="venues" className="flex items-baseline gap-3">
        <h2 className="font-display text-lg font-medium">場子</h2>
      </div>
      <p className="text-sm text-muted">
        記一筆時點一下場子，報表就能比較在不同場子的成績。刪掉場子不會刪掉已記錄的場次。
      </p>

      <Card className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-subtle">目前的場子</h2>

        {venues.length === 0 ? (
          <p className="text-sm text-muted">
            {readOnly ? "這位使用者還沒有場子。" : "還沒有場子，用下面的表單新增一個。"}
          </p>
        ) : readOnly ? (
          <div className="flex flex-col divide-y divide-border">
            {venues.map((v) => (
              <div key={v.id} className="py-3 text-sm text-subtle">
                {v.name}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {venues.map((v, i) => (
              <div key={v.id} className="flex flex-wrap items-center gap-2 py-3">
                {/* Inline rename */}
                <form action={updateVenue} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={v.id} />
                  <input
                    name="name"
                    defaultValue={v.name}
                    maxLength={12}
                    required
                    aria-label="場子名稱"
                    className={cn(inputClass, "w-40 py-2")}
                  />
                  <button
                    type="submit"
                    className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-subtle transition hover:bg-chip"
                  >
                    儲存
                  </button>
                </form>

                <div className="ml-auto flex items-center gap-1">
                  <form action={moveVenue}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button
                      type="submit"
                      disabled={i === 0}
                      aria-label="上移"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-chip disabled:opacity-30"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveVenue}>
                    <input type="hidden" name="id" value={v.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button
                      type="submit"
                      disabled={i === venues.length - 1}
                      aria-label="下移"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-chip disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={deleteVenue}>
                    <input type="hidden" name="id" value={v.id} />
                    <button
                      type="submit"
                      aria-label="刪除"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-chip hover:text-negative"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {!readOnly && (
        <Card className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-subtle">新增場子</h2>
          <AddVenueForm />
        </Card>
      )}

      <div className="flex items-baseline gap-3">
        <h2 className="font-display text-lg font-medium">資金池</h2>
      </div>
      <p className="text-sm text-muted">
        選填。填了之後，報表會換算成「夠撐幾個買入」，以你最常打的買入計算。
      </p>

      <Card>
        {readOnly ? (
          <p className="tnum text-sm text-subtle">
            {bankroll === null ? "未設定" : bankroll.toLocaleString("en-US")}
          </p>
        ) : (
          <BankrollForm bankroll={bankroll} />
        )}
      </Card>
    </div>
  );
}
