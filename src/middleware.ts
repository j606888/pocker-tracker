import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware: uses only authConfig (no Prisma / bcrypt).
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except static assets, the auth API, and the PWA files
  // (iOS fetches the icon / manifest without being logged in).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon).*)",
  ],
};
