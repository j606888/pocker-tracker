import { stopImpersonate } from "@/lib/actions/admin";

export function ImpersonationBanner({ email }: { email: string | null }) {
  return (
    <div className="sticky top-0 z-40 flex items-center gap-3 bg-accent px-5 py-2.5 text-sm text-white">
      <span>
        👁 正在檢視 <span className="font-semibold">{email ?? "使用者"}</span>
        <span className="ml-1 text-white/80">（唯讀）</span>
      </span>
      <form action={stopImpersonate} className="ml-auto">
        <button
          type="submit"
          className="rounded-md bg-white/20 px-3 py-1 text-xs font-semibold transition hover:bg-white/30"
        >
          切回後台
        </button>
      </form>
    </div>
  );
}
