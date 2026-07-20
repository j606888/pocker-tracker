import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /** Extra field returned from `authorize` to tell the two providers apart. */
  interface User {
    kind?: "user" | "admin";
  }

  interface Session {
    user: {
      /** Effective poker user. Undefined for a pure admin (not impersonating). */
      id?: string;
    } & DefaultSession["user"];
    /** The logged-in back-office operator, if any. */
    adminId?: string;
    /** Present only while an admin is impersonating a user (read-only mode). */
    actingAdminId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Effective poker user id (real user, or impersonated user). */
    id?: string;
    /** Back-office operator id (persists across an impersonation). */
    adminId?: string;
  }
}
