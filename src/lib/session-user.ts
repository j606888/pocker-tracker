import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Current user id, or redirect to login. Use in server components & actions. */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) redirect("/login");
  return id;
}
