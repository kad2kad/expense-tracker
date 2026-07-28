import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Middleware uses the edge-safe config (authorized callback handles gating).
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except static assets and the auth API.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
