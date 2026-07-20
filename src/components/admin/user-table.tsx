import type { AdminUserRow } from "@/lib/data/admin";
import { impersonate } from "@/lib/actions/admin";
import { cn, formatMoney } from "@/lib/utils";

function toneClass(n: number) {
  return n > 0 ? "text-positive" : n < 0 ? "text-negative" : "text-muted";
}

/** YYYY-MM-DD from a stored @db.Date (UTC midnight). */
function fmtDate(d: Date | null) {
  return d ? d.toISOString().slice(0, 10) : "—";
}

export function UserTable({ rows }: { rows: AdminUserRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface px-5 py-10 text-center text-sm text-muted">
        還沒有任何使用者。
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-4 py-3 font-medium">使用者</th>
            <th className="px-4 py-3 text-right font-medium">場次</th>
            <th className="px-4 py-3 text-right font-medium">總淨利</th>
            <th className="px-4 py-3 font-medium">最近牌局</th>
            <th className="px-4 py-3 font-medium">註冊於</th>
            <th className="px-4 py-3 text-right font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr
              key={u.id}
              className="border-b border-border/70 last:border-b-0"
            >
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="font-medium text-fg">
                    {u.name ?? "（未命名）"}
                  </span>
                  <span className="text-xs text-muted">{u.email}</span>
                </div>
              </td>
              <td className="tnum px-4 py-3 text-right text-subtle">
                {u.sessionCount}
              </td>
              <td
                className={cn(
                  "tnum px-4 py-3 text-right font-semibold",
                  toneClass(u.net)
                )}
              >
                {formatMoney(u.net, true)}
              </td>
              <td className="tnum px-4 py-3 text-subtle">
                {fmtDate(u.lastPlayedAt)}
              </td>
              <td className="tnum px-4 py-3 text-muted">
                {fmtDate(u.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <form action={impersonate}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-accent transition hover:bg-chip"
                  >
                    冒充檢視
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
