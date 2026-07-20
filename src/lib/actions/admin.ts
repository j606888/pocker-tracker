"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireAdminId } from "@/lib/session-user";
import { update } from "@/auth";

/** Start impersonating a user (read-only). Admins only. */
export async function impersonate(formData: FormData): Promise<void> {
  const adminId = await requireAdminId();

  const userId = formData.get("userId");
  if (typeof userId !== "string" || !userId) return;

  const [admin, user] = await Promise.all([
    prisma.admin.findUnique({ where: { id: adminId }, select: { email: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
  ]);
  if (!user) return;

  // Audit trail: snapshot both emails so it survives later deletions.
  await prisma.impersonationLog.create({
    data: {
      adminId,
      adminEmail: admin?.email ?? "",
      userId,
      userEmail: user.email,
    },
  });

  // Overlay the effective user onto the admin token (see auth.config jwt).
  // Custom trigger data — not part of the Session shape, so cast.
  await update({ impersonateUserId: userId } as never);
  redirect("/");
}

/** Stop impersonating and return to the admin dashboard. */
export async function stopImpersonate(): Promise<void> {
  // adminId persists through impersonation, so this still identifies the admin.
  await requireAdminId();
  await update({ stopImpersonate: true } as never);
  redirect("/admin");
}
