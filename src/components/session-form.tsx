"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { saveSession, type SessionFormState } from "@/lib/actions/sessions";
import { quickCreateVenue } from "@/lib/actions/venues";
import { MOODS, type MoodValue } from "@/lib/mood";
import { Chip } from "@/components/ui/chip";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/ui/field";
import { cn, formatMoney } from "@/lib/utils";

export type Preset = { id: string; label: string; buyIn: number };
export type VenueOption = { id: string; name: string };

export type SessionFormInitial = {
  id: string;
  playedAt: string; // YYYY-MM-DD
  levelPresetId: string | null;
  venueId: string | null;
  /** Total buy-in, rebuys included. */
  buyIn: number;
  rebuys: number;
  cashOut: number;
  rake: number;
  mood: MoodValue | null;
  note: string | null;
};

function localToday() {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/** Digits-only input -> integer; blank or junk -> null. */
function toInt(v: string): number | null {
  const s = v.replace(/,/g, "").trim();
  if (!/^\d+$/.test(s)) return null;
  return Number(s);
}

const num = (n: number) => n.toLocaleString("en-US");

/** Label on the left, controls on the right — keeps the sheet short. */
function Row({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2">
      <label
        htmlFor={htmlFor}
        className="w-9 shrink-0 pt-3 text-[13px] text-muted"
      >
        {label}
      </label>
      <div className="flex min-w-0 flex-1 flex-wrap gap-2">{children}</div>
    </div>
  );
}

const fieldClass = cn(inputClass, "h-11 w-full py-0 tnum");

export function SessionForm({
  presets,
  venues,
  defaultDate,
  initial,
  onSuccess,
}: {
  presets: Preset[];
  venues: VenueOption[];
  defaultDate: string;
  initial?: SessionFormInitial;
  /** Called after a successful save (e.g. to close a modal). */
  onSuccess?: () => void;
}) {
  const isEdit = Boolean(initial);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, pending] = useActionState<
    SessionFormState,
    FormData
  >(saveSession, undefined);

  // Correct the date default to the viewer's local day (create mode only).
  const [date, setDate] = useState(initial?.playedAt ?? defaultDate);
  useEffect(() => {
    if (!isEdit) setDate(localToday());
  }, [isEdit]);

  const [presetId, setPresetId] = useState<string | null>(
    initial?.levelPresetId ?? null
  );
  const [venueId, setVenueId] = useState<string | null>(
    initial?.venueId ?? null
  );
  // Per-entry buy-in; the total sent to the server is unit × (1 + rebuys).
  const [unit, setUnit] = useState(
    initial ? String(Math.round(initial.buyIn / (1 + initial.rebuys))) : ""
  );
  const [rebuys, setRebuys] = useState(initial?.rebuys ?? 0);
  const [cashOut, setCashOut] = useState(
    initial ? String(initial.cashOut) : ""
  );
  const [rake, setRake] = useState(initial?.rake ? String(initial.rake) : "");
  const [mood, setMood] = useState<MoodValue | null>(initial?.mood ?? null);

  // Inline "+ 場子".
  const [addingVenue, setAddingVenue] = useState(false);
  const [newVenue, setNewVenue] = useState("");
  const [venueError, setVenueError] = useState<string | null>(null);
  const [venuePending, startVenue] = useTransition();

  const unitN = toInt(unit);
  const total = unitN === null ? null : unitN * (1 + rebuys);
  const cashOutN = toInt(cashOut);
  const rakeN = toInt(rake) ?? 0;
  const net =
    total === null || cashOutN === null ? null : cashOutN - total - rakeN;

  // After a successful save: reset (create) or go back to that day (edit).
  useEffect(() => {
    if (!state?.ok) return;
    if (isEdit) {
      router.push(`/?month=${date.slice(0, 7)}&day=${date}`);
    } else {
      formRef.current?.reset();
      setPresetId(null);
      setVenueId(null);
      setUnit("");
      setRebuys(0);
      setCashOut("");
      setRake("");
      setMood(null);
      setDate(localToday());
    }
    onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function pickPreset(p: Preset) {
    setUnit(String(p.buyIn));
    setPresetId(p.id);
  }

  function addVenue() {
    setVenueError(null);
    startVenue(async () => {
      const res = await quickCreateVenue(newVenue);
      if (res.ok) {
        setVenueId(res.id);
        setNewVenue("");
        setAddingVenue(false);
      } else {
        setVenueError(res.error);
      }
    });
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {isEdit && <input type="hidden" name="id" value={initial!.id} />}
      <input type="hidden" name="levelPresetId" value={presetId ?? ""} />
      <input type="hidden" name="venueId" value={venueId ?? ""} />
      <input type="hidden" name="mood" value={mood ?? ""} />
      <input type="hidden" name="rebuys" value={rebuys} />
      <input type="hidden" name="buyIn" value={total ?? ""} />

      <Row label="日期" htmlFor="session-date">
        <input
          id="session-date"
          name="playedAt"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={fieldClass}
        />
      </Row>

      <Row label="級別">
        {presets.length === 0 ? (
          <Link
            href="/settings"
            className="flex h-11 items-center text-sm text-accent hover:underline"
          >
            到設定新增級別 →
          </Link>
        ) : (
          presets.map((p) => (
            <Chip
              key={p.id}
              block
              active={presetId === p.id}
              onClick={() => pickPreset(p)}
              className="tnum"
            >
              {p.label}
            </Chip>
          ))
        )}
      </Row>

      <Row label="場子">
        {venues.map((v) => (
          <Chip
            key={v.id}
            block
            active={venueId === v.id}
            // Optional: tap the selected one again to clear it.
            onClick={() => setVenueId(venueId === v.id ? null : v.id)}
          >
            {v.name}
          </Chip>
        ))}
        {!addingVenue && (
          <button
            type="button"
            onClick={() => setAddingVenue(true)}
            aria-label="新增場子"
            className={cn(
              "flex h-11 items-center justify-center rounded-xl border border-dashed border-muted/60 text-subtle transition hover:bg-chip",
              venues.length === 0 ? "px-4 text-sm" : "w-11 text-lg"
            )}
          >
            {venues.length === 0 ? "＋ 新增場子" : "+"}
          </button>
        )}
        {addingVenue && (
          <div className="flex w-full flex-col gap-1.5">
            <div className="flex gap-2">
              <input
                value={newVenue}
                onChange={(e) => setNewVenue(e.target.value)}
                onKeyDown={(e) => {
                  // Enter adds the venue instead of submitting the session.
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVenue();
                  }
                }}
                maxLength={12}
                autoFocus
                aria-label="場子名稱"
                placeholder="場子名稱"
                className={cn(inputClass, "h-11 min-w-0 flex-1 py-0")}
              />
              <Button
                type="button"
                onClick={addVenue}
                disabled={venuePending || !newVenue.trim()}
                className="h-11"
              >
                {venuePending ? "…" : "加入"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setAddingVenue(false);
                  setVenueError(null);
                }}
                className="h-11 px-3"
              >
                取消
              </Button>
            </div>
            {venueError && (
              <p className="text-xs text-negative">{venueError}</p>
            )}
          </div>
        )}
      </Row>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <label htmlFor="session-buyin" className="text-xs text-muted">
            買入
          </label>
          <input
            id="session-buyin"
            inputMode="numeric"
            required
            value={unit}
            onChange={(e) => {
              setUnit(e.target.value);
              setPresetId(null); // manual edit breaks the preset link
            }}
            placeholder="6600"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted">加買次數</span>
          <div className="flex h-11 items-center justify-between rounded-lg border border-border bg-surface">
            <button
              type="button"
              onClick={() => setRebuys((r) => Math.max(0, r - 1))}
              disabled={rebuys === 0}
              aria-label="少一次加買"
              className="h-full w-11 text-xl text-subtle disabled:opacity-30"
            >
              −
            </button>
            <span className="tnum text-[17px] font-semibold" aria-live="polite">
              {rebuys}
            </span>
            <button
              type="button"
              onClick={() => setRebuys((r) => Math.min(99, r + 1))}
              aria-label="多一次加買"
              className="h-full w-11 text-xl text-accent"
            >
              +
            </button>
          </div>
        </div>
      </div>
      {rebuys > 0 && total !== null && (
        <p className="tnum -mt-2 text-xs text-muted">
          總買入 {num(total)}（買入 × {1 + rebuys}）
        </p>
      )}

      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-1">
          <label htmlFor="session-cashout" className="text-xs text-muted">
            帶出
          </label>
          <input
            id="session-cashout"
            name="cashOut"
            inputMode="numeric"
            required
            value={cashOut}
            onChange={(e) => setCashOut(e.target.value)}
            placeholder="7100"
            className={fieldClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="session-rake" className="text-xs text-muted">
            水費
          </label>
          <input
            id="session-rake"
            name="rake"
            inputMode="numeric"
            value={rake}
            onChange={(e) => setRake(e.target.value)}
            placeholder="0"
            className={fieldClass}
          />
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl px-4 py-3",
          net === null ? "bg-chip" : net >= 0 ? "bg-pos-1" : "bg-neg-1"
        )}
        aria-live="polite"
      >
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs text-subtle">這場淨利</span>
          <span className="tnum truncate text-xs text-subtle">
            {net === null
              ? "輸入買入和帶出後自動計算"
              : `帶出 ${num(cashOutN!)} − 買入 ${num(total!)}${rakeN ? ` − 水 ${num(rakeN)}` : ""}`}
          </span>
        </div>
        <span
          className={cn(
            "tnum ml-auto font-display text-3xl font-medium leading-none",
            net === null
              ? "text-muted"
              : net >= 0
                ? "text-positive-strong"
                : "text-negative-strong"
          )}
        >
          {net === null ? "—" : formatMoney(net, true)}
        </span>
      </div>

      <Row label="心態">
        {MOODS.map((m) => (
          <Chip
            key={m.value}
            block
            active={mood === m.value}
            // Optional: tap the selected one again to clear it.
            onClick={() => setMood(mood === m.value ? null : m.value)}
          >
            {m.label}
          </Chip>
        ))}
      </Row>

      <input
        name="note"
        type="text"
        aria-label="備註"
        defaultValue={initial?.note ?? ""}
        placeholder="備註（選填）"
        className={cn(inputClass, "h-11 py-0")}
      />

      {state && !state.ok && (
        <p className="text-sm text-negative">{state.error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="h-12 flex-1 text-base">
          {pending ? "儲存中…" : isEdit ? "儲存變更" : "儲存"}
        </Button>
        {isEdit && (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(
                `/?month=${initial!.playedAt.slice(0, 7)}&day=${initial!.playedAt}`
              )
            }
            className="h-12"
          >
            取消
          </Button>
        )}
      </div>
    </form>
  );
}
