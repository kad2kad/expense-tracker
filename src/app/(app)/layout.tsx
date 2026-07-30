import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Nav } from "@/components/nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Middleware already gates these routes, but guard here too so `session`
  // is guaranteed for children and types are non-null.
  if (!session?.user) redirect("/login");

  const userLabel = session.user.name ?? session.user.email ?? "Account";

  return (
    <div className="flex min-h-dvh">
      <Nav userLabel={userLabel} />
      <main className="flex-1 pb-24 md:pb-0">{children}</main>
    </div>
  );
}
