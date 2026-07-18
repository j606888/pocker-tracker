import type { NextAuthConfig } from "next-auth";

const AUTH_ROUTES = ["/login", "/register"];

/**
 * Edge-safe config (no Prisma / bcrypt). Used by middleware and shared with
 * the full config in auth.ts. The Credentials provider lives in auth.ts so
 * the Node-only deps never reach the edge runtime.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = AUTH_ROUTES.some((r) =>
        nextUrl.pathname.startsWith(r)
      );

      if (isAuthRoute) {
        // Already logged in? Bounce away from login/register.
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      // Everything else requires a session.
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
