import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

async function requireSuperAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  const email = session?.user?.email;
  if (!email) return null;

  const me = await db.user.findUnique({
    where: { email: String(email) },
    select: { id: true, isSuperAdmin: true },
  });

  if (!me?.isSuperAdmin) return null;
  return me;
}

export async function GET(req: Request) {
  const me = await requireSuperAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const tenantId = String(searchParams.get("tenantId") || "");
  if (!tenantId) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });

  const rows = await db.tenantModule.findMany({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
    include: { module: { select: { id: true, code: true, name: true, routePath: true } } },
  });

  return NextResponse.json({ ok: true, tenantModules: rows });
}

export async function POST(req: Request) {
  const me = await requireSuperAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const tenantId = String(body?.tenantId || "");
  const moduleId = String(body?.moduleId || "");
  if (!tenantId || !moduleId) return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });

  const now = new Date();

  const row = await db.tenantModule.upsert({
    where: { tenantId_moduleId: { tenantId, moduleId } },
    update: { status: "ACTIVE", startsAt: body?.startsAt ? new Date(body.startsAt) : now, endsAt: null },
    create: { tenantId, moduleId, status: "ACTIVE", startsAt: now },
    include: { module: { select: { id: true, code: true, name: true, routePath: true } } },
  });

  return NextResponse.json({ ok: true, tenantModule: row });
}

export async function PATCH(req: Request) {
  const me = await requireSuperAdmin();
  if (!me) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const id = String(body?.id || "");
  const status = String(body?.status || "");
  if (!id || (status !== "ACTIVE" && status !== "DISABLED")) {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  }

  const row = await db.tenantModule.update({
    where: { id },
    data: {
      status,
      endsAt: status === "DISABLED" ? new Date() : null,
    },
  });

  return NextResponse.json({ ok: true, tenantModule: row });
}