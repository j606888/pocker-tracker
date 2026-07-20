import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Current effective poker user id, or redirect to login. Works for a normal
 * user AND for an admin impersonating a user (read-only). Use for READS in
 * server components & actions.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  return id;
}

/**
 * Like requireUserId, but refuses while an admin is impersonating. Use at the
 * top of every WRITE server action so impersonation stays strictly read-only.
 */
export async function requireWritableUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  if (session?.actingAdminId) {
    throw new Error("唯讀模式：冒充使用者時無法修改資料");
  }
  return id;
}

/** Current back-office operator id, or redirect to the admin login. */
export async function requireAdminId(): Promise<string> {
  const session = await auth();
  const adminId = session?.adminId;
  if (!adminId) redirect("/admin/login");
  return adminId;
}

/** The admin currently impersonating, or null. Drives the banner + read-only UI. */
export async function getActingAdminId(): Promise<string | null> {
  const session = await auth();
  return session?.actingAdminId ?? null;
}
