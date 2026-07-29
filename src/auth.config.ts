import type { NextAuthConfig } from "next-auth";

// Edge-safe config: no Prisma/bcrypt here so it can run in middleware.
// The Credentials provider (which needs Node APIs) lives in ./auth.ts.

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/add",
  "/history",
  "/report",
  "/settings",
  "/transactions",
];

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isAuthPage = pathname === "/login" || pathname === "/signup";

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      const isProtected =
        pathname === "/" ||
        PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

      if (isProtected) return isLoggedIn;
      return true;
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
  providers: [], // added in ./auth.ts
} satisfies NextAuthConfig;
