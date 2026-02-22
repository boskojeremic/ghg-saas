import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

async function requireSuperAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const email = session?.user?.email;
  if (!email) return { ok: false as const, status: 401, email: null };

  const me = await db.user.findUnique({
    where: { email: String(email) },
    select: { isSuperAdmin: true },
  });

  if (!me?.isSuperAdmin) return { ok: false as const, status: 403, email };
  return { ok: true as const, status: 200, email };
}

// GET /api/admin/memberships?tenantId=...
export async function GET(req: Request) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return json(guard.status, { ok: false, error: "Forbidden" });

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");
  if (!tenantId) return json(400, { ok: false, error: "tenantId is required" });

  const members = await db.membership.findMany({
    where: { tenantId },
    include: {
      user: { select: { id: true, email: true, name: true, isSuperAdmin: true } },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });

  return json(200, { ok: true, members });
}

// PATCH { membershipId, role }
export async function PATCH(req: Request) {
  const guard = await requireSuperAdmin();
  if (!guard.ok) return json(guard.status, { ok: false, error: "Forbidden" });

  const body = await req.json().catch(() => null);
  const membershipId = body?.membershipId;
  const role = body?.role;

  if (!membershipId || !role) {
    return json(400, { ok: false, error: "membershipId and role are required" });
  }

  // role must match your enum: OWNER | ADMIN | EDITOR | VIEWER
  const updated = await db.membership.update({
    where: { id: String(membershipId) },
    data: { role },
    select: { id: true, role: true, tenantId: true, userId: true },
  });

  return json(200, { ok: true, updated });
}