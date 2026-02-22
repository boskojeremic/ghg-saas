import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function CoreAdminLayout({ children }: { children: React.ReactNode }) {
  const session = (await getServerSession(authOptions as any)) as any;
  const email = session?.user?.email;

  if (!email) redirect("/login");

  const me = await db.user.findUnique({
    where: { email: String(email) },
    select: { isSuperAdmin: true },
  });

  if (!me?.isSuperAdmin) redirect("/"); // ili /og/ghg

  return (
  <div className="min-h-screen flex">
    <aside className="w-[280px] p-4 border-r border-white/10">
      <div className="font-bold mb-3">Core Admin</div>
      <nav className="flex flex-col gap-2 text-sm">
        <Link className="text-white/80 hover:text-white" href="/core-admin/tenant-control">Tenant Control</Link>
        <Link className="text-white/80 hover:text-white" href="/core-admin/tenants">Tenants</Link>
        <Link className="text-white/80 hover:text-white" href="/core-admin/licensing">Licensing</Link>
      </nav>
    </aside>
    <main className="flex-1 p-6">{children}</main>
  </div>
);
}