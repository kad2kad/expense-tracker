import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Next.js 16 renamed the `middleware` convention to `proxy`.
// Uses the edge-safe config (the authorized callback handles route gating).
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except static assets and the auth API.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
