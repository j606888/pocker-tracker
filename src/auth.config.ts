import type { NextAuthConfig } from "next-auth";

const AUTH_ROUTES = ["/login", "/register"];

/**
 * Token shape:
 *   token.id      = effective poker user (real user, or impersonated user)
 *   token.adminId = back-office operator (persists across an impersonation)
 * "Impersonating" is derived: both adminId AND id present. A normal user never
 * has adminId; a pure admin never has id.
 *
 * Edge-safe config (no Prisma / bcrypt). Used by middleware and shared with
 * the full config in auth.ts. The Credentials providers live in auth.ts so
 * the Node-only deps never reach the edge runtime.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;
      const adminId = auth?.adminId;
      const userId = auth?.user?.id;
      const isAdmin = !!adminId;
      const isImpersonating = !!adminId && !!userId;
      const hasUser = !!userId;

      const isAdminLogin = pathname.startsWith("/admin/login");
      const isAdminArea = pathname.startsWith("/admin");
      const isUserAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

      // Admin login page: reachable when logged out; bounce a real admin in.
      if (isAdminLogin) {
        if (isAdmin && !isImpersonating) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }
      // Admin area: admins only, and not while impersonating (must 切回 first).
      if (isAdminArea) {
        if (isAdmin && !isImpersonating) return true;
        return Response.redirect(new URL("/admin/login", nextUrl));
      }
      // User login/register: bounce anyone already logged in to their home.
      if (isUserAuthRoute) {
        if (hasUser) return Response.redirect(new URL("/", nextUrl));
        if (isAdmin) return Response.redirect(new URL("/admin", nextUrl));
        return true;
      }
      // Everything else = the user app.
      if (hasUser) return true; // normal user OR impersonating admin
      if (isAdmin) return Response.redirect(new URL("/admin", nextUrl));
      return false; // not logged in -> /login
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        // Initial sign-in: which provider authorized us?
        if (user.kind === "admin") token.adminId = user.id;
        else token.id = user.id;
      }
      if (trigger === "update") {
        // Start impersonation (admins only).
        if (session?.impersonateUserId && token.adminId) {
          token.id = session.impersonateUserId as string;
        }
        // Stop impersonation: drop the effective user, keep the admin.
        if (session?.stopImpersonate) {
          delete token.id;
        }
      }
      return token;
    },
    session({ session, token }) {
      const id = token.id as string | undefined;
      const adminId = token.adminId as string | undefined;
      if (session.user && id) session.user.id = id;
      session.adminId = adminId;
      // Impersonating iff an admin also has an effective user.
      session.actingAdminId = adminId && id ? adminId : undefined;
      return session;
    },
  },
} satisfies NextAuthConfig;
