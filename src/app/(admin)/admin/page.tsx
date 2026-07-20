import { auth, signOut } from "@/auth";
import { requireAdminId } from "@/lib/session-user";
import {
  getAllUsersWithStats,
  getRecentImpersonationLogs,
} from "@/lib/data/admin";
import { UserTable } from "@/components/admin/user-table";

/** UTC "YYYY-MM-DD HH:mm" from a full DateTime. */
function fmtDateTime(d: Date) {
  return d.toISOString().slice(0, 16).replace("T", " ");
}

export default async function AdminDashboardPage() {
  await requireAdminId();
  const [rows, logs, session] = await Promise.all([
    getAllUsersWithStats(),
    getRecentImpersonationLogs(),
    auth(),
  ]);
  const adminLabel = session?.user?.name ?? session?.user?.email ?? "Admin";

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-8">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="font-display text-2xl font-medium tracking-tight">
          後台
        </h1>
        <span className="text-sm text-muted">{adminLabel}</span>
        <form
          className="ml-auto"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-subtle transition hover:bg-chip"
          >
            登出
          </button>
        </form>
      </div>

      <p className="mb-4 text-sm text-muted">
        共 {rows.length} 位使用者。點「冒充檢視」以唯讀身分瀏覽該使用者的紀錄。
      </p>

      <UserTable rows={rows} />

      <h2 className="mb-3 mt-10 font-display text-lg font-medium">
        冒充紀錄
      </h2>
      {logs.length === 0 ? (
        <p className="text-sm text-muted">還沒有任何冒充紀錄。</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted">
                <th className="px-4 py-3 font-medium">時間 (UTC)</th>
                <th className="px-4 py-3 font-medium">Admin</th>
                <th className="px-4 py-3 font-medium">冒充對象</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-border/70 last:border-b-0"
                >
                  <td className="tnum px-4 py-3 text-subtle">
                    {fmtDateTime(l.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-subtle">{l.adminEmail}</td>
                  <td className="px-4 py-3 text-fg">{l.userEmail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
